import type { Meal, Region, MealTime, DailyMealPlan, Macros, UserProfile, WeeklyMealPlan, GroceryItem } from '../types';
import { calculateDailyCalories } from './bmi';
import mealsIndia from '../data/meals-india.json';
import mealsGermany from '../data/meals-germany.json';
import mealsUsa from '../data/meals-usa.json';

const ALL_MEALS: Meal[] = [
  ...(mealsIndia as Meal[]),
  ...(mealsGermany as Meal[]),
  ...(mealsUsa as Meal[]),
];

function getMealsByRegionAndTime(region: Region, mealTime: MealTime): Meal[] {
  return ALL_MEALS.filter(m => m.region === region && m.mealTime === mealTime);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickBestFit(meals: Meal[], targetCals: number): Meal {
  if (meals.length === 0) throw new Error('No meals available');
  return meals.reduce((best, meal) =>
    Math.abs(meal.macros.calories - targetCals) < Math.abs(best.macros.calories - targetCals)
      ? meal
      : best
  );
}

function sortByCalorieProximity(meals: Meal[], targetCals: number): Meal[] {
  return [...meals].sort((a, b) =>
    Math.abs(a.macros.calories - targetCals) - Math.abs(b.macros.calories - targetCals)
  );
}

function sumMacros(...meals: Meal[]): Macros {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.macros.calories,
      proteinG: acc.proteinG + m.macros.proteinG,
      carbsG: acc.carbsG + m.macros.carbsG,
      fatG: acc.fatG + m.macros.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

// Calorie distribution: Breakfast 25%, Lunch 35%, Snack 10%, Dinner 30%
const MEAL_DISTRIBUTION: Record<MealTime, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  snack: 0.10,
  dinner: 0.30,
};

export function generateDailyMealPlan(
  region: Region,
  targetCalories: number,
  date: string
): DailyMealPlan {
  const breakfast = pickBestFit(
    getMealsByRegionAndTime(region, 'breakfast'),
    targetCalories * MEAL_DISTRIBUTION.breakfast
  );
  const lunch = pickBestFit(
    getMealsByRegionAndTime(region, 'lunch'),
    targetCalories * MEAL_DISTRIBUTION.lunch
  );
  const snack = pickBestFit(
    getMealsByRegionAndTime(region, 'snack'),
    targetCalories * MEAL_DISTRIBUTION.snack
  );
  const dinner = pickBestFit(
    getMealsByRegionAndTime(region, 'dinner'),
    targetCalories * MEAL_DISTRIBUTION.dinner
  );

  return {
    date,
    breakfast,
    lunch,
    snack,
    dinner,
    totalMacros: sumMacros(breakfast, lunch, snack, dinner),
  };
}

export function generateMealPlanForProfile(
  profile: UserProfile,
  date: string
): DailyMealPlan {
  const targetCalories = calculateDailyCalories(profile);
  return generateDailyMealPlan(profile.region, targetCalories, date);
}

export function swapMeal(
  plan: DailyMealPlan,
  mealTime: MealTime,
  region: Region,
  excludeId?: string
): DailyMealPlan {
  const available = getMealsByRegionAndTime(region, mealTime).filter(
    m => m.id !== excludeId
  );
  const newMeal = pickRandom(available);
  const updated = { ...plan, [mealTime]: newMeal };
  updated.totalMacros = sumMacros(updated.breakfast, updated.lunch, updated.snack, updated.dinner);
  return updated;
}

export function generateWeeklyMealPlan(
  region: Region,
  targetCalories: number
): WeeklyMealPlan {
  const today = new Date();
  const days: DailyMealPlan[] = [];

  // Get all meals per time slot, shuffled, then assign round-robin so each day is different
  const breakfasts = shuffle(sortByCalorieProximity(
    getMealsByRegionAndTime(region, 'breakfast'),
    targetCalories * MEAL_DISTRIBUTION.breakfast
  ));
  const lunches = shuffle(sortByCalorieProximity(
    getMealsByRegionAndTime(region, 'lunch'),
    targetCalories * MEAL_DISTRIBUTION.lunch
  ));
  const snacks = shuffle(sortByCalorieProximity(
    getMealsByRegionAndTime(region, 'snack'),
    targetCalories * MEAL_DISTRIBUTION.snack
  ));
  const dinners = shuffle(sortByCalorieProximity(
    getMealsByRegionAndTime(region, 'dinner'),
    targetCalories * MEAL_DISTRIBUTION.dinner
  ));

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const breakfast = breakfasts[i % breakfasts.length];
    const lunch = lunches[i % lunches.length];
    const snack = snacks[i % snacks.length];
    const dinner = dinners[i % dinners.length];

    days.push({
      date: dateStr,
      breakfast,
      lunch,
      snack,
      dinner,
      totalMacros: sumMacros(breakfast, lunch, snack, dinner),
    });
  }

  const weeklyMacros = days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.totalMacros.calories,
      proteinG: acc.proteinG + d.totalMacros.proteinG,
      carbsG: acc.carbsG + d.totalMacros.carbsG,
      fatG: acc.fatG + d.totalMacros.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  return { region, targetCalories, days, weeklyMacros };
}

