const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const fs = require('fs');

const TEST_DB_PATH = path.join(os.tmpdir(), `workout-tracker-service-test-${process.pid}.db`);
process.env.DB_PATH = TEST_DB_PATH;

const db = require('../db/database');
const workoutService = require('./workoutService');

before(async () => {
  await db.initDb();
});

after(() => {
  db.close();
  fs.rmSync(TEST_DB_PATH, { force: true });
});

beforeEach(() => {
  db.run('DELETE FROM exercises');
  db.run('DELETE FROM workouts');
});

test('create() stores a workout with its exercises', () => {
  const workout = workoutService.create({
    title: 'Morning Run',
    category: 'cardio',
    date: '2026-01-01',
    duration_minutes: 30,
    notes: 'felt good',
    exercises: [{ name: 'Running', distance_km: 5 }],
  });

  assert.equal(workout.title, 'Morning Run');
  assert.equal(workout.exercises.length, 1);
  assert.equal(workout.exercises[0].distance_km, 5);
});

test('getById() returns null for a nonexistent workout', () => {
  assert.equal(workoutService.getById(999999), null);
});

test('getAll() falls back to sorting by date when an unknown sort column is requested', () => {
  workoutService.create({
    title: 'A',
    category: 'strength',
    date: '2026-01-01',
    duration_minutes: 10,
  });
  workoutService.create({
    title: 'B',
    category: 'strength',
    date: '2026-01-02',
    duration_minutes: 20,
  });

  const results = workoutService.getAll({ sort: 'id; DROP TABLE workouts;--' });

  assert.equal(results.length, 2);
  assert.equal(results[0].title, 'B');
});

test('getAll() filters by search and category', () => {
  workoutService.create({
    title: 'Leg Day',
    category: 'strength',
    date: '2026-01-01',
    duration_minutes: 45,
  });
  workoutService.create({
    title: 'Morning Run',
    category: 'cardio',
    date: '2026-01-02',
    duration_minutes: 30,
  });

  const bySearch = workoutService.getAll({ search: 'Run' });
  assert.equal(bySearch.length, 1);
  assert.equal(bySearch[0].title, 'Morning Run');

  const byCategory = workoutService.getAll({ category: 'strength' });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].title, 'Leg Day');
});

test('update() replaces a workout and its exercises', () => {
  const created = workoutService.create({
    title: 'Leg Day',
    category: 'strength',
    date: '2026-01-01',
    duration_minutes: 45,
    exercises: [{ name: 'Squat', sets: 3, reps: 10, weight_kg: 60 }],
  });

  const updated = workoutService.update(created.id, {
    title: 'Leg Day (heavy)',
    category: 'strength',
    date: '2026-01-01',
    duration_minutes: 50,
    exercises: [{ name: 'Deadlift', sets: 3, reps: 5, weight_kg: 100 }],
  });

  assert.equal(updated.title, 'Leg Day (heavy)');
  assert.equal(updated.exercises.length, 1);
  assert.equal(updated.exercises[0].name, 'Deadlift');
});

test('update() returns null for a nonexistent workout', () => {
  const result = workoutService.update(999999, {
    title: 'Nope',
    category: 'strength',
    date: '2026-01-01',
    duration_minutes: 10,
    exercises: [],
  });
  assert.equal(result, null);
});

test('delete() removes a workout and its exercises', () => {
  const created = workoutService.create({
    title: 'Temp',
    category: 'other',
    date: '2026-01-01',
    duration_minutes: 5,
    exercises: [{ name: 'Something' }],
  });

  const deleted = workoutService.delete(created.id);

  assert.equal(deleted.id, created.id);
  assert.equal(workoutService.getById(created.id), null);
});

test('getStats() aggregates totals and recent workouts', () => {
  workoutService.create({
    title: 'A',
    category: 'cardio',
    date: '2026-01-01',
    duration_minutes: 30,
  });
  workoutService.create({
    title: 'B',
    category: 'cardio',
    date: '2026-01-02',
    duration_minutes: 20,
  });

  const stats = workoutService.getStats();

  assert.equal(stats.totalWorkouts, 2);
  assert.equal(stats.totalMinutes, 50);
  assert.equal(stats.byCategory.length, 1);
  assert.equal(stats.byCategory[0].count, 2);
});
