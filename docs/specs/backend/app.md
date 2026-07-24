# SPEC: `backend/src/app.ts`

## Purpose

Assembles the Express application — CORS, JSON body parsing, route mounting, 404 handling, and
the top-level error handler — behind a single `createApp()` factory, kept separate from
`index.ts` so tests can build and exercise the app without binding a port.

## Exports / Props

- `createApp(): Application` (default export) — builds and returns a configured Express
  `Application`. Takes no arguments; reads `process.env.ALLOWED_ORIGINS` internally.

## Behavior

- CORS origins come from the comma-separated `ALLOWED_ORIGINS` env var (split + trimmed) or
  fall back to `DEFAULT_ORIGINS` (`https://mrlhfz.github.io`, `http://localhost:5173`) when
  unset.
- Route order matters: `/health` → `/api/workouts` (delegates to `workoutRoutes`) → catch-all
  404 JSON handler → error-handling middleware. The 404 handler must stay after all real
  routes; the error handler must stay last (Express identifies error middleware by its
  4-argument signature).
- The error handler logs `err.stack` to the console and always responds `500` with a generic
  `{ success: false, error: 'Internal server error' }` — it does not leak `err.message` to the
  client (contrast with the per-controller-method try/catch in `workoutController.ts`, which
  does return `err.message`; this handler only catches errors that escape the controllers).
- Does not call `app.listen()` — that's `index.ts`'s job, so this module is reusable under
  `supertest` without opening a real port.

## Dependencies

- Imports `workoutRoutes` from `routes/workouts.ts`.
- Imported by `index.ts` (which calls `initDb()` then `createApp().listen()`) and by
  `routes/workouts.test.ts` / `app.test.ts` (which call `initDb()` then drive the app with
  `supertest`, no `listen()` needed).
