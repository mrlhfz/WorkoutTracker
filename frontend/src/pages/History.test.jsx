import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import History from './History.jsx';
import { api } from '../api/workouts.js';

vi.mock('../api/workouts.js', () => ({
  api: { getWorkouts: vi.fn() },
}));

describe('History', () => {
  test('renders the workout list once the debounced API call resolves', async () => {
    api.getWorkouts.mockResolvedValue({
      data: [
        { id: 1, title: 'Leg Day', category: 'strength', date: '2026-01-01', duration_minutes: 45 },
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
    api.getWorkouts.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    expect(await screen.findByText('No workouts logged yet.')).toBeInTheDocument();
  });
});
