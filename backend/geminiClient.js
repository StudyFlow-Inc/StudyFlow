/**
 * geminiClient.js
 * Schlanker Client für die kostenlose Gemini API (Google AI Studio).
 * Nutzt Node's eingebautes fetch (Node 18+), keine zusätzliche
 * Abhängigkeit nötig außer dotenv für den API-Key.
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

function buildPrompt({ changeDescription, allEntries, maxHoursPerDay, preferredTimesText }) {
  return `Du bist ein Assistent, der einen bestehenden Kalender/Lernplan bei Änderungen anpasst.

Es gab folgende Änderung, auf die reagiert werden muss: "${changeDescription}"

Alle relevanten Termine im Zeitraum (JSON, "entryID" ist der eindeutige Bezeichner):
${JSON.stringify(allEntries, null, 2)}

Jeder Termin hat die Felder:
- "type": "FixedTask" (fester Termin wie Arbeit/Freizeit/Training) oder "LearnSession" (Lernsession)
- "editable": true oder false
  - true = dieser Termin darf bei Bedarf verschoben/verändert werden
  - false = dieser Termin ist geschützt und darf NIEMALS verändert werden (z. B. weil der Nutzer ihn manuell bearbeitet hat)

Deine Aufgabe:
1. Falls die Änderungsbeschreibung eine konkrete Anpassung an einem bestehenden Termin beschreibt (z. B. "Schicht X wurde bis 20 Uhr verlängert"), identifiziere GENAU DIESEN einen Termin anhand von Name/Zeit und passe seine Zeit entsprechend an - aber NUR wenn "editable": true für ihn gilt.
2. Prüfe danach, welche "LearnSession"-Termine mit "editable": true durch diese Änderung neu überschnitten würden, und verschiebe NUR diese in ein freies Zeitfenster.
3. Termine mit "editable": false NIEMALS verändern, auch wenn sie betroffen scheinen.
4. Verschiebe nichts, was nicht tatsächlich von der Änderung betroffen ist.

Randbedingungen für neue Zeiten von LearnSessions:
- Maximal ${maxHoursPerDay} Stunden Lernzeit pro Tag insgesamt
- Bevorzugte Lernzeiten, falls möglich einhalten: ${preferredTimesText || 'keine besonderen Präferenzen angegeben'}
- Eine neue Zeit darf sich mit keinem anderen Termin überschneiden

Antworte AUSSCHLIESSLICH mit folgendem JSON-Format, ohne zusätzlichen Text, ohne Markdown-Codeblock:
{
  "changes": [
    { "entryID": <Zahl>, "newStart": "<ISO-8601-Datetime>", "newEnd": "<ISO-8601-Datetime>", "reason": "<kurzer Grund, 1 Satz>" }
  ],
  "summary": "<ein Satz, der die Anpassung insgesamt zusammenfasst>"
}

Wenn kein Termin betroffen ist, gib "changes": [] zurück.`;
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
  maxHoursPerDay,
  preferredTimesText,
}) {
  const prompt = buildPrompt({ changeDescription, allEntries, maxHoursPerDay, preferredTimesText });

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
