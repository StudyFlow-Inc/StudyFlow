/**
 * seedSemester.js
 * Legt ein komplettes Beispiel-Sommersemester an (01.04.-30.09.2026,
 * Fachsemester 4): 4 Kurse mit Vorlesungszeiten (Software Engineering
 * inkl. Prüfungstermin), Arbeitszeiten als Werkstudent:in (15h/Woche),
 * 2x wöchentlich Sport, sowie zwei einmalige Termine (Techniker, Arzt).
 *
 * Schreibt direkt in die Datenbank (wie seed.js/seedMonth.js) und nutzt
 * dafür dieselben Generierungsfunktionen wie die echten Routen
 * (Arbeitszeiten/Vorlesungen -> automatische Kalendereinträge,
 * Prüfungstermin -> automatischer 2h-Kalendereintrag) - ohne einen
 * laufenden Server oder HTTP-Aufrufe zu benötigen.
 *
 * WICHTIG: workload/ECTS/Priorität sind für die drei Kurse ohne
 * angegebenen Zeitaufwand nur sinnvolle Platzhalter - bitte auf der
 * Kurs-Seite anpassen, falls euch die echten Werte bekannt sind.
 *
 * Ausführen mit: node seedSemester.js
 */
const db = require('./db');
const { toLocalISOString } = require('./scheduler');
const { generateWorkAndCommuteEntries } = require('./profileCalendar');
const { syncExamCalendarEntries, syncLectureAndCommuteEntries } = require('./routes/course');

function hasOverlap(userID, startDateTime, endDateTime) {
  const rows = db.prepare('SELECT startDateTime, endDateTime FROM calendar_entry WHERE userID = ?').all(userID);
  const newStart = new Date(startDateTime);
  const newEnd = new Date(endDateTime);
  return rows.some((r) => newStart < new Date(r.endDateTime) && newEnd > new Date(r.startDateTime));
}

const conflicts = [];

function insertEntrySafe(userID, taskID, startDateTime, endDateTime, reminderDaysBefore, label) {
  if (hasOverlap(userID, startDateTime, endDateTime)) {
    conflicts.push(`${label}: überschneidet sich mit einem bestehenden Termin, wurde NICHT angelegt`);
    return;
  }
  db.prepare(`
    INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, reminder, reminderDaysBefore, isManual)
    VALUES (?, ?, ?, ?, NULL, ?, 1)
  `).run(userID, taskID, startDateTime, endDateTime, reminderDaysBefore ?? null);
}

// ---------- 1. Profil ----------

const semesterStart = '2026-04-01';
const semesterEnd = '2026-09-30';

const workingHours = [
  { weekday: 1, start: '09:00', end: '13:00' }, // Montag, 4h (vor der SE-Vorlesung ab 14 Uhr)
  { weekday: 3, start: '13:00', end: '17:00' }, // Mittwoch, 4h (nach der Datenbanken-Vorlesung)
  { weekday: 5, start: '09:00', end: '16:00' }, // Freitag, 7h
];

