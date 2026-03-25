import type { Exercise, WorkoutDay, WeekPlan, SplitType, MuscleGroup, WorkoutExercise } from '../types';
import exercisesData from '../data/exercises.json';

const exercises = exercisesData as Exercise[];

function getExercisesForMuscle(muscle: MuscleGroup, count: number): WorkoutExercise[] {
  const matching = exercises.filter(e => e.muscleGroup === muscle);
  const selected = matching.slice(0, count);
  return selected.map(e => ({
    exerciseId: e.id,
    sets: e.defaultSets,
    reps: e.defaultReps,
    restSeconds: 90,
  }));
}

function buildDay(
  dayIndex: number,
  label: string,
  muscles: MuscleGroup[],
  exercisesPerMuscle: number = 3
): WorkoutDay {
  const allExercises = muscles.flatMap(m => getExercisesForMuscle(m, exercisesPerMuscle));
  return {
    dayIndex,
    label,
    targetMuscles: muscles,
    exercises: allExercises,
    isRestDay: false,
    estimatedMinutes: allExercises.length * 4 + 5, // ~4 min per exercise + warm-up
  };
}

function restDay(dayIndex: number): WorkoutDay {
  return {
    dayIndex,
    label: 'Rest Day',
    targetMuscles: [],
    exercises: [],
    isRestDay: true,
    estimatedMinutes: 0,
  };
}

const SPLIT_CONFIGS: Record<SplitType, () => WorkoutDay[]> = {
  ppl: () => [
    buildDay(0, 'Push (Chest, Shoulders, Triceps)', ['chest', 'shoulders', 'triceps'], 2),
    buildDay(1, 'Pull (Back, Biceps)', ['back', 'biceps'], 3),
    buildDay(2, 'Legs & Glutes', ['legs', 'glutes', 'calves'], 2),
    buildDay(3, 'Push (Chest, Shoulders, Triceps)', ['chest', 'shoulders', 'triceps'], 2),
    buildDay(4, 'Pull (Back, Biceps)', ['back', 'biceps'], 3),
    buildDay(5, 'Legs & Core', ['legs', 'core'], 3),
    restDay(6),
  ],
  upper_lower: () => [
    buildDay(0, 'Upper Body', ['chest', 'back', 'shoulders', 'biceps', 'triceps'], 1),
    buildDay(1, 'Lower Body', ['legs', 'glutes', 'calves', 'core'], 2),
    restDay(2),
    buildDay(3, 'Upper Body', ['chest', 'back', 'shoulders', 'biceps', 'triceps'], 1),
    buildDay(4, 'Lower Body', ['legs', 'glutes', 'calves', 'core'], 2),
    restDay(5),
    restDay(6),
  ],
  full_body: () => [
    buildDay(0, 'Full Body A', ['chest', 'back', 'legs', 'shoulders', 'core'], 1),
    restDay(1),
    buildDay(2, 'Full Body B', ['back', 'chest', 'glutes', 'biceps', 'triceps'], 1),
    restDay(3),
    buildDay(4, 'Full Body C', ['legs', 'shoulders', 'core', 'chest', 'back'], 1),
    restDay(5),
    restDay(6),
  ],
  bro_split: () => [
    buildDay(0, 'Chest Day', ['chest'], 4),
    buildDay(1, 'Back Day', ['back'], 4),
    buildDay(2, 'Shoulders & Arms', ['shoulders', 'biceps', 'triceps'], 2),
    buildDay(3, 'Leg Day', ['legs', 'glutes', 'calves'], 2),
    buildDay(4, 'Core & Conditioning', ['core'], 4),
    restDay(5),
    restDay(6),
  ],
};

let planCounter = 0;

export function generateWeekPlan(splitType: SplitType): WeekPlan {
  planCounter++;
  return {
    id: `plan-${splitType}-${planCounter}`,
    splitType,
    days: SPLIT_CONFIGS[splitType](),
  };
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find(e => e.id === id);
}

export function getAllExercises(): Exercise[] {
  return exercises;
}

export function getExercisesByMuscle(muscle: MuscleGroup): Exercise[] {
  return exercises.filter(e => e.muscleGroup === muscle);
}

export const SPLIT_LABELS: Record<SplitType, string> = {
  ppl: 'Push / Pull / Legs',
  upper_lower: 'Upper / Lower',
  full_body: 'Full Body',
  bro_split: 'Bro Split',
};

export const SPLIT_DESCRIPTIONS: Record<SplitType, string> = {
  ppl: '6 days/week — Great for intermediate to advanced lifters',
  upper_lower: '4 days/week — Balanced volume and recovery',
  full_body: '3 days/week — Perfect for beginners',
  bro_split: '5 days/week — Isolate each muscle group',
};

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
