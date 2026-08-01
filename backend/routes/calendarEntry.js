const express = require('express');
const router = express.Router();
const db = require('../db');

// alle CalendarEntries eines Users
router.get('/user/:userID', (req, res) => {
  res.json(
    db.prepare('SELECT * FROM calendar_entry WHERE userID = ?').all(req.params.userID)
  );
});

router.post('/', (req, res) => {
  const { userID, taskID, startDateTime, endDateTime, reminder } = req.body;
  const info = db.prepare(
    `INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, reminder)
     VALUES (?, ?, ?, ?, ?)`
  ).run(userID, taskID, startDateTime, endDateTime, reminder);
  res.status(201).json({ entryID: info.lastInsertRowid });
});

// entspricht reschedule() - verschiebt einen Eintrag und protokolliert die Änderung
router.put('/:id/reschedule', (req, res) => {
  const { startDateTime, endDateTime, reason } = req.body;
  const old = db.prepare('SELECT * FROM calendar_entry WHERE entryID = ?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'nicht gefunden' });

  db.prepare(
    'UPDATE calendar_entry SET startDateTime = ?, endDateTime = ? WHERE entryID = ?'
  ).run(startDateTime, endDateTime, req.params.id);

  db.prepare(
    `INSERT INTO calendar_change (entryID, oldSlot, newSlot, reason, timestamp)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
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