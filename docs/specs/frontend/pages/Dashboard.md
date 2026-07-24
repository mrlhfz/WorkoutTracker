# SPEC: `frontend/src/pages/Dashboard.tsx`

## Purpose

The `/` landing page — shows aggregate stats (total workouts, total time, category breakdown)
and a short list of recent workouts, or an empty-state prompt to log the first one.

## Exports / Props

- `Dashboard` (default export) — no props; rendered at the `/` route in `App.tsx`.

## Behavior

- Fetches `api.getStats()` once on mount (`useEffect` with an empty dependency array); renders a
  loading state, then either an error message or the stats.
- `hours`/`mins` are derived from `stats.totalMinutes` via `Math.floor(.../60)` and `% 60` —
  purely presentational, not stored in state.
- The category breakdown row and recent-workouts list only render if
  `stats.byCategory?.length > 0` / non-empty respectively; an empty `recentWorkouts` renders a
  dedicated empty-state block with a link to `/log`.
- `CATEGORY_EMOJI` is a local presentational lookup (falls back to `'💪'` for an unrecognized
  category) — not shared with any other file; if a new category is added elsewhere
  (`workoutController.ts`'s `CATEGORIES`, `WorkoutForm.tsx`'s `CATEGORIES`), this map won't
  automatically pick up an icon for it.

## Dependencies

- Imports `api` from `api/workouts.ts` and `Stats` from `types.ts`.
- Imports `Link` from `react-router-dom` (to `/history` and `/log`).
- Rendered by `App.tsx`'s route table; not imported by any other page.
