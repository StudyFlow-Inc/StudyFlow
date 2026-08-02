const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  generateFreeSlots,
  allocateSessions,
  parsePreferredWindow,
  splitSlotsByPreference,
} = require('../scheduler');

/**
 * POST /api/schedule/generate
 * Body: { userID, days?, dayStartHour?, dayEndHour?, chunkHours? }
 *
 * Plant offene Lernzeit (Course.workload minus bereits verplanter Zeit)
 * regelbasiert in die freien Zeitfenster eines Users ein, unter
 * Berücksichtigung bestehender FixedTask-Termine und UserPreferences.
 */
router.post('/generate', (req, res) => {
  try {
    const {
      userID,
      days = 7,
      dayStartHour = 8,
      dayEndHour = 22,
      chunkHours = 2,
    } = req.body;

    if (!userID) {
      return res.status(400).json({ error: 'userID erforderlich' });
    }

    const prefs = db.prepare('SELECT * FROM user_preferences WHERE userID = ?').get(userID) || {};
    const maxHoursPerDay = prefs.maxHoursPerDay || 6;
    const breakMinutes = prefs.breakDuration || 15;

    // 1. Belegte Zeiten = alle CalendarEntries zu FixedTask-Tasks dieses Users
    const busyRows = db.prepare(`
      SELECT ce.startDateTime, ce.endDateTime
      FROM calendar_entry ce
      JOIN task t ON t.taskID = ce.taskID
      WHERE ce.userID = ? AND t.discriminator = 'FixedTask'
    `).all(userID);

    const busyIntervals = busyRows.map((r) => ({
      start: new Date(r.startDateTime),
      end: new Date(r.endDateTime),
    }));

    // 2. Bereits verplante Lernzeit je Kurs (existierende LearnSession-Einträge)
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

    // 3. Kurse + offener Zeitaufwand ermitteln
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

    // 4. Freie Zeitfenster berechnen
    const freeSlots = generateFreeSlots({
      startDate: new Date(),
      days,
      dayStartHour,
      dayEndHour,
      busyIntervals,
    });

    // 4b. Freie Slots nach bevorzugter Tageszeit umsortieren: die
    // Präferenz-Fenster jedes Tages werden zuerst befüllt, danach erst
    // der Rest des Tages – so bekommt z. B. "abends" tatsächlich Vorrang.
    const preferredWindow = parsePreferredWindow(prefs.preferredTime, dayStartHour, dayEndHour);
    const { preferred, other } = splitSlotsByPreference(freeSlots, preferredWindow);
    const orderedSlots = [...preferred, ...other];

    // 5. Zuteilen (höhere Kurs-Priorität zuerst, bevorzugte Zeitfenster zuerst)
    const assignments = allocateSessions({
      freeSlots: orderedSlots,
      courses: courseInputs,
      chunkHours,
      breakMinutes,
      maxHoursPerDay,
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

    // 7. CalendarEntries für die zugeteilten Sessions anlegen
    const insertEntry = db.prepare(`
      INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, reminder)
      VALUES (?, ?, ?, ?, ?)
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

module.exports = router;
