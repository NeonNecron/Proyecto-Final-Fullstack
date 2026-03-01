import React from 'react';
import { useAuth } from '../../context/AuthContext';

const TaskItem = ({ task, onDelete, onToggleStatus }) => {
  const { isAdmin } = useAuth();

  const getPriorityInfo = (priority) => {
    const info = {
      low: { color: '#10b981', label: 'Baja', icon: '🔵' },
      medium: { color: '#f59e0b', label: 'Media', icon: '🟡' },
      high: { color: '#ef4444', label: 'Alta', icon: '🔴' }
    };
    return info[priority] || info.medium;
  };

  const getStatusInfo = (status) => {
    const info = {
      'todo': { icon: '📝', label: 'Por hacer' },
      'in-progress': { icon: '⚙️', label: 'En progreso' },
      'done': { icon: '✅', label: 'Completado' }
    };
    return info[status] || info.todo;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const priorityInfo = getPriorityInfo(task.priority);
  const statusInfo = getStatusInfo(task.status);

  return (
    <div className={`task-item priority-${task.priority}`}>
      <div className="task-header">
        <h3>
          {statusInfo.icon} {task.title}
        </h3>
        <span 
          className="priority-badge"
          style={{ backgroundColor: priorityInfo.color }}
        >
          {priorityInfo.icon} {priorityInfo.label}
        </span>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      <div className="task-meta">
        {task.dueDate && (
          <span className="due-date">
            📅 Vence: {formatDate(task.dueDate)}
          </span>
        )}
        <span className="status-badge">
          {statusInfo.icon} {statusInfo.label}
        </span>
        <span className="created-date">
          🕒 Creada: {formatDate(task.createdAt)}
        </span>
      </div>

      <div className="task-actions">
        <button 
          onClick={() => onToggleStatus(task._id, task.completed)}
          className="toggle-btn"
        >
          {task.completed ? '↩️ Reabrir' : '✅ Completar'}
        </button>
        
        {isAdmin() && (
          <button 
            onClick={() => onDelete(task._id)} 
            className="delete-btn"
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;