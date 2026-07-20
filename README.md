# WorkoutTracker

[![CI](https://github.com/mrlhfz/WorkoutTracker/actions/workflows/ci.yml/badge.svg)](https://github.com/mrlhfz/WorkoutTracker/actions/workflows/ci.yml)

A fullstack workout tracking application to log, search, and manage your training sessions.

This repository contains both the frontend and backend for WorkoutTracker, previously maintained as two separate repositories ([workout-tracker-frontend](https://github.com/mrlhfz/workout-tracker-frontend) and [workout-tracker-backend](https://github.com/mrlhfz/workout-tracker-backend)) and consolidated here into a single monorepo.

---

## Features

- **Log Workouts** — Track title, category, date, duration, notes, and individual exercises
- **Exercise Tracking** — Sets, reps, weight (strength) or distance (cardio)
- **Dashboard** — Stats overview: total workouts, total time, and category breakdown
- **History** — Full list of all workouts
- **Search** — Real-time search by workout title or notes
- **Filter** — Filter by category (strength, cardio, flexibility, sports, other)
- **Sort** — Sort by date, title, or duration; ascending or descending
- **Edit & Delete** — Full CRUD support for all workouts
- **Error & Loading States** — Proper feedback throughout the UI

---

## Tech Stack

| Layer    | Technology                         |
| -------- | ----------------------------------- |
| Frontend | React 18, React Router v6, Vite     |
| Backend  | Node.js, Express 4                  |
| Database | SQLite via better-sqlite3           |

---

## Project Structure

```
WorkoutTracker/
├── backend/
│   ├── src/
│   │   ├── db/database.js              # SQLite setup & helpers
│   │   ├── services/workoutService.js  # DB logic
│   │   ├── controllers/workoutController.js  # Request/response
│   │   ├── routes/workouts.js          # Express routes
│   │   └── index.js                    # App entry point
│   ├── data/                           # SQLite file (auto-created)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/workouts.js             # API client
│   │   ├── components/WorkoutForm.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── LogWorkout.jsx
│   │   │   └── EditWorkout.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── README.md
└── LICENSE
```

---

## Getting Started

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend API to be running (see `frontend/src/api/workouts.js` for the configured base URL).

---

## API Endpoints

| Method | Endpoint              | Description                                        |
| ------ | ---------------------- | --------------------------------------------------- |
| GET    | `/api/workouts`        | List all workouts (search, filter, sort supported)  |
| GET    | `/api/workouts/stats`  | Dashboard stats                                      |
| GET    | `/api/workouts/:id`    | Get single workout                                   |
| POST   | `/api/workouts`        | Create workout                                       |
| PUT    | `/api/workouts/:id`    | Update workout                                       |
| DELETE | `/api/workouts/:id`    | Delete workout                                       |
| GET    | `/health`               | Health check                                         |

### Query Parameters for `GET /api/workouts`

| Param      | Description                                              |
| ---------- | ---------------------------------------------------------- |
| `search`   | Search title and notes (partial match)                    |
| `category` | Filter by: strength, cardio, flexibility, sports, other    |
| `sort`     | Sort field: `date`, `title`, `duration_minutes`            |
| `order`    | `asc` or `desc` (default: `desc`)                          |

### Request Body (POST/PUT)

```json
{
  "title": "Morning Run",
  "category": "cardio",
  "date": "2026-05-08",
  "duration_minutes": 45,
  "notes": "Felt great today",
  "exercises": [
    { "name": "Running", "distance_km": 5 }
  ]
}
```

---

## Database Schema

### `workouts` table

| Column            | Type    | Notes                                     |
| ------------------ | ------- | ------------------------------------------ |
| id                 | INTEGER | Primary key, autoincrement                  |
| title              | TEXT    | Required                                    |
| category           | TEXT    | strength/cardio/flexibility/sports/other    |
| date               | TEXT    | YYYY-MM-DD format                           |
| duration_minutes   | INTEGER | Must be > 0                                 |
| notes              | TEXT    | Optional                                    |
| created_at         | TEXT    | Auto-set on insert                          |

### `exercises` table

| Column       | Type    | Notes                       |
| ------------- | ------- | ----------------------------- |
| id            | INTEGER | Primary key                   |
| workout_id    | INTEGER | Foreign key → workouts.id     |
| name          | TEXT    | Required                      |
| sets          | INTEGER | Nullable                      |
| reps          | INTEGER | Nullable                      |
| weight_kg     | REAL    | Nullable (for strength)       |
| distance_km   | REAL    | Nullable (for cardio)         |

---

## Deployment

Can be deployed using:

- **Frontend**: Vercel, Netlify, or GitHub Pages (`npm run build` → deploy `frontend/dist/`)
- **Backend**: Render, Railway, or EC2 (set `PORT` environment variable)

Both platforms support monorepos — set the project root/subdirectory to `frontend/` or `backend/` respectively in your deployment settings.

Frontend and backend can be deployed to two different hosts (e.g. frontend on GitHub Pages,
backend on Render) — each side reads its cross-origin config from environment variables rather
than a hardcoded value:

- **Frontend**: set `VITE_API_URL` to the deployed backend's full URL including the `/api`
  suffix (e.g. `https://your-backend-host.example.com/api`) before running `npm run build`. Left
  unset, it falls back to the relative `/api` path used by the local Vite dev proxy. See
  `frontend/.env.example`.
- **Backend**: set `ALLOWED_ORIGINS` to a comma-separated list of allowed frontend origins (e.g.
  `https://mrlhfz.github.io,https://your-new-frontend.example.com`). Left unset, it falls back to
  the built-in defaults. See `backend/.env.example`.

## License

MIT — see [LICENSE](LICENSE).
