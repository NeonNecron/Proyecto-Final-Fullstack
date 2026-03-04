const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


// 🔐 Generar JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};


// ===============================
// POST /api/auth/register
// ===============================
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      const err = new Error('Todos los campos son obligatorios');
      err.statusCode = 400;
      return next(err);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const err = new Error('El correo ya está registrado');
      err.statusCode = 400;
      return next(err);
    }

    // Crear usuario (el password se encripta automáticamente en el modelo)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
});


// ===============================
// POST /api/auth/login
// ===============================
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email y contraseña son obligatorios');
      err.statusCode = 400;
      return next(err);
    }

    // IMPORTANTE: traer password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      return next(err);
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      return next(err);
    }

    const token = generateToken(user);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
});


module.exports = router;
