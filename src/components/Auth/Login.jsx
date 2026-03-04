import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/tasks');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="card">
      <h1>Iniciar sesión</h1>
      
      <form onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input
            id="login-email"
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
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <p className="switch-text">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/register" className="link-button">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
};

export default Login;