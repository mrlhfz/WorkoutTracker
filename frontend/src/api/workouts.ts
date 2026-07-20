import type { ApiSuccess, Stats, WorkoutInput, WorkoutWithExercises } from '../types';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiSuccess<T>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.join(', ') || data.error || 'Request failed');
  return data;
}

export const api = {
  getWorkouts: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<WorkoutWithExercises[]>(`/workouts${q ? '?' + q : ''}`);
  },
  getWorkout: (id: number | string) => request<WorkoutWithExercises>(`/workouts/${id}`),
  getStats: () => request<Stats>('/workouts/stats'),
  createWorkout: (body: WorkoutInput) =>
    request<WorkoutWithExercises>('/workouts', { method: 'POST', body: JSON.stringify(body) }),
  updateWorkout: (id: number | string, body: WorkoutInput) =>
    request<WorkoutWithExercises>(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteWorkout: (id: number | string) =>
    request<WorkoutWithExercises>(`/workouts/${id}`, { method: 'DELETE' }),
};
