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
    const { title, description } = req.body;

    if (!title) {
      const err = new Error('El título es obligatorio');
      err.statusCode = 400;
      return next(err);
    }

    const task = await Task.create({
      title,
      description,
      user: req.user._id
    });

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
    const { title, description, completed } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
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
// Solo ADMIN puede eliminar
// ===============================
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      const err = new Error('Tarea no encontrada');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ message: 'Tarea eliminada por admin' });

  } catch (error) {
    next(error);
  }
});


module.exports = router;
