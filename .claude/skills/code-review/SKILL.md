---
name: code-review
description: Reviews uncommitted or branch changes against this repo's layering, security, and testing conventions and writes findings to temp/code-review.md. Use when the user asks for a code review, wants changes checked before committing, or says "/code-review".
---

# Code review

## Invocation

Determine the diff scope:

- If there are uncommitted changes (`git status --porcelain` is non-empty), review
  `git diff HEAD` (staged + unstaged) plus the contents of any untracked new files.
- Otherwise, review `git diff main...HEAD` — only relevant if currently on a side branch, since
  this repo has no mandatory topic-branch workflow and commits normally go straight to `main`.
- If neither shows any diff, say so and stop. Do not review the whole repo cold.

## Checklist

Work through each item only for files actually touched by the diff; skip sections that don't
apply to the change.

### 1. Layering violations (backend)

Strict one-direction flow: `routes/ → controllers/ → services/ → db/`.

- Flag any route file importing from `services/` or `db/` directly (skipping controllers).
- Flag any controller importing from `db/database.ts` directly (skipping services).
- Flag any SQL string (`SELECT`/`INSERT`/`UPDATE`/`DELETE`) appearing outside `services/` or
  `db/database.ts`.

### 2. Dynamic SQL / injection risk

- Any new `ORDER BY`, table/column name, or other identifier built from user input (query
  params, body fields) must be checked against an explicit allowlist before interpolation —
  model: `ALLOWED_SORTS` in `services/workoutService.ts`. Flag any string-interpolated SQL
  fragment sourced from `req.query`/`req.body`/`req.params` that isn't passed as a bound `?`
  parameter and isn't allowlist-checked.
- Bound parameters (`db.query(sql, [params])`) are fine and expected — don't flag ordinary
  parameterized queries.

### 3. CORS / env var handling

- New env vars should have a fallback default and be documented in the relevant
  `.env.example` (`backend/.env.example`, `frontend/.env.example`).
- `ALLOWED_ORIGINS`/`VITE_API_URL`-style config should stay read in `app.ts`/`api/workouts.ts`
  respectively, not scattered into other modules.
- Flag hardcoded URLs/origins that should instead come from env config.

### 4. Test coverage co-location

- Every new/changed `.ts`/`.tsx` file under `backend/src/` or `frontend/src/` that contains
  logic (not pure types/config) should have a co-located `*.test.ts`/`*.test.tsx` sibling.
- Flag new source files with no corresponding test file, and changed source files whose
  existing test file wasn't touched (behavior likely changed without test updates).

### 5. `db.close()` / test cleanup gotcha

- Any new backend test that creates its own temp SQLite file via `DB_PATH` must call
  `db.close()` (from `db/database.ts`) in an `after()`/`afterEach()` hook before deleting that
  file — an open better-sqlite3 handle blocks `fs.rmSync` on Windows. Flag any test that
  deletes a `DB_PATH` temp file without a preceding `close()`.

### 6. TypeScript strictness

- Flag new `any` (explicit or implicit) that isn't already suppressed with a targeted
  `eslint-disable-next-line` comment explaining why (existing precedent: `workoutController.ts`'s
  `validate(body: any)`).
- Flag `!` non-null assertions introduced without a preceding guard that makes them safe.
- Confirm `backend/src/types.ts` and `frontend/src/types.ts` were both updated together if the
  API request/response shape changed — they're hand-mirrored, not a shared package.

## Severity tiers

- **Blocker** — layering violation, unparameterized SQL from user input, missing `db.close()`
  before test cleanup (will hang/fail on Windows).
- **Should-fix** — missing test coverage for new logic, new `any` without justification, env
  var without fallback/doc.
- **Note** — style/consistency observations, N+1 query patterns, anything matching an
  already-documented known tradeoff in CLAUDE.md (e.g. no-transaction multi-step writes — don't
  re-flag existing documented tradeoffs as new findings).

## Output

Write findings to `temp/code-review.md` (create `temp/` if it doesn't exist — it's gitignored,
see CLAUDE.md's "AI-drafted messages" section). Structure:

```markdown
# Code review — <date>

Scope: <uncommitted changes | branch diff against main>

## Blocker
- `path/to/file.ts:line` — description

## Should-fix
- ...

## Note
- ...
```

If a section has no findings, write "None." under its heading.

Do not run `git commit`, `git push`, or modify any source files — this skill only reviews and
reports.
