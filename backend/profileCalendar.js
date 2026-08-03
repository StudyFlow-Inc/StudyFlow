const db = require('./db');
const { toLocalISOString } = require('./scheduler');

// Interne Marker in Task.description, um automatisch aus dem Profil erzeugte
// Termine wiederzufinden und sauber zu ersetzen, ohne manuell angelegte
// Arbeits-/Pendelzeit-Termine des Users anzufassen.
const MARKER_WORK = '__profile_work__';
const MARKER_COMMUTE_WORK = '__profile_commute_work__';
const MARKER_COMMUTE_UNI = '__profile_commute_uni__';

const DEFAULT_HORIZON_DAYS = 90;

function weekdayToJsDay(weekday) {
  // weekday: 1=Montag ... 7=Sonntag  ->  JS: 0=Sonntag ... 6=Samstag
  return weekday % 7;
}

function isoAt(date, timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m || 0, 0, 0);
  return toLocalISOString(d);
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
  fallback.setDate(fallback.getDate() + DEFAULT_HORIZON_DAYS);

  if (!semesterEnd) return fallback;
  const end = new Date(semesterEnd);
  if (isNaN(end)) return fallback;
  // Auf einen sinnvollen Maximalzeitraum begrenzen, damit ein sehr weit
  // entferntes Semesterende nicht Tausende Termine erzeugt
  const maxEnd = new Date(today);
  maxEnd.setDate(maxEnd.getDate() + 180);
  return end < maxEnd ? end : maxEnd;
}

/**
 * Entfernt alle zuvor aus dem Profil generierten Arbeits-/Pendelzeit-Termine
 * dieses Users (erkannt am description-Marker), damit ein erneutes Speichern
 * des Profils sauber neu generiert statt zu verdoppeln.
 */
function clearProfileGeneratedEntries(userID) {
  db.prepare(`
    DELETE FROM calendar_entry
    WHERE userID = ?
      AND taskID IN (
        SELECT taskID FROM task
        WHERE description IN (?, ?, ?)
      )
  `).run(userID, MARKER_WORK, MARKER_COMMUTE_WORK, MARKER_COMMUTE_UNI);

  db.prepare(`
    DELETE FROM task WHERE description IN (?, ?, ?)
      AND taskID NOT IN (SELECT taskID FROM calendar_entry)
  `).run(MARKER_WORK, MARKER_COMMUTE_WORK, MARKER_COMMUTE_UNI);
}

/**
 * Legt (nach dem Aufräumen alter Einträge) frische CalendarEntries für die
 * im Profil angegebenen Arbeitszeiten und Pendelzeiten an - direkt im
 * Kalender sichtbar, über den angegebenen Zeitraum (Semesterende, sonst 90 Tage).
 */
function generateWorkAndCommuteEntries(userID, { workingHours, commuteWork, commuteUni, semesterEnd }) {
  clearProfileGeneratedEntries(userID);

  const end = horizonEnd(semesterEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const insertTask = db.prepare(`
    INSERT INTO task (taskName, description, location, status, discriminator, type, recurring, learnable)
    VALUES (?, ?, NULL, 'offen', 'FixedTask', ?, 1, ?)
  `);
  const insertEntry = db.prepare(`
    INSERT INTO calendar_entry (userID, taskID, startDateTime, endDateTime, reminder, isManual)
    VALUES (?, ?, ?, ?, NULL, 0)
  `);

  // Arbeitszeiten: eine Task pro Wochentag-Zeile, Termine für jede passende
  // Woche im Zeitraum
  const workTaskIds = {};
  for (const row of workingHours || []) {
    if (!row || !row.start || !row.end || !row.weekday) continue;
    const key = `${row.weekday}-${row.start}-${row.end}`;
    if (!workTaskIds[key]) {
      workTaskIds[key] = insertTask.run('Arbeit', MARKER_WORK, 'Arbeit', 0).lastInsertRowid;
    }
    const taskID = workTaskIds[key];
    const jsDay = weekdayToJsDay(Number(row.weekday));

    for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === jsDay) {
        insertEntry.run(userID, taskID, isoAt(d, row.start), isoAt(d, row.end));
      }
    }
  }

  // Pendelzeiten: max. 2 Blöcke (Arbeit, Uni), je mit eigenen Wochentagen.
  // Hinweg = Ankunft minus Minuten davor, Rückweg = Abfahrt plus Minuten danach.
  const commuteBlocks = [
    { data: commuteWork, marker: MARKER_COMMUTE_WORK, label: 'Pendelzeit (Arbeit)' },
    { data: commuteUni, marker: MARKER_COMMUTE_UNI, label: 'Pendelzeit (Uni)' },
  ];

  for (const block of commuteBlocks) {
    const c = block.data;
    if (!c || !Array.isArray(c.days) || c.days.length === 0) continue;
    const minutesBefore = Number(c.minutesBefore) || 0;
    const minutesAfter = Number(c.minutesAfter) || 0;
    if (!c.arrival && !c.departure) continue;
    if (minutesBefore <= 0 && minutesAfter <= 0) continue;

    const learnable = c.learnable ? 1 : 0;
    const taskID = insertTask.run(block.label, block.marker, 'Pendelzeit', learnable).lastInsertRowid;
    const jsDays = c.days.map((wd) => weekdayToJsDay(Number(wd)));

    for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
      if (!jsDays.includes(d.getDay())) continue;

      if (minutesBefore > 0 && c.arrival) {
        const arrival = dateAt(d, c.arrival);
        const start = new Date(arrival.getTime() - minutesBefore * 60_000);
        insertEntry.run(userID, taskID, toLocalISOString(start), toLocalISOString(arrival));
      }
      if (minutesAfter > 0 && c.departure) {
        const departure = dateAt(d, c.departure);
        const end2 = new Date(departure.getTime() + minutesAfter * 60_000);
        insertEntry.run(userID, taskID, toLocalISOString(departure), toLocalISOString(end2));
      }
    }
  }
}

module.exports = { generateWorkAndCommuteEntries, clearProfileGeneratedEntries };
