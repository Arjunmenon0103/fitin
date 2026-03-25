import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeekPlan, SplitType } from '@fitin/core';
import { generateWeekPlan } from '@fitin/core';

interface WorkoutState {
  currentPlan: WeekPlan | null;
  splitType: SplitType;
  setSplitType: (split: SplitType) => void;
  regeneratePlan: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      splitType: 'ppl',
      setSplitType: (split) => {
        set({ splitType: split, currentPlan: generateWeekPlan(split) });
      },
      regeneratePlan: () => {
        const { splitType } = get();
        set({ currentPlan: generateWeekPlan(splitType) });
      },
    }),
    { name: 'fitin-workout' }
  )
);
