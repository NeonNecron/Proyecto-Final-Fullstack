import api from './api';

/**
 * Servicios para gestionar tareas
 * CRUD completo de tareas
 */

// Obtener todas las tareas del usuario
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks');
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
    const response = await api.delete(`/tasks/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Marcar tarea como completada/no completada
export const toggleTaskStatus = async (id, currentStatus) => {
  try {
    const response = await api.patch(`/tasks/${id}`, {
      completed: !currentStatus
    });
    return response;
  } catch (error) {
    throw error;
  }
};
