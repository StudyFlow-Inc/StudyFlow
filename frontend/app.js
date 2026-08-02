const API_BASE = 'http://localhost:3000/api';

let currentUserID = localStorage.getItem('currentUserID')
  ? Number(localStorage.getItem('currentUserID'))
  : null;

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
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : null;
}

function setActiveUserDisplay(user) {
  const el = document.getElementById('active-user');
  if (user) {
    el.textContent = `Aktiv: ${user.userName} (ID ${user.userID})`;
    el.classList.remove('empty');
  } else {
    el.textContent = 'Kein Profil aktiv';
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

// ---------- Tabs ----------

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ---------- User / Profil ----------

document.getElementById('user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const body = {
      userName: document.getElementById('userName').value,
      fieldOfStudy: document.getElementById('fieldOfStudy').value,
      employment: document.getElementById('employment').value,
      livingSituation: document.getElementById('livingSituation').value,
    };
    const data = await api('/users', { method: 'POST', body: JSON.stringify(body) });
    currentUserID = data.userID;
    localStorage.setItem('currentUserID', currentUserID);
    showToast('Profil angelegt.');
    e.target.reset();
    await loadUsers();
    await refreshActiveUserDisplay();
  } catch (err) {
    showToast('Fehler beim Anlegen: ' + err.message, true);
  }
});

document.getElementById('select-user-btn').addEventListener('click', async () => {
  const select = document.getElementById('user-select');
  if (!select.value) return;
  currentUserID = Number(select.value);
  localStorage.setItem('currentUserID', currentUserID);
  showToast('Profil aktiviert.');
  await refreshActiveUserDisplay();
  await loadPreferencesIntoForm();
  await loadCourses();
  await loadTasks();
  await loadEntries();
});

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

// ---------- Bevorzugte Lernzeiten (mehrere Uhrzeiten) ----------

function addPreferredTimeRow(value = '') {
  const list = document.getElementById('preferred-times-list');
  const row = document.createElement('div');
  row.className = 'repeatable-row';
  row.innerHTML = `
    <input type="time" class="preferredTime-input" value="${value}">
    <button type="button" class="secondary remove-time-btn">Entfernen</button>
  `;
  row.querySelector('.remove-time-btn').addEventListener('click', () => {
    if (document.querySelectorAll('.preferredTime-input').length > 1) {
      row.remove();
    } else {
      row.querySelector('input').value = '';
    }
  });
  list.appendChild(row);
}

document.querySelectorAll('.remove-time-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const row = e.target.closest('.repeatable-row');
    if (document.querySelectorAll('.preferredTime-input').length > 1) {
      row.remove();
    } else {
      row.querySelector('input').value = '';
    }
  });
});

document.getElementById('add-time-btn').addEventListener('click', () => addPreferredTimeRow());

function getPreferredTimesFromForm() {
  return Array.from(document.querySelectorAll('.preferredTime-input'))
    .map(input => input.value)
    .filter(Boolean);
}

function setPreferredTimesInForm(times) {
  const list = document.getElementById('preferred-times-list');
  list.innerHTML = '';
  if (!times || times.length === 0) {
    addPreferredTimeRow();
    return;
  }
  times.forEach(t => addPreferredTimeRow(t));
}

async function loadPreferencesIntoForm() {
  if (!currentUserID) return;
  try {
    const prefs = await api(`/users/${currentUserID}/preferences`);
    setPreferredTimesInForm(prefs.preferredTimes);
    document.getElementById('maxHoursPerDay').value = prefs.maxHoursPerDay ?? '';
    document.getElementById('breakDuration').value = prefs.breakDuration ?? '';
    document.getElementById('bufferBeforeExam').value = prefs.bufferBeforeExam ?? '';
  } catch (err) {
    showToast('Einstellungen konnten nicht geladen werden: ' + err.message, true);
  }
}

