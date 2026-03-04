import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h1>Crear cuenta</h1>
      
      {success ? (
        <p style={{ color: '#4ade80', textAlign: 'center' }}>
          ¡Registro exitoso! Redirigiendo al login...
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              id="register-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          
          <label>
            Correo electrónico
            <input
              id="register-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          
          <label>
            Contraseña
            <input
              id="register-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
            />
          </label>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>
      )}

      {error && <p className="error-message">{error}</p>}

      <p className="switch-text">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="link-button">
          Inicia sesión
        </Link>
      </p>
      </div>
    </div>
  );
};

export default Register;
