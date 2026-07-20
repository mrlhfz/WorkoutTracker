import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import History from './History';
import { api } from '../api/workouts';

vi.mock('../api/workouts', () => ({
  api: { getWorkouts: vi.fn() },
}));

describe('History', () => {
  test('renders the workout list once the debounced API call resolves', async () => {
    vi.mocked(api.getWorkouts).mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          title: 'Leg Day',
          category: 'strength',
          date: '2026-01-01',
          duration_minutes: 45,
          notes: '',
          created_at: '2026-01-01 00:00:00',
          exercises: [],
        },
      ],
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Leg Day')).toBeInTheDocument();
  });

  test('renders an empty state when there are no workouts', async () => {
    vi.mocked(api.getWorkouts).mockResolvedValue({ success: true, data: [] });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    expect(await screen.findByText('No workouts logged yet.')).toBeInTheDocument();
  });
});
