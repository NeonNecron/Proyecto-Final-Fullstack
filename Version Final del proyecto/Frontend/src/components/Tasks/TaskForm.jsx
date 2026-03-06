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
      alert('El título de la película es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const movieData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        ...(dueDate && { dueDate })
      };

      console.log('Adding movie:', movieData);
      const response = await createTask(movieData);
      console.log('Movie added:', response.data);
      onTaskCreated(response.data);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
    } catch (error) {
      console.error('Error al agregar película:', error);
      alert('Error al agregar la película');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h3>🎬 Agregar nueva película</h3>
      
      <input
        id="movie-title"
        name="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título de la película *"
        required
        disabled={loading}
        className="form-input"
      />
      
      <textarea
        id="movie-description"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Sinopsis o notas (opcional)"
        disabled={loading}
        className="form-textarea"
        rows="3"
      />

      <div className="form-row">
        <select 
          id="movie-priority"
          name="priority"
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
          disabled={loading}
          className="form-select"
        >
          <option value="high">🔥 Alta (quiero verla ya)</option>
          <option value="medium">⭐ Media (me interesa)</option>
          <option value="low">👌 Baja (tal vez después)</option>
        </select>

        <select 
          id="movie-status"
          name="status"
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
          className="form-select"
        >
          <option value="todo">⏳ Pendiente</option>
          <option value="in-progress">🎥 Viendo ahora</option>
          <option value="done">✅ Vista</option>
        </select>
      </div>

      <div className="form-row">
        <input
          id="movie-duedate"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={loading}
          className="form-input"
          placeholder="Fecha para ver"
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Agregando...' : '➕ Agregar película'}
      </button>
    </form>
  );
};

export default TaskForm;
