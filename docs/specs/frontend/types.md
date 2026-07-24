# SPEC: `frontend/src/types.ts`

## Purpose

Defines the frontend's data-model and API-envelope types. Hand-mirrors
`backend/src/types.ts`'s domain shapes (`Exercise`, `Workout`, `WorkoutWithExercises`,
`WorkoutInput`, `WorkoutQuery`, `Stats`) plus two frontend-only API-envelope types.

## Exports / Props

- `Exercise`, `Workout`, `WorkoutWithExercises`, `WorkoutInput`, `WorkoutQuery`, `Stats` — same
  shapes as their `backend/src/types.ts` counterparts (see
  `docs/specs/backend/types.md`), copied by hand rather than imported, since `frontend/` and
  `backend/` are independent npm projects, not a shared workspace.
- `ApiSuccess<T>` — `{ success: true, data: T, count?: number, message?: string }`, the shape
  every successful backend response takes.
- `ApiError` — `{ success: false, error?: string, errors?: string[] }` — `error` for
  single-message failures (e.g. 404/500), `errors` for validation failures (array of field
  errors from `workoutController.ts`'s `validate()`).

## Behavior

Pure type definitions — no runtime logic. A file-top comment explicitly documents the
hand-mirroring relationship with the backend so future edits don't assume a shared import.
`WorkoutInput.exercises` is typed as an inline anonymous array shape here rather than reusing a
named `ExerciseInput` type (unlike the backend, which has one) — if the exercise input shape
changes, both this inline type and the backend's `ExerciseInput` need updating together.

## Dependencies

- No imports.
- Consumed by nearly every frontend file: `api/workouts.ts`, `components/WorkoutForm.tsx`, and
  all of `pages/`.
- Must be kept in sync by hand with `backend/src/types.ts` whenever the API shape changes — see
  `docs/specs/backend/types.md`.
