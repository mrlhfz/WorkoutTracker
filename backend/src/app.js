const express = require('express');
const cors = require('cors');
const workoutRoutes = require('./routes/workouts');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: ['https://mrlhfz.github.io', 'http://localhost:5173'],
    }),
  );
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.use('/api/workouts', workoutRoutes);

  app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  return app;
}

module.exports = createApp;
