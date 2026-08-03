/**
 * geminiClient.js
 * Schlanker Client für die kostenlose Gemini API (Google AI Studio).
 * Nutzt Node's eingebautes fetch (Node 18+), keine zusätzliche
 * Abhängigkeit nötig außer dotenv für den API-Key.
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

function buildPrompt({ changeDescription, allEntries, courses, freeSlots, maxHoursPerDay, preferredTimesText, rangeStart, rangeEnd }) {
  return `Du bist ein Assistent, der einen bestehenden Kalender/Lernplan pflegt.

Anfrage des Nutzers: "${changeDescription}"

WICHTIG: Du darfst NUR innerhalb des Zeitraums ${rangeStart} bis ${rangeEnd} etwas ändern oder erstellen. Alles außerhalb bleibt unangetastet.

Diese Anfrage kann mehreres bedeuten (auch kombiniert):
A) Eine Änderung an einem bestehenden Termin (z. B. "Schicht X wurde bis 20 Uhr verlängert")
   -> vorhandene Termine ggf. verschieben (siehe "changes" unten)
B) Eine Bitte, NEUE Lernsessions einzuplanen (z. B. "Plane Lernsessions für Datenbanken diese Woche ein")
   -> neue Einträge mit entryType "LearnSession" (siehe "newEntries" unten)
C) Eine Bitte, einen NEUEN festen Termin anzulegen (z. B. "Zahnarzttermin Freitag 10-11 Uhr")
   -> neuer Eintrag mit entryType "FixedTask" (siehe "newEntries" unten)
D) Eine Bitte, einen bestehenden Termin ZU LÖSCHEN (z. B. "Training am Donnerstag fällt aus", "Lösche die Lernsession für Analysis am Montag")
   -> identifiziere GENAU DIESEN einen Termin anhand von Name/Zeit und gib ihn in "deletions" an - aber NUR wenn "editable": true für ihn gilt
E) Eine Bitte, einen bestehenden Termin UMZUBENENNEN (z. B. "Nenne den Zahnarzttermin in Kontrolltermin um")
   -> identifiziere GENAU DIESEN einen Termin anhand von Name/Zeit und gib ihn in "renames" an - aber NUR wenn "editable": true für ihn gilt
F) Eine reine FRAGE zum Kalender, die keine Änderung erfordert (z. B. "Wann ist meine nächste Lernsession?", "Wie viele Termine habe ich diese Woche?", "Ist am Montag noch Zeit frei?")
   -> beantworte die Frage direkt und knapp anhand der Termine unten, setze das Ergebnis in "answer", und lasse "changes", "newEntries", "deletions", "renames" leer sowie "needsClarification" auf false

Alle relevanten bestehenden Termine im Zeitraum (JSON, "entryID" ist der eindeutige Bezeichner):
${JSON.stringify(allEntries, null, 2)}

Jeder bestehende Termin hat:
- "type": "FixedTask" oder "LearnSession"
- "editable": true (darf verschoben werden) oder false (geschützt, NIEMALS verändern)

Kurse mit noch offenem Lernbedarf (Stunden, die noch nicht verplant sind):
${JSON.stringify(courses, null, 2)}

Freie Zeitfenster für neue LernSessions (jede neue LearnSession MUSS vollständig innerhalb
eines dieser Fenster liegen; für neue FixedTask-Termine gilt das NICHT, die dürfen zu jeder
Zeit liegen, solange sie sich mit nichts überschneiden):
${JSON.stringify(freeSlots, null, 2)}

Randbedingungen:
- Maximal ${maxHoursPerDay} Stunden Lernzeit pro Tag insgesamt (bestehende + neue LearnSessions zusammen)
- Bevorzugte Lernzeiten, falls möglich einhalten: ${preferredTimesText || 'keine besonderen Präferenzen angegeben'}
- Plane für einen Kurs nicht mehr Stunden neu ein, als bei ihm als "openHours" angegeben ist
- Verschiebe nur Termine mit "editable": true, und nur wenn sie tatsächlich betroffen sind
- Erfinde keine Kurse - nutze für "courseName" exakt einen Namen aus der Kursliste oben
- Ein neuer FixedTask braucht einen sinnvollen "taskName" (z. B. "Zahnarzttermin") und "appointmentType" (einer von: Arbeit, Freizeit, Training, Sonstiges)
- Kein neuer oder verschobener Termin darf sich mit einem bestehenden oder einem anderen neuen Termin überschneiden
- Lösche NUR einen Termin mit "editable": true, und nur wenn er eindeutig identifizierbar ist (Name + Zeit passen erkennbar zur Anfrage). Im Zweifel lieber NICHTS löschen, statt zu raten
- Ein Termin taucht pro Antwort nur EINMAL auf: entweder in "changes", "deletions" oder unverändert - niemals in mehreren gleichzeitig

WICHTIG zum Zeitformat: Alle Datums-/Uhrzeitangaben oben sind LOKALE Uhrzeit (Wanduhrzeit), OHNE Zeitzonen-Suffix und OHNE "Z". Führe KEINE Umrechnung nach UTC oder in eine andere Zeitzone durch - behandle die Zahlen genau so, wie sie dastehen (z. B. bedeutet "09:00:00" wortwörtlich 9 Uhr morgens lokale Zeit). Gib deine Antwortzeiten im EXAKT GLEICHEN Format zurück: "YYYY-MM-DDTHH:MM:SS", ohne "Z", ohne Zeitzonen-Offset.

Falls die Anfrage mehrdeutig ist (z. B. mehrere Termine passen gleichermaßen zur Beschreibung,
oder eine notwendige Angabe fehlt - etwa welcher Kurs gemeint ist oder wie lange eine neue
Session dauern soll): STELLE STATTDESSEN EINE EINZIGE, KURZE RÜCKFRAGE, statt zu raten. Setze
dafür "needsClarification": true und "clarifyingQuestion" auf die Frage, und lasse "changes",
"newEntries", "deletions" und "renames" leer.
WICHTIG: Eine reine informative Frage (Option F, z. B. "wann ist meine nächste Lernsession?")
ist NICHT automatisch mehrdeutig - beantworte sie direkt über "answer", auch wenn du dafür nur
die unten gelisteten Termine zur Verfügung hast. Frage nur nach, wenn die Frage selbst ohne
weitere Angabe wirklich nicht beantwortbar ist.

Antworte AUSSCHLIESSLICH mit folgendem JSON-Format, ohne zusätzlichen Text, ohne Markdown-Codeblock:
{
  "changes": [
    { "entryID": <Zahl>, "newStart": "<YYYY-MM-DDTHH:MM:SS>", "newEnd": "<YYYY-MM-DDTHH:MM:SS>", "reason": "<kurzer Grund>" }
  ],
  "newEntries": [
    { "entryType": "LearnSession", "courseName": "<exakter Kursname>", "start": "<YYYY-MM-DDTHH:MM:SS>", "end": "<YYYY-MM-DDTHH:MM:SS>", "reason": "<kurzer Grund>" },
    { "entryType": "FixedTask", "taskName": "<Bezeichnung>", "appointmentType": "<Arbeit|Freizeit|Training|Sonstiges>", "start": "<YYYY-MM-DDTHH:MM:SS>", "end": "<YYYY-MM-DDTHH:MM:SS>", "reason": "<kurzer Grund>" }
  ],
  "deletions": [
    { "entryID": <Zahl>, "reason": "<kurzer Grund>" }
  ],
  "renames": [
    { "entryID": <Zahl>, "newName": "<neue Bezeichnung>", "reason": "<kurzer Grund>" }
  ],
  "needsClarification": <true oder false>,
  "clarifyingQuestion": "<Frage an den Nutzer, nur falls needsClarification true ist, sonst leer>",
  "answer": "<Antworttext, nur falls es eine reine Frage war (Option F), sonst leer>",
  "summary": "<ein Satz, der alles zusammenfasst>"
}

Wenn nichts verschoben werden muss, "changes": []. Wenn keine neuen Einträge gewünscht/nötig sind, "newEntries": []. Wenn nichts gelöscht werden soll, "deletions": []. Wenn nichts umbenannt werden soll, "renames": [].`;
}

/**
 * Ruft Gemini auf und liefert das geparste { changes, summary } zurück.
 * Wirft einen Error mit verständlicher Meldung bei HTTP-Fehlern oder
 * wenn die Antwort kein gültiges JSON ist.
 */
async function requestRescheduleFromGemini({
  apiKey,
  changeDescription,
  allEntries,
  courses,
  freeSlots,
  maxHoursPerDay,
  preferredTimesText,
  rangeStart,
  rangeEnd,
}) {
  const prompt = buildPrompt({ changeDescription, allEntries, courses, freeSlots, maxHoursPerDay, preferredTimesText, rangeStart, rangeEnd });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API Fehler (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini hat keine verwertbare Antwort geliefert.');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Gemini-Antwort war kein gültiges JSON: ' + text.slice(0, 300));
  }
}

module.exports = { requestRescheduleFromGemini };
