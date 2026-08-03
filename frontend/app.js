const API_BASE = 'http://localhost:3000/api';

// ---------- i18n (Deutsch/Englisch) ----------

const TRANSLATIONS = {
  'nav.dashboard': { de: 'Dashboard', en: 'Dashboard' },
  'nav.kalender': { de: 'Kalender', en: 'Calendar' },
  'nav.kurse': { de: 'Kurse', en: 'Courses' },
  'nav.aufgaben': { de: 'Aufgaben & Termine', en: 'Tasks & Appointments' },
  'nav.ki': { de: 'KI-Assistent', en: 'AI Assistant' },
  'nav.profil': { de: 'Profil & Einstellungen', en: 'Profile & Settings' },
  'quicklink.profil': { de: 'Profil', en: 'Profile' },

  'topbar.menuOpen': { de: 'Menü öffnen', en: 'Open menu' },
  'topbar.search': { de: 'Suche', en: 'Search' },
  'topbar.searchPlaceholder': { de: 'Kurse, Termine, Aufgaben durchsuchen…', en: 'Search courses, appointments, tasks…' },
  'topbar.noProfile': { de: 'Kein Profil aktiv', en: 'No profile active' },
  'topbar.active': { de: 'Aktiv:', en: 'Active:' },
  'topbar.langToggle': { de: 'Sprache wechseln', en: 'Switch language' },
  'topbar.themeToggle': { de: 'Theme wechseln', en: 'Switch theme' },
  'topbar.newProfile': { de: '+ Neues Profil', en: '+ New Profile' },

  'dashboard.title': { de: 'Dashboard', en: 'Dashboard' },
  'dashboard.today': { de: 'Heutige Termine', en: "Today's Appointments" },
  'dashboard.openTasks': { de: 'Offene Aufgaben', en: 'Open Tasks' },
  'dashboard.quickAccess': { de: 'Schnellzugriff', en: 'Quick Access' },
  'dashboard.noProfile': { de: 'Kein Profil aktiv.', en: 'No profile active.' },
  'dashboard.noAppointmentsToday': { de: 'Heute keine Termine.', en: 'No appointments today.' },
  'dashboard.noOpenTasks': { de: 'Keine offenen Aufgaben.', en: 'No open tasks.' },

  'profil.createTitle': { de: 'Profil anlegen', en: 'Create profile' },
  'profil.currentTitle': { de: 'Aktuelle Profil-Einstellungen', en: 'Current Profile Settings' },
  'profil.currentHint': { de: 'Zeigt die Angaben des aktiven Profils und kann hier bearbeitet werden.', en: 'Shows the active profile\u2019s details and can be edited here.' },
  'profil.name': { de: 'Name', en: 'Name' },
  'profil.fieldOfStudy': { de: 'Studiengang', en: 'Field of study' },
  'profil.employment': { de: 'Arbeit', en: 'Employment' },
  'profil.employmentPlaceholder': { de: 'z. B. Werkstudent, 15h/Woche', en: 'e.g. working student, 15h/week' },
  'profil.livingSituation': { de: 'Wohnsituation', en: 'Living situation' },
  'profil.livingSituationPlaceholder': { de: 'z. B. WG, allein', en: 'e.g. shared flat, alone' },
  'profil.createBtn': { de: 'Profil anlegen', en: 'Create profile' },
  'profil.semesterType': { de: 'Semester', en: 'Semester' },
  'profil.semesterGroupTitle': { de: 'Semester', en: 'Semester' },
  'profil.semesterSummer': { de: 'Sommersemester', en: 'Summer semester' },
  'profil.semesterWinter': { de: 'Wintersemester', en: 'Winter semester' },
  'profil.semesterStart': { de: 'Semesterbeginn', en: 'Semester start' },
  'profil.semesterEnd': { de: 'Semesterende', en: 'Semester end' },
  'profil.semesterNumber': { de: 'Fachsemester (Nummer)', en: 'Semester number' },
  'profil.workingHours': { de: 'Arbeitszeiten', en: 'Working hours' },
  'profil.workingHoursHint': { de: 'Landet direkt als Termin im Kalender.', en: 'Goes directly into the calendar as an appointment.' },
  'profil.addWorkingHour': { de: '+ Arbeitszeit hinzufügen', en: '+ Add working hours' },
  'profil.commuteWork': { de: 'Pendelzeit zur Arbeit / nach Hause', en: 'Commute to work / home' },
  'profil.commuteWorkHint': { de: 'Hinweg endet automatisch am Beginn der jeweiligen Arbeitszeit, Rückweg beginnt an deren Ende.', en: 'The trip there automatically ends when work starts, the trip back starts when work ends.' },
  'profil.commuteUni': { de: 'Pendelzeit zur Uni / nach Hause', en: 'Commute to campus / home' },
  'profil.commuteLearnable': { de: 'In dieser Zeit kann gelernt werden', en: 'Studying is possible during this time' },
  'profil.selectTitle': { de: 'Bestehendes Profil wählen', en: 'Select existing profile' },
  'profil.selectLabel': { de: 'Profil', en: 'Profile' },
  'profil.selectBtn': { de: 'Als aktiv setzen', en: 'Set as active' },
  'profil.selectHint': { de: 'Alle weiteren Eingaben (Kurse, Aufgaben, Kalender) beziehen sich immer auf das aktive Profil.', en: 'All further entries (courses, tasks, calendar) always relate to the active profile.' },
  'profil.prefsTitle': { de: 'Einstellungen (UserPreferences)', en: 'Settings (UserPreferences)' },
  'profil.preferredTimes': { de: 'Bevorzugte Lernzeiten (von/bis)', en: 'Preferred study times (from/to)' },
  'profil.addTime': { de: '+ Zeitraum hinzufügen', en: '+ Add time range' },
  'profil.from': { de: 'von', en: 'from' },
  'profil.to': { de: 'bis', en: 'to' },
  'profil.arrival': { de: 'Ankunft', en: 'Arrival' },
  'profil.departure': { de: 'Abfahrt', en: 'Departure' },
  'profil.minutesBefore': { de: 'Minuten (Hinweg)', en: 'Minutes (there)' },
  'profil.minutesAfter': { de: 'Minuten (Rückweg)', en: 'Minutes (back)' },
  'profil.maxHoursPerDay': { de: 'Max. Stunden pro Tag', en: 'Max. hours per day' },
  'profil.breakDuration': { de: 'Pausenlänge (Min.)', en: 'Break length (min.)' },
  'profil.bufferBeforeExam': { de: 'Puffer vor Prüfung (Tage)', en: 'Buffer before exam (days)' },
  'profil.favoriteLocation': { de: 'Bevorzugter Lernort', en: 'Favorite study location' },
  'profil.excludedWeekdays': { de: 'Tage vom Lernen ausschließen', en: 'Exclude days from studying' },
  'profil.savePrefsBtn': { de: 'Einstellungen speichern', en: 'Save settings' },
  'profil.backupTitle': { de: 'Backup', en: 'Backup' },
  'profil.backupHint': { de: 'Lädt die komplette Datenbank als Datei herunter.', en: 'Downloads the complete database as a file.' },
  'profil.backupBtn': { de: 'Datenbank herunterladen', en: 'Download database' },
  'profil.deleteBtn': { de: 'Profil löschen', en: 'Delete profile' },
  'profil.deleteConfirm': { de: 'Dieses Profil inklusive aller Kurse, Aufgaben und Kalendereinträge unwiderruflich löschen?', en: 'Permanently delete this profile including all courses, tasks, and calendar entries?' },
  'weekday.mo': { de: 'Mo', en: 'Mon' },
  'weekday.di': { de: 'Di', en: 'Tue' },
  'weekday.mi': { de: 'Mi', en: 'Wed' },
  'weekday.do': { de: 'Do', en: 'Thu' },
  'weekday.fr': { de: 'Fr', en: 'Fri' },
  'weekday.sa': { de: 'Sa', en: 'Sat' },
  'weekday.so': { de: 'So', en: 'Sun' },

  'kurse.addTitle': { de: 'Kurs hinzufügen', en: 'Add course' },
  'kurse.editTitle': { de: 'Kurs bearbeiten', en: 'Edit course' },
  'kurse.workloadUnit': { de: 'Angabe pro', en: 'Specified per' },
  'kurse.workloadTotal': { de: 'Insgesamt', en: 'Total' },
  'kurse.workloadWeek': { de: 'Woche', en: 'Week' },
  'kurse.workloadMonth': { de: 'Monat', en: 'Month' },
  'kurse.workloadHint': { de: 'Bei Woche/Monat wird der Gesamtaufwand anhand des Semesterendes (Profil) automatisch hochgerechnet.', en: 'For week/month, the total is automatically projected using the semester end date (profile).' },
  'kurse.updateBtn': { de: 'Kurs aktualisieren', en: 'Update course' },
  'kurse.name': { de: 'Kursname', en: 'Course name' },
  'kurse.workload': { de: 'Zeitaufwand gesamt (Std.)', en: 'Total workload (hrs)' },
  'kurse.workloadGroupTitle': { de: 'Zeitaufwand', en: 'Workload' },
  'kurse.ects': { de: 'ECTS', en: 'ECTS' },
  'kurse.priority': { de: 'Priorität (1 = niedrig, 5 = hoch)', en: 'Priority (1 = low, 5 = high)' },
  'kurse.examDates': { de: 'Prüfungstermine', en: 'Exam dates' },
  'kurse.addExamDate': { de: '+ Prüfungstermin hinzufügen', en: '+ Add exam date' },
  'kurse.materialGoal': { de: 'Kursmaterial-Ziel (z. B. "20 Folien/Woche")', en: 'Course material goal (e.g. "20 slides/week")' },
  'kurse.materialGoalPlaceholder': { de: 'z. B. 20 Folien/Woche', en: 'e.g. 20 slides/week' },
  'kurse.materialPath': { de: 'Ordnerpfad der Kurs-Unterlagen', en: 'Folder path for course materials' },
  'kurse.materialPathHint': { de: 'Browser können aus Sicherheitsgründen keinen Datei-Explorer öffnen - der Link versucht es best-effort über file://, funktioniert aber nicht in jedem Browser.', en: 'Browsers cannot open a native file explorer for security reasons - the link attempts a best-effort file:// link, which does not work in every browser.' },
  'kurse.lectureTimes': { de: 'Vorlesungszeiten', en: 'Lecture times' },
  'kurse.addLectureTime': { de: '+ Vorlesungszeit hinzufügen', en: '+ Add lecture time' },
  'kurse.commuteUni': { de: 'Pendelzeit zur Uni / nach Hause', en: 'Commute to campus / home' },
  'kurse.commuteUniHint': { de: 'Hinweg endet automatisch am Beginn der jeweiligen Vorlesung, Rückweg beginnt an deren Ende.', en: 'The trip there automatically ends when the lecture starts, the trip back starts when it ends.' },
  'kurse.createBtn': { de: 'Kurs anlegen', en: 'Create course' },

  'task.addTitle': { de: 'Aufgabe / Termin anlegen', en: 'Create task / appointment' },
  'task.editTitle': { de: 'Aufgabe / Termin bearbeiten', en: 'Edit task / appointment' },
  'task.note': { de: 'Notiz', en: 'Note' },
  'task.updateBtn': { de: 'Aktualisieren', en: 'Update' },
  'task.listTitle': { de: 'Aufgaben & Termine', en: 'Tasks & Appointments' },
  'task.type': { de: 'Typ', en: 'Type' },
  'task.typeLearnSession': { de: 'Lernsession (an Kurs gebunden)', en: 'Learn session (tied to a course)' },
  'task.typeFixedTask': { de: 'Fester Termin (Arbeit/Freizeit/Training/...)', en: 'Fixed appointment (work/leisure/training/...)' },
  'task.name': { de: 'Bezeichnung', en: 'Name' },
  'task.description': { de: 'Beschreibung', en: 'Description' },
  'task.location': { de: 'Ort', en: 'Location' },
  'task.status': { de: 'Status', en: 'Status' },
  'task.statusOpen': { de: 'offen', en: 'open' },
  'task.statusInProgress': { de: 'in Bearbeitung', en: 'in progress' },
  'task.statusDone': { de: 'erledigt', en: 'done' },
  'task.course': { de: 'Zugehöriger Kurs', en: 'Associated course' },
  'task.kind': { de: 'Art', en: 'Kind' },
  'task.kindWork': { de: 'Arbeit', en: 'Work' },
  'task.kindLeisure': { de: 'Freizeit', en: 'Leisure' },
  'task.kindTraining': { de: 'Training', en: 'Training' },
  'task.kindOther': { de: 'Sonstiges', en: 'Other' },
  'task.recurring': { de: 'wiederkehrend (Routine ♻)', en: 'recurring (routine ♻)' },
  'task.createBtn': { de: 'Anlegen', en: 'Create' },

  'table.name': { de: 'Name', en: 'Name' },
  'table.ects': { de: 'ECTS', en: 'ECTS' },
  'table.workload': { de: 'Zeitaufwand', en: 'Workload' },
  'table.priority': { de: 'Priorität', en: 'Priority' },
  'table.exams': { de: 'Prüfungen', en: 'Exams' },
  'table.materialGoal': { de: 'Material-Ziel', en: 'Material goal' },
  'table.type': { de: 'Typ', en: 'Type' },
  'table.status': { de: 'Status', en: 'Status' },
  'table.location': { de: 'Ort', en: 'Location' },

  'calendar.generateTitle': { de: 'Lernplan generieren', en: 'Generate study plan' },
  'calendar.generateHint': { de: 'Plant offene Lernzeit für alle Kurse des aktiven Profils in die freien Zeitfenster der nächsten Tage ein.', en: 'Schedules open study time for all courses of the active profile into free slots over the coming days.' },
  'calendar.generateDays': { de: 'Zeitraum (Tage)', en: 'Period (days)' },
  'calendar.generateBtn': { de: 'Lernsessions einplanen', en: 'Schedule learn sessions' },
  'calendar.generateBtnUpdate': { de: 'Lernsessions aktualisieren', en: 'Update learn sessions' },
  'calendar.week': { de: 'Woche', en: 'Week' },
  'calendar.month': { de: 'Monat', en: 'Month' },
  'calendar.today': { de: 'Heute', en: 'Today' },
  'calendar.undo': { de: '↺ Rückgängig', en: '↺ Undo' },
  'calendar.undoTitle': { de: 'Letzte Änderung rückgängig machen', en: 'Undo last change' },
  'calendar.addEntryTitle': { de: 'Kalendereintrag anlegen', en: 'Create calendar entry' },

  'legend.learnSession': { de: 'Lernsession', en: 'Learn session' },
  'legend.routine': { de: 'Routine', en: 'Routine' },
  'legend.appointment': { de: 'Termin', en: 'Appointment' },

  'chat.welcome': { de: 'Hallo! Beschreibe eine Änderung (z. B. "Schicht am Montag bis 20 Uhr verlängert"), bitte um neue Lernsessions, oder lass mich einen Termin umbenennen bzw. löschen. Ich beziehe mich dabei immer auf den aktuell im Kalender angezeigten Zeitraum – in der Monatsansicht bitte einen konkreten Tag nennen.', en: "Hi! Describe a change (e.g. \"Monday's shift was extended to 8pm\"), ask me to schedule new learn sessions, or have me rename or delete an appointment. I always work within the period currently shown in the calendar - in month view, please name a specific day." },
  'chat.inputLabel': { de: 'Nachricht an den KI-Assistenten', en: 'Message to the AI assistant' },
  'chat.inputPlaceholder': { de: 'Nachricht eingeben…', en: 'Type a message…' },
  'chat.send': { de: 'Senden', en: 'Send' },
  'chat.thinking': { de: '… überlege …', en: '… thinking …' },
  'chat.monthNeedsDay': { de: 'Bitte in der Monatsansicht einen konkreten Tag angeben (z. B. "Freitag" oder "jeden Dienstag").', en: 'Please name a specific day in month view (e.g. "Friday" or "every Tuesday").' },
  'chat.noChangeNeeded': { de: 'Keine Anpassung nötig.', en: 'No adjustment needed.' },
  'chat.suggestionsIntro': { de: 'Folgende Änderungen werden vorgeschlagen:', en: 'The following changes are suggested:' },
  'chat.apply': { de: 'Übernehmen', en: 'Apply' },
  'chat.discard': { de: 'Verwerfen', en: 'Discard' },
  'chat.discarded': { de: 'Alles klar, ich habe nichts geändert.', en: "Got it, I haven't changed anything." },
  'chat.applied': { de: 'Übernommen.', en: 'Applied.' },
  'chat.error': { de: 'Fehler: ', en: 'Error: ' },
  'chat.new': { de: 'NEU', en: 'NEW' },
  'chat.delete': { de: 'LÖSCHEN', en: 'DELETE' },
  'chat.rename': { de: 'UMBENENNEN', en: 'RENAME' },

  'entryModal.createTitle': { de: 'Kalendereintrag anlegen', en: 'Create calendar entry' },
  'entryModal.editTitle': { de: 'Kalendereintrag bearbeiten', en: 'Edit calendar entry' },
  'entryModal.task': { de: 'Task', en: 'Task' },
  'entryModal.name': { de: 'Bezeichnung', en: 'Name' },
  'entryModal.start': { de: 'Start', en: 'Start' },
  'entryModal.end': { de: 'Ende', en: 'End' },
  'entryModal.reminder': { de: 'Erinnerung', en: 'Reminder' },
  'entryModal.reminderDays': { de: 'Erinnerungs-Pop-Up (Tage vorher, 0 = am selben Tag)', en: 'Reminder popup (days before, 0 = same day)' },
  'reminder.title': { de: 'Erinnerungen', en: 'Reminders' },
  'entryModal.reminderPlaceholder': { de: 'z. B. 30 Min. vorher', en: 'e.g. 30 min. before' },
  'entryModal.createBtn': { de: 'Eintrag anlegen', en: 'Create entry' },

  'common.remove': { de: 'Entfernen', en: 'Remove' },
  'common.edit': { de: 'Bearbeiten', en: 'Edit' },
  'common.save': { de: 'Speichern', en: 'Save' },
  'common.delete': { de: 'Löschen', en: 'Delete' },
  'common.close': { de: 'Schließen', en: 'Close' },
};

