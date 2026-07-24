# SPEC: `frontend/src/pages/LogWorkout.tsx`

## Purpose

The `/log` page — a bare `WorkoutForm` in "create" mode, submitting via `api.createWorkout`.

## Exports / Props

- `LogWorkout` (default export) — no props; rendered at the `/log` route in `App.tsx`.

## Behavior

- No `initial` prop is passed to `WorkoutForm`, so it defaults to `{}` (a blank form).
- On successful submit, shows a brief inline success message (`success` state) for 800ms
  (`setTimeout`) before navigating to `/history` — this is a fixed delay, not tied to any
  animation or transition completing.
- `handleSubmit`'s `try/finally` resets `loading` unconditionally; a thrown error from
  `api.createWorkout` propagates up to `WorkoutForm`'s own catch (see
  `docs/specs/frontend/components/WorkoutForm.md`), which is what actually displays the error —
  this component itself has no error state.

## Dependencies

- Imports `api` from `api/workouts.ts`, `WorkoutForm` from `components/WorkoutForm.tsx`, and
  `WorkoutInput` from `types.ts`.
- Imports `useNavigate` from `react-router-dom`.
- Rendered by `App.tsx`'s route table at `/log`.
