# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

WorkoutTracker is a small fullstack CRUD app (log/search/filter/sort workouts and their
exercises). It's a monorepo consolidating two previously separate repos
(`workout-tracker-frontend`, `workout-tracker-backend`) — `backend/` and `frontend/` are
independent Node projects with their own `package.json`, run and developed separately. Both are
100% TypeScript.

Both packages have ESLint + Prettier, a `tsc --noEmit` typecheck script, and a test suite (see
Commands below), and GitHub Actions runs typecheck + lint + test (+ build for the frontend) on
every push/PR to `main` (`.github/workflows/ci.yml`).

## Commands

Backend (`backend/`):
```bash
npm install
npm start          # tsx src/index.ts
npm run dev        # tsx watch src/index.ts (auto-restart; no nodemon)
npm run lint       # eslint .
npm run format     # prettier --write .
npm run typecheck  # tsc --noEmit
npm test           # tsx --test (discovers *.test.ts under src/)
```
Runs on `http://localhost:3001`. Health check: `GET /health`. Tests point `db/database.ts` at
a temp file via the `DB_PATH` env var (set at the top of each `*.test.ts` before requiring the
db module) rather than the real `data/workouts.db` — see `services/workoutService.test.ts` for
the pattern. Run a single test file directly: `tsx --test src/services/workoutService.test.ts`.
**Do not pass an explicit directory to `--test`** (e.g. `tsx --test src`) — Node's test runner
then treats every `.ts` file in that directory as a test, including `index.ts`, whose
`app.listen()` hangs the process. No path (or a specific file) is what makes it only match
`*.test.ts`.

Frontend (`frontend/`):
```bash
npm install
npm run dev        # vite dev server on :5173, proxies /api -> localhost:3001
npm run build      # production build to frontend/dist/
npm run preview    # preview the production build locally
npm run deploy     # gh-pages -d dist (publishes dist/ to GitHub Pages)
npm run lint       # eslint .
npm run format     # prettier --write .
npm run typecheck  # tsc --noEmit
npm test           # vitest run
```
The backend must be running for the frontend to have data to display. Frontend tests use
Vitest + jsdom + React Testing Library (config lives in the `test` block of `vite.config.ts`,
not a separate vitest config file). Run a single test file: `npx vitest run src/pages/Dashboard.test.tsx`.
Modules mocked with `vi.mock()` need `vi.mocked(fn).mockResolvedValue(...)` rather than
`fn.mockResolvedValue(...)` directly — the import is typed against the real module's signature,
which has no `.mockResolvedValue`.

