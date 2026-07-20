export type Category = 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';

export interface Exercise {
  id: number;
  workout_id: number;
  name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  distance_km: number | null;
}

export interface ExerciseInput {
  name: string;
  sets?: number | null;
  reps?: number | null;
  weight_kg?: number | null;
  distance_km?: number | null;
}

export interface Workout {
  id: number;
  title: string;
  category: string;
  date: string;
  duration_minutes: number;
  notes: string;
  created_at: string;
}

export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[];
}

export interface WorkoutInput {
  title: string;
  category: string;
  date: string;
  duration_minutes: number;
  notes?: string;
  exercises?: ExerciseInput[];
}

export interface WorkoutQuery {
  search?: string;
  category?: string;
  sort?: string;
  order?: string;
}

export interface Stats {
  totalWorkouts: number;
  byCategory: { category: string; count: number }[];
  totalMinutes: number;
  recentWorkouts: Workout[];
}
