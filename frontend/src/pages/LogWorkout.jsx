import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/workouts.js';
import WorkoutForm from '../components/WorkoutForm.jsx';

export default function LogWorkout() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(data) {
    setLoading(true);
    try {
      await api.createWorkout(data);
      setSuccess(true);
      setTimeout(() => navigate('/history'), 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">LOG WORKOUT</h1>
      {success ? (
        <div
          className="card"
          style={{ color: 'var(--green)', textAlign: 'center', padding: 40, fontSize: 18 }}
        >
          ✅ Workout saved! Redirecting...
        </div>
      ) : (
        <div className="card">
          <WorkoutForm onSubmit={handleSubmit} submitLabel="Log Workout" loading={loading} />
        </div>
      )}
    </div>
  );
}
