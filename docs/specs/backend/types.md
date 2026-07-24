# SPEC: `backend/src/types.ts`

## Purpose

Defines the backend's shared data-model and API-shape types, used across `db/`, `services/`,
and `controllers/`.

## Exports / Props

- `Category` — string literal union: `'strength' | 'cardio' | 'flexibility' | 'sports' | 'other'`.
- `Exercise` — a stored exercise row (`id`, `workout_id`, `name`, and nullable `sets`, `reps`,
  `weight_kg`, `distance_km`).
- `ExerciseInput` — the input shape for creating/updating an exercise (no `id`/`workout_id`;
  numeric fields optional/nullable).
- `Workout` — a stored workout row (`id`, `title`, `category`, `date`, `duration_minutes`,
  `notes`, `created_at`). Note `category` is typed as plain `string` here, not `Category` —
  validation of allowed values happens in `controllers/workoutController.ts`'s `CATEGORIES`
  array, not at the type level.
- `WorkoutWithExercises` — `Workout` plus an `exercises: Exercise[]` array.
- `WorkoutInput` — the input shape for creating/updating a workout, with optional `notes` and
  optional `exercises: ExerciseInput[]`.
- `WorkoutQuery` — optional `search`, `category`, `sort`, `order` query-string fields.
- `Stats` — aggregate shape returned by `getStats()`: `totalWorkouts`, `byCategory` (array of
  `{ category, count }`), `totalMinutes`, `recentWorkouts: Workout[]`.

## Behavior

Pure type/interface definitions — no runtime logic. `query<T>()`/`get<T>()` in
`db/database.ts` are generic over these types; callers supply the row shape at the call site
(e.g. `db.query<Workout>(sql, params)`).

## Dependencies

- No imports.
- Depended on by `db/database.ts` (implicitly, via generic type params at call sites in
  `services/workoutService.ts`), `services/workoutService.ts`, and
  `controllers/workoutController.ts`.
- Hand-mirrored by `frontend/src/types.ts` — the two packages aren't a shared workspace, so
  keep both in sync manually whenever a shape here changes (see
  `docs/specs/frontend/types.md`).
