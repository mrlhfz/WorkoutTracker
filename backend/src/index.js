const { initDb } = require('./db/database');
const createApp = require('./app');

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    const app = createApp();
    app.listen(PORT, () => console.log(`Workout Tracker API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
