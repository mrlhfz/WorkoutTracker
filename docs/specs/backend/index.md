# SPEC: `backend/src/index.ts`

## Purpose

The backend's real entrypoint: loads environment variables, initializes the database, then
starts the HTTP server. Kept minimal and separate from `app.ts` so `app.ts` can be required by
tests without this module's side effects (`dotenv` loading, `app.listen()`).

## Exports / Props

None — this module has no exports; it's a script, run via `npm start` / `npm run dev` (`tsx`).

## Behavior

- Loads `.env` via `import 'dotenv/config'` before anything else, so `process.env` is populated
  before `initDb()` or `createApp()` read it.
- Calls `initDb()` (async) first; only on success does it call `createApp()` and
  `app.listen(PORT, ...)`. `PORT` defaults to `3001` if `process.env.PORT` is unset.
- If `initDb()` rejects, logs the error and calls `process.exit(1)` — the server never starts
  without a working database connection.

## Dependencies

- Imports `initDb` from `db/database.ts` and `createApp` from `app.ts`.
- Not imported by anything else in the repo (it's the process entrypoint, not a reusable
  module) — deliberately excluded from Node's test runner glob (see backend `npm test` notes in
  the root `CLAUDE.md`) because `app.listen()` would hang the test process.
