const API_URL = 'http://localhost:4000/api';

const loginSection = document.getElementById('login-section');
const tasksSection = document.getElementById('tasks-section');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

const registerForm = document.getElementById('register-form');
const registerNameInput = document.getElementById('register-name');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerError = document.getElementById('register-error');

const logoutBtn = document.getElementById('logout-btn');
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskList = document.getElementById('task-list');

const showRegisterBtn = document.getElementById('show-register-btn');
const showLoginBtn = document.getElementById('show-login-btn');

let token = localStorage.getItem('token') || null;

const showLogin = () => {
  loginSection.classList.remove('hidden');
  tasksSection.classList.add('hidden');
};

const showTasks = () => {
  loginSection.classList.add('hidden');
  tasksSection.classList.remove('hidden');
  loadTasks();
};

const setToken = (newToken) => {
  token = newToken;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Si ya hay token intentamos entrar directo
if (token) {
  showTasks();
} else {
  showLogin();
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      loginError.textContent = data.message || 'Error al iniciar sesión';
      return;
    }

    setToken(data.token);
    showTasks();
  } catch (error) {
    loginError.textContent = 'Error de conexión con el servidor';
  }
});

// FUNCIONES PARA MOSTRAR/OCULTAR SECCIONES
function showLogin() {
  loginSection.classList.remove('hidden');
  registerSection.classList.add('hidden');
  tasksSection.classList.add('hidden');
}

function showRegister() {
  loginSection.classList.add('hidden');
  registerSection.classList.remove('hidden');
  tasksSection.classList.add('hidden');
}

function showTasks() {
  loginSection.classList.add('hidden');
  registerSection.classList.add('hidden');
  tasksSection.classList.remove('hidden');
  loadTasks(); // si ya tienes esta función, se usa aquí
}

// CAMBIO ENTRE LOGIN <-> REGISTRO
showRegisterBtn.addEventListener('click', showRegister);
showLoginBtn.addEventListener('click', showLogin);

// EVENTO DE REGISTRO
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: registerNameInput.value,
        email: registerEmailInput.value,
        password: registerPasswordInput.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      registerError.textContent = data.message || 'Error al registrar usuario';
      return;
    }

    // Registro exitoso → mandar al login
    alert('Usuario registrado correctamente. Ahora inicia sesión.');
    showLogin();
    loginEmailInput.value = registerEmailInput.value;
    loginPasswordInput.value = '';
  } catch (error) {
    registerError.textContent = 'Error de conexión con el servidor';
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  setToken(null);
  showLogin();
});

// Cargar tareas
async function loadTasks() {
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (error) {
    console.error(error);
  }
}

// Render de la lista
function renderTasks(tasks) {
  taskList.innerHTML = '';
  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const span = document.createElement('span');
    span.textContent = task.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => deleteTask(task._id));

    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

// Crear tarea
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: taskTitleInput.value,
        description: taskDescInput.value
      })
    });

    const newTask = await res.json();

    if (!res.ok) {
      alert(newTask.message || 'Error al crear la tarea');
      return;
    }

    // Agregar nueva tarea al DOM sin recargar toda la lista
    const li = document.createElement('li');
    li.className = 'task-item';

    const span = document.createElement('span');
    span.textContent = newTask.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => deleteTask(newTask._id));

    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.prepend(li);

    taskTitleInput.value = '';
    taskDescInput.value = '';
  } catch (error) {
    console.error(error);
  }
});

// Eliminar tarea
async function deleteTask(id) {
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Error al eliminar tarea');
      return;
    }

    // Quitar del DOM
    const li = [...taskList.children].find((item) =>
      item.querySelector('button').onclick.toString().includes(id)
    );
    if (li) {
      li.remove();
    } else {
      // Si no la encontramos, recargamos todo
      loadTasks();
    }
  } catch (error) {
    console.error(error);
  }
}
