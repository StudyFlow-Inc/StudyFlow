/**
 * holidays.js
 * Schlanker, gecachter Zugriff auf die kostenlose Nager.Date-API für
 * gesetzliche deutsche Feiertage. Wird sowohl vom /api/holidays/:year
 * Endpunkt als auch direkt vom Planungsalgorithmus (routes/schedule.js)
 * genutzt, damit Feiertage automatisch von der Lernzeit ausgeschlossen
 * werden.
 */
const cache = {};

async function getHolidays(year) {
  if (cache[year]) return cache[year];
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/DE`);
    if (!response.ok) throw new Error(`Feiertags-API antwortete mit ${response.status}`);
    const data = await response.json();
    const holidays = data.map((h) => ({ date: h.date, name: h.localName }));
    cache[year] = holidays;
    return holidays;
  } catch (err) {
    console.error(`Fehler beim Abrufen der Feiertage ${year}:`, err.message);
    return [];
  }
}

/**
 * Liefert alle Feiertagsdaten (nur "YYYY-MM-DD") für den Zeitraum
 * [startDate, endDate], über Jahresgrenzen hinweg.
 */
async function getHolidayDatesInRange(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const dates = [];
  for (let y = startYear; y <= endYear; y++) {
    const holidays = await getHolidays(y);
    dates.push(...holidays.map((h) => h.date));
  }
  return dates;
}

module.exports = { getHolidays, getHolidayDatesInRange };
