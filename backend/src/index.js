const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ['https://mrlhfz.github.io', 'http://localhost:5173'],
  }),
);
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

initDb()
  .then(() => {
    const workoutRoutes = require('./routes/workouts');
    app.use('/api/workouts', workoutRoutes);

    app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ success: false, error: 'Internal server error' });
    });

    app.listen(PORT, () => console.log(`Workout Tracker API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
