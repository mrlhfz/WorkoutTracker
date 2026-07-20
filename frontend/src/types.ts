// Mirrors backend/src/types.ts. Frontend and backend are independent npm projects
// (see CLAUDE.md), so these aren't literally shared/imported across the package
// boundary - keep them in sync by hand when the API shape changes.

export interface Exercise {
  id: number;
  workout_id: number;
  name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  distance_km: number | null;
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
  exercises?: {
    name: string;
    sets?: number | null;
    reps?: number | null;
    weight_kg?: number | null;
    distance_km?: number | null;
  }[];
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

export interface ApiSuccess<T> {
  success: true;
  data: T;
  count?: number;
  message?: string;
}

export interface ApiError {
  success: false;
  error?: string;
  errors?: string[];
}
