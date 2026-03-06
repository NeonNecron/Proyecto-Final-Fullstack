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
      setError(result.error || 'Credenciales incorrectas');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Iniciar sesión</h1>
        
        <p className="login-subtitle">
          Elige tu usuario para continuar
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              disabled={loading}
              className="login-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              disabled={loading}
              className="login-input"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="login-button"
          >
            {loading ? 'Cargando...' : 'Enviar'}
          </button>
        </form>

        <p className="login-footer">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="login-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
