import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('api base URL configuration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('falls back to the relative /api path when VITE_API_URL is unset', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    const { api } = await import('./workouts.js');
    await api.getStats();

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/workouts/stats', expect.anything());
  });

  test('uses VITE_API_URL as the base when set, for cross-origin deployments', async () => {
    vi.stubEnv('VITE_API_URL', 'https://workout-tracker-backend.onrender.com/api');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    const { api } = await import('./workouts.js');
    await api.getStats();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://workout-tracker-backend.onrender.com/api/workouts/stats',
      expect.anything(),
    );
  });
});