document.getElementById('preferences-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;
  try {
    const body = {
      preferredTimes: getPreferredTimesFromForm(),
      maxHoursPerDay: Number(document.getElementById('maxHoursPerDay').value) || null,
      breakDuration: Number(document.getElementById('breakDuration').value) || null,
      bufferBeforeExam: Number(document.getElementById('bufferBeforeExam').value) || null,
    };
    await api(`/users/${currentUserID}/preferences`, { method: 'PUT', body: JSON.stringify(body) });
    showToast('Einstellungen gespeichert.');
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

// ---------- Kurse ----------

document.getElementById('course-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;
  try {
    const body = {
      userID: currentUserID,
      courseName: document.getElementById('courseName').value,
      workload: Number(document.getElementById('workload').value) || 0,
      ects: Number(document.getElementById('ects').value) || 0,
      priority: Number(document.getElementById('priority').value) || 0,
    };
    await api('/courses', { method: 'POST', body: JSON.stringify(body) });
    showToast('Kurs angelegt.');
    e.target.reset();
    await loadCourses();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

async function loadCourses() {
  const courses = currentUserID ? (await api('/courses')).filter(c => c.userID === currentUserID) : [];

  const tbody = document.getElementById('course-list');
  tbody.innerHTML = courses.map(c => `
    <tr>
      <td>${c.courseName}</td>
      <td>${c.ects ?? ''}</td>
      <td>${c.workload ?? ''} Std.</td>
      <td>${c.priority ?? ''}</td>
      <td><button class="secondary" data-delete-course="${c.courseID}">Löschen</button></td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="hint">Noch keine Kurse.</td></tr>';

  const taskCourseSelect = document.getElementById('task-course');
  taskCourseSelect.innerHTML = courses
    .map(c => `<option value="${c.courseID}">${c.courseName}</option>`)
    .join('');

  tbody.querySelectorAll('[data-delete-course]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/courses/${btn.dataset.deleteCourse}`, { method: 'DELETE' });
      showToast('Kurs gelöscht.');
      await loadCourses();
    });
  });
}

// ---------- Tasks ----------

document.getElementById('discriminator').addEventListener('change', (e) => {
  const isLearnSession = e.target.value === 'LearnSession';
  document.getElementById('learnsession-fields').classList.toggle('hidden', !isLearnSession);
  document.getElementById('fixedtask-fields').classList.toggle('hidden', isLearnSession);
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
      discriminator,
      courseID: discriminator === 'LearnSession'
        ? Number(document.getElementById('task-course').value) || null
        : null,
      type: discriminator === 'FixedTask' ? document.getElementById('type').value : null,
      recurring: discriminator === 'FixedTask'
        ? (document.getElementById('recurring').checked ? 1 : 0)
        : null,
    };
    await api('/tasks', { method: 'POST', body: JSON.stringify(body) });
    showToast('Task angelegt.');
    e.target.reset();
    document.getElementById('learnsession-fields').classList.remove('hidden');
    document.getElementById('fixedtask-fields').classList.add('hidden');
    await loadTasks();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

async function loadTasks() {
  const tasks = await api('/tasks');

  const tbody = document.getElementById('task-list');
  tbody.innerHTML = tasks.map(t => `
    <tr>
      <td>${t.taskName}</td>
      <td>${t.discriminator}</td>
      <td>${t.status ?? ''}</td>
      <td>${t.location ?? ''}</td>
      <td><button class="secondary" data-delete-task="${t.taskID}">Löschen</button></td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="hint">Noch keine Tasks.</td></tr>';

  const entryTaskSelect = document.getElementById('entry-task');
  entryTaskSelect.innerHTML = tasks
    .map(t => `<option value="${t.taskID}">${t.taskName} (${t.discriminator})</option>`)
    .join('');

  tbody.querySelectorAll('[data-delete-task]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/tasks/${btn.dataset.deleteTask}`, { method: 'DELETE' });
      showToast('Task gelöscht.');
      await loadTasks();
    });
  });
}

