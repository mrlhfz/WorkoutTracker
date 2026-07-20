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
| Database | SQLite via sql.js (file-persisted)  |

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

> **Known limitation:** the frontend currently calls the API via a hardcoded relative path (`frontend/src/api/workouts.js`), which only works when both are served from the same origin (e.g. local dev via the Vite proxy). Deploying the frontend and backend to two different hosts will not work until the API base URL is made environment-configurable — this is a planned fix, not yet implemented.

## License

MIT — see [LICENSE](LICENSE).
