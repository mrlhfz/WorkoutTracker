# SPEC: `backend/src/controllers/workoutController.ts`

## Purpose

Parses and validates incoming HTTP requests for the `/api/workouts` routes, calls into
`workoutService` for the actual data operations, and shapes every response into the
`{ success, data/error/errors }` JSON envelope. This is the only layer that touches `req`/`res`
directly (besides `routes/workouts.ts`'s plain wiring).

## Exports / Props

`workoutController` (default export), an object with methods matching the route handlers:

- `getAll(req, res)` — lists workouts, applying `req.query` as a `WorkoutQuery`.
- `getById(req, res)` — fetches one workout by `req.params.id`; 404s if not found.
- `create(req, res)` — validates `req.body`, then creates a workout; 400s with `errors[]` on
  validation failure.
- `update(req, res)` — validates `req.body`, then updates the workout at `req.params.id`; 400s
  on validation failure, 404s if the workout doesn't exist.
- `delete(req, res)` — deletes the workout at `req.params.id`; 404s if not found.
- `getStats(req, res)` — returns aggregate stats.

Not exported, module-private: `CATEGORIES` (the validation allowlist), `errorMessage()`,
`validate()`.

## Behavior

- **Validation** (`validate()`) is hand-rolled, not schema-library-based: `title` must be a
  non-empty string; `category` must be one of `CATEGORIES` (`strength`, `cardio`,
  `flexibility`, `sports`, `other` — kept in sync with `frontend/src/components/WorkoutForm.tsx`'s
  own `CATEGORIES` constant by hand, not shared); `date` must match `YYYY-MM-DD`;
  `duration_minutes` must be a positive number. Returns an array of error strings (empty if
  valid).
- **Error handling**: every method wraps its body in try/catch and responds `500` with
  `err.message` via `errorMessage()` on any thrown error — there is no shared error-handling
  middleware for these expected-path errors (contrast with `app.ts`'s catch-all handler, which
  only catches errors that escape here).
- `create`/`update` both coerce `req.body.duration_minutes` to `Number(...)` before passing it
  to `workoutService` — the validated value from `validate()` isn't reused directly, so a
  change to the coercion logic must be kept consistent between `validate()` and the
  service-call sites.

## Dependencies

- Imports `workoutService` (default export) from `services/workoutService.ts`.
- Imports the `WorkoutQuery` type from `types.ts`.
- Depended on by `routes/workouts.ts`, which wires each HTTP verb/path directly to one of these
  methods with no additional logic.
