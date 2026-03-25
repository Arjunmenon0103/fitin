// ─── User ───────────────────────────────────────────────
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Region = 'india' | 'germany' | 'usa';
export type FitnessGoal = 'lose_weight' | 'maintain' | 'build_muscle';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  region: Region;
  goal: FitnessGoal;
  createdAt: string;
}

// ─── Weight Tracking ────────────────────────────────────
export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
}

// ─── Exercises ──────────────────────────────────────────
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core'
  | 'glutes'
  | 'forearms'
  | 'calves';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'bodyweight' | 'dumbbell' | 'barbell' | 'cable' | 'machine' | 'kettlebell' | 'band' | 'other';
export type VisualType = 'lottie' | 'gif' | 'video';

export interface ExerciseVisual {
  type: VisualType;
  url: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  difficulty: Difficulty;
  equipment: Equipment;
  instructions: string[];
  defaultSets: number;
  defaultReps: number;
  visuals: ExerciseVisual[];
}

// ─── Workout Plan ───────────────────────────────────────
export type SplitType = 'ppl' | 'upper_lower' | 'full_body' | 'bro_split';

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface WorkoutDay {
  dayIndex: number; // 0=Monday ... 6=Sunday
  label: string; // e.g. "Push Day", "Rest"
  targetMuscles: MuscleGroup[];
  exercises: WorkoutExercise[];
  isRestDay: boolean;
  estimatedMinutes: number;
}

export interface WeekPlan {
  id: string;
  splitType: SplitType;
  days: WorkoutDay[];
}

// ─── Meals ──────────────────────────────────────────────
export type MealTime = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface Macros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Meal {
  id: string;
  name: string;
  region: Region;
  mealTime: MealTime;
  macros: Macros;
  prepMinutes: number;
  isVegetarian: boolean;
  description: string;
}

export interface DailyMealPlan {
  date: string;
  breakfast: Meal;
  lunch: Meal;
  snack: Meal;
  dinner: Meal;
  totalMacros: Macros;
}

export interface WeeklyMealPlan {
  region: Region;
  targetCalories: number;
  days: DailyMealPlan[];
  weeklyMacros: Macros;
}

export interface GroceryItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
}
