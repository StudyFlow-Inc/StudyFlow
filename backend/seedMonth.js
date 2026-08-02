/**
 * seedMonth.js
 * Legt Beispieldaten für einen ganzen Monat an: Max Mustermann mit
 * regelmäßiger Arbeit (Mo/Mi/Fr) und Training (Di/Do), wöchentlichem
 * Einkauf (Sa) sowie einem einmaligen Handwerker-Termin zuhause.
 * Guter Datensatz, um Wochen- und Monatsansicht sowie den
 * Planungsalgorithmus über einen längeren Zeitraum zu testen.
 *
 * Ausführen mit: node seedMonth.js
 */
const db = require('./db');

const { toLocalISOString } = require('./scheduler');

function isoAt(date, hour, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return toLocalISOString(d);
}

const seedMonth = db.transaction(() => {
  // 1. User
  const userInfo = db.prepare(`
    INSERT INTO user (userName, fieldOfStudy, employment, livingSituation)
    VALUES (?, ?, ?, ?)
  `).run('Max Mustermann', 'Informatik', 'Werkstudent, 15h/Woche', 'WG');
  const userID = userInfo.lastInsertRowid;

  // 2. Preferences: mehrere bevorzugte Lernzeiten (morgens + abends)
  db.prepare(`
    INSERT INTO user_preferences (userID, preferredTimes, maxHoursPerDay, breakDuration, bufferBeforeExam)
    VALUES (?, ?, ?, ?, ?)
  `).run(userID, JSON.stringify(['08:00', '18:00']), 4, 15, 3);

  // 3. Kurse
  const course1ID = db.prepare(`
    INSERT INTO course (userID, courseName, workload, ects, priority)
    VALUES (?, ?, ?, ?, ?)
  `).run(userID, 'Analysis 1', 30, 8, 5).lastInsertRowid;

  const course2ID = db.prepare(`
    INSERT INTO course (userID, courseName, workload, ects, priority)
    VALUES (?, ?, ?, ?, ?)
  `).run(userID, 'Datenbanken', 18, 6, 3).lastInsertRowid;

  // 4. FixedTasks anlegen (jeweils einmal, Termine folgen als mehrere CalendarEntries)
  const jobTaskID = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, type, recurring)
    VALUES (?, ?, ?, ?, 'FixedTask', ?, 1)
  `).run('Werkstudentenjob', 'Schicht im Lager', 'Lagerhalle Nord', 'offen', 'Arbeit').lastInsertRowid;

  const trainingTaskID = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, type, recurring)
    VALUES (?, ?, ?, ?, 'FixedTask', ?, 1)
  `).run('Fußballtraining', null, 'Sportplatz', 'offen', 'Training').lastInsertRowid;

  const shoppingTaskID = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, type, recurring)
    VALUES (?, ?, ?, ?, 'FixedTask', ?, 1)
  `).run('Wocheneinkauf', null, 'Supermarkt', 'offen', 'Freizeit').lastInsertRowid;

  const handwerkerTaskID = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, type, recurring)
    VALUES (?, ?, ?, ?, 'FixedTask', ?, 0)
  `).run('Handwerker-Termin', 'Reparatur Waschmaschine', 'Zuhause', 'offen', 'Sonstiges').lastInsertRowid;

  const insertEntry = db.prepare(`
    INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, reminder)
    VALUES (?, ?, ?, ?, ?)
  `);

  // 5. Wiederkehrende Termine über 30 Tage ab heute erzeugen
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() + i);
    const weekday = day.getDay(); // 0 = So ... 6 = Sa

    if ([1, 3, 5].includes(weekday)) {
      // Mo/Mi/Fr: Arbeit 14-18 Uhr
      insertEntry.run(userID, jobTaskID, isoAt(day, 14), isoAt(day, 18), '30 Min. vorher');
    }
    if ([2, 4].includes(weekday)) {
      // Di/Do: Training 19-21 Uhr
      insertEntry.run(userID, trainingTaskID, isoAt(day, 19), isoAt(day, 21), null);
    }
    if (weekday === 6) {
      // Samstag: Einkauf 10-11 Uhr
      insertEntry.run(userID, shoppingTaskID, isoAt(day, 10), isoAt(day, 11), null);
    }
  }

  // 6. Einmaliger Handwerker-Termin, 10 Tage ab heute, 9-11 Uhr
  const handwerkerDay = new Date(today);
  handwerkerDay.setDate(handwerkerDay.getDate() + 10);
  insertEntry.run(userID, handwerkerTaskID, isoAt(handwerkerDay, 9), isoAt(handwerkerDay, 11), '1 Tag vorher');

  return { userID, course1ID, course2ID };
});

const result = seedMonth();
console.log('Monats-Beispieldaten angelegt:');
console.log(result);
console.log(
  'Test Planungsalgorithmus: POST http://localhost:3000/api/schedule/generate  Body: { "userID": ' +
    result.userID +
    ', "days": 30 }'
);
