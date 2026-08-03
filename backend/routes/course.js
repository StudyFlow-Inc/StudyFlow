const express = require('express');
const router = express.Router();
const db = require('../db');
const { toLocalISOString } = require('../scheduler');

function examTaskMarker(courseID) {
  return `__exam_${courseID}__`;
}

function withParsedExamDates(course) {
  let examDates = [];
  try {
    examDates = course.examDates ? JSON.parse(course.examDates) : [];
  } catch {
    examDates = [];
  }
  return { ...course, examDates };
}

/**
 * Legt für jeden Prüfungstermin (Datum + Uhrzeit) direkt einen
 * Kalendereintrag an (2h Standarddauer). Vorherige, für diesen Kurs
 * automatisch erzeugte Prüfungstermine werden zuerst entfernt, damit ein
 * erneutes Speichern nicht dupliziert.
 */
function syncExamCalendarEntries(userID, courseID, courseName, examDates) {
  const marker = examTaskMarker(courseID);

  db.prepare(`
    DELETE FROM calendar_entry
    WHERE userID = ? AND taskID IN (SELECT taskID FROM task WHERE description = ?)
  `).run(userID, marker);
  db.prepare(`DELETE FROM task WHERE description = ? AND taskID NOT IN (SELECT taskID FROM calendar_entry)`).run(marker);

  if (!examDates || examDates.length === 0) return;

  const taskID = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, courseID, type)
    VALUES (?, ?, NULL, 'offen', 'FixedTask', ?, 'Pruefung')
  `).run(`Prüfung: ${courseName}`, marker, courseID).lastInsertRowid;

  const insertEntry = db.prepare(`
    INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, isManual)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const dt of examDates) {
    const start = new Date(dt);
    if (isNaN(start)) continue;
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2h Standarddauer
    insertEntry.run(userID, taskID, toLocalISOString(start), toLocalISOString(end));
  }
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM course').all().map(withParsedExamDates));
});

router.get('/user/:userID', (req, res) => {
  res.json(db.prepare('SELECT * FROM course WHERE userID = ?').all(req.params.userID).map(withParsedExamDates));
});

router.post('/', (req, res) => {
  const { userID, courseName, workload, workloadUnit, ects, priority, examDates, materialGoal, materialPath } = req.body;
  const info = db.prepare(`
    INSERT INTO course (userID, courseName, workload, workloadUnit, ects, priority, examDates, materialGoal, materialPath)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userID, courseName, workload, workloadUnit || 'total', ects, priority,
    JSON.stringify(Array.isArray(examDates) ? examDates : []),
    materialGoal || null,
    materialPath || null
  );

  const courseID = info.lastInsertRowid;
  syncExamCalendarEntries(userID, courseID, courseName, examDates);

  res.status(201).json({ courseID });
});

router.put('/:id', (req, res) => {
  const { userID, courseName, workload, workloadUnit, ects, priority, examDates, materialGoal, materialPath } = req.body;
  db.prepare(`
    UPDATE course SET courseName = ?, workload = ?, workloadUnit = ?, ects = ?, priority = ?, examDates = ?, materialGoal = ?, materialPath = ?
     WHERE courseID = ?`
  ).run(
    courseName, workload, workloadUnit || 'total', ects, priority,
    JSON.stringify(Array.isArray(examDates) ? examDates : []),
    materialGoal || null,
    materialPath || null,
    req.params.id
  );

  syncExamCalendarEntries(userID, req.params.id, courseName, examDates);

  res.json({ updated: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM course WHERE courseID = ?').run(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;
