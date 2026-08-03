const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'lernplaner.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS user (
  userID INTEGER PRIMARY KEY AUTOINCREMENT,
  userName TEXT NOT NULL,
  fieldOfStudy TEXT,
  employment TEXT,
  livingSituation TEXT,
  semesterType TEXT,
  semesterStart TEXT,
  semesterEnd TEXT,
  semesterNumber INTEGER,
  workingHours TEXT,
  commuteWork TEXT,
  commuteUni TEXT
);

CREATE TABLE IF NOT EXISTS user_preferences (
  userID INTEGER PRIMARY KEY REFERENCES user(userID) ON DELETE CASCADE,
  preferredTimes TEXT,
  maxHoursPerDay REAL,
  breakDuration INTEGER,
  bufferBeforeExam INTEGER,
  favoriteLocation TEXT,
  excludedWeekdays TEXT
);

CREATE TABLE IF NOT EXISTS course (
  courseID INTEGER PRIMARY KEY AUTOINCREMENT,
  userID INTEGER REFERENCES user(userID) ON DELETE CASCADE,
  courseName TEXT NOT NULL,
  workload REAL,
  ects INTEGER,
  priority INTEGER,
  examDates TEXT,
  materialGoal TEXT
);

CREATE TABLE IF NOT EXISTS task (
  taskID INTEGER PRIMARY KEY AUTOINCREMENT,
  taskName TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT,
  discriminator TEXT NOT NULL CHECK(discriminator IN ('LearnSession','FixedTask')),
  courseID INTEGER REFERENCES course(courseID) ON DELETE CASCADE,
  type TEXT,
  recurring INTEGER,
  learnable INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS calendar_entry (
  entryID INTEGER PRIMARY KEY AUTOINCREMENT,
  userID INTEGER REFERENCES user(userID) ON DELETE CASCADE,
  taskID INTEGER REFERENCES task(taskID) ON DELETE CASCADE,
  startDateTime TEXT NOT NULL,
  endDateTime TEXT NOT NULL,
  reminder TEXT,
  isManual INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS calendar_change (
  changeID INTEGER PRIMARY KEY AUTOINCREMENT,
  entryID INTEGER REFERENCES calendar_entry(entryID) ON DELETE CASCADE,
  oldSlot TEXT,
  newSlot TEXT,
  reason TEXT,
  timestamp TEXT
);
`);

module.exports = db;
