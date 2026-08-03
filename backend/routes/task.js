const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM task').all());
});

router.get('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM task WHERE taskID = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'nicht gefunden' });
  res.json(task);
});

// alle LearnSessions eines Kurses
router.get('/course/:courseID', (req, res) => {
  res.json(
    db.prepare(`SELECT * FROM task WHERE courseID = ? AND discriminator = 'LearnSession'`)
      .all(req.params.courseID)
  );
});

router.post('/', (req, res) => {
  const { taskName, description, location, status, discriminator, courseID, type, recurring, note } = req.body;
  const info = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, courseID, type, recurring, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(taskName, description, location, status, discriminator, courseID ?? null, type ?? null, recurring ?? null, note ?? null);
  res.status(201).json({ taskID: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { taskName, description, location, status, note } = req.body;
  db.prepare(
    `UPDATE task SET taskName = ?, description = ?, location = ?, status = ?, note = ? WHERE taskID = ?`
  ).run(taskName, description, location, status, note ?? null, req.params.id);
  res.json({ updated: true });
});

// schnelle Statusänderung (z. B. Dropdown direkt in der Liste)
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE task SET status = ? WHERE taskID = ?').run(status, req.params.id);
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

module.exports = router;