Both packages' `typescript` is pinned to `6.0.3` rather than latest, and `typescript-eslint`'s
recommended rules are scoped to `**/*.{ts,tsx}` via `files` + `extends` in each `eslint.config.js`
(applying them repo-wide flags `eslint.config.js`'s own imports). See "TypeScript setup" below.

## Commit conventions

Commit messages follow `{type}[scope]: {description}`, e.g. `feat[backend]: add stats endpoint`
or `fix[frontend]: correct sort dropdown default`. This replaces the ad-hoc "Phase N: ..."
style used through the TypeScript migration — no need to renumber or rewrite past commits.

**Types:** `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`.

**Scopes** (pick the one most specific to what changed; omit only for a change that's
genuinely repo-wide, e.g. a root README rewrite):

- `backend` — anything under `backend/` not narrow enough for `db`/`api`
- `frontend` — anything under `frontend/` not narrow enough for `api`
- `db` — schema (`db/database.ts`'s `initDb()`), query/SQL changes in `services/`
- `api` — request/response shape changes to backend routes or `frontend/src/api/workouts.ts`
- `ci` — `.github/workflows/`, `.github/dependabot.yml`
- `docs` — `CLAUDE.md`, `README.md`, `Brainstorm.md`, `docs/`
- `repo` — cross-cutting changes that touch both packages or neither (`.gitignore`,
  root config, monorepo restructuring)

Description: imperative mood, lowercase, no trailing period. Dependabot's own auto-generated
commits (`Bump X from Y to Z in /backend`) are left as-is — this convention applies to
manually-authored commits going forward, not retroactively.

No commit-msg hook or CI check enforces this — it's a documented convention, not a gate.

## AI-drafted messages (`temp/`)

Claude drafts commit messages, code-review output, and PR-adjacent notes into a gitignored
`temp/` folder at the repo root (e.g. `temp/commit-message.md`, `temp/code-review.md`), or
alternatively writes an unsaved draft directly into `.git/COMMIT_EDITMSG` so `git commit` opens
pre-filled. Use `temp/` for anything that should persist or isn't tied to an imminent commit
(code-review output, PR-style notes); use `.git/COMMIT_EDITMSG` when you want to run
`git commit` immediately after and have the message ready to go. Either way, Claude never runs
`git commit` or `git push` on its own.

## SPEC docs (`docs/specs/`)

New or behaviorally-changed source files should get a short SPEC doc under `docs/specs/`,
mirroring the file's path under `backend/src/` or `frontend/src/` (e.g.
`backend/src/services/workoutService.ts` → `docs/specs/backend/services/workoutService.md`).
Use `docs/specs/_template.md` — four sections: Purpose, Exports/Props, Behavior, Dependencies.
Keep it short; this is a lighter-weight convention than a full design-doc process. All
implementation source files (excluding tests, `index.css`, and `test/setup.ts`) got a first-pass
SPEC as of this convention's introduction — write or update one whenever you touch a file
substantially going forward.

## Architecture

### Backend request flow

Strict layering, one direction only — never skip a layer:
`routes/workouts.ts` → `controllers/workoutController.ts` → `services/workoutService.ts` → `db/database.ts`

`app.ts` assembles the Express app (middleware, routes, error handlers) via `createApp()` and
is required by both `index.ts` (which calls `initDb()` then `app.listen()`) and
`routes/workouts.test.ts` (which calls `initDb()` then hits the app with `supertest`, no
`listen()` needed) — keep new middleware/routes in `app.ts`, not `index.ts`.

- **routes** only wires HTTP verbs/paths to controller methods.
- **controllers** parse `req`, hand-roll validation (see the `validate()`/`CATEGORIES` block
  in `workoutController.ts` — there's no schema-validation library), and shape the
  `{ success, data/error }` JSON envelope. All error handling is a try/catch per method
  returning a 500 with `err.message` — there's no shared error-handling middleware.
- **services** (`workoutService.ts`) hold all SQL and business logic, including the
  `ALLOWED_SORTS` allowlist that guards the dynamic `ORDER BY ${col}` clause in `getAll()`
  against injection via the `sort` query param — keep any new sortable column added there in
  sync with the DB schema.
- **db** (`db/database.ts`) wraps `better-sqlite3`, a native synchronous SQLite driver — each
  `run()`/`query()`/`get()` call is a real incremental disk write via `.prepare().run()/.all()/.get()`,
  not a full-file rewrite. Still no transactions, though — a multi-step write (e.g.
  `workoutService.update()` deleting and re-inserting `exercises` rows) is still several separate
  statements, not one atomic operation. `db.close()` is exported and must be called before
  deleting a test's temp DB file on Windows, where an open native handle blocks `fs.rmSync` — see
  the `after()` hook in `services/workoutService.test.ts`.
- **types** (`types.ts`) defines `Workout`/`Exercise`/`WorkoutInput`/`Stats` etc., imported
  throughout the layers above. `query<T>()`/`get<T>()` in `db/database.ts` are generic — callers
  supply the row shape (e.g. `db.query<Workout>(sql, params)`).

### Data model

Two tables with a one-to-many relationship, schema defined inline in `initDb()`
(`db/database.ts`) via `CREATE TABLE IF NOT EXISTS` — there is no migration framework, so any
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
(raw `fetch`). `frontend/src/api/workouts.ts` is a single object (`api`) wrapping every backend
endpoint — add new endpoints there rather than calling `fetch` directly from components/pages.
`frontend/src/types.ts` mirrors `backend/src/types.ts` by hand (frontend and backend are
independent npm projects, not a workspace, so these aren't literally shared — keep both in sync
when the API shape changes).

`App.tsx` owns the route table and sidebar nav in one place (`NAV` array + `<Routes>` block) —
adding a page means updating both.

`api/workouts.ts`'s request base is `import.meta.env.VITE_API_URL`, falling back to the relative
`/api` path used by the local Vite proxy (`vite.config.ts`) when unset — see `frontend/.env.example`.
This is what makes deploying frontend and backend to two different hosts (e.g. GitHub Pages +
Render) actually work; set `VITE_API_URL` to the deployed backend's full URL (including `/api`)
before running `npm run build` for that kind of deploy.

`WorkoutForm.tsx` keeps its own local form-state types (`ExerciseFormState`, etc.) distinct from
`types.ts`'s API shapes — controlled `<input>` values are always strings in this component's
state, converted to `number | null` only in `handleSubmit`, so the two shapes genuinely differ.

### CORS

`backend/src/app.ts`'s `createApp()` reads the allowed origins from the comma-separated
`ALLOWED_ORIGINS` env var, falling back to `DEFAULT_ORIGINS` (`https://mrlhfz.github.io`,
`http://localhost:5173`) when unset — see `backend/.env.example`. `index.ts` loads `.env` via
`dotenv` before anything else; `app.ts` itself doesn't depend on dotenv (kept env-loading in the
entrypoint so `createApp()` behaves the same way under tests, which set `process.env` directly).

### TypeScript setup

Both packages run source directly via `tsx` (esbuild-based) rather than a `tsc` build step —
`tsc --noEmit` is used only for typechecking (locally via `npm run typecheck` and in CI), never
to emit output. `typescript` is pinned to `6.0.3` in both packages because `typescript-eslint`'s
peer range caps below whatever newer `typescript` version npm resolves by default — check that
range before bumping either package. `@types/react`/`@types/react-dom` must stay on the `18.x`
line to match the installed `react`/`react-dom` majors (they resolve to `19.x` by default
otherwise, which type-mismatches against React 18's actual API).

## Project docs

- `README.md` — features, API reference, DB schema tables, deployment notes.
- `Brainstorm.md` — open-ended scaling/feature ideas doc; check here for context before
  proposing new directions, and add ideas here rather than only in conversation.
