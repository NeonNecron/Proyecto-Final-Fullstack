const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // 🛑 Error ID inválido (CastError de Mongo)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID inválido';
  }

  // 🛑 Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  }

  // 🛑 Error de clave duplicada (email único)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'El valor ya existe en la base de datos';
  }

  // 🛑 Error de JWT inválido
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  // 🛑 Token expirado
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production'
      ? undefined
      : err.stack
  });
};

module.exports = errorHandler;
