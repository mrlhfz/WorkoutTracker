# SPEC: `backend/src/db/database.ts`

## Purpose

The sole point of contact with SQLite (`better-sqlite3`) for the whole backend. Owns schema
creation and exposes small generic query/run/get/close primitives that every service call sits
on top of.

## Exports / Props

- `initDb(): Promise<Database.Database>` — opens (or creates) the SQLite file at `DB_PATH` and
  runs `CREATE TABLE IF NOT EXISTS` for both tables. Must be called once before any other
  export is used (they all reference the module-level `db` variable it assigns).
- `query<T = unknown>(sql: string, params?: unknown[]): T[]` — runs a `SELECT`, returns all
  matching rows cast to `T[]`.
- `run(sql: string, params?: unknown[]): { lastInsertRowid: number | bigint }` — runs an
  `INSERT`/`UPDATE`/`DELETE`, returns the inserted row id (relevant for inserts).
- `get<T = unknown>(sql: string, params?: unknown[]): T | null` — runs a `SELECT` expected to
  return at most one row; returns `null` rather than `undefined` if there's no match.
- `close(): void` — closes the underlying `better-sqlite3` handle.

## Behavior

- `DB_PATH` defaults to `<repo>/backend/data/workouts.db` but is overridden via the `DB_PATH`
  env var in tests (set at the top of each `*.test.ts` file before requiring this module — see
  `services/workoutService.test.ts`) so tests never touch the real dev database.
- The parent directory of `DB_PATH` is created with `fs.mkdirSync(..., { recursive: true })`
  synchronously at module load time, before `initDb()` is even called.
- Schema (`workouts`, `exercises` with a `workout_id` FK) is defined inline via
  `CREATE TABLE IF NOT EXISTS` — there is no migration framework. Any schema change is a direct
  edit here; safe for additive (`ADD COLUMN`-style) changes against the app's own dev DB, but
  requires more care once real data exists anywhere deployed.
- Each `run()`/`query()`/`get()` call is a real incremental disk write via
  `.prepare().run()/.all()/.get()` — not a full-file rewrite. There are no transactions, though:
  a multi-step write (e.g. `workoutService.update()`'s delete-then-reinsert of `exercises` rows)
  is still several separate statements, not one atomic operation.
- `close()` **must** be called before a test deletes its `DB_PATH` temp file — on Windows, an
  open native `better-sqlite3` handle blocks `fs.rmSync`. See the `after()` hook in
  `services/workoutService.test.ts` for the pattern.

## Dependencies

- Imports `better-sqlite3`, Node's `path` and `fs`.
- Depended on directly by `services/workoutService.ts` (the only consumer of `query`/`run`/`get`)
  and by `index.ts` / test files (which call `initDb()`/`close()`). Controllers and routes never
  import this module directly — see the code-review skill's layering check.
