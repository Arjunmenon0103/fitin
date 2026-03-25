import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyMealPlan, Region, MealTime } from '@fitin/core';
import { generateDailyMealPlan, swapMeal } from '@fitin/core';

interface MealState {
  currentPlan: DailyMealPlan | null;
  selectedRegion: Region;
  targetCalories: number;
  setRegion: (region: Region) => void;
  setTargetCalories: (cals: number) => void;
  generatePlan: (date?: string) => void;
  swapMealSlot: (mealTime: MealTime) => void;
}

export const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      selectedRegion: 'india',
      targetCalories: 2000,
      setRegion: (region) => set({ selectedRegion: region }),
      setTargetCalories: (cals) => set({ targetCalories: cals }),
      generatePlan: (date) => {
        const { selectedRegion, targetCalories } = get();
        const today = date || new Date().toISOString().split('T')[0];
        set({ currentPlan: generateDailyMealPlan(selectedRegion, targetCalories, today) });
      },
      swapMealSlot: (mealTime) => {
        const { currentPlan, selectedRegion } = get();
        if (!currentPlan) return;
        const currentMealId = currentPlan[mealTime]?.id;
        set({ currentPlan: swapMeal(currentPlan, mealTime, selectedRegion, currentMealId) });
      },
    }),
    { name: 'fitin-meals' }
  )
);
