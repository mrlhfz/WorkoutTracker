import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogWorkout from './LogWorkout.jsx';

vi.mock('../api/workouts.js', () => ({
  api: { createWorkout: vi.fn() },
}));

describe('LogWorkout', () => {
  test('renders the log workout form', () => {
    render(
      <MemoryRouter>
        <LogWorkout />
      </MemoryRouter>,
    );

    expect(screen.getByText('LOG WORKOUT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log Workout' })).toBeInTheDocument();
  });
});
