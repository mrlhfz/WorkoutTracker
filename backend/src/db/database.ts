import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/workouts.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db: Database.Database;

async function initDb(): Promise<Database.Database> {
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

function query<T = unknown>(sql: string, params: unknown[] = []): T[] {
  return db.prepare(sql).all(params) as T[];
}

function run(sql: string, params: unknown[] = []): { lastInsertRowid: number | bigint } {
  const info = db.prepare(sql).run(params);
  return { lastInsertRowid: info.lastInsertRowid };
}

function get<T = unknown>(sql: string, params: unknown[] = []): T | null {
  return (db.prepare(sql).get(params) as T) ?? null;
}

function close(): void {
  db.close();
}

export { initDb, query, run, get, close };
