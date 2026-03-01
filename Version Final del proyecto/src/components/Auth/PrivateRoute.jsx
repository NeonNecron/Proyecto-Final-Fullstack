import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Cargando...</div>;
  }

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;