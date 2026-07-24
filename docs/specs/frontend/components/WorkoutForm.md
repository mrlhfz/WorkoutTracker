# SPEC: `frontend/src/components/WorkoutForm.tsx`

## Purpose

The single shared form used by both `LogWorkout` (create) and `EditWorkout` (update) — renders
workout + exercise fields, adapts its exercise-row layout to the selected category, and hands a
clean `WorkoutInput` up to the caller on submit.

## Exports / Props

- `WorkoutFormInitial` (exported interface) — the shape a caller passes as `initial` to
  pre-populate the form (all fields optional; numeric fields may be `number | string`).
- `WorkoutForm` (default export), props (`WorkoutFormProps`, not exported):
  - `initial?: WorkoutFormInitial` — pre-fill values (defaults to `{}` for create).
  - `onSubmit: (data: WorkoutInput) => Promise<unknown>` — called with the cleaned form data;
    the form awaits this and surfaces a thrown error's message inline.
  - `submitLabel?: string` — button text (defaults `'Save'`).
  - `loading?: boolean` — disables the submit button while `true` (defaults `false`).

## Behavior

- Keeps its own local form-state types (`ExerciseFormState`) distinct from `types.ts`'s API
  shapes — controlled `<input>` values are always strings in this component's state (so numeric
  inputs like `sets`/`weight_kg` can be temporarily empty while typing), converted to
  `number | null` only in `handleSubmit`'s `cleanExercises` mapping. The two shapes genuinely
  differ; this isn't accidental duplication.
- `isCardio = category === 'cardio' || category === 'sports'` toggles which exercise fields
  render: cardio/sports show a `distance_km` input, everything else shows `sets`/`reps`/
  `weight_kg`. `CATEGORIES` here (`strength`, `cardio`, `flexibility`, `sports`, `other`) is a
  separate module-level constant from `backend/src/controllers/workoutController.ts`'s
  `CATEGORIES` — must be kept in sync by hand if the category list ever changes.
- Exercises with a blank/whitespace-only `name` are silently dropped in
  `cleanExercises` before submit — an exercise row is only persisted if it has a name.
- On `onSubmit` rejection, the caught error's message (or `String(err)` if not an `Error`) is
  shown via a local `errors` state array; the form does not clear `errors` on its own next
  successful submit attempt path except at the top of `handleSubmit` (`setErrors([])`).

## Dependencies

- Imports `WorkoutInput` from `types.ts`. No other repo-internal imports.
- Depended on by `pages/LogWorkout.tsx` and `pages/EditWorkout.tsx`, which supply different
  `onSubmit`/`initial`/`submitLabel` values but share this same component.
