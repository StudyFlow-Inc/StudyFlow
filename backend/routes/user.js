const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM user').all());
});

router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM user WHERE userID = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'nicht gefunden' });
  res.json(user);
});

router.post('/', (req, res) => {
  const { userName, fieldOfStudy, employment, livingSituation } = req.body;
  const info = db.prepare(
    `INSERT INTO user (userName, fieldOfStudy, employment, livingSituation)
     VALUES (?, ?, ?, ?)`
  ).run(userName, fieldOfStudy, employment, livingSituation);

  db.prepare('INSERT INTO user_preferences (userID) VALUES (?)').run(info.lastInsertRowid);

  res.status(201).json({ userID: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { userName, fieldOfStudy, employment, livingSituation } = req.body;
  db.prepare(
    `UPDATE user SET userName = ?, fieldOfStudy = ?, employment = ?, livingSituation = ?
     WHERE userID = ?`
  ).run(userName, fieldOfStudy, employment, livingSituation, req.params.id);
  res.json({ updated: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM user WHERE userID = ?').run(req.params.id);
  res.json({ deleted: true });
});

// GET Preferences (preferredTimes wird als Array zurückgegeben, nicht als JSON-String)
router.get('/:id/preferences', (req, res) => {
  const prefs = db.prepare('SELECT * FROM user_preferences WHERE userID = ?').get(req.params.id);
  if (!prefs) return res.status(404).json({ error: 'nicht gefunden' });
  let preferredTimes = [];
  try {
    preferredTimes = prefs.preferredTimes ? JSON.parse(prefs.preferredTimes) : [];
  } catch {
    preferredTimes = [];
  }
  res.json({ ...prefs, preferredTimes });
});

// PUT Preferences: preferredTimes kommt als Array an ["08:00","18:00"], wird als JSON gespeichert
router.put('/:id/preferences', (req, res) => {
  const { preferredTimes, maxHoursPerDay, breakDuration, bufferBeforeExam } = req.body;
  db.prepare(
    `UPDATE user_preferences
     SET preferredTimes = ?, maxHoursPerDay = ?, breakDuration = ?, bufferBeforeExam = ?
     WHERE userID = ?`
  ).run(
    JSON.stringify(Array.isArray(preferredTimes) ? preferredTimes : []),
    maxHoursPerDay,
    breakDuration,
    bufferBeforeExam,
    req.params.id
  );
  res.json({ updated: true });
});

module.exports = router;
