const express = require('express');
const router = express.Router();
const db = require('../db');
const { toLocalISOString } = require('../scheduler');

const OVERLAP_MESSAGE = '⚠ Kalenderüberschneidung erkannt';

/**
 * Prüft, ob [startDateTime, endDateTime) sich mit einem bestehenden Termin
 * desselben Users überschneidet. excludeEntryID wird beim Bearbeiten
 * übergeben, damit der Eintrag nicht mit sich selbst verglichen wird.
 */
function hasOverlap(userID, startDateTime, endDateTime, excludeEntryID = null) {
  const rows = db.prepare(
    `SELECT entryID, startDateTime, endDateTime FROM calendar_entry
     WHERE userID = ? ${excludeEntryID ? 'AND entryID != ?' : ''}`
  ).all(...(excludeEntryID ? [userID, excludeEntryID] : [userID]));

  const newStart = new Date(startDateTime);
  const newEnd = new Date(endDateTime);

  return rows.some((r) => {
    const start = new Date(r.startDateTime);
    const end = new Date(r.endDateTime);
    return newStart < end && newEnd > start;
  });
}

// alle CalendarEntries eines Users
router.get('/user/:userID', (req, res) => {
  res.json(
    db.prepare('SELECT * FROM calendar_entry WHERE userID = ?').all(req.params.userID)
  );
});

// manuell angelegter Eintrag (z. B. über das Popup) -> isManual = 1, wird beim
// Aktualisieren des Lernplans nie automatisch gelöscht/überschrieben
router.post('/', (req, res) => {
  const { userID, taskID, startDateTime, endDateTime, reminder, reminderDaysBefore } = req.body;

  if (hasOverlap(userID, startDateTime, endDateTime)) {
    return res.status(409).json({ error: OVERLAP_MESSAGE });
  }

  const info = db.prepare(`
    INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, reminder, reminderDaysBefore, isManual)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(userID, taskID, startDateTime, endDateTime, reminder, reminderDaysBefore ?? null);
  res.status(201).json({ entryID: info.lastInsertRowid });
});

// allgemeine Bearbeitung eines Eintrags (Zeit/Erinnerung ändern) -> sobald der
// Nutzer selbst editiert, gilt der Eintrag als "bearbeitet" (isManual = 1) und
// wird beim nächsten Aktualisieren des Lernplans nicht mehr angetastet
router.put('/:id', (req, res) => {
  const { startDateTime, endDateTime, reminder, reminderDaysBefore } = req.body;
  const old = db.prepare('SELECT * FROM calendar_entry WHERE entryID = ?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'nicht gefunden' });

  if (hasOverlap(old.userID, startDateTime, endDateTime, Number(req.params.id))) {
    return res.status(409).json({ error: OVERLAP_MESSAGE });
  }

  db.prepare(`
    UPDATE calendar_entry
    SET startDateTime = ?, endDateTime = ?, reminder = ?, reminderDaysBefore = ?, isManual = 1
    WHERE entryID = ?
  `).run(startDateTime, endDateTime, reminder, reminderDaysBefore ?? null, req.params.id);

  if (old.startDateTime !== startDateTime || old.endDateTime !== endDateTime) {
    db.prepare(`
      INSERT INTO calendar_change (entryID, oldSlot, newSlot, reason, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.params.id,
      `${old.startDateTime} - ${old.endDateTime}`,
      `${startDateTime} - ${endDateTime}`,
      'manuell bearbeitet',
      toLocalISOString(new Date())
    );
  }

  res.json({ updated: true });
});

// entspricht reschedule() - verschiebt einen Eintrag, protokolliert die
// Änderung und markiert den Eintrag als manuell bearbeitet
router.put('/:id/reschedule', (req, res) => {
  const { startDateTime, endDateTime, reason } = req.body;
  const old = db.prepare('SELECT * FROM calendar_entry WHERE entryID = ?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'nicht gefunden' });

  if (hasOverlap(old.userID, startDateTime, endDateTime, Number(req.params.id))) {
    return res.status(409).json({ error: OVERLAP_MESSAGE });
  }

  db.prepare(`
    UPDATE calendar_entry
    SET startDateTime = ?, endDateTime = ?, isManual = 1
    WHERE entryID = ?
  `).run(startDateTime, endDateTime, req.params.id);

  db.prepare(`
    INSERT INTO calendar_change (entryID, oldSlot, newSlot, reason, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    req.params.id,
    `${old.startDateTime} - ${old.endDateTime}`,
    `${startDateTime} - ${endDateTime}`,
    reason,
    toLocalISOString(new Date())
  );

  res.json({ rescheduled: true });
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM calendar_entry WHERE entryID = ?').run(req.params.id);
  if (info.changes === 0) {
    console.warn(`DELETE /calendar-entries/${req.params.id}: keine Zeile betroffen (existierte der Eintrag?)`);
    return res.status(404).json({ deleted: false, error: 'Eintrag wurde nicht gefunden (evtl. bereits gelöscht).' });
  }
  res.json({ deleted: true });
});

module.exports = router;
