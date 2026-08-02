const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM task').all());
});

// alle LearnSessions eines Kurses
router.get('/course/:courseID', (req, res) => {
  res.json(
    db.prepare(`SELECT * FROM task WHERE courseID = ? AND discriminator = 'LearnSession'`)
      .all(req.params.courseID)
  );
});

router.post('/', (req, res) => {
  const { taskName, description, location, status, discriminator, courseID, type, recurring } = req.body;
  const info = db.prepare(
    `INSERT INTO task (taskName, description, location, status, discriminator, courseID, type, recurring)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(taskName, description, location, status, discriminator, courseID ?? null, type ?? null, recurring ?? null);
  res.status(201).json({ taskID: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { taskName, description, location, status } = req.body;
  db.prepare(
    `UPDATE task SET taskName = ?, description = ?, location = ?, status = ? WHERE taskID = ?`
  ).run(taskName, description, location, status, req.params.id);
  res.json({ updated: true });
});

// entspricht completeTask() aus dem Klassendiagramm
router.put('/:id/complete', (req, res) => {
  db.prepare(`UPDATE task SET status = 'erledigt' WHERE taskID = ?`).run(req.params.id);
  res.json({ completed: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM task WHERE taskID = ?').run(req.params.id);
  res.json({ deleted: true });
});

// eigener, schlanker Endpunkt zum Umbenennen (überschreibt nicht versehentlich
// andere Felder, wie es ein vollständiges PUT ohne die übrigen Werte täte)
router.put('/:id/rename', (req, res) => {
  const { taskName } = req.body;
  if (!taskName) return res.status(400).json({ error: 'taskName erforderlich' });
  db.prepare('UPDATE task SET taskName = ? WHERE taskID = ?').run(taskName, req.params.id);
  res.json({ renamed: true });
});

module.exports = router;
