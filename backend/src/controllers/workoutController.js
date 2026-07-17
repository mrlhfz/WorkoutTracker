const workoutService = require('../services/workoutService');

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'sports', 'other'];

function validate(body) {
  const errors = [];
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0)
    errors.push('title is required');
  if (!CATEGORIES.includes(body.category))
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date))
    errors.push('date must be in YYYY-MM-DD format');
  if (!body.duration_minutes || isNaN(body.duration_minutes) || Number(body.duration_minutes) < 1)
    errors.push('duration_minutes must be a positive number');
  return errors;
}

const workoutController = {
  getAll(req, res) {
    try {
      const workouts = workoutService.getAll(req.query);
      res.json({ success: true, data: workouts, count: workouts.length });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getById(req, res) {
    try {
      const workout = workoutService.getById(Number(req.params.id));
      if (!workout) return res.status(404).json({ success: false, error: 'Workout not found' });
      res.json({ success: true, data: workout });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  create(req, res) {
    try {
      const errors = validate(req.body);
      if (errors.length) return res.status(400).json({ success: false, errors });
      const workout = workoutService.create({
        ...req.body,
        duration_minutes: Number(req.body.duration_minutes),
      });
      res.status(201).json({ success: true, data: workout });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  update(req, res) {
    try {
      const errors = validate(req.body);
      if (errors.length) return res.status(400).json({ success: false, errors });
      const workout = workoutService.update(Number(req.params.id), {
        ...req.body,
        duration_minutes: Number(req.body.duration_minutes),
      });
      if (!workout) return res.status(404).json({ success: false, error: 'Workout not found' });
      res.json({ success: true, data: workout });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  delete(req, res) {
    try {
      const workout = workoutService.delete(Number(req.params.id));
      if (!workout) return res.status(404).json({ success: false, error: 'Workout not found' });
      res.json({ success: true, message: 'Workout deleted', data: workout });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getStats(req, res) {
    try {
      const stats = workoutService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

module.exports = workoutController;
