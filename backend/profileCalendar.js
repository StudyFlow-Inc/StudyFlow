const db = require('./db');
const { toLocalISOString } = require('./scheduler');

// Interne Marker in Task.description, um automatisch aus dem Profil erzeugte
// Termine wiederzufinden und sauber zu ersetzen, ohne manuell angelegte
// Arbeits-/Pendelzeit-Termine des Users anzufassen.
const MARKER_WORK = '__profile_work__';
const MARKER_COMMUTE_WORK = '__profile_commute_work__';

const DEFAULT_HORIZON_DAYS = 90;

function weekdayToJsDay(weekday) {
  // weekday: 1=Montag ... 7=Sonntag  ->  JS: 0=Sonntag ... 6=Samstag
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
        WHERE description IN (?, ?)
      )
  `).run(userID, MARKER_WORK, MARKER_COMMUTE_WORK);

  db.prepare(`
    DELETE FROM task WHERE description IN (?, ?)
      AND taskID NOT IN (SELECT taskID FROM calendar_entry)
  `).run(MARKER_WORK, MARKER_COMMUTE_WORK);
}

/**
 * Legt (nach dem Aufräumen alter Einträge) frische CalendarEntries für die
 * im Profil angegebenen Arbeitszeiten und die Pendelzeit Arbeit/nach Hause an.
 * Die Pendelzeit braucht keine eigene Ankerzeit mehr - Hinweg endet, Rückweg
 * beginnt jeweils an der passenden Arbeitszeit selbst (aus workingHours).
 */
function generateWorkAndCommuteEntries(userID, { workingHours, commuteWork, semesterEnd }) {
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
  // Woche im Zeitraum. Gleichzeitig merken wir uns jedes Vorkommen (Datum +
  // Start/Ende), damit die Pendelzeit direkt daran andocken kann.
  const workTaskIds = {};
  const workOccurrences = []; // { date, start, end, weekday }

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
        const startDate = dateAt(d, row.start);
        const endDate = dateAt(d, row.end);
        insertEntry.run(userID, taskID, toLocalISOString(startDate), toLocalISOString(endDate));
        workOccurrences.push({ date: new Date(d), start: startDate, end: endDate, weekday: Number(row.weekday) });
      }
    }
  }

  // Pendelzeit Arbeit/nach Hause: Hinweg endet am Start der jeweiligen
  // Arbeitszeit, Rückweg beginnt an deren Ende - kein manueller Anker nötig.
  const c = commuteWork;
  if (c && Array.isArray(c.days) && c.days.length > 0 && (Number(c.minutesBefore) > 0 || Number(c.minutesAfter) > 0)) {
    const minutesBefore = Number(c.minutesBefore) || 0;
    const minutesAfter = Number(c.minutesAfter) || 0;
    const learnable = c.learnable ? 1 : 0;
    const taskID = insertTask.run('Pendelzeit (Arbeit)', MARKER_COMMUTE_WORK, 'Pendelzeit', learnable).lastInsertRowid;

    for (const occ of workOccurrences) {
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

module.exports = { generateWorkAndCommuteEntries, clearProfileGeneratedEntries };