let currentLang = localStorage.getItem('lang') || 'de';

function t(key) {
  const entry = TRANSLATIONS[key];
  if (!entry) return null;
  return entry[currentLang] ?? entry.de;
}

function localeTag() {
  return currentLang === 'en' ? 'en-US' : 'de-DE';
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const text = t(el.dataset.i18n);
    if (text == null) return;
    const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== '');
    if (textNode) {
      textNode.textContent = text;
    } else if (el.childNodes.length === 0) {
      el.textContent = text;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const text = t(el.dataset.i18nPlaceholder);
    if (text != null) el.setAttribute('placeholder', text);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const text = t(el.dataset.i18nTitle);
    if (text != null) el.setAttribute('title', text);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const text = t(el.dataset.i18nAriaLabel);
    if (text != null) el.setAttribute('aria-label', text);
  });

  document.getElementById('lang-toggle').textContent = lang === 'de' ? 'DE' : 'EN';

  // dynamisch gerenderte Inhalte neu zeichnen, damit auch sie die Sprache wechseln
  // (defensiv mit try/catch, falls applyLanguage vor der Initialisierung
  // anderer Variablen aufgerufen wird)
  try {
    if (typeof renderCalendar === 'function') renderCalendar();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof updateGenerateButtonLabel === 'function') updateGenerateButtonLabel();
    if (typeof setActiveUserDisplay === 'function') setActiveUserDisplay(lastKnownUser);
  } catch (err) {
    console.warn('applyLanguage: dynamische Inhalte konnten noch nicht neu gezeichnet werden', err);
  }
}

