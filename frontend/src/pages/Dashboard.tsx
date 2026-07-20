import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/workouts';
import type { Stats } from '../types';

const CATEGORY_EMOJI: Record<string, string> = {
  strength: '🏋️',
  cardio: '🏃',
  flexibility: '🧘',
  sports: '⚽',
  other: '💪',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getStats()
      .then((res) => setStats(res.data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading stats...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!stats) return null;

  const hours = Math.floor((stats.totalMinutes || 0) / 60);
  const mins = (stats.totalMinutes || 0) % 60;

  return (
    <div>
      <h1 className="page-title">DASHBOARD</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalWorkouts}</div>
          <div className="stat-label">Total Workouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {hours}h {mins}m
          </div>
          <div className="stat-label">Total Time Logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.byCategory?.length || 0}</div>
          <div className="stat-label">Exercise Types</div>
        </div>
      </div>

      {stats.byCategory?.length > 0 && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Breakdown by Category</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stats.byCategory.map((c) => (
              <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{CATEGORY_EMOJI[c.category] || '💪'}</span>
                <span className={`tag tag-${c.category}`}>{c.category}</span>
                <span style={{ color: 'var(--sub)', fontSize: 13 }}>{c.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1 }}>
          RECENT WORKOUTS
        </h2>
        <Link to="/history" style={{ color: 'var(--accent)', fontSize: 13 }}>
          View all →
        </Link>
      </div>

      {stats.recentWorkouts?.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏋️</div>
          <div>No workouts yet.</div>
          <Link
            to="/log"
            className="btn btn-primary"
            style={{ marginTop: 16, display: 'inline-flex' }}
          >
            Log your first workout
          </Link>
        </div>
      ) : (
        <div className="workout-list">
          {stats.recentWorkouts.map((w) => (
            <div className="workout-card" key={w.id}>
              <span className={`tag tag-${w.category}`}>{w.category}</span>
              <div className="workout-info">
                <div className="workout-title">{w.title}</div>
                <div className="workout-meta">
                  <span>📅 {w.date}</span>
                  <span>⏱ {w.duration_minutes} min</span>
                </div>
              </div>
              <Link to={`/edit/${w.id}`} className="btn btn-ghost btn-sm">
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
