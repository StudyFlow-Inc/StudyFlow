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
 * Übersetzt UserPreferences.preferredTime in eine Stunden-Spanne.
 * preferredTime ist eine konkrete Uhrzeit (z. B. "18:00") oder ein
 * Zeitraum ("18:00-21:00"). Eine einzelne Uhrzeit wird als "ab dieser
 * Zeit bis Tagesende bevorzugt" interpretiert. Liefert null, wenn das
 * Feld leer oder nicht auswertbar ist – dann wird rein chronologisch
 * geplant.
 */
function parsePreferredWindow(preferredTime, dayStartHour, dayEndHour) {
  if (!preferredTime) return null;
  const text = preferredTime.trim();

  // Zeitraum, z. B. "18:00-21:00" oder "18-21"
  const rangeMatch = text.match(/^(\d{1,2})(?::(\d{2}))?\s*-\s*(\d{1,2})(?::(\d{2}))?$/);
  if (rangeMatch) {
    const startHour = Number(rangeMatch[1]) + (rangeMatch[2] ? Number(rangeMatch[2]) / 60 : 0);
    const endHour = Number(rangeMatch[3]) + (rangeMatch[4] ? Number(rangeMatch[4]) / 60 : 0);
    const clampedStart = Math.max(startHour, dayStartHour);
    const clampedEnd = Math.min(endHour, dayEndHour);
    if (clampedStart < clampedEnd) return { startHour: clampedStart, endHour: clampedEnd };
    return null;
  }

  // einzelne Uhrzeit, z. B. "18:00" -> bevorzugt ab dieser Zeit bis Tagesende
  const singleMatch = text.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (singleMatch) {
    const startHour = Number(singleMatch[1]) + (singleMatch[2] ? Number(singleMatch[2]) / 60 : 0);
    const clampedStart = Math.max(startHour, dayStartHour);
    if (clampedStart < dayEndHour) return { startHour: clampedStart, endHour: dayEndHour };
    return null;
  }

  return null;
}

/**
 * Teilt die freien Zeitfenster in "preferred" (überschneidet sich mit
 * dem bevorzugten Zeitfenster des Users, an jedem Tag neu berechnet)
 * und "other" (der Rest) auf. Slots, die nur teilweise überlappen,
 * werden an der Grenze aufgeteilt statt komplett verworfen.
 */
function splitSlotsByPreference(freeSlots, preferredWindow) {
  if (!preferredWindow) {
    return { preferred: [], other: [...freeSlots].sort((a, b) => a.start - b.start) };
  }

  const preferred = [];
  const other = [];

  for (const slot of freeSlots) {
    const day = new Date(slot.start);
    const prefStart = new Date(day);
    prefStart.setHours(preferredWindow.startHour, 0, 0, 0);
    const prefEnd = new Date(day);
    prefEnd.setHours(preferredWindow.endHour, 0, 0, 0);

    const overlapStart = slot.start > prefStart ? slot.start : prefStart;
    const overlapEnd = slot.end < prefEnd ? slot.end : prefEnd;

    if (overlapStart < overlapEnd) {
      preferred.push({ start: overlapStart, end: overlapEnd });
      if (slot.start < overlapStart) other.push({ start: slot.start, end: overlapStart });
      if (slot.end > overlapEnd) other.push({ start: overlapEnd, end: slot.end });
    } else {
      other.push(slot);
    }
  }

  preferred.sort((a, b) => a.start - b.start);
  other.sort((a, b) => a.start - b.start);
  return { preferred, other };
}

module.exports = {
  generateFreeSlots,
  allocateSessions,
  parsePreferredWindow,
  splitSlotsByPreference,
};
