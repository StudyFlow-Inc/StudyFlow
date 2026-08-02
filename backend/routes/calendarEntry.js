const express = require('express');
const router = express.Router();
const db = require('../db');

// alle CalendarEntries eines Users
router.get('/user/:userID', (req, res) => {
  res.json(
    db.prepare('SELECT * FROM calendar_entry WHERE userID = ?').all(req.params.userID)
  );
});

// manuell angelegter Eintrag (z. B. über das Popup) -> isManual = 1, wird beim
// Aktualisieren des Lernplans nie automatisch gelöscht/überschrieben
router.post('/', (req, res) => {
  const { userID, taskID, startDateTime, endDateTime, reminder } = req.body;
  const info = db.prepare(`
    INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, reminder, isManual)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(userID, taskID, startDateTime, endDateTime, reminder);
  res.status(201).json({ entryID: info.lastInsertRowid });
});

// allgemeine Bearbeitung eines Eintrags (Zeit/Erinnerung ändern) -> sobald der
// Nutzer selbst editiert, gilt der Eintrag als "bearbeitet" (isManual = 1) und
// wird beim nächsten Aktualisieren des Lernplans nicht mehr angetastet
router.put('/:id', (req, res) => {
  const { startDateTime, endDateTime, reminder } = req.body;
  const old = db.prepare('SELECT * FROM calendar_entry WHERE entryID = ?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'nicht gefunden' });

  db.prepare(`
    UPDATE calendar_entry
    SET startDateTime = ?, endDateTime = ?, reminder = ?, isManual = 1
    WHERE entryID = ?
  `).run(startDateTime, endDateTime, reminder, req.params.id);

  if (old.startDateTime !== startDateTime || old.endDateTime !== endDateTime) {
    db.prepare(`
      INSERT INTO calendar_change (entryID, oldSlot, newSlot, reason, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.params.id,
      `${old.startDateTime} - ${old.endDateTime}`,
      `${startDateTime} - ${endDateTime}`,
      'manuell bearbeitet',
      new Date().toISOString()
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
    new Date().toISOString()
  );

  res.json({ rescheduled: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM calendar_entry WHERE entryID = ?').run(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;
