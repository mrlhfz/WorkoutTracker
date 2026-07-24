# SPEC: `frontend/src/pages/EditWorkout.tsx`

## Purpose

The `/edit/:id` page — fetches an existing workout by id, pre-fills `WorkoutForm`, and submits
updates via `api.updateWorkout`.

## Exports / Props

- `EditWorkout` (default export) — no props; reads `id` from the route via `useParams<'id'>()`.

## Behavior

- Fetches the workout on mount and whenever `id` changes (`useEffect` dependency `[id]`);
  distinguishes an initial-fetch `fetching` state from a separate `loading` state used only
  during the update submit, so the form doesn't flash a full-page loading state while saving.
- `id!` (non-null assertion) is used when calling `api.getWorkout(id!)` /
  `api.updateWorkout(id!, data)` — assumes React Router always supplies the `:id` param for
  this route (true given `App.tsx`'s route definition, but would throw at runtime if this
  component were ever rendered outside that route).
- On successful update, navigates to `/history`; on fetch failure, renders the error message in
  place of the form (no retry action).
- `handleSubmit`'s `try/finally` only resets `loading` — it does not catch the rejection itself;
  `WorkoutForm` is the one that catches `onSubmit`'s rejection and displays the error inline
  (see `docs/specs/frontend/components/WorkoutForm.md`).

## Dependencies

- Imports `api` from `api/workouts.ts`, `WorkoutForm` from `components/WorkoutForm.tsx`, and
  `WorkoutInput`/`WorkoutWithExercises` from `types.ts`.
- Imports `useNavigate`, `useParams`, `Link` from `react-router-dom`.
- Rendered by `App.tsx`'s route table at `/edit/:id`.
