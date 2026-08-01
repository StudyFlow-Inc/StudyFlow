// routes/course.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// alle Kurse eines Users abrufen
router.get('/', (req, res) => {
  const courses = db.prepare('SELECT * FROM course').all();
  res.json(courses);
});

// einen Kurs anlegen
router.post('/', (req, res) => {
  const { userID, courseName, workload, ects, priority } = req.body;
  const stmt = db.prepare(
    `INSERT INTO course (userID, courseName, workload, ects, priority)
     VALUES (?, ?, ?, ?, ?)`
  );
  const info = stmt.run(userID, courseName, workload, ects, priority);
  res.status(201).json({ courseID: info.lastInsertRowid });
});

// einen Kurs bearbeiten
router.put('/:id', (req, res) => {
  const { courseName, workload, ects, priority } = req.body;
  db.prepare(
    `UPDATE course SET courseName = ?, workload = ?, ects = ?, priority = ?
     WHERE courseID = ?`
  ).run(courseName, workload, ects, priority, req.params.id);
  res.json({ updated: true });
});

// einen Kurs löschen
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM course WHERE courseID = ?').run(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;