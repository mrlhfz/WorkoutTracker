# SPEC: `frontend/src/App.tsx`

## Purpose

Owns the app's route table and sidebar navigation in one place, so the two stay visually and
structurally in sync.

## Exports / Props

- `App` (default export) — no props; rendered once by `main.tsx` inside `BrowserRouter`.

## Behavior

- `NAV` is a small array of `{ to, label, icon }` — the sidebar renders one `NavLink` per entry.
  `end={n.to === '/'}` ensures the Dashboard link is only "active" on an exact `/` match, not on
  every sub-route (otherwise it would stay highlighted on `/log`, `/history`, etc., since those
  don't start with a different prefix under React Router's default matching).
- `<Routes>` maps `/` → `Dashboard`, `/log` → `LogWorkout`, `/history` → `History`,
  `/edit/:id` → `EditWorkout`. Adding a new page requires updating **both** `NAV` and
  `<Routes>` — there is no single source of truth generating one from the other.

## Dependencies

- Imports `Dashboard`, `History`, `LogWorkout`, `EditWorkout` from `pages/`.
- Imports `Routes`, `Route`, `NavLink` from `react-router-dom`.
- Rendered by `main.tsx`.
