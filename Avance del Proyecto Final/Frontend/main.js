const API_URL = 'http://localhost:4000/api';

// SECCIONES
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const tasksSection = document.getElementById('tasks-section');

// LOGIN
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

// REGISTRO
const registerForm = document.getElementById('register-form');
const registerNameInput = document.getElementById('register-name');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerError = document.getElementById('register-error');

// TAREAS
const logoutBtn = document.getElementById('logout-btn');
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskList = document.getElementById('task-list');

// BOTONES CAMBIO LOGIN / REGISTRO
const showRegisterBtn = document.getElementById('show-register-btn');
const showLoginBtn = document.getElementById('show-login-btn');

let token = localStorage.getItem('token') || null;

/* =========================
   FUNCIONES DE VISTAS
   ========================= */

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
  loadTasks();
}

function addDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const taskId = button.dataset.id;

      try {
        await fetch(`http://localhost:4000/api/tasks/${taskId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        loadTasks(); // recargar tareas
      } catch (error) {
        console.error("Error eliminando tarea:", error);
      }
    });
  });
}

function setToken(newToken) {
  token = newToken;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

// Al cargar la página
if (token) {
  showTasks();
} else {
  showLogin();
}

/* =========================
   LOGIN
   ========================= */

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

/* =========================
   REGISTRO
   ========================= */

// Cambiar entre login y registro
showRegisterBtn.addEventListener('click', showRegister);
showLoginBtn.addEventListener('click', showLogin);

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

    alert('Usuario registrado correctamente. Ahora inicia sesión.');
    // Mandar al login y rellenar el correo
    showLogin();
    emailInput.value = registerEmailInput.value;
    passwordInput.value = '';
  } catch (error) {
    registerError.textContent = 'Error de conexión con el servidor';
  }
});

/* =========================
   LOGOUT
   ========================= */

logoutBtn.addEventListener('click', () => {
  setToken(null);
  showLogin();
});

/* =========================
   CRUD TAREAS
   ========================= */

async function loadTasks() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:4000/api/tasks", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    console.error("Error cargando tareas:", error);
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="task-content">
        <h3>${task.title}</h3>
        ${task.description ? `<p>${task.description}</p>` : ""}
      </div>
      <button class="delete-btn" data-id="${task._id}">
        Eliminar
      </button>
    `;

    taskList.appendChild(li);
  });

  addDeleteEvents();
}


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

   // ✅ Después de crear la tarea:
  await loadTasks();


    taskTitleInput.value = '';
    taskDescInput.value = '';
  } catch (error) {
    console.error(error);
  }
});

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

    loadTasks(); // más simple: recargar lista
  } catch (error) {
    console.error(error);
  }
}