document.getElementById('lang-toggle').addEventListener('click', () => {
  applyLanguage(currentLang === 'de' ? 'en' : 'de');
});

let currentUserID = localStorage.getItem('currentUserID')
  ? Number(localStorage.getItem('currentUserID'))
  : null;
let lastKnownUser = null;

// ---------- Helpers ----------

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.error) throw new Error(parsed.error);
    } catch (parseErr) {
      if (parseErr instanceof SyntaxError) {
        throw new Error(`${res.status} ${res.statusText} ${text}`);
      }
      throw parseErr;
    }
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : null;
}

function setActiveUserDisplay(user) {
  const el = document.getElementById('active-user');
  lastKnownUser = user || null;
  if (user) {
    el.textContent = `${t('topbar.active')} ${user.userName} (ID ${user.userID})`;
    el.classList.remove('empty');
  } else {
    el.textContent = t('topbar.noProfile');
    el.classList.add('empty');
  }
}

function requireActiveUser() {
  if (!currentUserID) {
    showToast('Bitte zuerst ein Profil anlegen oder auswählen.', true);
    return false;
  }
  return true;
}

// ---------- Navigation (Sidebar-Views) ----------

function switchView(viewName) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === viewName));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.querySelectorAll('.quick-link').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ---------- Theme (Light/Dark) ----------

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

applyTheme(localStorage.getItem('theme') || 'light');

// ---------- User / Profil ----------

// ---------- Gemeinsame Formular-Templates (Profil-Bearbeiten + Neues-Profil-Popup) ----------

const WEEKDAY_OPTIONS = [
  [1, 'weekday.mo'], [2, 'weekday.di'], [3, 'weekday.mi'], [4, 'weekday.do'],
  [5, 'weekday.fr'], [6, 'weekday.sa'], [7, 'weekday.so'],
];

function profileFieldsTemplate(prefix) {
  return `
    <label>${t('profil.name')}
      <input type="text" id="${prefix}userName" required>
    </label>
    <label>${t('profil.fieldOfStudy')}
      <input type="text" id="${prefix}fieldOfStudy">
    </label>

    <div class="field-group">
      <p class="field-group-title">${t('profil.semesterGroupTitle')}</p>
      <label>${t('profil.semesterType')}
        <select id="${prefix}semesterType">
          <option value="Sommersemester">${t('profil.semesterSummer')}</option>
          <option value="Wintersemester">${t('profil.semesterWinter')}</option>
        </select>
      </label>
      <label>${t('profil.semesterStart')}
        <input type="date" id="${prefix}semesterStart">
      </label>
      <label>${t('profil.semesterEnd')}
        <input type="date" id="${prefix}semesterEnd">
      </label>
      <label>${t('profil.semesterNumber')}
        <input type="number" id="${prefix}semesterNumber" min="1">
      </label>
    </div>

    <label>${t('profil.employment')}
      <input type="text" id="${prefix}employment" placeholder="${t('profil.employmentPlaceholder')}">
    </label>
    <label>${t('profil.livingSituation')}
      <input type="text" id="${prefix}livingSituation" placeholder="${t('profil.livingSituationPlaceholder')}">
    </label>

    <label>${t('profil.workingHours')}</label>
    <p class="hint">${t('profil.workingHoursHint')}</p>
    <div id="${prefix}working-hours-list"></div>
    <button type="button" class="secondary" data-working-hours-add="${prefix}">${t('profil.addWorkingHour')}</button>

    <div class="commute-block">
      <label>${t('profil.commuteWork')}</label>
      <div class="weekday-checks">
        ${WEEKDAY_OPTIONS.map(([v, key]) => `
          <label><input type="checkbox" class="${prefix}commuteWork-day" value="${v}">${t(key)}</label>
        `).join('')}
      </div>
      <p class="hint">${t('profil.commuteWorkHint')}</p>
      <div class="commute-times-row">
        <label>${t('profil.minutesBefore')}<input type="number" id="${prefix}commuteWork-minutesBefore" min="0"></label>
        <label>${t('profil.minutesAfter')}<input type="number" id="${prefix}commuteWork-minutesAfter" min="0"></label>
      </div>
      <label class="checkbox-label"><input type="checkbox" id="${prefix}commuteWork-learnable"> ${t('profil.commuteLearnable')}</label>
    </div>
  `;
}

function preferencesFieldsTemplate(prefix) {
  return `
    <label>${t('profil.preferredTimes')}</label>
    <div id="${prefix}preferred-times-list"></div>
    <button type="button" class="secondary" data-preferred-times-add="${prefix}">${t('profil.addTime')}</button>

    <label>${t('profil.maxHoursPerDay')}
      <input type="number" id="${prefix}maxHoursPerDay" step="0.5">
    </label>
    <label>${t('profil.breakDuration')}
      <input type="number" id="${prefix}breakDuration">
    </label>
    <label>${t('profil.bufferBeforeExam')}
      <input type="number" id="${prefix}bufferBeforeExam">
    </label>
    <label>${t('profil.favoriteLocation')}
      <input type="text" id="${prefix}favoriteLocation">
    </label>
    <label>${t('profil.excludedWeekdays')}</label>
    <div class="weekday-checks">
      ${WEEKDAY_OPTIONS.map(([v, key]) => `
        <label><input type="checkbox" class="${prefix}excludedWeekday" value="${v}">${t(key)}</label>
      `).join('')}
    </div>
  `;
}

function addWorkingHourRow(prefix, row = {}) {
  const list = document.getElementById(`${prefix}working-hours-list`);
  const el = document.createElement('div');
  el.className = 'working-hours-row';
  el.innerHTML = `
    <select class="${prefix}workingHour-weekday">
      ${WEEKDAY_OPTIONS.map(([v, key]) => `<option value="${v}" ${Number(row.weekday) === v ? 'selected' : ''}>${t(key)}</option>`).join('')}
    </select>
    <input type="time" class="${prefix}workingHour-start" value="${row.start || ''}">
    <input type="time" class="${prefix}workingHour-end" value="${row.end || ''}">
    <button type="button" class="secondary">${t('common.remove')}</button>
  `;
  el.querySelector('button').addEventListener('click', () => el.remove());
  list.appendChild(el);
}

function addLectureTimeRow(row = {}) {
  const list = document.getElementById('lecture-times-list');
  const el = document.createElement('div');
  el.className = 'working-hours-row';
  el.innerHTML = `
    <select class="lectureTime-weekday">
      ${WEEKDAY_OPTIONS.map(([v, key]) => `<option value="${v}" ${Number(row.weekday) === v ? 'selected' : ''}>${t(key)}</option>`).join('')}
    </select>
    <input type="time" class="lectureTime-start" value="${row.start || ''}">
    <input type="time" class="lectureTime-end" value="${row.end || ''}">
    <button type="button" class="secondary">${t('common.remove')}</button>
  `;
  el.querySelector('button').addEventListener('click', () => el.remove());
  list.appendChild(el);
}

function getLectureTimesFromForm() {
  return Array.from(document.getElementById('lecture-times-list').children).map(row => ({
    weekday: Number(row.querySelector('.lectureTime-weekday').value),
    start: row.querySelector('.lectureTime-start').value,
    end: row.querySelector('.lectureTime-end').value,
  })).filter(r => r.start && r.end);
}

document.getElementById('add-lecture-time-btn').addEventListener('click', () => addLectureTimeRow());

function addPreferredTimeRangeRow(prefix, range = {}) {
  const list = document.getElementById(`${prefix}preferred-times-list`);
  const el = document.createElement('div');
  el.className = 'repeatable-row';
  el.innerHTML = `
    <input type="time" class="${prefix}preferredTime-from" value="${range.from || ''}" placeholder="${t('profil.from')}">
    <input type="time" class="${prefix}preferredTime-to" value="${range.to || ''}" placeholder="${t('profil.to')}">
    <button type="button" class="secondary">${t('common.remove')}</button>
  `;
  el.querySelector('button').addEventListener('click', () => {
    if (list.children.length > 1) el.remove();
    else { el.querySelectorAll('input').forEach(i => i.value = ''); }
  });
  list.appendChild(el);
}

function getCommuteFromForm(prefix, name) {
  return {
    days: Array.from(document.querySelectorAll(`.${prefix}${name}-day:checked`)).map(cb => Number(cb.value)),
    minutesBefore: Number(document.getElementById(`${prefix}${name}-minutesBefore`)?.value) || 0,
    minutesAfter: Number(document.getElementById(`${prefix}${name}-minutesAfter`)?.value) || 0,
    learnable: document.getElementById(`${prefix}${name}-learnable`)?.checked || false,
  };
}

function setCommuteInForm(prefix, name, c) {
  document.querySelectorAll(`.${prefix}${name}-day`).forEach(cb => {
    cb.checked = !!(c && c.days && c.days.includes(Number(cb.value)));
  });
  const setVal = (id, value) => { const el = document.getElementById(`${prefix}${id}`); if (el) el.value = value ?? ''; };
  setVal(`${name}-minutesBefore`, c?.minutesBefore);
  setVal(`${name}-minutesAfter`, c?.minutesAfter);
  const learnableEl = document.getElementById(`${prefix}${name}-learnable`);
  if (learnableEl) learnableEl.checked = !!(c && c.learnable);
}

