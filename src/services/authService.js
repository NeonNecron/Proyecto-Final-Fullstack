import api from './api';

/**
 * Servicios de autenticación
 * Comunicación con el backend para login y registro
 */

// Iniciar sesión
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response;
  } catch (error) {
    throw error;
  }
};

// Registrar nuevo usuario
export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { 
      name, 
      email, 
      password 
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Cerrar sesión (solo local, el token se elimina)
export const logout = () => {
  localStorage.removeItem('token');
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};
