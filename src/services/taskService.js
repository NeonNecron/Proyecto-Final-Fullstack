import api from './api';

/**
 * Servicios para gestionar tareas
 * CRUD completo de tareas
 */

// Obtener todas las tareas del usuario
export const getTasks = async (page = 1, limit = 5, completed = null) => {
  try {
    const params = { page, limit };
    // sólo incluir completed si no es null
    if (completed !== null && completed !== undefined) params.completed = completed;
    const response = await api.get('/tasks', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Obtener una tarea específica por ID
export const getTaskById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Crear una nueva tarea
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Actualizar una tarea existente
export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Eliminar una tarea
export const deleteTask = async (id) => {
  try {
    // Debug: capture presence of token and include a short snippet as a header
    const token = localStorage.getItem('token');
    try { console.log('taskService.deleteTask: token present?', !!token, token ? token.slice(0, 8) + '...' : 'none'); } catch(e){}
    const headers = { 'X-Debug-Token-Snippet': token ? token.slice(0, 8) : 'none' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await api.delete(`/tasks/${id}`, { headers });
    return response;
  } catch (error) {
    throw error;
  }
};

// Marcar tarea como completada/no completada
export const toggleTaskStatus = async (id, desiredStatus) => {
  try {
    const response = await api.patch(`/tasks/${id}`, {
      completed: desiredStatus
    });
    return response;
  } catch (error) {
    throw error;
  }
};
