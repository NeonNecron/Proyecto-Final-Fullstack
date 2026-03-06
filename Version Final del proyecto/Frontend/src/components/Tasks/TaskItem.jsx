import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateTask } from '../../services/taskService';

const TaskItem = ({ task, onDelete, onToggleStatus, onUpdated }) => {
  const { isAdmin, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [status, setStatus] = useState(task.status || 'todo');
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [saving, setSaving] = useState(false);

  const getPriorityInfo = (priority) => {
    const info = {
      low: { color: '#94a3b8', label: 'Bajo interés', icon: '👌' },
      medium: { color: '#f59e0b', label: 'Interés medio', icon: '⭐' },
      high: { color: '#ef4444', label: 'Alto interés', icon: '🔥' }
    };
    return info[priority] || info.medium;
  };

  const getStatusInfo = (status) => {
    const info = {
      'todo': { icon: '⏳', label: 'Pendiente' },
      'in-progress': { icon: '🎥', label: 'Viendo ahora' },
      'done': { icon: '✅', label: 'Vista' }
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

  const canModify = true; // Todos pueden editar/eliminar por ahora

  return (
    <div className={`task-item priority-${task.priority}`}>
      {isEditing ? (
        <form
          className="edit-task-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              const updated = {
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                status,
                ...(dueDate && { dueDate })
              };
              const response = await updateTask(task._id, updated);
              onUpdated && onUpdated(response.data);
              setIsEditing(false);
            } catch (err) {
              console.error('Error updating movie:', err);
              alert('Error al actualizar la película');
            } finally {
              setSaving(false);
            }
          }}
        >
            <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="Título de la película" required />
            <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} className="form-textarea" placeholder="Sinopsis o notas" rows="2" />
          <div className="form-row">
            <select name="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="form-select">
              <option value="high">🔥 Alto interés (quiero verla ya)</option>
              <option value="medium">⭐ Interés medio</option>
              <option value="low">👌 Bajo interés (tal vez después)</option>
            </select>

            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
              <option value="todo">⏳ Pendiente</option>
              <option value="in-progress">🎥 Viendo ahora</option>
              <option value="done">✅ Vista</option>
            </select>
          </div>

          <input name="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input" placeholder="Fecha para ver" />

          <div className="task-actions">
            <button type="submit" className="save-btn" disabled={saving}>{saving ? 'Guardando...' : '💾 Guardar'}</button>
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)} disabled={saving}>❌ Cancelar</button>
          </div>
        </form>
      ) : (
        <>
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
                📅 Fecha para ver: {formatDate(task.dueDate)}
              </span>
            )}
            <span className="status-badge">
              {statusInfo.icon} {statusInfo.label}
            </span>
            <span className="created-date">
              🕒 Agregada: {formatDate(task.createdAt)}
            </span>
          </div>

          <div className="task-actions">
            <button 
              onClick={() => onToggleStatus(task)}
              className="toggle-btn"
              disabled={task.isUpdating}
            >
              {task.isUpdating ? 'Actualizando...' : (task.completed ? '↩️ Marcar como pendiente' : '✅ Marcar como vista')}
            </button>
            
            {canModify && (
              <>
                <button type="button" onClick={() => setIsEditing(true)} className="edit-btn">✏️ Editar</button>
                <button 
                  onClick={() => onDelete(task._id)} 
                  className="delete-btn"
                >
                  🗑️ Quitar de la lista
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;