// ---------- Kalendereintrag-Popup ----------

const entryModal = document.getElementById('entry-modal');

document.getElementById('open-entry-modal-btn').addEventListener('click', () => {
  if (!requireActiveUser()) return;
  entryModal.classList.remove('hidden');
});

function closeEntryModal() {
  entryModal.classList.add('hidden');
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

document.getElementById('optimize-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;
  try {
    const changeDescription = document.getElementById('change-description').value;
    const result = await api('/schedule/optimize', {
      method: 'POST',
      body: JSON.stringify({ userID: currentUserID, changeDescription }),
    });

    showToast(result.message || 'Lernplan angepasst.');
    if (result.rejected && result.rejected.length > 0) {
      console.warn('Von der KI vorgeschlagene, aber abgelehnte Änderungen:', result.rejected);
    }
    e.target.reset();
    await loadEntries();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

// ---------- Kalenderansicht (Woche/Monat) ----------

const HOUR_START = 6;
const HOUR_END = 23;
const SLOT_MINUTES = 30;
const SLOTS_PER_DAY = ((HOUR_END - HOUR_START) * 60) / SLOT_MINUTES;
const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

let calendarView = 'week';
let calendarAnchor = new Date();
let allEntries = [];
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

function eventClassFor(task) {
  if (!task) return 'event-sonstiges';
  if (task.discriminator === 'LearnSession') return 'event-learn';
  const map = { Arbeit: 'event-arbeit', Freizeit: 'event-freizeit', Training: 'event-training' };
  return map[task.type] || 'event-sonstiges';
}

async function loadEntries() {
  allEntries = currentUserID ? await api(`/calendar-entries/user/${currentUserID}`) : [];
  const tasks = await api('/tasks');
  taskInfoById = Object.fromEntries(tasks.map(t => [t.taskID, t]));
  updateGenerateButtonLabel();
  renderCalendar();
}

function updateGenerateButtonLabel() {
  const hasLearnSessions = allEntries.some(en => taskInfoById[en.taskID]?.discriminator === 'LearnSession');
  document.getElementById('generate-btn').textContent = hasLearnSessions
    ? 'Lernsessions aktualisieren'
    : 'Lernsessions einplanen';
}

async function deleteEntry(entryID) {
  if (!confirm('Diesen Kalendereintrag löschen?')) return;
  await api(`/calendar-entries/${entryID}`, { method: 'DELETE' });
  showToast('Eintrag gelöscht.');
  await loadEntries();
}

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
    `${weekStart.toLocaleDateString('de-DE')} – ${weekEnd.toLocaleDateString('de-DE')}`;

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
    header.textContent = `${WEEKDAY_LABELS[i]} ${d.getDate()}.${d.getMonth() + 1}.`;
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
    chip.style.gridColumn = dayIndex + 2;
    chip.style.gridRow = `${startSlot + 2} / ${endSlot + 2}`;
    chip.textContent = task ? task.taskName : `Task ${en.taskID}`;
    chip.title = `${start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
    chip.addEventListener('click', () => deleteEntry(en.entryID));
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
    calendarAnchor.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

  const grid = document.createElement('div');
  grid.className = 'month-grid';

  WEEKDAY_LABELS.forEach(label => {
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
      chip.textContent = `${start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} ${task ? task.taskName : ''}`;
      chip.addEventListener('click', () => deleteEntry(en.entryID));
      cell.appendChild(chip);
    });

    grid.appendChild(cell);
  }

  document.getElementById('calendar-container').appendChild(grid);
}

// ---------- Init ----------

(async function init() {
  try {
    await loadUsers();
    await refreshActiveUserDisplay();
    await loadPreferencesIntoForm();
    await loadCourses();
    await loadTasks();
    await loadEntries();
  } catch (err) {
    showToast('Backend nicht erreichbar. Läuft node server.js?', true);
  }
})();
