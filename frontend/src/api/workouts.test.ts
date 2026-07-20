import { describe, test, expect, afterEach, vi } from 'vitest';
import { api } from './workouts';
import type { WorkoutInput } from '../types';

function mockFetchOnce(
  body: unknown,
  { ok = true, status = ok ? 200 : 400 }: { ok?: boolean; status?: number } = {},
) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

describe('api/workouts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getWorkouts() calls the workouts endpoint with a query string built from params', async () => {
    mockFetchOnce({ success: true, data: [], count: 0 });

    await api.getWorkouts({ search: 'run', category: 'cardio' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/workouts?search=run&category=cardio',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    );
  });

  test('getWorkouts() omits the query string entirely when no params are given', async () => {
    mockFetchOnce({ success: true, data: [], count: 0 });

    await api.getWorkouts();

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/workouts', expect.anything());
  });

  test('createWorkout() sends a POST with a JSON body', async () => {
    mockFetchOnce({ success: true, data: { id: 1 } }, { status: 201 });

    const body = { title: 'Leg Day', category: 'strength' } as WorkoutInput;
    await api.createWorkout(body);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/workouts',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(body) }),
    );
  });

  test('deleteWorkout() sends a DELETE request to the workout id endpoint', async () => {
    mockFetchOnce({ success: true, message: 'Workout deleted' });

    await api.deleteWorkout(42);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/workouts/42',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  test('throws the joined validation errors when the response has an errors array', async () => {
    mockFetchOnce(
      { success: false, errors: ['title is required', 'date is required'] },
      { ok: false },
    );

    await expect(api.createWorkout({} as WorkoutInput)).rejects.toThrow(
      'title is required, date is required',
    );
  });

  test('throws the single error message when the response has an error string', async () => {
    mockFetchOnce({ success: false, error: 'Workout not found' }, { ok: false, status: 404 });

    await expect(api.getWorkout(999)).rejects.toThrow('Workout not found');
  });

  test('falls back to a generic message when the response has neither errors nor error', async () => {
    mockFetchOnce({ success: false }, { ok: false, status: 500 });

    await expect(api.getStats()).rejects.toThrow('Request failed');
  });
});
