import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, WeightEntry } from '@fitin/core';

interface UserState {
  profile: UserProfile | null;
  weightEntries: WeightEntry[];
  isOnboarded: boolean;
  setProfile: (profile: UserProfile) => void;
  setWeightEntries: (entries: WeightEntry[]) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  removeWeightEntry: (date: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      weightEntries: [],
      isOnboarded: false,
      setProfile: (profile) => set({ profile, isOnboarded: true }),
      setWeightEntries: (entries) =>
        set({ weightEntries: [...entries].sort((a, b) => a.date.localeCompare(b.date)) }),
      addWeightEntry: (entry) =>
        set((state) => {
          const filtered = state.weightEntries.filter((e) => e.date !== entry.date);
          return { weightEntries: [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date)) };
        }),
      removeWeightEntry: (date) =>
        set((state) => ({
          weightEntries: state.weightEntries.filter((e) => e.date !== date),
        })),
      reset: () => set({ profile: null, weightEntries: [], isOnboarded: false }),
    }),
    { name: 'fitin-user' }
  )
);
