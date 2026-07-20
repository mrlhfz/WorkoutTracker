import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { api } from '../api/workouts';

vi.mock('../api/workouts', () => ({
  api: { getStats: vi.fn() },
}));

describe('Dashboard', () => {
  test('renders stats once the API call resolves', async () => {
    vi.mocked(api.getStats).mockResolvedValue({
      success: true,
      data: {
        totalWorkouts: 2,
        totalMinutes: 90,
        byCategory: [{ category: 'cardio', count: 2 }],
        recentWorkouts: [
          {
            id: 1,
            title: 'Morning Run',
            category: 'cardio',
            date: '2026-01-01',
            duration_minutes: 45,
            notes: '',
            created_at: '2026-01-01 00:00:00',
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Morning Run')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('renders an error message when the API call fails', async () => {
    vi.mocked(api.getStats).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });
});
