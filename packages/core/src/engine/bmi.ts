import type { UserProfile, ActivityLevel } from '../types';

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateBMR(profile: UserProfile): number {
  // Mifflin-St Jeor Equation
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  if (profile.gender === 'male') return base + 5;
  return base - 161;
}

export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel]);
}

export function calculateDailyCalories(profile: UserProfile): number {
  const tdee = calculateTDEE(profile);
  switch (profile.goal) {
    case 'lose_weight':
      return Math.round(tdee - 500); // ~0.5 kg/week loss
    case 'build_muscle':
      return Math.round(tdee + 300); // lean bulk
    case 'maintain':
    default:
      return tdee;
  }
}

export function calculateMacroTargets(dailyCals: number, goal: UserProfile['goal']) {
  // Protein: 30%, Carbs: 40%, Fat: 30% (default)
  let proteinPct = 0.3;
  let carbsPct = 0.4;
  let fatPct = 0.3;

  if (goal === 'build_muscle') {
    proteinPct = 0.35;
    carbsPct = 0.40;
    fatPct = 0.25;
  } else if (goal === 'lose_weight') {
    proteinPct = 0.35;
    carbsPct = 0.35;
    fatPct = 0.30;
  }

  return {
    calories: dailyCals,
    proteinG: Math.round((dailyCals * proteinPct) / 4),
    carbsG: Math.round((dailyCals * carbsPct) / 4),
    fatG: Math.round((dailyCals * fatPct) / 9),
  };
}
