const db = require('../db/database');

const ALLOWED_SORTS = ['date', 'title', 'duration_minutes', 'created_at'];

const workoutService = {
  getAll({ search = '', category = '', sort = 'date', order = 'desc' } = {}) {
    const col = ALLOWED_SORTS.includes(sort) ? sort : 'date';
    const dir = order === 'asc' ? 'ASC' : 'DESC';

    let sql = 'SELECT * FROM workouts WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (title LIKE ? OR notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ` ORDER BY ${col} ${dir}`;

    const workouts = db.query(sql, params);
    return workouts.map((w) => ({
      ...w,
      exercises: db.query('SELECT * FROM exercises WHERE workout_id = ?', [w.id]),
    }));
  },

  getById(id) {
    const workout = db.get('SELECT * FROM workouts WHERE id = ?', [id]);
    if (!workout) return null;
    workout.exercises = db.query('SELECT * FROM exercises WHERE workout_id = ?', [id]);
    return workout;
  },

  create({ title, category, date, duration_minutes, notes = '', exercises = [] }) {
    const info = db.run(
      'INSERT INTO workouts (title, category, date, duration_minutes, notes) VALUES (?, ?, ?, ?, ?)',
      [title, category, date, duration_minutes, notes],
    );
    const workoutId = info.lastInsertRowid;
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
    return this.getById(workoutId);
  },

  update(id, { title, category, date, duration_minutes, notes = '', exercises = [] }) {
    const existing = this.getById(id);
    if (!existing) return null;
    db.run(
      'UPDATE workouts SET title=?, category=?, date=?, duration_minutes=?, notes=? WHERE id=?',
      [title, category, date, duration_minutes, notes, id],
    );
    db.run('DELETE FROM exercises WHERE workout_id = ?', [id]);
    for (const ex of exercises) {
      db.run(
        'INSERT INTO exercises (workout_id, name, sets, reps, weight_kg, distance_km) VALUES (?, ?, ?, ?, ?, ?)',
        [
          id,
          ex.name,
          ex.sets ?? null,
          ex.reps ?? null,
          ex.weight_kg ?? null,
          ex.distance_km ?? null,
        ],
      );
    }
    return this.getById(id);
  },

  delete(id) {
    const existing = this.getById(id);
    if (!existing) return null;
    db.run('DELETE FROM exercises WHERE workout_id = ?', [id]);
    db.run('DELETE FROM workouts WHERE id = ?', [id]);
    return existing;
  },

  getStats() {
    const total = db.get('SELECT COUNT(*) as count FROM workouts');
    const byCategory = db.query(
      'SELECT category, COUNT(*) as count FROM workouts GROUP BY category',
    );
    const totalDuration = db.get('SELECT SUM(duration_minutes) as total FROM workouts');
    const recent = db.query('SELECT * FROM workouts ORDER BY date DESC LIMIT 5');
    return {
      totalWorkouts: total.count,
      byCategory,
      totalMinutes: totalDuration.total || 0,
      recentWorkouts: recent,
    };
  },
};

module.exports = workoutService;
