import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/workouts';
import type { WorkoutWithExercises } from '../types';

const CATEGORIES = ['', 'strength', 'cardio', 'flexibility', 'sports', 'other'];

export default function History() {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('date');
  const [order, setOrder] = useState('desc');
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchWorkouts = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    params.sort = sort;
    params.order = order;

    api
      .getWorkouts(params)
      .then((res) => {
        setWorkouts(res.data);
        setError('');
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [search, category, sort, order]);

  useEffect(() => {
    const t = setTimeout(fetchWorkouts, 250);
    return () => clearTimeout(t);
  }, [fetchWorkouts]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this workout?')) return;
    setDeleting(id);
    try {
      await api.deleteWorkout(id);
      setWorkouts((ws) => ws.filter((w) => w.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <h1 className="page-title">HISTORY</h1>

      {/* Filter bar — advanced features: Search + Filter + Sort */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Search workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date">Sort: Date</option>
          <option value="title">Sort: Title</option>
          <option value="duration_minutes">Sort: Duration</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="desc">↓ Desc</option>
          <option value="asc">↑ Asc</option>
        </select>
        <Link to="/log" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
          + Log Workout
        </Link>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {loading ? (
        <div className="loading">Loading workouts...</div>
      ) : workouts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <div>
            {search || category ? 'No workouts match your filters.' : 'No workouts logged yet.'}
          </div>
        </div>
      ) : (
        <div className="workout-list">
          {workouts.map((w) => (
            <div className="workout-card" key={w.id}>
              <span className={`tag tag-${w.category}`}>{w.category}</span>
              <div className="workout-info">
                <div className="workout-title">{w.title}</div>
                <div className="workout-meta">
                  <span>📅 {w.date}</span>
                  <span>⏱ {w.duration_minutes} min</span>
                  {w.exercises?.length > 0 && (
                    <span>
                      🏋️ {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {w.notes && (
                    <span
                      style={{
                        color: 'var(--sub)',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      📝 {w.notes}
                    </span>
                  )}
                </div>
              </div>
              <div className="workout-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/edit/${w.id}`)}>
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(w.id)}
                  disabled={deleting === w.id}
                >
                  {deleting === w.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
