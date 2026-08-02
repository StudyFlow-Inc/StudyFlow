/**
 * seed.js
 * Legt Beispieldaten an: 1 User samt Preferences, 2 Kurse, ein paar
 * FixedTask-Termine (Arbeit/Freizeit) und einen bereits bestehenden
 * LearnSession-Task. Gut geeignet, um den Planungsalgorithmus direkt
 * zu testen, ohne alles manuell über die GUI einzutippen.
 *
 * Ausführen mit: node seed.js
 */
const db = require('./db');

// Hilfsfunktion: gibt ein ISO-Datum für "heute + Tage, Uhrzeit" zurück
function isoAt(daysFromNow, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const insertMany = db.transaction(() => {
  // 1. User
  const userInfo = db.prepare(`
    INSERT INTO user (userName, fieldOfStudy, employment, livingSituation)
    VALUES (?, ?, ?, ?)
  `).run('Max Mustermann', 'Informatik', 'Werkstudent, 15h/Woche', 'WG');
  const userID = userInfo.lastInsertRowid;

  // 2. Preferences
  db.prepare(`
    INSERT INTO user_preferences (userID, preferredTime, maxHoursPerDay, breakDuration, bufferBeforeExam)
    VALUES (?, ?, ?, ?, ?)
  `).run(userID, '18:00', 4, 15, 3);

  // 3. Kurse
  const course1 = db.prepare(`
    INSERT INTO course (userID, courseName, workload, ects, priority)
    VALUES (?, ?, ?, ?, ?)
  `).run(userID, 'Analysis 1', 20, 8, 5);
  const course1ID = course1.lastInsertRowid;

  const course2 = db.prepare(`
    INSERT INTO course (userID, courseName, workload, ects, priority)
    VALUES (?, ?, ?, ?, ?)
  `).run(userID, 'Datenbanken', 12, 6, 3);
  const course2ID = course2.lastInsertRowid;

  // 4. FixedTask: Arbeitsschicht (wiederkehrend, Mo/Mi 14-18 Uhr diese Woche)
  const jobTask = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, type, recurring)
    VALUES (?, ?, ?, ?, 'FixedTask', ?, ?)
  `).run('Werkstudentenjob', 'Schicht im Lager', 'Lagerhalle Nord', 'offen', 'Arbeit', 1);
  const jobTaskID = jobTask.lastInsertRowid;

  const insertEntry = db.prepare(`
    INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, reminder)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertEntry.run(userID, jobTaskID, isoAt(1, 14), isoAt(1, 18), '30 Min. vorher');
  insertEntry.run(userID, jobTaskID, isoAt(3, 14), isoAt(3, 18), '30 Min. vorher');

  // 5. FixedTask: Freizeittermin (Fußballtraining)
  const sportTask = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, type, recurring)
    VALUES (?, ?, ?, ?, 'FixedTask', ?, ?)
  `).run('Fußballtraining', null, 'Sportplatz', 'offen', 'Training', 1);
  const sportTaskID = sportTask.lastInsertRowid;
  insertEntry.run(userID, sportTaskID, isoAt(2, 19), isoAt(2, 21), null);

  // 6. Bereits bestehende LearnSession für Kurs 1 (damit "offener Zeitaufwand" nicht bei 0 anfängt)
  const learnTask = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, courseID)
    VALUES (?, ?, ?, ?, 'LearnSession', ?)
  `).run('Lernen: Analysis 1', null, null, 'erledigt', course1ID);
  const learnTaskID = learnTask.lastInsertRowid;
  insertEntry.run(userID, learnTaskID, isoAt(0, 9), isoAt(0, 11), null);

  return { userID, course1ID, course2ID };
});

const result = insertMany();
console.log('Beispieldaten angelegt:');
console.log(result);
console.log('Test: POST http://localhost:3000/api/schedule/generate  Body: { "userID": ' + result.userID + ' }');
