# SPEC: `backend/src/routes/workouts.ts`

## Purpose

Wires HTTP verbs and paths under `/api/workouts` to the corresponding `workoutController`
method. Contains no logic of its own — routing only.

## Exports / Props

- Default export: an Express `Router` mounted at `/api/workouts` by `app.ts`.

Routes:

- `GET /stats` → `workoutController.getStats`
- `GET /` → `workoutController.getAll`
- `GET /:id` → `workoutController.getById`
- `POST /` → `workoutController.create`
- `PUT /:id` → `workoutController.update`
- `DELETE /:id` → `workoutController.delete`

## Behavior

- `GET /stats` is registered before `GET /:id` deliberately — if `/:id` were matched first,
  a request to `/stats` would be handled as `getById` with `id = 'stats'`. Any new static-path
  route added under this router must be placed above `/:id` for the same reason.
- No validation, error handling, or response shaping happens here — that's entirely
  `workoutController`'s responsibility, per the strict `routes → controllers → services → db`
  layering.

## Dependencies

- Imports `workoutController` (default export) from `controllers/workoutController.ts`.
- Imported and mounted by `app.ts`.
