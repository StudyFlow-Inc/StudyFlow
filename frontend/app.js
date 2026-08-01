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

document.getElementById('preferences-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireActiveUser()) return;
  try {
    const body = {
      preferredTime: document.getElementById('preferredTime').value,
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

// ---------- Kalendereinträge ----------

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
    await loadEntries();
  } catch (err) {
    showToast('Fehler: ' + err.message, true);
  }
});

async function loadEntries() {
  const entries = currentUserID
    ? await api(`/calendar-entries/user/${currentUserID}`)
    : [];
  const tasks = await api('/tasks');
  const taskNameById = Object.fromEntries(tasks.map(t => [t.taskID, t.taskName]));

  const tbody = document.getElementById('entry-list');
  tbody.innerHTML = entries.map(en => `
    <tr>
      <td>${taskNameById[en.taskID] ?? en.taskID}</td>
      <td>${new Date(en.startDateTime).toLocaleString('de-DE')}</td>
      <td>${new Date(en.endDateTime).toLocaleString('de-DE')}</td>
      <td>${en.reminder ?? ''}</td>
      <td><button class="secondary" data-delete-entry="${en.entryID}">Löschen</button></td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="hint">Noch keine Kalendereinträge.</td></tr>';

  tbody.querySelectorAll('[data-delete-entry]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/calendar-entries/${btn.dataset.deleteEntry}`, { method: 'DELETE' });
      showToast('Eintrag gelöscht.');
      await loadEntries();
    });
  });
}

// ---------- Init ----------

(async function init() {
  try {
    await loadUsers();
    await refreshActiveUserDisplay();
    await loadCourses();
    await loadTasks();
    await loadEntries();
  } catch (err) {
    showToast('Backend nicht erreichbar. Läuft node server.js?', true);
  }
})();
