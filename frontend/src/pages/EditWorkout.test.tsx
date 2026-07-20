import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditWorkout from './EditWorkout';
import { api } from '../api/workouts';

vi.mock('../api/workouts', () => ({
  api: { getWorkout: vi.fn(), updateWorkout: vi.fn() },
}));

function renderAtEditRoute(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/edit/${id}`]}>
      <Routes>
        <Route path="/edit/:id" element={<EditWorkout />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EditWorkout', () => {
  test('loads the workout and pre-fills the form', async () => {
    vi.mocked(api.getWorkout).mockResolvedValue({
      success: true,
      data: {
        id: 1,
        title: 'Leg Day',
        category: 'strength',
        date: '2026-01-01',
        duration_minutes: 45,
        notes: '',
        created_at: '2026-01-01 00:00:00',
        exercises: [],
      },
    });

    renderAtEditRoute();

    expect(await screen.findByText('EDIT WORKOUT')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Leg Day')).toBeInTheDocument();
  });

  test('renders an error message when the workout fails to load', async () => {
    vi.mocked(api.getWorkout).mockRejectedValue(new Error('Workout not found'));

    renderAtEditRoute('999');

    expect(await screen.findByText('Workout not found')).toBeInTheDocument();
  });
});
