const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  generateFreeSlots,
  allocateSessions,
  parsePreferredWindows,
  splitSlotsByPreference,
} = require('../scheduler');

/**
 * POST /api/schedule/generate
 * Body: { userID, days?, dayStartHour?, dayEndHour?, chunkHours?, mode?, minSessionHours? }
 *
 * Aktualisiert den Lernplan: NUR automatisch generierte LearnSession-
 * Einträge (isManual = 0) werden vor der Neuberechnung gelöscht. Manuell
 * angelegte oder vom Nutzer bearbeitete Einträge (isManual = 1) bleiben
 * unangetastet, zählen als bereits verplante Zeit (verringern den offenen
 * Workload) und blockieren die entsprechenden Zeitfenster für neue
 * Sessions, genau wie FixedTask-Termine.
 *
 * Reicht der verbleibende Workload nicht aus, um den gewünschten Zeitraum
 * (days) zu füllen, wird OHNE zu erstellen ein Hinweis zurückgegeben
 * (needsConfirmation). Der Client kann dann erneut aufrufen mit:
 *   mode: 'stretch'  -> kürzere Sessions, um den vollen Zeitraum zu nutzen
 *   mode: 'shorten'  -> kürzeren Zeitraum akzeptieren, sonst unverändert
 */
router.post('/generate', (req, res) => {
  try {
    const {
      userID,
      days = 7,
      dayStartHour = 8,
      dayEndHour = 22,
      chunkHours = 2,
      mode,
      minSessionHours = 1,
    } = req.body;

    if (!userID) {
      return res.status(400).json({ error: 'userID erforderlich' });
    }

    const prefs = db.prepare('SELECT * FROM user_preferences WHERE userID = ?').get(userID) || {};
    const maxHoursPerDay = prefs.maxHoursPerDay || 6;
    const breakMinutes = prefs.breakDuration || 15;

    // 0. Nur die automatisch generierten (nie angefassten) Lernsessions
    // entfernen. Manuell angelegte/bearbeitete Einträge (isManual = 1)
    // bleiben stehen.
    db.prepare(`
      DELETE FROM calendar_entry
      WHERE userID = ?
        AND isManual = 0
        AND taskID IN (
          SELECT taskID FROM task
          WHERE discriminator = 'LearnSession'
            AND courseID IN (SELECT courseID FROM course WHERE userID = ?)
        )
    `).run(userID, userID);

    // 1. Belegte Zeiten = FixedTask-Termine UND alle manuellen/bearbeiteten
    // Einträge (auch LearnSessions, die der Nutzer selbst gesetzt hat) -
    // beides darf von der Neuberechnung nicht überschrieben werden.
    const busyRows = db.prepare(`
      SELECT ce.startDateTime, ce.endDateTime
      FROM calendar_entry ce
      JOIN task t ON t.taskID = ce.taskID
      WHERE ce.userID = ?
        AND (t.discriminator = 'FixedTask' OR ce.isManual = 1)
    `).all(userID);

    const busyIntervals = busyRows.map((r) => ({
      start: new Date(r.startDateTime),
      end: new Date(r.endDateTime),
    }));

    // 2. Bereits verplante Lernzeit je Kurs = verbliebene (manuelle)
    // LearnSession-Einträge nach dem Löschen oben
    const plannedRows = db.prepare(`
      SELECT t.courseID, ce.startDateTime, ce.endDateTime
      FROM calendar_entry ce
      JOIN task t ON t.taskID = ce.taskID
      WHERE ce.userID = ? AND t.discriminator = 'LearnSession'
    `).all(userID);

    const plannedHoursByCourse = {};
    for (const row of plannedRows) {
      const hours = (new Date(row.endDateTime) - new Date(row.startDateTime)) / 3_600_000;
      plannedHoursByCourse[row.courseID] = (plannedHoursByCourse[row.courseID] || 0) + hours;
    }

    // 3. Kurse + offener Zeitaufwand (workload minus bereits verplanter Zeit)
    const courses = db.prepare('SELECT * FROM course WHERE userID = ?').all(userID);
    const courseInputs = courses
      .map((c) => ({
        courseID: c.courseID,
        priority: c.priority || 0,
        remainingHours: Math.max(0, (c.workload || 0) - (plannedHoursByCourse[c.courseID] || 0)),
      }))
      .filter((c) => c.remainingHours > 0);

    if (courseInputs.length === 0) {
      return res.json({ message: 'Kein offener Lernbedarf für diesen User.', created: [] });
    }

    // 3b. Prüfen, ob der offene Workload überhaupt ausreicht, um "days" zu füllen
    const totalRemainingHours = courseInputs.reduce((sum, c) => sum + c.remainingHours, 0);
    const achievableDays = Math.max(1, Math.ceil(totalRemainingHours / maxHoursPerDay));

    if (!mode && achievableDays < days) {
      return res.json({
        needsConfirmation: true,
        requestedDays: days,
        achievableDays,
        totalRemainingHours,
        message:
          `Der offene Lernbedarf (${totalRemainingHours}h) füllt bei ${chunkHours}h-Sessions ` +
          `nur etwa ${achievableDays} von ${days} Tagen.`,
      });
    }

    // 3c. Falls "stretch": Sessions verkürzen, damit sich die Lernzeit über
    // den vollen Zeitraum verteilt, statt sich in den ersten Tagen zu ballen.
    let effectiveChunkHours = chunkHours;
    let effectiveMaxHoursPerDay = maxHoursPerDay;
    if (mode === 'stretch') {
      effectiveMaxHoursPerDay = Math.max(minSessionHours, totalRemainingHours / days);
      effectiveChunkHours = Math.min(chunkHours, effectiveMaxHoursPerDay);
    }

    // 4. Freie Zeitfenster berechnen (abzüglich FixedTask + manueller Einträge)
    const freeSlots = generateFreeSlots({
      startDate: new Date(),
      days,
      dayStartHour,
      dayEndHour,
      busyIntervals,
    });

    // 4b. Freie Slots nach bevorzugter Tageszeit umsortieren
    const preferredWindows = parsePreferredWindows(prefs.preferredTimes, dayStartHour, dayEndHour);
    const { preferred, other } = splitSlotsByPreference(freeSlots, preferredWindows);
    const orderedSlots = [...preferred, ...other];

    // 5. Zuteilen
    const assignments = allocateSessions({
      freeSlots: orderedSlots,
      courses: courseInputs,
      chunkHours: effectiveChunkHours,
      breakMinutes,
      maxHoursPerDay: effectiveMaxHoursPerDay,
    });

    if (assignments.length === 0) {
      return res.json({ message: 'Keine freien Zeitfenster im gewählten Zeitraum gefunden.', created: [] });
    }

    // 6. Pro Kurs eine LearnSession-Task sicherstellen (wiederverwenden statt duplizieren)
    const getExistingTask = db.prepare(
      `SELECT taskID FROM task WHERE courseID = ? AND discriminator = 'LearnSession' LIMIT 1`
    );
    const insertTask = db.prepare(`
      INSERT INTO task (taskName, description, location, status, discriminator, courseID)
      VALUES (?, ?, ?, ?, 'LearnSession', ?)
    `);

    const taskIdByCourse = {};
    for (const a of assignments) {
      if (taskIdByCourse[a.courseID]) continue;
      const existing = getExistingTask.get(a.courseID);
      if (existing) {
        taskIdByCourse[a.courseID] = existing.taskID;
      } else {
        const course = courses.find((c) => c.courseID === a.courseID);
        const info = insertTask.run(`Lernen: ${course.courseName}`, null, null, 'offen', a.courseID);
        taskIdByCourse[a.courseID] = info.lastInsertRowid;
      }
    }

    // 7. CalendarEntries für die zugeteilten Sessions anlegen -> isManual = 0
    // (automatisch generiert, darf beim nächsten Aktualisieren ersetzt werden)
    const insertEntry = db.prepare(`
      INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, reminder, isManual)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    const created = assignments.map((a) => {
      const info = insertEntry.run(
        userID,
        taskIdByCourse[a.courseID],
        a.start.toISOString(),
        a.end.toISOString(),
        null
      );
      return {
        entryID: info.lastInsertRowid,
        courseID: a.courseID,
        start: a.start.toISOString(),
        end: a.end.toISOString(),
      };
    });

    res.status(201).json({ message: `${created.length} Lernsession(s) eingeplant.`, created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/schedule/optimize
 * Body: { userID, changeDescription, days? }
 *
 * PREVIEW ONLY - schreibt NICHTS in die Datenbank. Schickt ALLE Termine
 * (FixedTask + LearnSession) der nächsten `days` Tage zusammen mit der
 * Änderungsbeschreibung an Gemini, validiert die Vorschläge (geschützte
 * Termine, Überschneidungen) und gibt zurück, was angewendet werden
 * KÖNNTE ("candidates") und was von vornherein verworfen wird
 * ("rejected"). Der Client zeigt "candidates" dem Nutzer zur Bestätigung,
 * bevor /optimize/apply aufgerufen wird.
 */
router.post('/optimize', async (req, res) => {
  try {
    const { userID, changeDescription, days = 14 } = req.body;

    if (!userID || !changeDescription) {
      return res.status(400).json({ error: 'userID und changeDescription sind erforderlich' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY ist nicht gesetzt (siehe .env / .env.example).' });
    }

    const prefs = db.prepare('SELECT * FROM user_preferences WHERE userID = ?').get(userID) || {};
    const maxHoursPerDay = prefs.maxHoursPerDay || 6;
    let preferredTimesText = '';
    try {
      const times = prefs.preferredTimes ? JSON.parse(prefs.preferredTimes) : [];
      preferredTimesText = times.join(', ');
    } catch {
      preferredTimesText = '';
    }

    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + days);

    // ALLE Termine im Zeitraum holen - FixedTask + LearnSession
    const rows = db.prepare(`
      SELECT ce.entryID, ce.startDateTime, ce.endDateTime, ce.isManual,
             t.discriminator, t.taskName
      FROM calendar_entry ce
      JOIN task t ON t.taskID = ce.taskID
      WHERE ce.userID = ?
        AND ce.startDateTime <= ? AND ce.endDateTime >= ?
      ORDER BY ce.startDateTime
    `).all(userID, horizon.toISOString(), now.toISOString());

    if (rows.length === 0) {
      return res.json({ message: 'Keine Termine im Zeitraum gefunden.', candidates: [], rejected: [] });
    }

    // editable: FixedTask darf immer angefasst werden (das IST die Änderung,
    // die beschrieben wird); LearnSession nur, wenn automatisch generiert
    // (isManual = 0) - manuell bearbeitete Lernsessions bleiben geschützt.
    const entryInfoById = new Map();
    const allEntries = rows.map((r) => {
      const editable = r.discriminator === 'FixedTask' ? true : r.isManual === 0;
      entryInfoById.set(r.entryID, { ...r, editable });
      return {
        entryID: r.entryID,
        type: r.discriminator,
        taskName: r.taskName,
        start: r.startDateTime,
        end: r.endDateTime,
        editable,
      };
    });

    const { requestRescheduleFromGemini } = require('../geminiClient');
    const result = await requestRescheduleFromGemini({
      apiKey,
      changeDescription,
      allEntries,
      maxHoursPerDay,
      preferredTimesText,
    });

    const candidates = [];
    const rejected = [];

    // Aktueller Stand aller Zeiten (wird bei jedem GEPRÜFTEN Vorschlag
    // gedanklich aktualisiert, damit nachfolgende Prüfungen konsistent
    // sind - es wird dabei noch NICHTS in die DB geschrieben)
    const currentTimes = new Map(
      rows.map((r) => [r.entryID, { start: new Date(r.startDateTime), end: new Date(r.endDateTime) }])
    );

    // FixedTask-Änderungen zuerst prüfen, damit LearnSession-Prüfungen
    // gegen die NEUE Schichtzeit laufen, nicht die alte.
    const changes = [...(result.changes || [])].sort((a, b) => {
      const infoA = entryInfoById.get(a.entryID);
      const infoB = entryInfoById.get(b.entryID);
      const aIsFixed = infoA?.discriminator === 'FixedTask' ? 0 : 1;
      const bIsFixed = infoB?.discriminator === 'FixedTask' ? 0 : 1;
      return aIsFixed - bIsFixed;
    });

    for (const change of changes) {
      const info = entryInfoById.get(change.entryID);
      if (!info) {
        rejected.push({ ...change, rejectReason: 'unbekannte entryID' });
        continue;
      }
      if (!info.editable) {
        rejected.push({ ...change, rejectReason: 'Termin ist geschützt (manuell bzw. nicht Teil der Änderung)' });
        continue;
      }

      const newStart = new Date(change.newStart);
      const newEnd = new Date(change.newEnd);
      if (isNaN(newStart) || isNaN(newEnd) || newEnd <= newStart) {
        rejected.push({ ...change, rejectReason: 'ungültige Start-/Endzeit' });
        continue;
      }

      const overlaps = [...currentTimes.entries()].some(([entryID, t]) => {
        if (entryID === change.entryID) return false;
        return newStart < t.end && newEnd > t.start;
      });
      if (overlaps) {
        rejected.push({ ...change, rejectReason: 'überschneidet sich mit einem anderen Termin' });
        continue;
      }

      currentTimes.set(change.entryID, { start: newStart, end: newEnd });
      candidates.push({
        entryID: change.entryID,
        type: info.discriminator,
        taskName: info.taskName,
        oldStart: info.startDateTime,
        oldEnd: info.endDateTime,
        newStart: newStart.toISOString(),
        newEnd: newEnd.toISOString(),
        reason: change.reason || changeDescription,
      });
    }

    res.json({
      message: result.summary || `${candidates.length} Termin(e) vorgeschlagen.`,
      candidates,
      rejected,
    });
  } catch (err) {
    console.error('Fehler in /api/schedule/optimize:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/schedule/optimize/apply
 * Body: { userID, changeDescription, candidates: [...] }
 *
 * Wendet die vom Nutzer BESTÄTIGTEN Kandidaten aus /optimize an. Prüft
 * pro Kandidat sicherheitshalber nochmal auf Überschneidung mit dem
 * aktuellen DB-Stand (falls sich zwischen Preview und Bestätigung etwas
 * geändert hat), bevor geschrieben wird.
 */
router.post('/optimize/apply', (req, res) => {
  try {
    const { userID, changeDescription, candidates } = req.body;
    if (!userID || !Array.isArray(candidates)) {
      return res.status(400).json({ error: 'userID und candidates (Array) sind erforderlich' });
    }

    const getEntry = db.prepare('SELECT * FROM calendar_entry WHERE entryID = ? AND userID = ?');
    const updateEntry = db.prepare('UPDATE calendar_entry SET startDateTime = ?, endDateTime = ? WHERE entryID = ?');
    const logChange = db.prepare(`
      INSERT INTO calendar_change (entryID, oldSlot, newSlot, reason, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    const otherEntriesInRange = db.prepare(`
      SELECT entryID, startDateTime, endDateTime FROM calendar_entry
      WHERE userID = ? AND entryID != ?
    `);

    const applied = [];
    const rejected = [];

    for (const c of candidates) {
      const old = getEntry.get(c.entryID, userID);
      if (!old) {
        rejected.push({ ...c, rejectReason: 'Termin existiert nicht mehr' });
        continue;
      }

      const newStart = new Date(c.newStart);
      const newEnd = new Date(c.newEnd);
      const overlaps = otherEntriesInRange.all(userID, c.entryID).some((o) => {
        const oStart = new Date(o.startDateTime);
        const oEnd = new Date(o.endDateTime);
        return newStart < oEnd && newEnd > oStart;
      });
      if (overlaps) {
        rejected.push({ ...c, rejectReason: 'überschneidet sich mittlerweile mit einem anderen Termin' });
        continue;
      }

      updateEntry.run(newStart.toISOString(), newEnd.toISOString(), c.entryID);
      logChange.run(
        c.entryID,
        `${old.startDateTime} - ${old.endDateTime}`,
        `${newStart.toISOString()} - ${newEnd.toISOString()}`,
        c.reason || changeDescription || 'KI-Anpassung',
        new Date().toISOString()
      );
      applied.push({ entryID: c.entryID, type: c.type, newStart: c.newStart, newEnd: c.newEnd });
    }

    res.json({ message: `${applied.length} Termin(e) übernommen.`, applied, rejected });
  } catch (err) {
    console.error('Fehler in /api/schedule/optimize/apply:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/schedule/undo
 * Body: { userID }
 *
 * Macht die zeitlich letzte protokollierte Änderung (aus calendar_change)
 * an einem Termin dieses Users rückgängig, indem oldSlot wiederhergestellt
 * wird. Der zugehörige calendar_change-Eintrag wird danach gelöscht, damit
 * ein erneutes "Rückgängig" den davor liegenden Schritt trifft.
 */
router.post('/undo', (req, res) => {
  try {
    const { userID } = req.body;
    if (!userID) {
      return res.status(400).json({ error: 'userID erforderlich' });
    }

    const lastChange = db.prepare(`
      SELECT cc.* FROM calendar_change cc
      JOIN calendar_entry ce ON ce.entryID = cc.entryID
      WHERE ce.userID = ?
      ORDER BY cc.timestamp DESC, cc.changeID DESC
      LIMIT 1
    `).get(userID);

    if (!lastChange) {
      return res.json({ message: 'Keine Änderung zum Rückgängigmachen gefunden.', undone: null });
    }

    const [oldStart, oldEnd] = lastChange.oldSlot.split(' - ');

    const entry = db.prepare('SELECT * FROM calendar_entry WHERE entryID = ?').get(lastChange.entryID);
    if (!entry) {
      // Termin existiert nicht mehr (z. B. inzwischen gelöscht) - Log-Eintrag trotzdem aufräumen
      db.prepare('DELETE FROM calendar_change WHERE changeID = ?').run(lastChange.changeID);
      return res.json({ message: 'Zugehöriger Termin existiert nicht mehr, Protokolleintrag entfernt.', undone: null });
    }

    // Überschneidung mit anderen Terminen prüfen, bevor rückgängig gemacht wird
    const newStartDate = new Date(oldStart);
    const newEndDate = new Date(oldEnd);
    const overlaps = db.prepare('SELECT startDateTime, endDateTime FROM calendar_entry WHERE userID = ? AND entryID != ?')
      .all(userID, lastChange.entryID)
      .some((o) => newStartDate < new Date(o.endDateTime) && newEndDate > new Date(o.startDateTime));

    if (overlaps) {
      return res.status(409).json({
        error: 'Rückgängigmachen würde zu einer Überschneidung mit einem anderen Termin führen.',
      });
    }

    db.prepare('UPDATE calendar_entry SET startDateTime = ?, endDateTime = ? WHERE entryID = ?')
      .run(oldStart, oldEnd, lastChange.entryID);
    db.prepare('DELETE FROM calendar_change WHERE changeID = ?').run(lastChange.changeID);

    res.json({
      message: 'Letzte Änderung wurde rückgängig gemacht.',
      undone: { entryID: lastChange.entryID, restoredStart: oldStart, restoredEnd: oldEnd },
    });
  } catch (err) {
    console.error('Fehler in /api/schedule/undo:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