function getProfileFieldsFromForm(prefix) {
  const val = (id) => document.getElementById(`${prefix}${id}`)?.value || '';
  const workingHoursRows = Array.from(document.getElementById(`${prefix}working-hours-list`).children).map(row => ({
    weekday: Number(row.querySelector(`.${prefix}workingHour-weekday`).value),
    start: row.querySelector(`.${prefix}workingHour-start`).value,
    end: row.querySelector(`.${prefix}workingHour-end`).value,
  })).filter(r => r.start && r.end);

  return {
    userName: val('userName'),
    fieldOfStudy: val('fieldOfStudy'),
    employment: val('employment'),
    livingSituation: val('livingSituation'),
    semesterType: val('semesterType'),
    semesterStart: val('semesterStart'),
    semesterEnd: val('semesterEnd'),
    semesterNumber: Number(val('semesterNumber')) || null,
    workingHours: workingHoursRows,
    commuteWork: getCommuteFromForm(prefix, 'commuteWork'),
  };
}

function setProfileFieldsInForm(prefix, user) {
  const set = (id, value) => { const el = document.getElementById(`${prefix}${id}`); if (el) el.value = value ?? ''; };
  set('userName', user.userName);
  set('fieldOfStudy', user.fieldOfStudy);
  set('employment', user.employment);
  set('livingSituation', user.livingSituation);
  set('semesterType', user.semesterType || 'Wintersemester');
  set('semesterStart', user.semesterStart ? user.semesterStart.slice(0, 10) : '');
  set('semesterEnd', user.semesterEnd ? user.semesterEnd.slice(0, 10) : '');
  set('semesterNumber', user.semesterNumber);

  const list = document.getElementById(`${prefix}working-hours-list`);
  list.innerHTML = '';
  (user.workingHours && user.workingHours.length ? user.workingHours : []).forEach(row => addWorkingHourRow(prefix, row));

  setCommuteInForm(prefix, 'commuteWork', user.commuteWork);
}

function getPreferencesFieldsFromForm(prefix) {
  const preferredTimes = Array.from(document.getElementById(`${prefix}preferred-times-list`).children).map(row => ({
    from: row.querySelector(`.${prefix}preferredTime-from`).value,
    to: row.querySelector(`.${prefix}preferredTime-to`).value,
  })).filter(r => r.from && r.to);

  const excludedWeekdays = Array.from(document.querySelectorAll(`.${prefix}excludedWeekday:checked`)).map(cb => Number(cb.value));

  return {
    preferredTimes,
    maxHoursPerDay: Number(document.getElementById(`${prefix}maxHoursPerDay`).value) || null,
    breakDuration: Number(document.getElementById(`${prefix}breakDuration`).value) || null,
    bufferBeforeExam: Number(document.getElementById(`${prefix}bufferBeforeExam`).value) || null,
    favoriteLocation: document.getElementById(`${prefix}favoriteLocation`).value,
    excludedWeekdays,
  };
}

function setPreferencesFieldsInForm(prefix, prefs) {
  const list = document.getElementById(`${prefix}preferred-times-list`);
  list.innerHTML = '';
  const times = prefs.preferredTimes && prefs.preferredTimes.length ? prefs.preferredTimes : [{}];
  times.forEach(r => addPreferredTimeRangeRow(prefix, r));

  document.getElementById(`${prefix}maxHoursPerDay`).value = prefs.maxHoursPerDay ?? '';
  document.getElementById(`${prefix}breakDuration`).value = prefs.breakDuration ?? '';
  document.getElementById(`${prefix}bufferBeforeExam`).value = prefs.bufferBeforeExam ?? '';
  document.getElementById(`${prefix}favoriteLocation`).value = prefs.favoriteLocation || '';
  document.querySelectorAll(`.${prefix}excludedWeekday`).forEach(cb => {
    cb.checked = (prefs.excludedWeekdays || []).includes(Number(cb.value));
  });
}

// Templates einmalig einfügen und die "+ hinzufügen"-Buttons verdrahten (delegiert, da Buttons erst nach dem Einfügen existieren)
document.getElementById('profile-fields-container').innerHTML = profileFieldsTemplate('');
document.getElementById('new-profile-fields-container').innerHTML = profileFieldsTemplate('new-');
document.getElementById('prefs-fields-container').innerHTML = preferencesFieldsTemplate('');
document.getElementById('new-profile-prefs-container').innerHTML = preferencesFieldsTemplate('new-');

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-working-hours-add]')) {
    addWorkingHourRow(e.target.dataset.workingHoursAdd);
  }
  if (e.target.matches('[data-preferred-times-add]')) {
    addPreferredTimeRangeRow(e.target.dataset.preferredTimesAdd);
  }
});

// ---------- Profil bearbeiten (aktives Profil) ----------

