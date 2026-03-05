const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

const app = require('../src/server');
const connectDB = require('../src/config/db');

let userToken;
let adminToken;
let createdTaskId;

beforeAll(async () => {
  await connectDB();

  // Crear usuario normal
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'User',
      email: 'user@test.com',
      password: '123456'
    });

  userToken = userRes.body.token;

  // Crear admin
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin'
    });

  adminToken = adminRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('TASK ROUTES', () => {

  it('Debe crear tarea', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Tarea Test',
        description: 'Descripción test'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');

    createdTaskId = res.body._id;
  });

  it('Debe listar tareas', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('Debe actualizar tarea', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Tarea Actualizada',
        completed: true
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('Debe fallar sin token', async () => {
    const res = await request(app)
      .get('/api/tasks');

    expect(res.statusCode).toBe(401);
  });

  it('Debe eliminar tarea', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Tarea eliminada');

    // Verificar que la tarea ya no existe
    const getRes = await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(getRes.statusCode).toBe(404);
  });
});
