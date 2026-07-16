import { useState } from 'react'

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'sports', 'other']

function emptyExercise() {
  return { name: '', sets: '', reps: '', weight_kg: '', distance_km: '' }
}

export default function WorkoutForm({ initial = {}, onSubmit, submitLabel = 'Save', loading = false }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    category: initial.category || 'strength',
    date: initial.date || new Date().toISOString().slice(0, 10),
    duration_minutes: initial.duration_minutes || '',
    notes: initial.notes || '',
  })
  const [exercises, setExercises] = useState(
    initial.exercises?.length ? initial.exercises.map(e => ({ ...e, sets: e.sets ?? '', reps: e.reps ?? '', weight_kg: e.weight_kg ?? '', distance_km: e.distance_km ?? '' })) : [emptyExercise()]
  )
  const [errors, setErrors] = useState([])

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function setExField(i, key, value) {
    setExercises(exs => exs.map((e, idx) => idx === i ? { ...e, [key]: value } : e))
  }

  function addExercise() {
    setExercises(exs => [...exs, emptyExercise()])
  }

  function removeExercise(i) {
    setExercises(exs => exs.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setErrors([])

    const cleanExercises = exercises
      .filter(ex => ex.name.trim())
      .map(ex => ({
        name: ex.name.trim(),
        sets: ex.sets !== '' ? Number(ex.sets) : null,
        reps: ex.reps !== '' ? Number(ex.reps) : null,
        weight_kg: ex.weight_kg !== '' ? Number(ex.weight_kg) : null,
        distance_km: ex.distance_km !== '' ? Number(ex.distance_km) : null,
      }))

    onSubmit({ ...form, duration_minutes: Number(form.duration_minutes), exercises: cleanExercises })
      .catch(err => setErrors([err.message]))
  }

  const isCardio = form.category === 'cardio' || form.category === 'sports'

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group full">
          <label>Workout Title *</label>
          <input
            type="text"
            placeholder="e.g. Morning Run, Upper Body"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Category *</label>
          <select value={form.category} onChange={e => setField('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Duration (minutes) *</label>
          <input
            type="number"
            min="1"
            placeholder="45"
            value={form.duration_minutes}
            onChange={e => setField('duration_minutes', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <input type="text" placeholder="Optional notes..." value={form.notes} onChange={e => setField('notes', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title">EXERCISES</div>

      <div style={{ marginBottom: 8 }}>
        <div className="exercise-row" style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 4 }}>
          <span>Exercise Name</span>
          {isCardio ? <span>Distance (km)</span> : <span>Sets</span>}
          {isCardio ? <span></span> : <span>Reps</span>}
          {isCardio ? <span></span> : <span>Weight (kg)</span>}
          <span></span>
          <span></span>
        </div>
        {exercises.map((ex, i) => (
          <div className="exercise-row" key={i}>
            <input
              type="text"
              placeholder="Exercise name"
              value={ex.name}
              onChange={e => setExField(i, 'name', e.target.value)}
            />
            {isCardio ? (
              <input type="number" placeholder="km" min="0" step="0.1" value={ex.distance_km} onChange={e => setExField(i, 'distance_km', e.target.value)} />
            ) : (
              <input type="number" placeholder="Sets" min="1" value={ex.sets} onChange={e => setExField(i, 'sets', e.target.value)} />
            )}
            {isCardio ? (
              <span></span>
            ) : (
              <input type="number" placeholder="Reps" min="1" value={ex.reps} onChange={e => setExField(i, 'reps', e.target.value)} />
            )}
            {isCardio ? (
              <span></span>
            ) : (
              <input type="number" placeholder="kg" min="0" step="0.5" value={ex.weight_kg} onChange={e => setExField(i, 'weight_kg', e.target.value)} />
            )}
            <span></span>
            <button type="button" onClick={() => removeExercise(i)} style={{ background: 'none', color: 'var(--red)', fontSize: 18, padding: '4px 8px' }}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={addExercise} style={{ marginTop: 8 }}>
          + Add Exercise
        </button>
      </div>

      {errors.length > 0 && (
        <div className="error-msg" style={{ marginTop: 12 }}>
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
