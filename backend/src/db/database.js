const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/workouts.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db;

async function initDb() {
  db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sets INTEGER,
      reps INTEGER,
      weight_kg REAL,
      distance_km REAL,
      FOREIGN KEY (workout_id) REFERENCES workouts(id)
    )
  `);

  return db;
}

function query(sql, params = []) {
  return db.prepare(sql).all(params);
}

function run(sql, params = []) {
  const info = db.prepare(sql).run(params);
  return { lastInsertRowid: info.lastInsertRowid };
}

function get(sql, params = []) {
  return db.prepare(sql).get(params) || null;
}

function close() {
  db.close();
}

module.exports = { initDb, query, run, get, close };
