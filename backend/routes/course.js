const express = require('express');
const router = express.Router();
const db = require('../db');
const { toLocalISOString } = require('../scheduler');

function examTaskMarker(courseID) {
  return `__exam_${courseID}__`;
}
function lectureTaskMarker(courseID) {
  return `__lecture_${courseID}__`;
}
function commuteUniTaskMarker(courseID) {
  return `__commuteUni_${courseID}__`;
}

function weekdayToJsDay(weekday) {
  return weekday % 7;
}
function dateAt(date, timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m || 0, 0, 0);
  return d;
}
function horizonEnd(semesterEnd) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fallback = new Date(today);
  fallback.setDate(fallback.getDate() + 90);
  if (!semesterEnd) return fallback;
  const end = new Date(semesterEnd);
  if (isNaN(end)) return fallback;
  const maxEnd = new Date(today);
  maxEnd.setDate(maxEnd.getDate() + 180);
  return end < maxEnd ? end : maxEnd;
}

function withParsedCourseFields(course) {
  const parse = (v, fallback) => {
    try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  };
  return {
    ...course,
    examDates: parse(course.examDates, []),
    lectureTimes: parse(course.lectureTimes, []),
    commuteUni: parse(course.commuteUni, null),
  };
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

/**
 * Legt Vorlesungstermine (wiederkehrend, aus lectureTimes) sowie die
 * Pendelzeit Uni/nach Hause an - letztere ohne eigenen Zeit-Anker, sondern
 * direkt an Start/Ende der jeweiligen Vorlesung andockend (Hinweg endet am
 * Vorlesungsbeginn, Rückweg beginnt am Vorlesungsende).
 */
function syncLectureAndCommuteEntries(userID, courseID, courseName, lectureTimes, commuteUni, semesterEnd) {
  const lectureMarker = lectureTaskMarker(courseID);
  const commuteMarker = commuteUniTaskMarker(courseID);

  db.prepare(`
    DELETE FROM calendar_entry
    WHERE userID = ? AND taskID IN (SELECT taskID FROM task WHERE description IN (?, ?))
  `).run(userID, lectureMarker, commuteMarker);
  db.prepare(`
    DELETE FROM task WHERE description IN (?, ?) AND taskID NOT IN (SELECT taskID FROM calendar_entry)
  `).run(lectureMarker, commuteMarker);

  const end = horizonEnd(semesterEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const insertTask = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, courseID, type, recurring, learnable)
    VALUES (?, ?, NULL, 'offen', 'FixedTask', ?, ?, 1, ?)
  `);
  const insertEntry = db.prepare(`
    INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, isManual)
    VALUES (?, ?, ?, ?, 0)
  `);

  const lectureTaskIds = {};
  const lectureOccurrences = []; // { weekday, start, end }

  for (const row of lectureTimes || []) {
    if (!row || !row.start || !row.end || !row.weekday) continue;
    const key = `${row.weekday}-${row.start}-${row.end}`;
    if (!lectureTaskIds[key]) {
      lectureTaskIds[key] = insertTask.run(`Vorlesung: ${courseName}`, lectureMarker, courseID, 'Vorlesung', 0).lastInsertRowid;
    }
    const taskID = lectureTaskIds[key];
    const jsDay = weekdayToJsDay(Number(row.weekday));

    for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === jsDay) {
        const startDate = dateAt(d, row.start);
        const endDate = dateAt(d, row.end);
        insertEntry.run(userID, taskID, toLocalISOString(startDate), toLocalISOString(endDate));
        lectureOccurrences.push({ weekday: Number(row.weekday), start: startDate, end: endDate });
      }
    }
  }

  const c = commuteUni;
  if (c && Array.isArray(c.days) && c.days.length > 0 && (Number(c.minutesBefore) > 0 || Number(c.minutesAfter) > 0)) {
    const minutesBefore = Number(c.minutesBefore) || 0;
    const minutesAfter = Number(c.minutesAfter) || 0;
    const learnable = c.learnable ? 1 : 0;
    const taskID = insertTask.run(`Pendelzeit (Uni): ${courseName}`, commuteMarker, courseID, 'Pendelzeit', learnable).lastInsertRowid;

    for (const occ of lectureOccurrences) {
      if (!c.days.includes(occ.weekday)) continue;
      if (minutesBefore > 0) {
        const start = new Date(occ.start.getTime() - minutesBefore * 60_000);
        insertEntry.run(userID, taskID, toLocalISOString(start), toLocalISOString(occ.start));
      }
      if (minutesAfter > 0) {
        const commuteEnd = new Date(occ.end.getTime() + minutesAfter * 60_000);
        insertEntry.run(userID, taskID, toLocalISOString(occ.end), toLocalISOString(commuteEnd));
      }
    }
  }
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM course').all().map(withParsedCourseFields));
});

router.get('/user/:userID', (req, res) => {
  res.json(db.prepare('SELECT * FROM course WHERE userID = ?').all(req.params.userID).map(withParsedCourseFields));
});

router.post('/', (req, res) => {
  const {
    userID, courseName, workload, workloadUnit, ects, priority,
    examDates, materialGoal, materialPath, lectureTimes, commuteUni,
  } = req.body;

  const info = db.prepare(`
    INSERT INTO course (userID, courseName, workload, workloadUnit, ects, priority, examDates, materialGoal, materialPath, lectureTimes, commuteUni)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userID, courseName, workload, workloadUnit || 'total', ects, priority,
    JSON.stringify(Array.isArray(examDates) ? examDates : []),
    materialGoal || null,
    materialPath || null,
    JSON.stringify(Array.isArray(lectureTimes) ? lectureTimes : []),
    JSON.stringify(commuteUni || null)
  );

  const courseID = info.lastInsertRowid;
  const userRow = db.prepare('SELECT semesterEnd FROM user WHERE userID = ?').get(userID);
  syncExamCalendarEntries(userID, courseID, courseName, examDates);
  syncLectureAndCommuteEntries(userID, courseID, courseName, lectureTimes, commuteUni, userRow?.semesterEnd);

  res.status(201).json({ courseID });
});

router.put('/:id', (req, res) => {
  const {
    userID, courseName, workload, workloadUnit, ects, priority,
    examDates, materialGoal, materialPath, lectureTimes, commuteUni,
  } = req.body;

  db.prepare(`
    UPDATE course SET courseName = ?, workload = ?, workloadUnit = ?, ects = ?, priority = ?, examDates = ?,
      materialGoal = ?, materialPath = ?, lectureTimes = ?, commuteUni = ?
     WHERE courseID = ?`
  ).run(
    courseName, workload, workloadUnit || 'total', ects, priority,
    JSON.stringify(Array.isArray(examDates) ? examDates : []),
    materialGoal || null,
    materialPath || null,
    JSON.stringify(Array.isArray(lectureTimes) ? lectureTimes : []),
    JSON.stringify(commuteUni || null),
    req.params.id
  );

  const userRow = db.prepare('SELECT semesterEnd FROM user WHERE userID = ?').get(userID);
  syncExamCalendarEntries(userID, req.params.id, courseName, examDates);
  syncLectureAndCommuteEntries(userID, req.params.id, courseName, lectureTimes, commuteUni, userRow?.semesterEnd);

  res.json({ updated: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM course WHERE courseID = ?').run(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;
