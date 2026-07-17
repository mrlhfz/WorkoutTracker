const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.join(', ') || data.error || 'Request failed');
  return data;
}

export const api = {
  getWorkouts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/workouts${q ? '?' + q : ''}`);
  },
  getWorkout: (id) => request(`/workouts/${id}`),
  getStats: () => request('/workouts/stats'),
  createWorkout: (body) => request('/workouts', { method: 'POST', body: JSON.stringify(body) }),
  updateWorkout: (id, body) =>
    request(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteWorkout: (id) => request(`/workouts/${id}`, { method: 'DELETE' }),
};
