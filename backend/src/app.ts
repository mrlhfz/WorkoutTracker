import express, { type Application, type ErrorRequestHandler } from 'express';
import cors from 'cors';
import workoutRoutes from './routes/workouts';

const DEFAULT_ORIGINS = ['https://mrlhfz.github.io', 'http://localhost:5173'];

function createApp(): Application {
  const app = express();

  const origins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : DEFAULT_ORIGINS;

  app.use(cors({ origin: origins }));
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.use('/api/workouts', workoutRoutes);

  app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

  const errorHandler: ErrorRequestHandler = (err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
  };
  app.use(errorHandler);

  return app;
}

export default createApp;
