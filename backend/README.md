# 💪 WorkoutTrack

A fullstack workout tracking application to log, search, and manage your training sessions.

---

## Features

- **Log Workouts** — Track title, category, date, duration, notes, and individual exercises
- **Exercise Tracking** — Sets, reps, weight (strength) or distance (cardio)
- **Dashboard** — Stats overview: total workouts, total time, and category breakdown
- **History** — Full list of all workouts
- **Search** *(Advanced Feature 1)* — Realtime search by workout title or notes
- **Filter** *(Advanced Feature 2)* — Filter by category (strength, cardio, flexibility, sports, other)
- **Sort** — Sort by date, title, or duration; ascending or descending
- **Edit & Delete** — Full CRUD support for all workouts
- **Error & Loading States** — Proper feedback throughout the UI

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router v6, Vite     |
| Backend   | Node.js, Express 4                  |
| Database  | SQLite via sql.js (file-persisted)  |

---

## Project Structure

```
workout-tracker/
├── backend/
│   ├── src/
│   │   ├── db/database.js          # SQLite setup & helpers
│   │   ├── services/workoutService.js  # DB logic
│   │   ├── controllers/workoutController.js  # Request/response
│   │   ├── routes/workouts.js      # Express routes
│   │   └── index.js                # App entry point
│   ├── data/                       # SQLite file (auto-created)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/workouts.js         # API client
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
└── README.md
```

---

## API Endpoints

| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| GET    | `/api/workouts`           | List all workouts (search, filter, sort supported) |
| GET    | `/api/workouts/stats`     | Dashboard stats                |
| GET    | `/api/workouts/:id`       | Get single workout             |
| POST   | `/api/workouts`           | Create workout                 |
| PUT    | `/api/workouts/:id`       | Update workout                 |
| DELETE | `/api/workouts/:id`       | Delete workout                 |
| GET    | `/health`                 | Health check                   |

### Query Parameters for GET `/api/workouts`

| Param      | Description                                      |
|------------|--------------------------------------------------|
| `search`   | Search title and notes (partial match)           |
| `category` | Filter by: strength, cardio, flexibility, sports, other |
| `sort`     | Sort field: `date`, `title`, `duration_minutes`  |
| `order`    | `asc` or `desc` (default: `desc`)                |

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
| Column             | Type    | Notes                                  |
|--------------------|---------|----------------------------------------|
| id                 | INTEGER | Primary key, autoincrement             |
| title              | TEXT    | Required                               |
| category           | TEXT    | strength/cardio/flexibility/sports/other |
| date               | TEXT    | YYYY-MM-DD format                      |
| duration_minutes   | INTEGER | Must be > 0                            |
| notes              | TEXT    | Optional                               |
| created_at         | TEXT    | Auto-set on insert                     |

### `exercises` table
| Column      | Type    | Notes                            |
|-------------|---------|----------------------------------|
| id          | INTEGER | Primary key                      |
| workout_id  | INTEGER | Foreign key → workouts.id        |
| name        | TEXT    | Required                         |
| sets        | INTEGER | Nullable                         |
| reps        | INTEGER | Nullable                         |
| weight_kg   | REAL    | Nullable (for strength)          |
| distance_km | REAL    | Nullable (for cardio)            |


## Advanced Features Implemented

1. **Search** — Full-text search across workout title and notes via query parameter
2. **Filtering** — Filter workouts by category with instant UI updates
3. **Sorting** — Sort by date, title, or duration in either direction

---

## Deployment

Can be deployed using:
- **Frontend**: Vercel or Netlify (`npm run build` → deploy `dist/`)
- **Backend**: Render, Railway, or EC2 (set `PORT` environment variable)
