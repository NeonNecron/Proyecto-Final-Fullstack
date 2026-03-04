import React, { useState } from 'react';
import { createTask } from '../../services/taskService';

const TaskForm = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        ...(dueDate && { dueDate })
      };

      const response = await createTask(taskData);
      onTaskCreated(response.data);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert('Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h3>Crear nueva tarea</h3>
      
      <input
        id="task-title"
        name="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título de la tarea *"
        required
        disabled={loading}
        className="form-input"
      />
      
      <textarea
        id="task-description"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        disabled={loading}
        className="form-textarea"
        rows="3"
      />

      <div className="form-row">
        <select 
          id="task-priority"
          name="priority"
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
          disabled={loading}
          className="form-select"
        >
          <option value="low">🔵 Baja prioridad</option>
          <option value="medium">🟡 Media prioridad</option>
          <option value="high">🔴 Alta prioridad</option>
        </select>

        <select 
          id="task-status"
          name="status"
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
          className="form-select"
        >
          <option value="todo">📝 Por hacer</option>
          <option value="in-progress">⚙️ En progreso</option>
          <option value="done">✅ Completado</option>
        </select>
      </div>

      <div className="form-row">
        <input
          id="task-dueDate"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={loading}
          className="form-input"
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Creando...' : '➕ Crear Tarea'}
      </button>
    </form>
  );
};

export default TaskForm;