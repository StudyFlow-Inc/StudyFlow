require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const userRouter = require('./routes/user');
const courseRouter = require('./routes/course');
const taskRouter = require('./routes/task');
const calendarEntryRouter = require('./routes/calendarEntry');
const calendarChangeRouter = require('./routes/calendarChange');
const scheduleRouter = require('./routes/schedule');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  try {
    const result = db.prepare('SELECT 1 AS ok').get();
    res.json({ server: 'läuft', db: result.ok === 1 ? 'verbunden' : 'Fehler' });
  } catch (err) {
    res.status(500).json({ server: 'läuft', db: 'Fehler', error: err.message });
  }
});

// Backup: liefert die komplette SQLite-Datei zum Download
app.get('/api/backup', (req, res) => {
  const dbPath = path.join(__dirname, 'data', 'lernplaner.db');
  res.download(dbPath, 'studyflow-backup.db', (err) => {
    if (err) {
      console.error('Fehler beim Backup-Download:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Backup konnte nicht erstellt werden.' });
    }
  });
});

// Gesetzliche Feiertage (Deutschland) über die kostenlose Nager.Date-API -
// keine Anmeldung/API-Key nötig.
const { getHolidays } = require('./holidays');
app.get('/api/holidays/:year', async (req, res) => {
  const holidays = await getHolidays(req.params.year);
  res.json(holidays);
});

app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/calendar-entries', calendarEntryRouter);
app.use('/api/calendar-changes', calendarChangeRouter);
app.use('/api/schedule', scheduleRouter);

app.listen(3000, () => {
  console.log('Backend läuft auf http://localhost:3000');
  if (!process.env.GEMINI_API_KEY) {
    console.log('Hinweis: GEMINI_API_KEY ist nicht gesetzt - /api/schedule/optimize wird fehlschlagen. Siehe .env.example.');
  }
});
