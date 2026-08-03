const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateWorkAndCommuteEntries } = require('../profileCalendar');

function withParsedJsonFields(user) {
  const parse = (v, fallback) => {
    try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  };
  return {
    ...user,
    workingHours: parse(user.workingHours, []),
    commuteWork: parse(user.commuteWork, null),
  };
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM user').all().map(withParsedJsonFields));
});

router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM user WHERE userID = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'nicht gefunden' });
  res.json(withParsedJsonFields(user));
});

router.post('/', (req, res) => {
  const {
    userName, fieldOfStudy, employment, livingSituation,
    semesterType, semesterStart, semesterEnd, semesterNumber,
    workingHours, commuteWork,
  } = req.body;

  const info = db.prepare(`
    INSERT INTO user (
      userName, fieldOfStudy, employment, livingSituation,
      semesterType, semesterStart, semesterEnd, semesterNumber,
      workingHours, commuteWork
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userName, fieldOfStudy, employment, livingSituation,
    semesterType || null, semesterStart || null, semesterEnd || null, semesterNumber || null,
    JSON.stringify(Array.isArray(workingHours) ? workingHours : []),
    JSON.stringify(commuteWork || null)
  );

  const userID = info.lastInsertRowid;
  db.prepare('INSERT INTO user_preferences (userID) VALUES (?)').run(userID);

  generateWorkAndCommuteEntries(userID, { workingHours, commuteWork, semesterEnd });

  res.status(201).json({ userID });
});

router.put('/:id', (req, res) => {
  const {
    userName, fieldOfStudy, employment, livingSituation,
    semesterType, semesterStart, semesterEnd, semesterNumber,
    workingHours, commuteWork,
  } = req.body;

  db.prepare(`
    UPDATE user SET
      userName = ?, fieldOfStudy = ?, employment = ?, livingSituation = ?,
      semesterType = ?, semesterStart = ?, semesterEnd = ?, semesterNumber = ?,
      workingHours = ?, commuteWork = ?
    WHERE userID = ?
  `).run(
    userName, fieldOfStudy, employment, livingSituation,
    semesterType || null, semesterStart || null, semesterEnd || null, semesterNumber || null,
    JSON.stringify(Array.isArray(workingHours) ? workingHours : []),
    JSON.stringify(commuteWork || null),
    req.params.id
  );

  generateWorkAndCommuteEntries(req.params.id, { workingHours, commuteWork, semesterEnd });

  res.json({ updated: true });
});

// Löscht das Profil komplett (Kurse/Kalendereinträge/Einstellungen kaskadieren per FK)
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM user WHERE userID = ?').run(req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ deleted: false, error: 'Profil wurde nicht gefunden.' });
  }
  res.json({ deleted: true });
});

// GET Preferences (preferredTimes/excludedWeekdays werden als Array zurückgegeben)
router.get('/:id/preferences', (req, res) => {
  const prefs = db.prepare('SELECT * FROM user_preferences WHERE userID = ?').get(req.params.id);
  if (!prefs) return res.status(404).json({ error: 'nicht gefunden' });
  const parse = (v, fallback) => {
    try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  };
  res.json({
    ...prefs,
    preferredTimes: parse(prefs.preferredTimes, []),
    excludedWeekdays: parse(prefs.excludedWeekdays, []),
  });
});

// PUT Preferences: preferredTimes kommt als Array von {from, to} an
router.put('/:id/preferences', (req, res) => {
  const {
    preferredTimes, maxHoursPerDay, breakDuration, bufferBeforeExam,
    favoriteLocation, excludedWeekdays,
  } = req.body;

  db.prepare(`
    UPDATE user_preferences
    SET preferredTimes = ?, maxHoursPerDay = ?, breakDuration = ?, bufferBeforeExam = ?,
        favoriteLocation = ?, excludedWeekdays = ?
    WHERE userID = ?
  `).run(
    JSON.stringify(Array.isArray(preferredTimes) ? preferredTimes : []),
    maxHoursPerDay,
    breakDuration,
    bufferBeforeExam,
    favoriteLocation || null,
    JSON.stringify(Array.isArray(excludedWeekdays) ? excludedWeekdays : []),
    req.params.id
  );
  res.json({ updated: true });
});

module.exports = router;
