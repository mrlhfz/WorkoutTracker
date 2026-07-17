import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api/workouts.js';
import WorkoutForm from '../components/WorkoutForm.jsx';

export default function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getWorkout(id)
      .then((res) => setWorkout(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(data) {
    setLoading(true);
    try {
      await api.updateWorkout(id, data);
      navigate('/history');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="loading">Loading workout...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!workout) return <div className="error-msg">Workout not found.</div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link to="/history" style={{ color: 'var(--sub)', fontSize: 13 }}>
          ← Back to History
        </Link>
      </div>
      <h1 className="page-title">EDIT WORKOUT</h1>
      <div className="card">
        <WorkoutForm
          initial={workout}
          onSubmit={handleSubmit}
          submitLabel="Update Workout"
          loading={loading}
        />
      </div>
    </div>
  );
}
