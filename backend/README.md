# StudyFlow

A web application for time-based study planning for students – takes into
account courses, exams, work shifts, commute times, and leisure appointments,
and adjusts the study plan automatically via an AI assistant (Gemini API)
when things change.

## Architecture

- **Frontend:** plain HTML/CSS/JS, no frameworks. Sidebar navigation +
  floating AI chat bubble (visible everywhere except while a popup is open)
- **Backend:** Node.js + Express
- **Database:** SQLite (local file, no separate DB server needed)
- **AI:** Google Gemini API (free tier)
- **External API:** Nager.Date (free, no key) for German public holidays

Everything runs locally on one machine – there is no central/shared
server, each installation is independent.

```
project/
├── backend/
│   ├── db.js                 	database schema + connection
│   ├── server.js             	Express server, wires up all routes
│   ├── scheduler.js          	planning algorithm (pure logic, no DB)
│   ├── profileCalendar.js    	generates calendar entries from profile
│   │                         	working hours / commute times
│   ├── holidays.js           	cached lookup of German public holidays
│   ├── geminiClient.js       	connection to the Gemini API
│   ├── seed.js               	sample data (1 week)
│   ├── seedMonth.js          	sample data (1 month, recurring appointments)
│   ├── .env		      	template for the Gemini API key
│   ├── data/                 	SQLite file (created automatically)
│   └── routes/
│       ├── user.js           	profile, semester info, working hours, commute
│       ├── course.js         	courses, exam dates, material goal/path
│       ├── task.js           	tasks (LearnSession / FixedTask), quick status
│       ├── calendarEntry.js  	CRUD + overlap check + reminders
│       ├── calendarChange.js 	change log (used by Undo)
│       └── schedule.js       	rule-based planner + AI endpoints
└── frontend/
    ├── index.html
    ├── style.css
    ├── app.js
    └── assets/
        └── studyflow-logo.png  also used as favicon
```

## Requirements

- **Node.js** (LTS version), ideally installed via a version manager such
  as [fnm](https://github.com/Schniz/fnm) so everyone on the team uses
  the same version
- A build toolchain for native modules (only relevant for the first
  `npm install`):
  - **Windows:** Visual Studio Build Tools (C++ workload)
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Linux:** `build-essential`
- A browser (for the frontend)
- A free **Gemini API key** (see below)
- An internet connection while running (for the Gemini API and the public
  holiday lookup) – everything else works fully offline

No separate SQLite installation needed – `better-sqlite3` bundles the
engine as a native module.

## Setup

### 1. Get the repository and install packages

```bash
cd backend
npm install
```

This installs `express`, `cors`, `better-sqlite3`, and `dotenv`.

### 2. Set up the Gemini API key

1. Sign in at [aistudio.google.com](https://aistudio.google.com) with a
   Google account
2. Generate a free key via "Get API key"
3. Create a `.env` file in the `backend` folder (template: `.env.example`):

```
GEMINI_API_KEY=your-actual-key-here

# Optional: which Gemini model to use (default: gemini-3.5-flash-lite)
# GEMINI_MODEL=gemini-3.5-flash-lite
```

**Important:** `.env` should not go into the Git repository (add it to
`.gitignore`), since it contains your private API key.

Without a key set, the application still works – only the AI chat bubble
will return an error instead of a result.

### 3. Start the backend

```bash
node server.js
```

Expected output: `Backend läuft auf http://localhost:3000`

Quick test in the browser: `http://localhost:3000/api/health` should
return `{"server":"läuft","db":"verbunden"}`.

### 4. (Optional) Load sample data

```bash
node seedMonth.js
```

Creates a sample profile ("Max Mustermann") with two courses, recurring
work/training, weekly grocery shopping, and one repairman appointment
spread over a whole month.

### 5. Open the frontend

Open `frontend/index.html` in the browser (double-click works, or use
the VS Code "Live Server" extension). The backend must be running in
parallel. Make sure `frontend/assets/studyflow-logo.png` is present –
it's used both as the sidebar logo and the browser tab favicon.

## Usage

1. Click **"+ New Profile"** (top right) to create a profile: name, field
   of study, semester info, working hours, and commute times (with a
   checkbox for whether studying is possible during that commute). Working
   hours and commute times are turned into calendar entries automatically
2. Add **courses** (workload per week/month/total, priority, exam dates
   with time, material goal, optional folder path)
3. Add **tasks & appointments** – either a learn session (tied to a
   course) or a fixed appointment
4. In the **calendar**, use the `+` to add entries manually, or click
   "Schedule learn sessions" to have the study plan calculated
5. Use the floating **chat bubble** (bottom right, everywhere) to ask
   questions ("when is my next learn session?"), describe changes
   ("shift extended to 8pm"), or ask for new sessions/appointments to be
   created, renamed, or deleted – each suggestion is shown for
   confirmation before anything is written
6. **Profile & Settings** also has a backup button (downloads the whole
   database as a file)

## Known limitations

- There is no login – the "active profile" is remembered in the browser
  (`localStorage`), not protected by authentication
- The AI chat only ever moves/creates/deletes/renames automatically
  generated entries or the one fixed appointment a change clearly refers
  to – manually created or edited calendar entries are always left
  untouched
- The "Explorer quick access" folder icon next to a course is best-effort
  only (`file://` link) – browsers cannot open a native file explorer for
  security reasons, so this does not work in every browser
- There is no real file upload for course material, only a text field for
  the material goal (e.g. "20 slides/week") and an optional folder path
  string
- Language switching (DE/EN) covers the whole static interface, but the
  more complex profile/preferences forms are only translated on first
  load, not retroactively if you switch language afterwards
- No full WCAG contrast audit has been done, only a targeted pass on the
  most visible icons/buttons
