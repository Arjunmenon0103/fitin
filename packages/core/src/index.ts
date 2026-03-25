// Types
export type {
  Gender,
  ActivityLevel,
  Region,
  FitnessGoal,
  UserProfile,
  WeightEntry,
  MuscleGroup,
  Difficulty,
  Equipment,
  VisualType,
  ExerciseVisual,
  Exercise,
  SplitType,
  WorkoutExercise,
  WorkoutDay,
  WeekPlan,
  MealTime,
  Macros,
  Meal,
  DailyMealPlan,
  WeeklyMealPlan,
  GroceryItem,
} from './types';

// Engines
export {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateDailyCalories,
  calculateMacroTargets,
} from './engine/bmi';

export {
  generateWeekPlan,
  getExerciseById,
  getAllExercises,
  getExercisesByMuscle,
  SPLIT_LABELS,
  SPLIT_DESCRIPTIONS,
  DAY_NAMES,
} from './engine/weeklyPlan';

export {
  generateDailyMealPlan,
  generateMealPlanForProfile,
  generateWeeklyMealPlan,
  buildGroceryList,
  swapMeal,
  getMealsForRegion,
  getAllMeals,
} from './engine/mealPlanner';
