import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import WorkoutForm from './WorkoutForm';

async function fillRequiredFields(user: UserEvent) {
  await user.type(screen.getByPlaceholderText('e.g. Morning Run, Upper Body'), 'Leg Day');
  await user.type(screen.getByPlaceholderText('45'), '45');
}

describe('WorkoutForm', () => {
  test('submits cleaned form data, dropping exercises with an empty name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({});
    render(<WorkoutForm onSubmit={onSubmit} />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.title).toBe('Leg Day');
    expect(payload.duration_minutes).toBe(45);
    expect(payload.exercises).toEqual([]);
  });

  test('includes a named exercise with numeric fields converted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({});
    render(<WorkoutForm onSubmit={onSubmit} />);

    await fillRequiredFields(user);
    await user.type(screen.getByPlaceholderText('Exercise name'), 'Squat');
    await user.type(screen.getByPlaceholderText('Sets'), '3');
    await user.type(screen.getByPlaceholderText('Reps'), '10');
    await user.type(screen.getByPlaceholderText('kg'), '60');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.exercises).toEqual([
      { name: 'Squat', sets: 3, reps: 10, weight_kg: 60, distance_km: null },
    ]);
  });

  test('shows distance field instead of sets/reps/weight for cardio category', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={vi.fn().mockResolvedValue({})} />);

    await user.selectOptions(screen.getByRole('combobox'), 'cardio');

    expect(screen.getByPlaceholderText('km')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Sets')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Reps')).not.toBeInTheDocument();
  });

  test('"+ Add Exercise" adds another exercise row', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={vi.fn().mockResolvedValue({})} />);

    expect(screen.getAllByPlaceholderText('Exercise name')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: '+ Add Exercise' }));

    expect(screen.getAllByPlaceholderText('Exercise name')).toHaveLength(2);
  });

  test('displays the error message when onSubmit rejects', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Something went wrong'));
    render(<WorkoutForm onSubmit={onSubmit} />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });

  test('disables the submit button and shows "Saving..." while loading', () => {
    render(<WorkoutForm onSubmit={vi.fn().mockResolvedValue({})} loading />);

    const button = screen.getByRole('button', { name: 'Saving...' });
    expect(button).toBeDisabled();
  });
});
