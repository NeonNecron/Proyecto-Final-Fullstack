import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import { getTasks, deleteTask, toggleTaskStatus, updateTask } from '../../services/taskService';
import api from '../../services/api';
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
    completed: null  // null = todas, true = vistas, false = pendientes
  });
  
  const { isAdmin, user, logout } = useAuth();

  const loadTasks = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError('');
      // Si hay un filtro activo (vistas/pendientes) pedimos más items
      // para poder filtrar localmente cuando el backend no soporte el query param.
      const fetchLimit = filter.completed !== null ? 1000 : pagination.limit;

      const response = await getTasks(page, fetchLimit, filter.completed);
      
      // La respuesta del backend es: { data, total, pages, page }
      const { data, total, pages } = response.data;

      // Si el backend no soporta el query param 'completed' y devuelve 'status' en las tareas,
      // aplicamos un filtrado local según `filter.completed` para asegurar que la pestaña muestre lo esperado.
      let filtered = data;
      if (filter.completed !== null && Array.isArray(data)) {
        if (data.length > 0 && Object.prototype.hasOwnProperty.call(data[0], 'completed')) {
          filtered = data.filter(t => Boolean(t.completed) === Boolean(filter.completed));
        } else if (data.length > 0 && Object.prototype.hasOwnProperty.call(data[0], 'status')) {
          filtered = data.filter(t => {
            const done = t.status === 'done' || t.status === 'completed' || t.status === 'Done';
            return filter.completed ? done : !done;
          });
        }
      }
      setTasks(filtered);
      setPagination({
        ...pagination,
        page,
        // Ajustar total si filtramos localmente (fallback)
        total: filtered.length || total,
        totalPages: pages
      });
      
      setTasks(data);
      console.log('Películas cargadas:', data.length, 'ejemplo:', data[0]);
      setPagination({
        ...pagination,
        page,
        total,
        totalPages: pages
      });
      
    } catch (error) {
      console.error('Error cargando películas:', error);
      setError('Error al cargar las películas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(1);
  }, [filter.completed]); // Recargar cuando cambia el filtro

  const handleDelete = async (id) => {
    const taskToDelete = tasks.find(t => t._id === id);
    if (!taskToDelete) {
      setError('Película no encontrada');
      return;
    }

    // Determinar id del propietario comprobando varios posibles campos (incluye task.user que puede ser string)
    const ownerId = taskToDelete.owner || taskToDelete.owner?._id || taskToDelete.createdBy || taskToDelete.createdBy?._id || taskToDelete.userId || taskToDelete.user || taskToDelete.user?._id || null;
    const currentUserId = user?._id || null;
    if (!(isAdmin() || (currentUserId && ownerId && String(currentUserId) === String(ownerId)))) {
      console.warn('Permiso de eliminación denegado. user._id:', currentUserId, 'ownerId:', ownerId, 'película:', taskToDelete);
      setError('❌ Solo administradores o el propietario pueden eliminar películas');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar esta película de tu lista?')) return;
    // Verificar token antes de intentar borrar
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Delete blocked: no auth token in localStorage');
      setError('No estás autenticado. Por favor inicia sesión.');
      return;
    }

    // Log completo para debugging
    console.log('Attempting delete (debug):', { id, ownerId, userId: user?._id, task: taskToDelete, tokenPresent: !!token, tokenSnippet: token ? token.slice(0,8) + '...' : 'none' });

    try {
      await deleteTask(id);
      // Recargar la página actual
      loadTasks(pagination.page);
    } catch (error) {
      console.error('Error deleting movie:', error, error.response?.data || error.message);
      const serverMsg = error.response?.data?.message || error.response?.data || null;
      if (error.response?.status === 403) {
        setError(serverMsg || 'No tienes permiso para eliminar películas');
      } else {
        setError(serverMsg || 'Error al eliminar la película');
      }
    }
  };

  const handleToggleStatus = async (task) => {
    // Optimistic update: actualizar UI antes de la petición
    const prevTasks = [...tasks];
    try {
      console.log('handleToggleStatus called for movie:', task);
      setError('');
      // Derivar el estado actual con preferencia por `completed` cuando exista
      const currentCompleted = task.completed !== undefined && task.completed !== null
        ? Boolean(task.completed)
        : (typeof task.status === 'string' ? (task.status === 'done' || task.status === 'completed' || task.status === 'Done') : false);

      const desired = !currentCompleted;

      // aplicar optimistamente (sin romper otros campos)
      setTasks(tasks.map(t => t._id === task._id ? { ...t, completed: desired, status: desired ? 'done' : (t.status || 'todo'), isUpdating: true } : t));

      // Enviar el objeto completo por PUT (algunos backends esperan la entidad completa)
      const fullPayload = { ...task, completed: desired, status: desired ? 'done' : (task.status && task.status !== 'done' ? task.status : 'todo') };
      const response = await updateTask(task._id, fullPayload);
      console.log('updateTask response status:', response.status, 'data:', response.data);
      const updated = response.data;
      if (updated && updated._id) {
        setTasks(prev => prev.map(t => t._id === updated._id ? { ...updated, isUpdating: false } : t));
      } else {
        setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: desired, isUpdating: false } : t));
      }
      // Sincronizar estado desde el servidor
      await loadTasks(pagination.page);
    } catch (error) {
      console.error('Error toggling movie:', error, error.response?.data || error.message);
      setError('Error al actualizar el estado: ' + (error.response?.data?.message || error.message || 'desconocido'));
      // revertir cambios optimistas
      setTasks(prevTasks);
    }
  };

  const handleTaskCreated = (newTask) => {
    // Ir a la primera página para ver la nueva película
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
          <p>Cargando películas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <div>
          <h1>🎬 Mi Lista de Películas</h1>
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
          Vistas
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="no-tasks">
            <p>No hay películas en tu lista</p>
            {filter.completed !== null && (
              <button 
                className="filter-btn"
                onClick={() => handleFilterChange(null)}
              >
                Ver todas las películas
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
              onUpdated={(updatedTask) => setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t))}
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
          Total: {pagination.total} película{pagination.total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default TaskList;