document.getElementById('user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;
  try {
    const body = getProfileFieldsFromForm('');
    await api(`/users/${currentUserID}`, { method: 'PUT', body: JSON.stringify(body) });
    showToast('Profil aktualisiert.');
    await loadUsers();
    await refreshActiveUserDisplay();
    await loadEntries();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

document.getElementById('delete-profile-btn').addEventListener('click', async () => {
  if (!requireActiveUser()) return;
  if (!confirm(t('profil.deleteConfirm'))) return;
  try {
    await api(`/users/${currentUserID}`, { method: 'DELETE' });
    showToast('Profil gelöscht.');
    currentUserID = null;
    localStorage.removeItem('currentUserID');
    setProfileFieldsInForm('', {});
    await loadUsers();
    await refreshActiveUserDisplay();
    await loadPreferencesIntoForm();
    await loadCourses();
    await loadTasks();
    await loadEntries();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

async function loadProfileIntoForm() {
  if (!currentUserID) return;
  try {
    const user = await api(`/users/${currentUserID}`);
    setProfileFieldsInForm('', user);
  } catch (err) {
    showToast('Profil konnte nicht geladen werden: ' + err.message, true);
  }
}

// ---------- Neues Profil (Popup) ----------

const newProfileModal = document.getElementById('new-profile-modal');

document.getElementById('new-profile-btn').addEventListener('click', () => {
  setProfileFieldsInForm('new-', {});
  setPreferencesFieldsInForm('new-', {});
  newProfileModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
});

function closeNewProfileModal() {
  newProfileModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

document.getElementById('close-new-profile-modal').addEventListener('click', closeNewProfileModal);
newProfileModal.addEventListener('click', (e) => {
  if (e.target === newProfileModal) closeNewProfileModal();
});

document.getElementById('new-user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const profileBody = getProfileFieldsFromForm('new-');
    const data = await api('/users', { method: 'POST', body: JSON.stringify(profileBody) });
    currentUserID = data.userID;
    localStorage.setItem('currentUserID', currentUserID);

    const prefsBody = getPreferencesFieldsFromForm('new-');
    await api(`/users/${currentUserID}/preferences`, { method: 'PUT', body: JSON.stringify(prefsBody) });

    showToast('Profil angelegt.');
    closeNewProfileModal();
    await loadUsers();
    await refreshActiveUserDisplay();
    await loadProfileIntoForm();
    await loadPreferencesIntoForm();
    await loadCourses();
    await loadTasks();
    await loadEntries();
  } catch (err) {
    showToast('Fehler beim Anlegen: ' + err.message, true);
  }
});

// ---------- Bestehendes Profil auswählen ----------

document.getElementById('select-user-btn').addEventListener('click', async () => {
  const select = document.getElementById('user-select');
  if (!select.value) return;
  currentUserID = Number(select.value);
  localStorage.setItem('currentUserID', currentUserID);
  showToast('Profil aktiviert.');
  await refreshActiveUserDisplay();
  await loadProfileIntoForm();
  await loadPreferencesIntoForm();
  await loadCourses();
  await loadTasks();
  await loadEntries();
});

document.getElementById('active-user').addEventListener('click', () => switchView('profil'));

async function loadUsers() {
  const users = await api('/users');
  const select = document.getElementById('user-select');
  select.innerHTML = users
    .map(u => `<option value="${u.userID}">${u.userName} (ID ${u.userID})</option>`)
    .join('');
}

async function refreshActiveUserDisplay() {
  if (!currentUserID) {
    setActiveUserDisplay(null);
    return;
  }
  try {
    const user = await api(`/users/${currentUserID}`);
    setActiveUserDisplay(user);
  } catch {
    currentUserID = null;
    localStorage.removeItem('currentUserID');
    setActiveUserDisplay(null);
  }
}

// ---------- UserPreferences (aktives Profil) ----------

async function loadPreferencesIntoForm() {
  if (!currentUserID) return;
  try {
    const prefs = await api(`/users/${currentUserID}/preferences`);
    setPreferencesFieldsInForm('', prefs);
  } catch (err) {
    showToast('Einstellungen konnten nicht geladen werden: ' + err.message, true);
  }
}

document.getElementById('preferences-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;
  try {
    const body = getPreferencesFieldsFromForm('');
    await api(`/users/${currentUserID}/preferences`, { method: 'PUT', body: JSON.stringify(body) });
    showToast('Einstellungen gespeichert.');
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

// ---------- Kurse ----------

// ---------- Prüfungstermine (mehrere Daten pro Kurs) ----------

function addExamDateRow(value = '') {
  const list = document.getElementById('exam-dates-list');
  const row = document.createElement('div');
  row.className = 'repeatable-row';
  row.innerHTML = `
    <input type="datetime-local" class="examDate-input" value="${value}">
    <button type="button" class="secondary remove-exam-date-btn">Entfernen</button>
  `;
  row.querySelector('.remove-exam-date-btn').addEventListener('click', () => {
    if (document.querySelectorAll('.examDate-input').length > 1) {
      row.remove();
    } else {
      row.querySelector('input').value = '';
    }
  });
  list.appendChild(row);
}

document.querySelectorAll('.remove-exam-date-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const row = e.target.closest('.repeatable-row');
    if (document.querySelectorAll('.examDate-input').length > 1) {
      row.remove();
    } else {
      row.querySelector('input').value = '';
    }
  });
});

document.getElementById('add-exam-date-btn').addEventListener('click', () => addExamDateRow());

function getExamDatesFromForm() {
  return Array.from(document.querySelectorAll('.examDate-input'))
    .map(input => input.value)
    .filter(Boolean);
}

function resetExamDatesInForm() {
  const list = document.getElementById('exam-dates-list');
  list.innerHTML = `
    <div class="repeatable-row">
      <input type="date" class="examDate-input">
      <button type="button" class="secondary remove-exam-date-btn">Entfernen</button>
    </div>
  `;
  list.querySelector('.remove-exam-date-btn').addEventListener('click', () => {
    list.querySelector('input').value = '';
  });
}

let editingCourseID = null;

function setCourseFormEditMode(course) {
  editingCourseID = course ? course.courseID : null;
  document.getElementById('course-form-title').textContent = course ? t('kurse.editTitle') : t('kurse.addTitle');
  document.getElementById('course-form-submit-btn').textContent = course ? t('kurse.updateBtn') : t('kurse.createBtn');

  if (!course) {
    document.getElementById('course-form').reset();
    resetExamDatesInForm();
    document.getElementById('lecture-times-list').innerHTML = '';
    setCommuteInForm('', 'commuteUni', null);
    return;
  }

  document.getElementById('courseName').value = course.courseName || '';
  document.getElementById('workload').value = course.workload ?? '';
  document.getElementById('workloadUnit').value = course.workloadUnit || 'total';
  document.getElementById('ects').value = course.ects ?? '';
  document.getElementById('priority').value = course.priority ?? '';
  document.getElementById('materialGoal').value = course.materialGoal || '';
  document.getElementById('materialPath').value = course.materialPath || '';

  const list = document.getElementById('exam-dates-list');
  list.innerHTML = '';
  (course.examDates && course.examDates.length ? course.examDates : ['']).forEach(d => addExamDateRow(d));

  const lectureList = document.getElementById('lecture-times-list');
  lectureList.innerHTML = '';
  (course.lectureTimes && course.lectureTimes.length ? course.lectureTimes : []).forEach(row => addLectureTimeRow(row));

  setCommuteInForm('', 'commuteUni', course.commuteUni);
}

document.getElementById('course-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;
  try {
    const body = {
      userID: currentUserID,
      courseName: document.getElementById('courseName').value,
      workload: Number(document.getElementById('workload').value) || 0,
      workloadUnit: document.getElementById('workloadUnit').value,
      ects: Number(document.getElementById('ects').value) || 0,
      priority: Number(document.getElementById('priority').value) || 0,
      examDates: getExamDatesFromForm(),
      materialGoal: document.getElementById('materialGoal').value,
      materialPath: document.getElementById('materialPath').value,
      lectureTimes: getLectureTimesFromForm(),
      commuteUni: getCommuteFromForm('', 'commuteUni'),
    };

    if (editingCourseID) {
      await api(`/courses/${editingCourseID}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Kurs aktualisiert.');
    } else {
      await api('/courses', { method: 'POST', body: JSON.stringify(body) });
      showToast('Kurs angelegt.');
    }
    setCourseFormEditMode(null);
    await loadCourses();
    await loadEntries();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

let allCoursesCache = [];

const workloadUnitLabel = { total: '', week: '/Woche', month: '/Monat' };

async function loadCourses() {
  const courses = currentUserID ? (await api('/courses')).filter(c => c.userID === currentUserID) : [];
  allCoursesCache = courses;

  const tbody = document.getElementById('course-list');
  tbody.innerHTML = courses.map(c => `
    <tr>
      <td>${c.courseName}</td>
      <td>${c.ects ?? ''}</td>
      <td>${c.workload ?? ''} Std.${workloadUnitLabel[c.workloadUnit] || ''}</td>
      <td>${c.priority ?? ''}</td>
      <td>${(c.examDates || []).map(d => new Date(d).toLocaleString(localeTag(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })).join(', ') || '–'}</td>
      <td>${c.materialGoal || '–'}</td>
      <td>
        ${c.materialPath ? `<a href="file:///${c.materialPath.replace(/\\/g, '/')}" class="folder-link" title="${t('kurse.materialPathHint')}">📂</a>` : ''}
        <button class="secondary" data-edit-course="${c.courseID}">${t('common.edit')}</button>
        <button class="secondary" data-delete-course="${c.courseID}">${t('common.delete')}</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="hint">Noch keine Kurse.</td></tr>';

  const taskCourseSelect = document.getElementById('task-course');
  taskCourseSelect.innerHTML = courses
    .map(c => `<option value="${c.courseID}">${c.courseName}</option>`)
    .join('');

  tbody.querySelectorAll('[data-delete-course]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/courses/${btn.dataset.deleteCourse}`, { method: 'DELETE' });
      showToast('Kurs gelöscht.');
      if (editingCourseID === Number(btn.dataset.deleteCourse)) setCourseFormEditMode(null);
      await loadCourses();
      await loadEntries();
    });
  });

  tbody.querySelectorAll('[data-edit-course]').forEach(btn => {
    btn.addEventListener('click', () => {
      const course = courses.find(c => c.courseID === Number(btn.dataset.editCourse));
      if (course) {
        setCourseFormEditMode(course);
        document.getElementById('course-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

// ---------- Tasks ----------

document.getElementById('discriminator').addEventListener('change', (e) => {
  const isLearnSession = e.target.value === 'LearnSession';
  document.getElementById('learnsession-fields').classList.toggle('hidden', !isLearnSession);
  document.getElementById('fixedtask-fields').classList.toggle('hidden', isLearnSession);
});

let editingTaskFormID = null;

function setTaskFormEditMode(task) {
  editingTaskFormID = task ? task.taskID : null;
  document.getElementById('task-form-title').textContent = task ? t('task.editTitle') : t('task.addTitle');
  document.getElementById('task-form-submit-btn').textContent = task ? t('task.updateBtn') : t('task.createBtn');

  if (!task) {
    document.getElementById('task-form').reset();
    document.getElementById('learnsession-fields').classList.remove('hidden');
    document.getElementById('fixedtask-fields').classList.add('hidden');
    return;
  }

  document.getElementById('discriminator').value = task.discriminator;
  document.getElementById('discriminator').dispatchEvent(new Event('change'));
  document.getElementById('taskName').value = task.taskName || '';
  document.getElementById('description').value = task.description || '';
  document.getElementById('location').value = task.location || '';
  document.getElementById('status').value = task.status || 'offen';
  document.getElementById('task-note').value = task.note || '';
  if (task.discriminator === 'LearnSession' && task.courseID) {
    document.getElementById('task-course').value = task.courseID;
  }
  if (task.discriminator === 'FixedTask') {
    document.getElementById('type').value = task.type || 'Arbeit';
    document.getElementById('recurring').checked = task.recurring === 1;
  }
}

// Notiz automatisch mit dem Material-Ziel des gewählten Kurses vorbefüllen
// (nur wenn die Notiz noch leer ist, um eigene Eingaben nicht zu überschreiben)
document.getElementById('task-course').addEventListener('change', () => {
  const noteField = document.getElementById('task-note');
  if (noteField.value.trim() !== '') return;
  const course = allCoursesCache.find(c => c.courseID === Number(document.getElementById('task-course').value));
  if (course && course.materialGoal) {
    noteField.value = course.materialGoal;
  }
});

document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;
  try {
    const discriminator = document.getElementById('discriminator').value;
    const body = {
      taskName: document.getElementById('taskName').value,
      description: document.getElementById('description').value,
      location: document.getElementById('location').value,
      status: document.getElementById('status').value,
      note: document.getElementById('task-note').value,
      discriminator,
      courseID: discriminator === 'LearnSession'
        ? Number(document.getElementById('task-course').value) || null
        : null,
      type: discriminator === 'FixedTask' ? document.getElementById('type').value : null,
      recurring: discriminator === 'FixedTask'
        ? (document.getElementById('recurring').checked ? 1 : 0)
        : null,
    };

    if (editingTaskFormID) {
      await api(`/tasks/${editingTaskFormID}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Task aktualisiert.');
    } else {
      await api('/tasks', { method: 'POST', body: JSON.stringify(body) });
      showToast('Task angelegt.');
    }
    setTaskFormEditMode(null);
    await loadTasks();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

async function loadTasks() {
  const tasks = await api('/tasks');

  const statusOptions = ['offen', 'in Bearbeitung', 'erledigt'];
  const tbody = document.getElementById('task-list');
  tbody.innerHTML = tasks.map(task => `
    <tr>
      <td>${task.taskName}</td>
      <td>${task.discriminator}</td>
      <td>
        <select class="quick-status" data-task-id="${task.taskID}">
          ${statusOptions.map(s => `<option value="${s}" ${task.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>${task.location ?? ''}</td>
      <td>
        <button class="secondary" data-edit-task="${task.taskID}">${t('common.edit')}</button>
        <button class="secondary" data-delete-task="${task.taskID}">${t('common.delete')}</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="hint">Noch keine Tasks.</td></tr>';

  const entryTaskSelect = document.getElementById('entry-task');
  entryTaskSelect.innerHTML = tasks
    .map(t => `<option value="${t.taskID}">${t.taskName} (${t.discriminator})</option>`)
    .join('');

  tbody.querySelectorAll('.quick-status').forEach(sel => {
    sel.addEventListener('change', async () => {
      await api(`/tasks/${sel.dataset.taskId}/status`, { method: 'PUT', body: JSON.stringify({ status: sel.value }) });
      showToast('Status aktualisiert.');
      await loadEntries(); // Dashboard/offene Aufgaben aktualisieren
    });
  });

  tbody.querySelectorAll('[data-edit-task]').forEach(btn => {
    btn.addEventListener('click', () => {
      const task = tasks.find(t => t.taskID === Number(btn.dataset.editTask));
      if (task) {
        setTaskFormEditMode(task);
        document.getElementById('task-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  tbody.querySelectorAll('[data-delete-task]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/tasks/${btn.dataset.deleteTask}`, { method: 'DELETE' });
      showToast('Task gelöscht.');
      if (editingTaskFormID === Number(btn.dataset.deleteTask)) setTaskFormEditMode(null);
      await loadTasks();
    });
  });
}

// ---------- Kalendereintrag-Popup ----------

const entryModal = document.getElementById('entry-modal');

document.getElementById('open-entry-modal-btn').addEventListener('click', () => {
  if (!requireActiveUser()) return;
  entryModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
});

function closeEntryModal() {
  entryModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

document.getElementById('close-entry-modal').addEventListener('click', closeEntryModal);
entryModal.addEventListener('click', (e) => {
  if (e.target === entryModal) closeEntryModal();
});

document.getElementById('entry-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;
  try {
    const body = {
      userID: currentUserID,
      taskID: Number(document.getElementById('entry-task').value),
      startDateTime: document.getElementById('startDateTime').value,
      endDateTime: document.getElementById('endDateTime').value,
      reminder: document.getElementById('reminder').value,
      reminderDaysBefore: Number(document.getElementById('reminderDaysBefore').value) || null,
    };
    await api('/calendar-entries', { method: 'POST', body: JSON.stringify(body) });
    showToast('Kalendereintrag angelegt.');
    e.target.reset();
    closeEntryModal();
    await loadEntries();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

// ---------- Lernplan generieren ----------

async function requestScheduleGeneration(days, mode) {
  return api('/schedule/generate', {
    method: 'POST',
    body: JSON.stringify({ userID: currentUserID, days, ...(mode ? { mode } : {}) }),
  });
}

document.getElementById('generate-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;

  const isUpdate = document.getElementById('generate-btn').textContent.includes('aktualisieren');
  if (isUpdate) {
    const confirmed = confirm(
      'Dadurch werden alle bisher automatisch generierten Lernsessions gelöscht und neu berechnet ' +
      '(manuell angelegte/bearbeitete Termine bleiben erhalten). Fortfahren?'
    );
    if (!confirmed) return;
  }

  try {
    const days = Number(document.getElementById('generate-days').value) || 14;
    let result = await requestScheduleGeneration(days);

    if (result.needsConfirmation) {
      const useShorterSessions = confirm(
        `${result.message}\n\n` +
        `OK = kürzere Lernsessions einbauen, um alle ${result.requestedDays} Tage zu nutzen\n` +
        `Abbrechen = kürzeren Zeitraum (~${result.achievableDays} Tage) verwenden`
      );
      result = await requestScheduleGeneration(days, useShorterSessions ? 'stretch' : 'shorten');
    }

    showToast(result.message || 'Lernplan generiert.');
    await loadTasks();
    await loadEntries();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

// ---------- KI-Anpassung ----------

function formatCandidateLine(c) {
  if (c.action === 'create') {
    const start = new Date(c.newStart).toLocaleString(localeTag(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    const end = new Date(c.newEnd).toLocaleString(localeTag(), { hour: '2-digit', minute: '2-digit' });
    const label = c.entryType === 'FixedTask' ? `${c.taskName} (${c.appointmentType})` : c.courseName;
    return `• ${t('chat.new')}: ${label}: ${start} – ${end}`;
  }
  if (c.action === 'delete') {
    const start = new Date(c.oldStart).toLocaleString(localeTag(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    const end = new Date(c.oldEnd).toLocaleString(localeTag(), { hour: '2-digit', minute: '2-digit' });
    return `• ${t('chat.delete')}: ${c.taskName || 'Task ' + c.entryID} (${c.type}): ${start} – ${end}`;
  }
  if (c.action === 'rename') {
    return `• ${t('chat.rename')}: "${c.oldName}" → "${c.newName}"`;
  }
  const oldTime = new Date(c.oldStart).toLocaleString(localeTag(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const newTime = new Date(c.newStart).toLocaleString(localeTag(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return `• ${c.taskName || 'Task ' + c.entryID} (${c.type}): ${oldTime} → ${newTime}`;
}

const WEEKDAY_PATTERN = /montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|\bmo\.?|\bdi\.?|\bmi\.?|\bdo\.?|\bfr\.?|\bsa\.?|\bso\.?|\d{1,2}\.\d{1,2}\.?|\d{1,2}\.\s*(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)/i;

const chatLog = document.getElementById('chat-log');
const chatPanel = document.getElementById('chat-panel');

document.getElementById('chat-bubble-toggle').addEventListener('click', () => {
  chatPanel.classList.toggle('hidden');
  if (!chatPanel.classList.contains('hidden')) {
    document.getElementById('change-description').focus();
  }
});
document.getElementById('chat-panel-close').addEventListener('click', () => {
  chatPanel.classList.add('hidden');
});
let pendingClarificationContext = null;

function appendChatMessage(role, contentHTML) {
  const msg = document.createElement('div');
  msg.className = `chat-msg ${role}`;
  msg.innerHTML = `
    <span class="chat-avatar" aria-hidden="true">${role === 'user' ? '🙂' : '🤖'}</span>
    <div class="chat-bubble">${contentHTML}</div>
  `;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
  return msg;
}

document.getElementById('optimize-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;

  const typedText = document.getElementById('change-description').value;
  appendChatMessage('user', typedText.replace(/</g, '&lt;'));
  e.target.reset();

  // Falls die KI zuvor eine Rückfrage gestellt hat, wird diese Antwort mit
  // der ursprünglichen Anfrage kombiniert, statt isoliert als neue,
  // kontextlose Anfrage geschickt zu werden.
  const changeDescription = pendingClarificationContext
    ? `Ursprüngliche Anfrage: "${pendingClarificationContext}". Antwort auf Rückfrage: "${typedText}"`
    : typedText;
  pendingClarificationContext = null;

  // Der Chat ist jetzt überall sichtbar, nicht mehr an die Kalenderansicht
  // gebunden - daher ein festes, großzügiges Zeitfenster statt der zuvor
  // angezeigten Woche/Monat, damit z. B. "wann ist meine nächste
  // Lernsession?" auch über die aktuelle Woche hinaus beantwortet werden kann.
  const rangeStart = new Date();
  const rangeEnd = new Date();
  rangeEnd.setDate(rangeEnd.getDate() + 30);

  const thinkingMsg = appendChatMessage('assistant', `<em>${t('chat.thinking')}</em>`);

  try {
    const preview = await api('/schedule/optimize', {
      method: 'POST',
      body: JSON.stringify({
        userID: currentUserID,
        changeDescription,
        rangeStart: rangeStart.toISOString(),
        rangeEnd: rangeEnd.toISOString(),
      }),
    });

    thinkingMsg.remove();

    if (preview.needsClarification) {
      pendingClarificationContext = changeDescription;
      appendChatMessage('assistant', preview.question);
      return;
    }

    if (preview.answer) {
      appendChatMessage('assistant', preview.answer);
      return;
    }

    if (!preview.candidates || preview.candidates.length === 0) {
      appendChatMessage('assistant', preview.message || t('chat.noChangeNeeded'));
      return;
    }

    const listHTML = '<ul>' + preview.candidates.map(c => `<li>${formatCandidateLine(c).replace(/^•\s*/, '')}</li>`).join('') + '</ul>';
    const bubble = appendChatMessage('assistant',
      `${preview.message || t('chat.suggestionsIntro')}${listHTML}
       <div class="chat-actions">
         <button type="button" class="apply-btn">${t('chat.apply')}</button>
         <button type="button" class="secondary discard-btn">${t('chat.discard')}</button>
       </div>`
    );

    bubble.querySelector('.apply-btn').addEventListener('click', async () => {
      bubble.querySelector('.chat-actions').remove();
      try {
        const result = await api('/schedule/optimize/apply', {
          method: 'POST',
          body: JSON.stringify({ userID: currentUserID, changeDescription, candidates: preview.candidates }),
        });
        appendChatMessage('assistant', result.message || t('chat.applied'));
        if (result.rejected && result.rejected.length > 0) {
          console.warn('Beim Übernehmen abgelehnte Änderungen:', result.rejected);
        }
        await loadEntries();
      } catch (err) {
        appendChatMessage('assistant', t('chat.error') + err.message);
      }
    });

    bubble.querySelector('.discard-btn').addEventListener('click', () => {
      bubble.querySelector('.chat-actions').remove();
      appendChatMessage('assistant', t('chat.discarded'));
    });
  } catch (err) {
    thinkingMsg.remove();
    appendChatMessage('assistant', t('chat.error') + err.message);
  }
});

// ---------- Rückgängig ----------

document.getElementById('undo-btn').addEventListener('click', async () => {
  if (!requireActiveUser()) return;
  try {
    const result = await api('/schedule/undo', {
      method: 'POST',
      body: JSON.stringify({ userID: currentUserID }),
    });
    showToast(result.message || 'Rückgängig gemacht.');
    await loadEntries();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

// ---------- Kalenderansicht (Woche/Monat) ----------

const HOUR_START = 0;
const HOUR_END = 24;
const SLOT_MINUTES = 30;
const SLOTS_PER_DAY = ((HOUR_END - HOUR_START) * 60) / SLOT_MINUTES;
function getWeekdayLabels() {
  return currentLang === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
}

let calendarView = 'week';
let calendarAnchor = new Date();
let allEntries = [];
let holidaysByDate = {}; // 'YYYY-MM-DD' -> Name

async function loadHolidays() {
  const currentYear = new Date().getFullYear();
  try {
    const [thisYear, nextYear] = await Promise.all([
      api(`/holidays/${currentYear}`),
      api(`/holidays/${currentYear + 1}`),
    ]);
    holidaysByDate = {};
    [...thisYear, ...nextYear].forEach(h => { holidaysByDate[h.date] = h.name; });
  } catch (err) {
    console.warn('Feiertage konnten nicht geladen werden:', err);
  }
}
let taskInfoById = {};

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    calendarView = btn.dataset.view;
    renderCalendar();
  });
});

document.getElementById('cal-prev').addEventListener('click', () => {
  moveAnchor(-1);
  renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', () => {
  moveAnchor(1);
  renderCalendar();
});
document.getElementById('cal-today').addEventListener('click', () => {
  calendarAnchor = new Date();
  renderCalendar();
});

function moveAnchor(direction) {
  if (calendarView === 'week') {
    calendarAnchor.setDate(calendarAnchor.getDate() + direction * 7);
  } else {
    calendarAnchor.setMonth(calendarAnchor.getMonth() + direction);
  }
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Montag = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toLocalDateKey(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function eventClassFor(task) {
  if (!task) return 'event-sonstiges';
  if (task.discriminator === 'LearnSession') return 'event-kurse';
  if (task.type === 'Pendelzeit') return 'event-pendelzeit';
  if (task.recurring === 1) return 'event-routine';
  return 'event-termin';
}

async function loadEntries() {
  allEntries = currentUserID ? await api(`/calendar-entries/user/${currentUserID}`) : [];
  const tasks = await api('/tasks');
  taskInfoById = Object.fromEntries(tasks.map(t => [t.taskID, t]));
  updateGenerateButtonLabel();
  renderCalendar();
  renderDashboard();
  checkDueReminders();
}

/**
 * Prüft, ob ein Kalendereintrag mit gesetztem reminderDaysBefore innerhalb
 * dieses Zeitraums vor seinem Start liegt, und zeigt dafür ein
 * Erinnerungs-Pop-Up. Jeder Eintrag wird pro Kalendertag nur einmal
 * angezeigt (Merker in localStorage).
 */
function checkDueReminders() {
  const todayKey = toLocalDateKey(new Date());
  const shownKey = 'shownReminders';
  let shown = {};
  try {
    shown = JSON.parse(localStorage.getItem(shownKey) || '{}');
  } catch {
    shown = {};
  }

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const due = allEntries.filter(en => {
    if (!en.reminderDaysBefore && en.reminderDaysBefore !== 0) return false;
    const start = new Date(en.startDateTime);
    if (start <= now) return false; // Termin hat schon begonnen/ist vorbei

    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const daysUntilCalendar = Math.round((startMidnight - todayMidnight) / (24 * 3600 * 1000));

    if (daysUntilCalendar < 0 || daysUntilCalendar > Number(en.reminderDaysBefore)) return false;
    return shown[en.entryID] !== todayKey;
  });

  if (due.length === 0) return;

  const list = document.getElementById('reminder-list');
  list.innerHTML = due.map(en => {
    const task = taskInfoById[en.taskID];
    const start = new Date(en.startDateTime).toLocaleString(localeTag(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `<li>🔔 ${task ? task.taskName : 'Task ' + en.taskID} – ${start}</li>`;
  }).join('');

  due.forEach(en => { shown[en.entryID] = todayKey; });
  localStorage.setItem(shownKey, JSON.stringify(shown));

  document.getElementById('reminder-modal').classList.remove('hidden');
  document.body.classList.add('modal-open');
}

document.getElementById('close-reminder-modal').addEventListener('click', () => {
  document.getElementById('reminder-modal').classList.add('hidden');
  document.body.classList.remove('modal-open');
});

function updateGenerateButtonLabel() {
  const hasLearnSessions = allEntries.some(en => taskInfoById[en.taskID]?.discriminator === 'LearnSession');
  document.getElementById('generate-btn').textContent = hasLearnSessions
    ? t('calendar.generateBtnUpdate')
    : t('calendar.generateBtn');
}

// ---------- Dashboard ----------

function renderDashboard() {
  const todayList = document.getElementById('dashboard-today');
  const openList = document.getElementById('dashboard-open-tasks');

  if (!currentUserID) {
    todayList.innerHTML = `<li class="hint">${t('dashboard.noProfile')}</li>`;
    openList.innerHTML = `<li class="hint">${t('dashboard.noProfile')}</li>`;
    return;
  }

  const now = new Date();
  const todaysEntries = allEntries
    .filter(en => isSameDay(new Date(en.startDateTime), now))
    .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

  todayList.innerHTML = todaysEntries.map(en => {
    const task = taskInfoById[en.taskID];
    const time = new Date(en.startDateTime).toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit' });
    const icon = task?.discriminator === 'LearnSession' ? '📘' : (task?.recurring === 1 ? '♻' : '📅');
    return `<li>${icon} ${time} – ${task ? task.taskName : 'Task ' + en.taskID}</li>`;
  }).join('') || `<li class="hint">${t('dashboard.noAppointmentsToday')}</li>`;

  const openTasks = Object.values(taskInfoById).filter(task => task.status && task.status !== 'erledigt');
  openList.innerHTML = openTasks.map(task =>
    `<li>✓ ${task.taskName} <span class="hint">(${task.discriminator})</span></li>`
  ).join('') || `<li class="hint">${t('dashboard.noOpenTasks')}</li>`;
}

// ---------- Globale Suche ----------

const searchInput = document.getElementById('global-search');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    searchResults.classList.add('hidden');
    searchResults.innerHTML = '';
    return;
  }

  const courseMatches = (allCoursesCache || []).filter(c => c.courseName.toLowerCase().includes(q));
  const taskMatches = Object.values(taskInfoById).filter(task => task.taskName.toLowerCase().includes(q));
  const entryMatches = allEntries.filter(en => {
    const task = taskInfoById[en.taskID];
    return task && task.taskName.toLowerCase().includes(q);
  });

  // Für jeden Task-Treffer den nächsten (kommenden, sonst ersten) zugehörigen
  // Kalendereintrag suchen, damit ein Klick direkt dorthin springt statt nur
  // zur Aufgaben-Seite. Nur falls der Task gar keinen Termin hat, bleibt der
  // Sprung zur Aufgaben-Seite als Fallback.
  const now = new Date();
  function nearestEntryForTask(taskID) {
    const entries = allEntries.filter(en => en.taskID === taskID);
    if (entries.length === 0) return null;
    const upcoming = entries.filter(en => new Date(en.startDateTime) >= now)
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    return upcoming[0] || entries.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))[0];
  }

  const sections = [];
  if (courseMatches.length) {
    sections.push(`<div class="search-group-label">📘 Kurse</div>` +
      courseMatches.map(c => `<button type="button" class="search-result-item" data-view="kurse">📘 ${c.courseName}</button>`).join(''));
  }
  if (taskMatches.length) {
    sections.push(`<div class="search-group-label">✓ Aufgaben &amp; Termine</div>` +
      taskMatches.map(task => {
        const nearest = nearestEntryForTask(task.taskID);
        const icon = task.discriminator === 'LearnSession' ? '📘' : '✓';
        if (nearest) {
          return `<button type="button" class="search-result-item" data-view="kalender" data-entry-id="${nearest.entryID}" data-entry-start="${nearest.startDateTime}">${icon} ${task.taskName}</button>`;
        }
        return `<button type="button" class="search-result-item" data-view="aufgaben">${icon} ${task.taskName}</button>`;
      }).join(''));
  }
  if (entryMatches.length) {
    sections.push(`<div class="search-group-label">📅 Kalendereinträge</div>` +
      entryMatches.map(en => {
        const task = taskInfoById[en.taskID];
        const date = new Date(en.startDateTime).toLocaleDateString(localeTag());
        return `<button type="button" class="search-result-item" data-view="kalender" data-entry-id="${en.entryID}" data-entry-start="${en.startDateTime}">📅 ${task.taskName} (${date})</button>`;
      }).join(''));
  }

  searchResults.innerHTML = sections.join('') || '<div class="search-group-label">Keine Treffer</div>';
  searchResults.classList.remove('hidden');
  searchResults.querySelectorAll('.search-result-item').forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
      if (btn.dataset.entryId) {
        jumpToCalendarEntry(Number(btn.dataset.entryId), btn.dataset.entryStart);
      }
      searchResults.classList.add('hidden');
      searchInput.value = '';
    });
  });
});

/**
 * Springt im Kalender zur Woche des angegebenen Termins und hebt die
 * entsprechende Kachel kurz farblich hervor.
 */
function jumpToCalendarEntry(entryID, startDateTime) {
  calendarView = 'week';
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'week'));
  calendarAnchor = new Date(startDateTime);
  renderCalendar();

  setTimeout(() => {
    const chip = document.querySelector(`[data-entry-id="${entryID}"]`);
    if (chip) {
      chip.classList.add('search-highlight');
      chip.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTimeout(() => chip.classList.remove('search-highlight'), 2500);
    }
  }, 0);
}

document.addEventListener('click', (e) => {
  if (!searchResults.contains(e.target) && e.target !== searchInput) {
    searchResults.classList.add('hidden');
  }
});

async function deleteEntry(entryID) {
  console.log('deleteEntry() aufgerufen mit entryID:', entryID, typeof entryID);
  const confirmed = confirm('Diesen Kalendereintrag löschen?');
  console.log('confirm() Ergebnis:', confirmed);
  if (!confirmed) return;
  try {
    const result = await api(`/calendar-entries/${entryID}`, { method: 'DELETE' });
    console.log('DELETE Antwort:', result);
    showToast('Eintrag gelöscht.');
    await loadEntries();
  } catch (err) {
    console.error('Löschen fehlgeschlagen:', err);
    showToast('Löschen fehlgeschlagen: ' + err.message, true);
  }
}

// ---------- Kalendereintrag bearbeiten (Popup bei Klick auf einen Termin) ----------

const editEntryModal = document.getElementById('edit-entry-modal');
let editingEntryID = null;

function toLocalInputValue(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

let editingTaskID = null;

function openEditEntryModal(entry) {
  editingEntryID = entry.entryID;
  editingTaskID = entry.taskID;
  const task = taskInfoById[entry.taskID];
  document.getElementById('edit-taskName').value = task ? task.taskName : '';
  document.getElementById('edit-entry-task-name').textContent = task
    ? `Typ: ${task.discriminator}${task.type ? ' - ' + task.type : ''}`
    : '';
  document.getElementById('edit-startDateTime').value = toLocalInputValue(entry.startDateTime);
  document.getElementById('edit-endDateTime').value = toLocalInputValue(entry.endDateTime);
  document.getElementById('edit-reminder').value = entry.reminder || '';
  document.getElementById('edit-reminderDaysBefore').value = entry.reminderDaysBefore ?? '';
  document.getElementById('edit-taskStatus').value = task?.status || 'offen';
  editEntryModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeEditEntryModal() {
  editEntryModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  editingEntryID = null;
  editingTaskID = null;
}

document.getElementById('close-edit-modal').addEventListener('click', closeEditEntryModal);
editEntryModal.addEventListener('click', (e) => {
  if (e.target === editEntryModal) closeEditEntryModal();
});

document.getElementById('edit-entry-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!editingEntryID) return;
  try {
    const newTaskName = document.getElementById('edit-taskName').value;
    const currentTaskName = taskInfoById[editingTaskID]?.taskName;
    if (editingTaskID && newTaskName && newTaskName !== currentTaskName) {
      await api(`/tasks/${editingTaskID}/rename`, { method: 'PUT', body: JSON.stringify({ taskName: newTaskName }) });
    }

    const newStatus = document.getElementById('edit-taskStatus').value;
    if (editingTaskID && newStatus !== taskInfoById[editingTaskID]?.status) {
      await api(`/tasks/${editingTaskID}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    }

    const body = {
      startDateTime: document.getElementById('edit-startDateTime').value,
      endDateTime: document.getElementById('edit-endDateTime').value,
      reminder: document.getElementById('edit-reminder').value,
      reminderDaysBefore: Number(document.getElementById('edit-reminderDaysBefore').value) || null,
    };
    await api(`/calendar-entries/${editingEntryID}`, { method: 'PUT', body: JSON.stringify(body) });
    showToast('Kalendereintrag aktualisiert.');
    closeEditEntryModal();
    await loadTasks();
    await loadEntries();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

document.getElementById('delete-entry-btn').addEventListener('click', async () => {
  console.log('Löschen-Button geklickt, editingEntryID =', editingEntryID);
  if (!editingEntryID) return;
  await deleteEntry(editingEntryID);
  closeEditEntryModal();
});

function renderCalendar() {
  document.getElementById('calendar-container').innerHTML = '';
  if (calendarView === 'week') {
    renderWeekView();
  } else {
    renderMonthView();
  }
}

function renderWeekView() {
  const weekStart = startOfWeek(calendarAnchor);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  document.getElementById('cal-label').textContent =
    `${weekStart.toLocaleDateString(localeTag())} – ${weekEnd.toLocaleDateString(localeTag())}`;

  const grid = document.createElement('div');
  grid.className = 'week-grid';
  grid.style.gridTemplateRows = `auto repeat(${SLOTS_PER_DAY}, 22px)`;

  // Kopfzeile
  const corner = document.createElement('div');
  corner.className = 'week-header corner';
  grid.appendChild(corner);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  days.forEach((d, i) => {
    const header = document.createElement('div');
    header.className = 'week-header';
    if (isSameDay(d, new Date())) header.classList.add('today');
    const holidayKey = toLocalDateKey(d);
    if (holidaysByDate[holidayKey]) {
      header.classList.add('holiday');
      header.title = holidaysByDate[holidayKey];
    }
    header.textContent = `${getWeekdayLabels()[i]} ${d.getDate()}.${d.getMonth() + 1}.`;
    header.style.gridColumn = i + 2;
    header.style.gridRow = 1;
    grid.appendChild(header);
  });

  // Stunden-Labels + leere Zellen als Raster
  for (let slot = 0; slot < SLOTS_PER_DAY; slot++) {
    const totalMinutes = HOUR_START * 60 + slot * SLOT_MINUTES;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    if (minute === 0) {
      const label = document.createElement('div');
      label.className = 'week-hour-label';
      label.textContent = `${String(hour).padStart(2, '0')}:00`;
      label.style.gridColumn = 1;
      label.style.gridRow = slot + 2;
      grid.appendChild(label);
    }

    for (let day = 0; day < 7; day++) {
      const cell = document.createElement('div');
      cell.className = 'week-cell';
      if (isSameDay(days[day], new Date())) cell.classList.add('today-col');
      cell.style.gridColumn = day + 2;
      cell.style.gridRow = slot + 2;
      grid.appendChild(cell);
    }
  }

  // Einträge dieser Woche platzieren
  const weekEntries = allEntries.filter(en => {
    const start = new Date(en.startDateTime);
    return days.some(d => isSameDay(d, start));
  });

  weekEntries.forEach(en => {
    const start = new Date(en.startDateTime);
    const end = new Date(en.endDateTime);
    const dayIndex = days.findIndex(d => isSameDay(d, start));
    if (dayIndex === -1) return;

    const startSlot = Math.max(0, Math.round(((start.getHours() * 60 + start.getMinutes()) - HOUR_START * 60) / SLOT_MINUTES));
    const endSlot = Math.min(SLOTS_PER_DAY, Math.round(((end.getHours() * 60 + end.getMinutes()) - HOUR_START * 60) / SLOT_MINUTES));
    if (endSlot <= startSlot) return;

    const task = taskInfoById[en.taskID];
    const chip = document.createElement('div');
    chip.className = `week-event ${eventClassFor(task)}`;
    chip.dataset.entryId = en.entryID;
    chip.style.gridColumn = dayIndex + 2;
    chip.style.gridRow = `${startSlot + 2} / ${endSlot + 2}`;
    chip.textContent = task ? task.taskName : `Task ${en.taskID}`;
    chip.title = `${start.toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit' })}`;
    chip.addEventListener('click', () => openEditEntryModal(en));
    grid.appendChild(chip);
  });

  document.getElementById('calendar-container').appendChild(grid);
}

function renderMonthView() {
  const year = calendarAnchor.getFullYear();
  const month = calendarAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = startOfWeek(firstOfMonth);

  document.getElementById('cal-label').textContent =
    calendarAnchor.toLocaleDateString(localeTag(), { month: 'long', year: 'numeric' });

  const grid = document.createElement('div');
  grid.className = 'month-grid';

  getWeekdayLabels().forEach(label => {
    const el = document.createElement('div');
    el.className = 'month-weekday';
    el.textContent = label;
    grid.appendChild(el);
  });

  const today = new Date();
  const totalCells = 42; // 6 Wochen x 7 Tage, deckt jeden Monat ab

  for (let i = 0; i < totalCells; i++) {
    const day = new Date(gridStart);
    day.setDate(day.getDate() + i);

    const cell = document.createElement('div');
    cell.className = 'month-day';
    if (day.getMonth() !== month) cell.classList.add('outside');
    if (isSameDay(day, today)) cell.classList.add('today');
    const holidayKey = toLocalDateKey(day);
    if (holidaysByDate[holidayKey]) {
      cell.classList.add('holiday');
      cell.title = holidaysByDate[holidayKey];
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day.getDate();
    cell.appendChild(dayNumber);

    const dayEntries = allEntries
      .filter(en => isSameDay(new Date(en.startDateTime), day))
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    dayEntries.forEach(en => {
      const start = new Date(en.startDateTime);
      const task = taskInfoById[en.taskID];
      const chip = document.createElement('div');
      chip.className = `event-chip ${eventClassFor(task)}`;
      chip.dataset.entryId = en.entryID;
      chip.textContent = `${start.toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit' })} ${task ? task.taskName : ''}`;
      chip.addEventListener('click', () => openEditEntryModal(en));
      cell.appendChild(chip);
    });

    grid.appendChild(cell);
  }

  document.getElementById('calendar-container').appendChild(grid);
}

// ---------- Init ----------

applyLanguage(currentLang);

(async function init() {
  try {
    await loadHolidays();
    await loadUsers();
    await refreshActiveUserDisplay();
    await loadProfileIntoForm();
    await loadPreferencesIntoForm();
    await loadCourses();
    await loadTasks();
    await loadEntries();
  } catch (err) {
    showToast('Backend nicht erreichbar. Läuft node server.js?', true);
  }
})();
