import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) return 'El nombre es obligatorio';
    if (!email.trim()) return 'El correo es obligatorio';
    if (!email.includes('@') || !email.includes('.')) return 'Correo electrónico inválido';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    const result = await register(name, email, password);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error || 'Error al registrar usuario');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Crear cuenta</h1>
        
        <p className="login-subtitle">
          Regístrate para comenzar a usar la aplicación
        </p>

        {success ? (
          <div className="login-success">
            <p>¡Registro exitoso!</p>
            <p className="success-subtitle">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                required
                disabled={loading}
                className="login-input"
              />
            </div>

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
                placeholder="Contraseña (mínimo 6 caracteres)"
                required
                disabled={loading}
                className="login-input"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
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
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        )}

        <p className="login-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="login-link">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
