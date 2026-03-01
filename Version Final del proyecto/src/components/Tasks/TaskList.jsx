import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import { getTasks, deleteTask, toggleTaskStatus } from '../../services/taskService';
import './Tasks.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Paginación
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 5
  });
  
  // Filtros
  const [filter, setFilter] = useState({
    completed: null  // null = todas, true = completadas, false = pendientes
  });
  
  const { isAdmin, user, logout } = useAuth();

  const loadTasks = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getTasks(page, pagination.limit, filter.completed);
      
      // La respuesta del backend es: { data, total, pages, page }
      const { data, total, pages } = response.data;
      
      setTasks(data);
      setPagination({
        ...pagination,
        page,
        total,
        totalPages: pages
      });
      
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(1);
  }, [filter.completed]); // Recargar cuando cambia el filtro

  const handleDelete = async (id) => {
    if (!isAdmin()) {
      setError('❌ Solo administradores pueden eliminar tareas');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      await deleteTask(id);
      // Recargar la página actual
      loadTasks(pagination.page);
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.response?.status === 403) {
        setError('No tienes permiso para eliminar tareas');
      } else {
        setError('Error al eliminar la tarea');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleTaskStatus(id, !currentStatus);
      // Actualizar la tarea en el estado local
      setTasks(tasks.map(task => 
        task._id === id ? { ...task, completed: !currentStatus } : task
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
      setError('Error al actualizar el estado');
    }
  };

  const handleTaskCreated = (newTask) => {
    // Ir a la primera página para ver la nueva tarea
    loadTasks(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadTasks(newPage);
      // Scroll suave al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (completed) => {
    setFilter({ completed });
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="tasks-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <div>
          <h1>Mis Tareas</h1>
          {user && (
            <p className="user-role">
              Rol: <span className={`role-${user.role}`}>{user.role}</span>
            </p>
          )}
        </div>
        <button onClick={logout} className="logout-btn">
          Cerrar sesión
        </button>
      </div>

      <TaskForm onTaskCreated={handleTaskCreated} />

      {/* Filtros */}
      <div className="filters">
        <button 
          className={`filter-btn ${filter.completed === null ? 'active' : ''}`}
          onClick={() => handleFilterChange(null)}
        >
          Todas
        </button>
        <button 
          className={`filter-btn ${filter.completed === false ? 'active' : ''}`}
          onClick={() => handleFilterChange(false)}
        >
          Pendientes
        </button>
        <button 
          className={`filter-btn ${filter.completed === true ? 'active' : ''}`}
          onClick={() => handleFilterChange(true)}
        >
          Completadas
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="no-tasks">
            <p>No hay tareas para mostrar</p>
            {filter.completed !== null && (
              <button 
                className="filter-btn"
                onClick={() => handleFilterChange(null)}
              >
                Ver todas las tareas
              </button>
            )}
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task._id}
              task={task}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="page-btn"
          >
            ← Anterior
          </button>
          
          <span className="page-info">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="page-btn"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Info de total */}
      {pagination.total > 0 && (
        <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '1rem' }}>
          Total: {pagination.total} tarea{pagination.total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default TaskList;