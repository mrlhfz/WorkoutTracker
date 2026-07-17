import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditWorkout from './EditWorkout.jsx';
import { api } from '../api/workouts.js';

vi.mock('../api/workouts.js', () => ({
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
    api.getWorkout.mockResolvedValue({
      data: {
        id: 1,
        title: 'Leg Day',
        category: 'strength',
        date: '2026-01-01',
        duration_minutes: 45,
        notes: '',
        exercises: [],
      },
    });

    renderAtEditRoute();

    expect(await screen.findByText('EDIT WORKOUT')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Leg Day')).toBeInTheDocument();
  });

  test('renders an error message when the workout fails to load', async () => {
    api.getWorkout.mockRejectedValue(new Error('Workout not found'));

    renderAtEditRoute('999');

    expect(await screen.findByText('Workout not found')).toBeInTheDocument();
  });
});
