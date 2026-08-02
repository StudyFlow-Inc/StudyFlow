/**
 * scheduler.js
 * Reine Planungslogik, unabhängig von der Datenbank – so lässt sich der
 * Algorithmus isoliert testen (z. B. mit Beispieldaten), bevor er an
 * echte DB-Daten angeschlossen wird.
 */

/**
 * Berechnet freie Zeitfenster über mehrere Tage, ausgehend von einem
 * Tagesraster (dayStartHour–dayEndHour) abzüglich bereits belegter
 * Intervalle (z. B. FixedTask-Termine wie Arbeit/Vorlesung).
 */
function generateFreeSlots({ startDate, days, dayStartHour, dayEndHour, busyIntervals }) {
  const slots = [];

  for (let d = 0; d < days; d++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + d);

    const dayStart = new Date(day);
    dayStart.setHours(dayStartHour, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(dayEndHour, 0, 0, 0);

    const dayBusy = busyIntervals
      .filter((b) => b.end > dayStart && b.start < dayEnd)
      .map((b) => ({
        start: b.start < dayStart ? dayStart : b.start,
        end: b.end > dayEnd ? dayEnd : b.end,
      }))
      .sort((a, b) => a.start - b.start);

    let cursor = dayStart;
    for (const busy of dayBusy) {
      if (busy.start > cursor) {
        slots.push({ start: new Date(cursor), end: new Date(busy.start) });
      }
      if (busy.end > cursor) cursor = busy.end;
    }
    if (cursor < dayEnd) {
      slots.push({ start: new Date(cursor), end: new Date(dayEnd) });
    }
  }

  return slots;
}

/**
 * Verteilt offenen Lernbedarf (pro Kurs) auf die freien Zeitfenster.
 * Kurse mit höherer priority werden zuerst bedient. Pro Tag wird
 * maxHoursPerDay nicht überschritten, zwischen Sessions liegt eine Pause
 * (breakMinutes).
 *
 * courses: [{ courseID, remainingHours, priority }]
 * -> mutiert NICHT das Input-Array, arbeitet auf einer Kopie
 */
function allocateSessions({ freeSlots, courses, chunkHours = 2, breakMinutes = 15, maxHoursPerDay = 6 }) {
  const queue = courses
    .filter((c) => c.remainingHours > 0)
    .map((c) => ({ ...c }))
    .sort((a, b) => b.priority - a.priority);

  const assignments = [];
  const dayUsage = {};

  for (const slot of freeSlots) {
    let cursor = new Date(slot.start);

    while (cursor < slot.end && queue.some((c) => c.remainingHours > 0)) {
      const dayKey = cursor.toDateString();
      dayUsage[dayKey] = dayUsage[dayKey] || 0;
      if (dayUsage[dayKey] >= maxHoursPerDay) break; // Tageskontingent erreicht -> nächster Slot

      const course = queue.find((c) => c.remainingHours > 0);
      if (!course) break;

      const remainingSlotHours = (slot.end - cursor) / 3_600_000;
      const remainingDayHours = maxHoursPerDay - dayUsage[dayKey];
      const hoursToUse = Math.min(chunkHours, course.remainingHours, remainingSlotHours, remainingDayHours);

      if (hoursToUse <= 0) break;

      const sessionEnd = new Date(cursor.getTime() + hoursToUse * 3_600_000);
      assignments.push({ courseID: course.courseID, start: new Date(cursor), end: sessionEnd });

      course.remainingHours -= hoursToUse;
      dayUsage[dayKey] += hoursToUse;
      cursor = new Date(sessionEnd.getTime() + breakMinutes * 60_000);
    }
  }

  return assignments;
}

/**
 * Übersetzt UserPreferences.preferredTimes (JSON-Array mehrerer
 * Uhrzeiten, z. B. '["08:00","18:00"]') in mehrere Stunden-Spannen.
 * Jede Uhrzeit erzeugt ein Präferenz-Fenster von windowHours Länge ab
 * dieser Zeit. Liefert ein leeres Array, wenn nichts auswertbar ist –
 * dann wird rein chronologisch geplant.
 */
function parsePreferredWindows(preferredTimes, dayStartHour, dayEndHour, windowHours = 3) {
  if (!preferredTimes) return [];

  let times;
  try {
    times = typeof preferredTimes === 'string' ? JSON.parse(preferredTimes) : preferredTimes;
  } catch {
    times = [preferredTimes]; // Abwärtskompatibilität: einzelner String statt JSON-Array
  }
  if (!Array.isArray(times)) times = [times];

  const windows = [];
  for (const t of times) {
    const match = String(t).trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (!match) continue;
    const startHour = Number(match[1]) + (match[2] ? Number(match[2]) / 60 : 0);
    const clampedStart = Math.max(startHour, dayStartHour);
    const clampedEnd = Math.min(startHour + windowHours, dayEndHour);
    if (clampedStart < clampedEnd) windows.push({ startHour: clampedStart, endHour: clampedEnd });
  }
  return windows;
}

/**
 * Teilt die freien Zeitfenster in "preferred" (überschneidet sich mit
 * einem der bevorzugten Zeitfenster, an jedem Tag neu berechnet) und
 * "other" (der Rest) auf. Überlappende Präferenz-Fenster desselben
 * Tages werden zuerst zusammengeführt. Slots, die nur teilweise
 * überlappen, werden an der Grenze aufgeteilt statt komplett verworfen.
 */
function splitSlotsByPreference(freeSlots, preferredWindows) {
  if (!preferredWindows || preferredWindows.length === 0) {
    return { preferred: [], other: [...freeSlots].sort((a, b) => a.start - b.start) };
  }

  const preferred = [];
  const other = [];

  for (const slot of freeSlots) {
    const day = new Date(slot.start);

    const dayWindows = preferredWindows
      .map((w) => {
        const start = new Date(day);
        start.setHours(Math.floor(w.startHour), Math.round((w.startHour % 1) * 60), 0, 0);
        const end = new Date(day);
        end.setHours(Math.floor(w.endHour), Math.round((w.endHour % 1) * 60), 0, 0);
        return { start, end };
      })
      .sort((a, b) => a.start - b.start);

    // überlappende Fenster desselben Tages zusammenführen
    const merged = [];
    for (const w of dayWindows) {
      const last = merged[merged.length - 1];
      if (last && w.start <= last.end) {
        if (w.end > last.end) last.end = w.end;
      } else {
        merged.push({ ...w });
      }
    }

    let cursor = slot.start;
    for (const w of merged) {
      const overlapStart = cursor > w.start ? cursor : w.start;
      const overlapEnd = slot.end < w.end ? slot.end : w.end;
      if (overlapStart < overlapEnd) {
        if (cursor < overlapStart) other.push({ start: cursor, end: overlapStart });
        preferred.push({ start: overlapStart, end: overlapEnd });
        cursor = overlapEnd;
      }
    }
    if (cursor < slot.end) other.push({ start: cursor, end: slot.end });
  }

  preferred.sort((a, b) => a.start - b.start);
  other.sort((a, b) => a.start - b.start);
  return { preferred, other };
}

module.exports = {
  generateFreeSlots,
  allocateSessions,
  parsePreferredWindows,
  splitSlotsByPreference,
};