const userInfo = db.prepare(`
  INSERT INTO user (
    userName, fieldOfStudy, employment, livingSituation,
    semesterType, semesterStart, semesterEnd, semesterNumber,
    workingHours, commuteWork
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'Max Mustermann', 'Informatik', 'Werkstudent/in, 15h/Woche', 'WG',
  'Sommersemester', semesterStart, semesterEnd, 4,
  JSON.stringify(workingHours),
  JSON.stringify(null)
);
const userID = userInfo.lastInsertRowid;
db.prepare('INSERT INTO user_preferences (userID) VALUES (?)').run(userID);

generateWorkAndCommuteEntries(userID, { workingHours, commuteWork: null, semesterEnd });

// ---------- 2. Kurse ----------

function insertCourse({ courseName, workload, ects, priority, examDates, lectureTimes }) {
  const info = db.prepare(`
    INSERT INTO course (userID, courseName, workload, workloadUnit, ects, priority, examDates, materialGoal, materialPath, lectureTimes, commuteUni)
    VALUES (?, ?, ?, 'total', ?, ?, ?, NULL, NULL, ?, ?)
  `).run(
    userID, courseName, workload, ects, priority,
    JSON.stringify(examDates), JSON.stringify(lectureTimes), JSON.stringify(null)
  );
  const courseID = info.lastInsertRowid;
  syncExamCalendarEntries(userID, courseID, courseName, examDates);
  syncLectureAndCommuteEntries(userID, courseID, courseName, lectureTimes, null, semesterEnd);
  return courseID;
}

const softwareEngineeringID = insertCourse({
  courseName: 'Software Engineering',
  workload: 60, // Platzhalter - bitte bei Bedarf anpassen
  ects: 6,
  priority: 4,
  examDates: ['2026-07-27T14:00:00'], // Dauer wird automatisch mit 2h angelegt
  lectureTimes: [{ weekday: 1, start: '14:00', end: '19:30' }], // Montag
});

const mathe2ID = insertCourse({
  courseName: 'Mathe 2',
  workload: 40, // Platzhalter
  ects: 5,
  priority: 3,
  examDates: [],
  lectureTimes: [{ weekday: 2, start: '09:00', end: '12:00' }], // Dienstag
});

const datenbankenID = insertCourse({
  courseName: 'Datenbanken',
  workload: 40, // Platzhalter
  ects: 5,
  priority: 3,
  examDates: [],
  lectureTimes: [{ weekday: 3, start: '09:00', end: '12:00' }], // Mittwoch
});

const gdiID = insertCourse({
  courseName: 'Grundlagen der Informatik',
  workload: 40, // Platzhalter
  ects: 5,
  priority: 3,
  examDates: [],
  lectureTimes: [{ weekday: 4, start: '09:00', end: '12:00' }], // Donnerstag
});

// ---------- 3. Sport (2x wöchentlich, wiederkehrend) ----------

const sportTaskID = db.prepare(`
  INSERT INTO task (taskName, description, location, status, discriminator, courseID, type, recurring, learnable)
  VALUES ('Fitnessstudio', NULL, NULL, 'offen', 'FixedTask', NULL, 'Training', 1, 0)
`).run().lastInsertRowid;

function isoAt(date, hour, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const rangeStart = new Date(semesterStart);
const rangeEnd = new Date(semesterEnd);
for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
  const weekday = d.getDay(); // 0=So ... 6=Sa
  if (weekday === 2 || weekday === 4) { // Dienstag + Donnerstag, 18-20 Uhr
    const start = isoAt(d, 18);
    const end = isoAt(d, 20);
    insertEntrySafe(userID, sportTaskID, toLocalISOString(start), toLocalISOString(end), null, `Fitnessstudio ${toLocalISOString(d).slice(0, 10)}`);
  }
}

// ---------- 4. Einmalige Termine ----------

const arztTaskID = db.prepare(`
  INSERT INTO task (taskName, description, location, status, discriminator, courseID, type, recurring, learnable)
  VALUES ('Arzttermin', NULL, NULL, 'offen', 'FixedTask', NULL, 'Sonstiges', 0, 0)
`).run().lastInsertRowid;
insertEntrySafe(userID, arztTaskID, '2026-06-01T10:00:00', '2026-06-01T12:00:00', 1, 'Arzttermin (01.06.2026, 10-12 Uhr)');

// ---------- Zusammenfassung ----------

const entryCount = db.prepare('SELECT COUNT(*) c FROM calendar_entry WHERE userID = ?').get(userID).c;
console.log('Semester-Beispieldaten angelegt:');
console.log({ userID, courses: [softwareEngineeringID, mathe2ID, datenbankenID, gdiID] });
console.log(`Insgesamt ${entryCount} Kalendereinträge über das Sommersemester 2026 generiert.`);

if (conflicts.length > 0) {
  console.log('\n⚠ Folgende Termine konnten wegen Überschneidung mit anderen Einträgen NICHT angelegt werden:');
  conflicts.forEach((c) => console.log(' - ' + c));
  console.log('Bitte in der GUI manuell lösen (z. B. Arbeitszeit an dem Tag anpassen oder den Termin verschieben).');
}
