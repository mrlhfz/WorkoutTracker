# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

WorkoutTracker is a small fullstack CRUD app (log/search/filter/sort workouts and their
exercises). It's a monorepo consolidating two previously separate repos
(`workout-tracker-frontend`, `workout-tracker-backend`) — `backend/` and `frontend/` are
independent Node projects with their own `package.json`, run and developed separately.

Both packages have ESLint + Prettier and a test suite (see Commands below), and GitHub Actions
runs lint + test (+ build for the frontend) on every push/PR to `main` (`.github/workflows/ci.yml`).

## Commands

Backend (`backend/`):
```bash
npm install
npm start       # node src/index.js
npm run dev     # nodemon src/index.js (auto-restart)
npm run lint    # eslint .
npm run format  # prettier --write .
npm test        # node --test (discovers *.test.js under src/)
```
Runs on `http://localhost:3001`. Health check: `GET /health`. Tests point `db/database.js` at
a temp file via the `DB_PATH` env var (set at the top of each `*.test.js` before requiring the
db module) rather than the real `data/workouts.db` — see `services/workoutService.test.js` for
the pattern. Run a single test file directly: `node --test src/services/workoutService.test.js`.

Frontend (`frontend/`):
```bash
npm install
npm run dev       # vite dev server on :5173, proxies /api -> localhost:3001
npm run build     # production build to frontend/dist/
npm run preview   # preview the production build locally
npm run deploy    # gh-pages -d dist (publishes dist/ to GitHub Pages)
npm run lint      # eslint .
npm run format    # prettier --write .
npm test          # vitest run
```
The backend must be running for the frontend to have data to display. Frontend tests use
Vitest + jsdom + React Testing Library (config lives in the `test` block of `vite.config.js`,
not a separate vitest config file). Run a single test file: `npx vitest run src/pages/Dashboard.test.jsx`.

## Architecture

### Backend request flow

Strict layering, one direction only — never skip a layer:
`routes/workouts.js` → `controllers/workoutController.js` → `services/workoutService.js` → `db/database.js`

`app.js` assembles the Express app (middleware, routes, error handlers) via `createApp()` and
is required by both `index.js` (which calls `initDb()` then `app.listen()`) and
`routes/workouts.test.js` (which calls `initDb()` then hits the app with `supertest`, no
`listen()` needed) — keep new middleware/routes in `app.js`, not `index.js`.

- **routes** only wires HTTP verbs/paths to controller methods.
- **controllers** parse `req`, hand-roll validation (see the `validate()`/`CATEGORIES` block
  in `workoutController.js` — there's no schema-validation library), and shape the
  `{ success, data/error }` JSON envelope. All error handling is a try/catch per method
  returning a 500 with `err.message` — there's no shared error-handling middleware.
- **services** (`workoutService.js`) hold all SQL and business logic, including the
  `ALLOWED_SORTS` allowlist that guards the dynamic `ORDER BY ${col}` clause in `getAll()`
  against injection via the `sort` query param — keep any new sortable column added there in
  sync with the DB schema.
- **db** (`db/database.js`) wraps `better-sqlite3`, a native synchronous SQLite driver — each
  `run()`/`query()`/`get()` call is a real incremental disk write via `.prepare().run()/.all()/.get()`,
  not a full-file rewrite. Still no transactions, though — a multi-step write (e.g.
  `workoutService.update()` deleting and re-inserting `exercises` rows) is still several separate
  statements, not one atomic operation. `db.close()` is exported and must be called before
  deleting a test's temp DB file on Windows, where an open native handle blocks `fs.rmSync` — see
  the `after()` hook in `services/workoutService.test.js`.

### Data model

Two tables with a one-to-many relationship, schema defined inline in `initDb()`
(`db/database.js`) via `CREATE TABLE IF NOT EXISTS` — there is no migration framework, so any
schema change is a direct edit to that inline SQL (safe for `ADD COLUMN`-style additive
changes since the app owns its own dev DB; be more careful once real data exists anywhere it's
deployed).

- `workouts` (title, category, date, duration_minutes, notes, created_at)
- `exercises` (workout_id FK → workouts.id, name, sets, reps, weight_kg, distance_km) —
  strength exercises use `weight_kg`, cardio exercises use `distance_km`; both are nullable and
  the choice of which to populate is left to the client, not enforced server-side.

`workoutService.getAll()`/`getById()` always fetch a workout's `exercises` with a separate
follow-up query (N+1 pattern) rather than a JOIN — fine at current scale, worth revisiting if
list sizes grow.

### Frontend

Plain React + Vite, no state-management library, no CSS framework, no data-fetching library
(raw `fetch`). `frontend/src/api/workouts.js` is a single object (`api`) wrapping every backend
endpoint — add new endpoints there rather than calling `fetch` directly from components/pages.

`App.jsx` owns the route table and sidebar nav in one place (`NAV` array + `<Routes>` block) —
adding a page means updating both.

`api/workouts.js`'s request base is `import.meta.env.VITE_API_URL`, falling back to the relative
`/api` path used by the local Vite proxy (`vite.config.js`) when unset — see `frontend/.env.example`.
This is what makes deploying frontend and backend to two different hosts (e.g. GitHub Pages +
Render) actually work; set `VITE_API_URL` to the deployed backend's full URL (including `/api`)
before running `npm run build` for that kind of deploy.

### CORS

`backend/src/app.js`'s `createApp()` reads the allowed origins from the comma-separated
`ALLOWED_ORIGINS` env var, falling back to `DEFAULT_ORIGINS` (`https://mrlhfz.github.io`,
`http://localhost:5173`) when unset — see `backend/.env.example`. `index.js` loads `.env` via
`dotenv` before anything else; `app.js` itself doesn't depend on dotenv (kept env-loading in the
entrypoint so `createApp()` behaves the same way under tests, which set `process.env` directly).

## Project docs

- `README.md` — features, API reference, DB schema tables, deployment notes.
- `Brainstorm.md` — open-ended scaling/feature ideas doc; check here for context before
  proposing new directions, and add ideas here rather than only in conversation.
