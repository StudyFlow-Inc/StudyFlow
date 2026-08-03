# StudyFlow

A web application for time-based study planning for students. It takes into
account courses, exams, lecture times, work shifts, commute times, and
leisure appointments, and adjusts the study plan automatically via an AI
assistant (Gemini API) when things change.

## Features

- **Profile**: field of study, semester info (type/start/end/number),
  recurring working hours (auto-generates calendar entries), commute to
  work/home (auto-anchored to working hours, no manual clock time needed)
- **Courses**: workload (total, per week, or per month – auto-projected
  using the semester end date), ECTS, priority, exam dates with time
  (auto-added to the calendar), recurring lecture times, commute to
  campus/home (auto-anchored to lecture times), material goal, and an
  optional folder path for course materials
- **Tasks & appointments**: learn sessions (tied to a course) or fixed
  appointments, with notes, location, quick status editing, and reminders
  (days-before popup)
- **Calendar**: week/month view showing the full day, today and public
  holidays (Germany, via a free API) highlighted, drag-free manual
  editing with overlap prevention, undo for the last change
- **Rule-based study planner**: schedules open course workload into free
  time slots, respecting preferred study times, daily hour limits,
  excluded weekdays, and public holidays
- **AI assistant**: a floating chat bubble (visible everywhere except
  while a popup is open) that can answer questions about your calendar,
  move/create/rename/delete automatically generated entries, or plan new
  learn sessions – every suggestion is shown for confirmation before
  anything is written
- **Search**: jumps directly to the matching calendar entry and briefly
  highlights it
- **Backup**: one-click database download from the Profile page
- **Bilingual UI** (English default, German available) and a light/dark
  theme toggle
- **First-run tutorial** explaining the navigation, shown once

## Architecture

- **Frontend:** plain HTML/CSS/JS, no frameworks. Sidebar navigation +
  floating AI chat bubble
- **Backend:** Node.js + Express – now also serves the frontend as static
  files, so both run on a single port
- **Database:** SQLite (local file, no separate DB server needed)
- **AI:** Google Gemini API (free tier)
- **External API:** Nager.Date (free, no key) for German public holidays

Everything runs locally on one machine – there is no central/shared
server, each installation is independent.

```
project/
├── Start-StudyFlow.bat        Windows: double-click to launch
├── Start-StudyFlow.command    macOS: double-click to launch
├── start-studyflow.sh         Linux: run in a terminal
├── .gitignore
├── backend/
│   ├── db.js                 database schema + connection
│   ├── server.js             Express server; serves API + frontend, opens the browser
│   ├── scheduler.js          planning algorithm (pure logic, no DB)
│   ├── profileCalendar.js    generates calendar entries from working hours/commute
│   ├── holidays.js           cached lookup of German public holidays
│   ├── geminiClient.js       connection to the Gemini API
│   ├── seed.js               sample data (1 week)
│   ├── seedMonth.js          sample data (1 month, recurring appointments)
│   ├── seedSemester.js       sample data (a full semester, courses + work + sport)
│   ├── .env.example          template for the Gemini API key
│   ├── data/                 SQLite file (created automatically)
│   └── routes/
│       ├── user.js           profile, semester info, working hours, commute
│       ├── course.js         courses, exam dates, lecture times, commute
│       ├── task.js           tasks (LearnSession / FixedTask), quick status
│       ├── calendarEntry.js  CRUD + overlap check + reminders
│       ├── calendarChange.js change log (used by Undo)
│       └── schedule.js       rule-based planner + AI endpoints
└── frontend/
    ├── index.html
    ├── style.css
    ├── app.js
    └── assets/
        └── studyflow-logo.png   also used as favicon
```

## Requirements

- **Node.js** (LTS version) – the only thing you need to install manually.
  Get it from [nodejs.org](https://nodejs.org) (takes about 2 minutes)
- A free **Gemini API key** (optional, only needed for the AI chat – see
  below)
- An internet connection while running (for the Gemini API and the public
  holiday lookup) – everything else works fully offline

No separate SQLite installation needed – `better-sqlite3` bundles the
engine as a native module. No build tools needed either, as long as you
install a current Node.js LTS release (prebuilt binaries are used).

## Quick start (recommended)

1. Install Node.js once (see above)
2. Double-click the launcher for your system:
   - Windows: `Start-StudyFlow.bat`
   - macOS: `Start-StudyFlow.command`
   - Linux: run `./start-studyflow.sh` in a terminal
3. On first run it installs dependencies automatically (only once), then
   starts the server and opens your browser to `http://localhost:3000`

That's it – no manual `npm install`, no separate frontend step.

## Manual setup (alternative)

```bash
cd backend
npm install
node server.js
```

Then open `http://localhost:3000` in your browser.

## Setting up the Gemini API key (for the AI chat)

1. Sign in at [aistudio.google.com](https://aistudio.google.com) with a
   Google account
2. Generate a free key via "Get API key"
3. Create a `.env` file in the `backend` folder (template: `.env.example`):

```
GEMINI_API_KEY=your-actual-key-here

# Optional: which Gemini model to use (default: gemini-3.5-flash-lite)
# GEMINI_MODEL=gemini-3.5-flash-lite
```

**Important:** `.env` should not go into the Git repository (already
covered by `.gitignore`), since it contains your private API key.

Without a key set, the application still works – only the AI chat bubble
will return an error instead of a result.

## Sample data

Three seed scripts are included (run from inside `backend/`, server does
not need to be running):

```bash
node seed.js           # a single sample week
node seedMonth.js      # a full month with recurring appointments
node seedSemester.js   # a full semester: courses, lectures, work, sport
```

## Usage

1. Click **"+ New Profile"** (top right) to create a profile
2. Add **courses** with workload, exam dates, lecture times, and
   optionally a commute-to-campus block
3. Add **tasks & appointments**, or use **"Schedule learn sessions"** in
   the calendar to auto-plan study time
4. Use the floating **chat bubble** to ask questions, describe changes,
   or request new sessions/appointments – confirm before anything is
   applied
5. **Profile & Settings** has a backup button (downloads the whole
   database) and a delete-profile button

## Known limitations

- No login – the "active profile" is remembered in the browser
  (`localStorage`), not protected by authentication
- The AI chat only ever moves/creates/deletes/renames automatically
  generated entries or the one fixed appointment a change clearly refers
  to – manually created or edited calendar entries are always left
  untouched
- The "Explorer quick access" folder icon next to a course is best-effort
  only (`file://` link) – browsers cannot open a native file explorer for
  security reasons, so this does not work in every browser
- No real file upload for course material, only a text field for the
  material goal and an optional folder path string
- The more complex profile/preferences forms are only translated on
  first load, not retroactively if you switch language afterwards
- No full WCAG contrast audit has been done, only a targeted pass on the
  most visible icons/buttons
- A truly dependency-free single-file executable (no Node.js install at
  all) was intentionally not pursued – `better-sqlite3` is a native
  module that bundles poorly into tools like `pkg`/Electron; the
  double-click launcher scripts were chosen instead as the more reliable
  low-effort option
