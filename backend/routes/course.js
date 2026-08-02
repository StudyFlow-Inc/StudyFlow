const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM course').all());
});

router.get('/user/:userID', (req, res) => {
  res.json(db.prepare('SELECT * FROM course WHERE userID = ?').all(req.params.userID));
});

router.post('/', (req, res) => {
  const { userID, courseName, workload, ects, priority } = req.body;
  const info = db.prepare(
    `INSERT INTO course (userID, courseName, workload, ects, priority)
     VALUES (?, ?, ?, ?, ?)`
  ).run(userID, courseName, workload, ects, priority);
  res.status(201).json({ courseID: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { courseName, workload, ects, priority } = req.body;
  db.prepare(
    `UPDATE course SET courseName = ?, workload = ?, ects = ?, priority = ?
     WHERE courseID = ?`
  ).run(courseName, workload, ects, priority, req.params.id);
  res.json({ updated: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM course WHERE courseID = ?').run(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;