export function buildGroceryList(plan: WeeklyMealPlan): GroceryItem[] {
  const mealCounts = new Map<string, { meal: Meal; count: number }>();

  for (const day of plan.days) {
    for (const mealTime of ['breakfast', 'lunch', 'snack', 'dinner'] as const) {
      const meal = day[mealTime];
      const existing = mealCounts.get(meal.id);
      if (existing) {
        existing.count++;
      } else {
        mealCounts.set(meal.id, { meal, count: 1 });
      }
    }
  }

  const groceryMap = new Map<string, GroceryItem>();

  const MEAL_INGREDIENTS: Record<string, { name: string; category: string; qty: number; unit: string }[]> = {
    // India
    'in-b1': [{ name: 'Oats', category: 'Grains', qty: 80, unit: 'g' }, { name: 'Banana', category: 'Fruits', qty: 1, unit: 'pc' }, { name: 'Milk', category: 'Dairy', qty: 200, unit: 'ml' }],
    'in-b2': [{ name: 'Whole wheat flour', category: 'Grains', qty: 100, unit: 'g' }, { name: 'Yogurt', category: 'Dairy', qty: 100, unit: 'g' }, { name: 'Potato', category: 'Vegetables', qty: 1, unit: 'pc' }],
    'in-l1': [{ name: 'Basmati rice', category: 'Grains', qty: 150, unit: 'g' }, { name: 'Chicken breast', category: 'Protein', qty: 200, unit: 'g' }, { name: 'Onion', category: 'Vegetables', qty: 1, unit: 'pc' }, { name: 'Tomato', category: 'Vegetables', qty: 2, unit: 'pc' }],
    'in-l2': [{ name: 'Basmati rice', category: 'Grains', qty: 150, unit: 'g' }, { name: 'Dal (lentils)', category: 'Protein', qty: 100, unit: 'g' }, { name: 'Ghee', category: 'Fats', qty: 10, unit: 'g' }],
    'in-s1': [{ name: 'Mixed nuts', category: 'Snacks', qty: 30, unit: 'g' }, { name: 'Dates', category: 'Fruits', qty: 3, unit: 'pc' }],
    'in-d1': [{ name: 'Paneer', category: 'Protein', qty: 200, unit: 'g' }, { name: 'Bell pepper', category: 'Vegetables', qty: 2, unit: 'pc' }, { name: 'Roti flour', category: 'Grains', qty: 100, unit: 'g' }],
    'in-d2': [{ name: 'Chicken breast', category: 'Protein', qty: 250, unit: 'g' }, { name: 'Roti flour', category: 'Grains', qty: 100, unit: 'g' }, { name: 'Onion', category: 'Vegetables', qty: 1, unit: 'pc' }],
    // Germany
    'de-b1': [{ name: 'Whole grain bread', category: 'Grains', qty: 100, unit: 'g' }, { name: 'Cheese', category: 'Dairy', qty: 40, unit: 'g' }, { name: 'Butter', category: 'Fats', qty: 10, unit: 'g' }],
    'de-l1': [{ name: 'Pork schnitzel', category: 'Protein', qty: 200, unit: 'g' }, { name: 'Potato', category: 'Vegetables', qty: 3, unit: 'pc' }, { name: 'Breadcrumbs', category: 'Grains', qty: 50, unit: 'g' }],
    'de-d1': [{ name: 'Bratwurst', category: 'Protein', qty: 200, unit: 'g' }, { name: 'Sauerkraut', category: 'Vegetables', qty: 150, unit: 'g' }, { name: 'Mustard', category: 'Condiments', qty: 20, unit: 'g' }],
    // USA
    'us-b1': [{ name: 'Eggs', category: 'Protein', qty: 3, unit: 'pc' }, { name: 'Whole wheat bread', category: 'Grains', qty: 2, unit: 'slices' }, { name: 'Avocado', category: 'Fruits', qty: 1, unit: 'pc' }],
    'us-l1': [{ name: 'Chicken breast', category: 'Protein', qty: 200, unit: 'g' }, { name: 'Mixed greens', category: 'Vegetables', qty: 100, unit: 'g' }, { name: 'Caesar dressing', category: 'Condiments', qty: 30, unit: 'ml' }],
    'us-d1': [{ name: 'Salmon fillet', category: 'Protein', qty: 200, unit: 'g' }, { name: 'Broccoli', category: 'Vegetables', qty: 150, unit: 'g' }, { name: 'Brown rice', category: 'Grains', qty: 100, unit: 'g' }],
  };

  for (const [, { meal, count }] of mealCounts) {
    const ingredients = MEAL_INGREDIENTS[meal.id];
    if (ingredients) {
      for (const ing of ingredients) {
        const key = `${ing.name}-${ing.unit}`;
        const existing = groceryMap.get(key);
        if (existing) {
          existing.quantity += ing.qty * count;
        } else {
          groceryMap.set(key, {
            name: ing.name,
            category: ing.category,
            quantity: ing.qty * count,
            unit: ing.unit,
          });
        }
      }
    } else {
      // Fallback: use meal name as a generic grocery item
      const key = meal.name;
      const existing = groceryMap.get(key);
      if (existing) {
        existing.quantity += count;
      } else {
        groceryMap.set(key, {
          name: meal.name,
          category: 'Prepared',
          quantity: count,
          unit: 'servings',
        });
      }
    }
  }

  return Array.from(groceryMap.values()).sort((a, b) => a.category.localeCompare(b.category));
}

export function getMealsForRegion(region: Region): Meal[] {
  return ALL_MEALS.filter(m => m.region === region);
}

export function getAllMeals(): Meal[] {
  return ALL_MEALS;
}
