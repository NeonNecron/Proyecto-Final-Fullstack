const jwt = require('jsonwebtoken');
const User = require('../models/User');


// ===============================
// 🔐 Verificar token
// ===============================
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      message: 'No autorizado, no hay token'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en BD (sin password)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'Usuario no encontrado'
      });
    }

    req.user = user; // ahora tenemos id y role
    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Token no válido'
    });
  }
};


// ===============================
// 🔐 Autorización por roles
// ===============================
exports.authorize = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'No tienes permiso para realizar esta acción'
      });
    }

    next();
  };
};
