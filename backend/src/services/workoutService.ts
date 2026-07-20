import * as db from '../db/database';
import type {
  Exercise,
  ExerciseInput,
  Stats,
  Workout,
  WorkoutInput,
  WorkoutQuery,
  WorkoutWithExercises,
} from '../types';

const ALLOWED_SORTS = ['date', 'title', 'duration_minutes', 'created_at'];

function attachExercises(workout: Workout): WorkoutWithExercises {
  return {
    ...workout,
    exercises: db.query<Exercise>('SELECT * FROM exercises WHERE workout_id = ?', [workout.id]),
  };
}

function insertExercises(workoutId: number, exercises: ExerciseInput[]): void {
  for (const ex of exercises) {
    db.run(
      'INSERT INTO exercises (workout_id, name, sets, reps, weight_kg, distance_km) VALUES (?, ?, ?, ?, ?, ?)',
      [
        workoutId,
        ex.name,
        ex.sets ?? null,
        ex.reps ?? null,
        ex.weight_kg ?? null,
        ex.distance_km ?? null,
      ],
    );
  }
}

const workoutService = {
  getAll({
    search = '',
    category = '',
    sort = 'date',
    order = 'desc',
  }: WorkoutQuery = {}): WorkoutWithExercises[] {
    const col = ALLOWED_SORTS.includes(sort) ? sort : 'date';
    const dir = order === 'asc' ? 'ASC' : 'DESC';

    let sql = 'SELECT * FROM workouts WHERE 1=1';
    const params: unknown[] = [];

    if (search) {
      sql += ' AND (title LIKE ? OR notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ` ORDER BY ${col} ${dir}`;

    const workouts = db.query<Workout>(sql, params);
    return workouts.map(attachExercises);
  },

  getById(id: number): WorkoutWithExercises | null {
    const workout = db.get<Workout>('SELECT * FROM workouts WHERE id = ?', [id]);
    if (!workout) return null;
    return attachExercises(workout);
  },

  create({
    title,
    category,
    date,
    duration_minutes,
    notes = '',
    exercises = [],
  }: WorkoutInput): WorkoutWithExercises {
    const info = db.run(
      'INSERT INTO workouts (title, category, date, duration_minutes, notes) VALUES (?, ?, ?, ?, ?)',
      [title, category, date, duration_minutes, notes],
    );
    const workoutId = Number(info.lastInsertRowid);
    insertExercises(workoutId, exercises);
    return this.getById(workoutId)!;
  },

  update(
    id: number,
    { title, category, date, duration_minutes, notes = '', exercises = [] }: WorkoutInput,
  ): WorkoutWithExercises | null {
    const existing = this.getById(id);
    if (!existing) return null;
    db.run(
      'UPDATE workouts SET title=?, category=?, date=?, duration_minutes=?, notes=? WHERE id=?',
      [title, category, date, duration_minutes, notes, id],
    );
    db.run('DELETE FROM exercises WHERE workout_id = ?', [id]);
    insertExercises(id, exercises);
    return this.getById(id);
  },

  delete(id: number): WorkoutWithExercises | null {
    const existing = this.getById(id);
    if (!existing) return null;
    db.run('DELETE FROM exercises WHERE workout_id = ?', [id]);
    db.run('DELETE FROM workouts WHERE id = ?', [id]);
    return existing;
  },

  getStats(): Stats {
    const total = db.get<{ count: number }>('SELECT COUNT(*) as count FROM workouts')!;
    const byCategory = db.query<{ category: string; count: number }>(
      'SELECT category, COUNT(*) as count FROM workouts GROUP BY category',
    );
    const totalDuration = db.get<{ total: number | null }>(
      'SELECT SUM(duration_minutes) as total FROM workouts',
    )!;
    const recent = db.query<Workout>('SELECT * FROM workouts ORDER BY date DESC LIMIT 5');
    return {
      totalWorkouts: total.count,
      byCategory,
      totalMinutes: totalDuration.total || 0,
      recentWorkouts: recent,
    };
  },
};

export default workoutService;
