# SPEC: `backend/src/services/workoutService.ts`

## Purpose

Holds all SQL and business logic for workouts and their exercises — the only layer allowed to
call `db/database.ts`'s query primitives directly. Highest blast radius of any single backend
file: every controller method depends on it.

## Exports / Props

`workoutService` (default export), an object with:

- `getAll(query?: WorkoutQuery): WorkoutWithExercises[]` — search/filter/sort across workouts.
- `getById(id: number): WorkoutWithExercises | null`
- `create(input: WorkoutInput): WorkoutWithExercises`
- `update(id: number, input: WorkoutInput): WorkoutWithExercises | null`
- `delete(id: number): WorkoutWithExercises | null`
- `getStats(): Stats`

Not exported, module-private: `ALLOWED_SORTS`, `attachExercises()`, `insertExercises()`.

## Behavior

- **`ALLOWED_SORTS` injection guard**: `getAll()` builds a dynamic `ORDER BY ${col} ${dir}`
  clause. `col` is only ever set to `sort` if `sort` is a member of
  `ALLOWED_SORTS = ['date', 'title', 'duration_minutes', 'created_at']`; otherwise it silently
  falls back to `'date'`. `dir` is hardcoded to `'ASC'` only when `order === 'asc'`, `'DESC'`
  otherwise — never interpolated from a wider set of values. Any new sortable column added to
  the DB schema must be added to `ALLOWED_SORTS` here to become sortable, and the code-review
  skill treats any *other* dynamic-SQL-from-user-input pattern without an equivalent allowlist
  as a Blocker.
- **Search/filter**: `search` matches `title`/`notes` via `LIKE '%...%'` with bound params
  (safe); `category` is an exact-match bound param.
- **N+1 pattern**: `getAll()`/`getById()` fetch a workout's `exercises` via a separate
  follow-up query per workout (`attachExercises()`), not a JOIN — acceptable at current scale,
  worth revisiting if list sizes grow (already noted in root `CLAUDE.md`; don't re-flag as a
  new finding in code review).
- **No transactions**: `update()` deletes all of a workout's `exercises` rows and re-inserts the
  new set as two separate statements (`db.run('DELETE ...')` then `insertExercises()`) — not
  atomic. A crash between the two would leave a workout with no exercises. Same caveat applies
  to `create()`'s insert-workout-then-insert-exercises sequence.
- `create()`/`update()` both call `this.getById(...)` to return the full row with exercises
  attached, using non-null assertions (`this.getById(workoutId)!`) since the row was just
  written and is assumed to exist.

## Dependencies

- Imports `query`/`run`/`get` from `db/database.ts` (as `db.*`), and types from `types.ts`.
- Depended on by `controllers/workoutController.ts` exclusively — no route or other layer calls
  this directly.
