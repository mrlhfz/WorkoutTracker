# SPEC: `frontend/src/api/workouts.ts`

## Purpose

The single wrapper around every backend endpoint the frontend calls. All pages/components go
through this module rather than calling `fetch` directly, so the request base URL, headers,
and error-unwrapping logic live in exactly one place.

## Exports / Props

- `api` — an object with `getWorkouts(params?)`, `getWorkout(id)`, `getStats()`,
  `createWorkout(body)`, `updateWorkout(id, body)`, `deleteWorkout(id)`. Each returns a
  `Promise<ApiSuccess<T>>` for the relevant `T` (`WorkoutWithExercises[]`,
  `WorkoutWithExercises`, `Stats`).

Module-private: `request<T>()`, `BASE`.

## Behavior

- `BASE` reads `import.meta.env.VITE_API_URL`, falling back to the relative `/api` path used by
  the local Vite dev-server proxy (`vite.config.ts`) when unset. This is what makes deploying
  frontend and backend to two different hosts work — set `VITE_API_URL` to the deployed
  backend's full URL (including `/api`) before `npm run build` for that kind of deploy. See
  `frontend/.env.example`.
- `request<T>()` always sets `Content-Type: application/json`, parses the response body as
  JSON, and if `res.ok` is false, throws an `Error` built from `data.errors?.join(', ')` (field
  validation errors) or `data.error` (single-message failures) or a generic `'Request failed'`
  fallback — callers only ever need to catch a plain `Error`, never inspect the raw response.
- `getWorkouts(params)` builds a query string via `URLSearchParams` from a flat
  `Record<string, string>` — callers (`History.tsx`) are responsible for only passing
  string-valued params.

## Dependencies

- Imports `ApiSuccess`, `Stats`, `WorkoutInput`, `WorkoutWithExercises` from `types.ts`.
- Depended on by `pages/Dashboard.tsx`, `pages/History.tsx`, `pages/LogWorkout.tsx`,
  `pages/EditWorkout.tsx` — no page or component calls `fetch` directly; new endpoints should be
  added here first.
