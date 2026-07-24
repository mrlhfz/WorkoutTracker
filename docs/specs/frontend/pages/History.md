# SPEC: `frontend/src/pages/History.tsx`

## Purpose

The `/history` page — the main search/filter/sort/delete surface for existing workouts.

## Exports / Props

- `History` (default export) — no props; rendered at the `/history` route in `App.tsx`.

## Behavior

- Filter/sort state (`search`, `category`, `sort`, `order`) is local component state; every
  change re-triggers `fetchWorkouts()` (wrapped in `useCallback`, deps
  `[search, category, sort, order]`) via a `useEffect` that also runs on mount.
- `search` input changes are debounced 250ms via a `setTimeout`/`clearTimeout` pair inside the
  `useEffect` — `category`/`sort`/`order` changes go through the same effect and therefore share
  the same debounce delay (not just `search`), since the effect can't distinguish which
  dependency changed.
- `CATEGORIES` includes a leading `''` entry filtered out (`.filter(Boolean)`) when rendering
  the `<select>` options, so `''` can still be the "All categories" default `<option>` value
  without a separate empty-string check in the render.
- Delete flow: `handleDelete` uses the browser's native `confirm()` dialog, then calls
  `api.deleteWorkout(id)`; on success it optimistically filters the deleted workout out of local
  `workouts` state (does not refetch); on failure it uses native `alert()` to show the error.
  `deleting` tracks which single workout id is mid-delete, to disable just that row's delete
  button.
- Server-side sort/filter params (`sort`, `order`, `category`, `search`) map directly to
  `backend/src/services/workoutService.ts`'s `getAll()` query params and its `ALLOWED_SORTS`
  allowlist — the `sort` `<select>` here only ever offers `date`/`title`/`duration_minutes` as
  options, staying inside that allowlist by construction (not enforced by any shared constant).

## Dependencies

- Imports `api` from `api/workouts.ts` and `WorkoutWithExercises` from `types.ts`.
- Imports `Link`, `useNavigate` from `react-router-dom`.
- Rendered by `App.tsx`'s route table at `/history`; links to `/log` and `/edit/:id`.
