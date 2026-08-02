const express = require('express');
const router = express.Router();
const db = require('../db');

function withParsedExamDates(course) {
  let examDates = [];
  try {
    examDates = course.examDates ? JSON.parse(course.examDates) : [];
  } catch {
    examDates = [];
  }
  return { ...course, examDates };
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM course').all().map(withParsedExamDates));
});

router.get('/user/:userID', (req, res) => {
  res.json(db.prepare('SELECT * FROM course WHERE userID = ?').all(req.params.userID).map(withParsedExamDates));
});

router.post('/', (req, res) => {
  const { userID, courseName, workload, ects, priority, examDates, materialGoal } = req.body;
  const info = db.prepare(
    `INSERT INTO course (userID, courseName, workload, ects, priority, examDates, materialGoal)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userID, courseName, workload, ects, priority,
    JSON.stringify(Array.isArray(examDates) ? examDates : []),
    materialGoal || null
  );
  res.status(201).json({ courseID: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { courseName, workload, ects, priority, examDates, materialGoal } = req.body;
  db.prepare(
    `UPDATE course SET courseName = ?, workload = ?, ects = ?, priority = ?, examDates = ?, materialGoal = ?
     WHERE courseID = ?`
  ).run(
    courseName, workload, ects, priority,
    JSON.stringify(Array.isArray(examDates) ? examDates : []),
    materialGoal || null,
    req.params.id
  );
  res.json({ updated: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM course WHERE courseID = ?').run(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;
