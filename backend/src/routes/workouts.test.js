const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const fs = require('fs');
const request = require('supertest');

const TEST_DB_PATH = path.join(os.tmpdir(), `workout-tracker-route-test-${process.pid}.db`);
process.env.DB_PATH = TEST_DB_PATH;

const db = require('../db/database');
const createApp = require('../app');

let app;

before(async () => {
  await db.initDb();
  app = createApp();
});

after(() => {
  db.close();
  fs.rmSync(TEST_DB_PATH, { force: true });
});

beforeEach(() => {
  db.run('DELETE FROM exercises');
  db.run('DELETE FROM workouts');
});

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('POST /api/workouts with missing fields returns 400 with validation errors', async () => {
  const res = await request(app).post('/api/workouts').send({});
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(res.body.errors.length > 0);
});

test('POST /api/workouts creates a workout, GET /api/workouts/:id retrieves it', async () => {
  const createRes = await request(app).post('/api/workouts').send({
    title: 'Evening Yoga',
    category: 'flexibility',
    date: '2026-02-01',
    duration_minutes: 40,
    exercises: [],
  });
  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.success, true);

  const id = createRes.body.data.id;
  const getRes = await request(app).get(`/api/workouts/${id}`);
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.data.title, 'Evening Yoga');
});

test('GET /api/workouts/:id for a nonexistent id returns 404', async () => {
  const res = await request(app).get('/api/workouts/999999');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

test('PUT /api/workouts/:id updates a workout, DELETE removes it', async () => {
  const createRes = await request(app).post('/api/workouts').send({
    title: 'Old Title',
    category: 'strength',
    date: '2026-02-01',
    duration_minutes: 20,
    exercises: [],
  });
  const id = createRes.body.data.id;

  const updateRes = await request(app).put(`/api/workouts/${id}`).send({
    title: 'New Title',
    category: 'strength',
    date: '2026-02-01',
    duration_minutes: 25,
    exercises: [],
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.data.title, 'New Title');

  const deleteRes = await request(app).delete(`/api/workouts/${id}`);
  assert.equal(deleteRes.status, 200);

  const getRes = await request(app).get(`/api/workouts/${id}`);
  assert.equal(getRes.status, 404);
});

test('GET /api/workouts/stats returns aggregate stats', async () => {
  await request(app).post('/api/workouts').send({
    title: 'A',
    category: 'cardio',
    date: '2026-02-01',
    duration_minutes: 30,
    exercises: [],
  });

  const res = await request(app).get('/api/workouts/stats');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.totalWorkouts, 1);
});

test('unknown route returns 404', async () => {
  const res = await request(app).get('/api/nonexistent');
  assert.equal(res.status, 404);
});
