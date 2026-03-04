import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Verificar si hay token guardado
    if (token) {
      // Intentar derivar información mínima del token (decodificar JWT)
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const possibleId = payload.sub || payload.id || payload._id || payload.userId;
          const possibleRole = payload.role || payload.roles || payload?.role;
          // Si aún no hay user, establecer un usuario mínimo para checks en UI
          setUser(prev => prev || { _id: possibleId, role: possibleRole });
        }
      } catch (e) {
        // ignore decode errors
      }

      // Intentar obtener el usuario completo desde el backend si el endpoint existe
      (async () => {
        try {
          const resp = await api.get('/auth/me');
          const serverUser = resp.data?.user || resp.data;
          if (serverUser) setUser(serverUser);
        } catch (e) {
          // Si no existe /auth/me, no es crítico — el usuario puede venir del login
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiRegister(name, email, password);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrar' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};