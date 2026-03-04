const express = require('express');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ===============================
// Todas las rutas requieren login
// ===============================
router.use(protect);


// ===============================
// GET /api/tasks
// Listar con paginación y filtros
// ===============================
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === 'true';
    }

    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: tasks
    });

  } catch (error) {
    next(error);
  }
});


// ===============================
// GET /api/tasks/:id
// ===============================
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

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


// ===============================
// POST /api/tasks
// ===============================
router.post('/', async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    if (!title) {
      const err = new Error('El título es obligatorio');
      err.statusCode = 400;
      return next(err);
    }

    const taskData = {
      title,
      description,
      user: req.user._id
    };

    // ✅ Guardar campos opcionales si vienen en la petición
    if (priority) taskData.priority = priority;
    if (status) taskData.status = status;
    if (dueDate) taskData.dueDate = dueDate;

    const task = await Task.create(taskData);
    res.status(201).json(task);

  } catch (error) {
    next(error);
  }
});


// ===============================
// PUT /api/tasks/:id
// ===============================
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, completed, priority, status, dueDate } = req.body;

    const updateData = {};

    // ✅ Solo actualizar los campos que vienen en la petición
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
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


// ===============================
// PATCH /api/tasks/:id/status
// ===============================
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { completed } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { completed },
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


// ===============================
// DELETE /api/tasks/:id
// Elimina la tarea si pertenece al usuario autenticado
// ===============================
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      const err = new Error('Tarea no encontrada o no autorizada');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
