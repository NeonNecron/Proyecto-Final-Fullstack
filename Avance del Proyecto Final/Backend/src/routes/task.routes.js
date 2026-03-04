const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Todas estas rutas requieren token
router.use(auth);

// GET /api/tasks - listar tareas del usuario
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort('-createdAt');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - crear tarea
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      const err = new Error('El título es obligatorio');
      err.statusCode = 400;
      return next(err);
    }

    const task = await Task.create({
      title,
      description,
      user: req.user.id
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - actualizar
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, description, completed },
      { new: true }
    );

    if (!task) {
      const err = new Error('Tarea no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - eliminar
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      const err = new Error('Tarea no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
