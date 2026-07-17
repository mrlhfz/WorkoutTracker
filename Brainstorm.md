# Brainstorm: Scaling WorkoutTracker

A working doc for thinking through where this project could go next — both product
features and technical scaling. Not a commitment to build any of this; just a place
to capture ideas as they come up and refine them with Claude's help over time.

For the already-agreed-on hygiene/tooling roadmap (lint, tests, CI, TypeScript, etc.),
see the plan Claude wrote — this file is for everything *beyond* that: new features,
bigger architectural questions, "what if" ideas.

---

## Current shape (for reference)

- Single user, no auth, one SQLite file, 2 tables (`workouts`, `exercises`)
- React + Vite frontend, Express backend, deployed (or deployable) as GitHub Pages + Render/Railway
- ~1,200 total lines of code

---

## Open questions to resolve before committing to any direction

- Who is this actually for — just you, or do you want other people to be able to use it?
- Is "scale" mostly about *code quality/architecture* (handling growth gracefully) or about
  *actual usage* (more users, more data, more traffic)? These pull in different directions.
- Is there a feature you're already itching to add, or is this purely exploratory?

---

## Feature ideas

<!-- Add ideas here as they come up. Loose/unfiltered is fine. -->

-

## Architecture / technical ideas

<!-- Bigger structural questions worth thinking through before acting on -->

-

## Ideas parked as "not yet" (and why)

<!-- Things considered and deliberately deferred, so we don't re-litigate them later -->

-

---

## Decisions made

<!-- Once an idea moves from "maybe" to "yes, doing this," log it here with the date and reasoning -->

-
