/*
 * Categorical fills only. These distinguish muscle groups from one another and
 * are never used as a call to action, which stays locked to the violet accent.
 * Every fill is light enough to carry ink text at AA.
 */
export const MUSCLE_FILLS: Record<string, string> = {
  chest: 'bg-surface-pink',
  back: 'bg-surface-blue',
  shoulders: 'bg-surface-gold',
  biceps: 'bg-surface-periwinkle',
  triceps: 'bg-surface-orange',
  legs: 'bg-surface-cyan',
  core: 'bg-surface-amber',
  glutes: 'bg-surface-rose',
  calves: 'bg-surface-blue',
  forearms: 'bg-surface-yellow',
};

export function muscleFill(group: string): string {
  return MUSCLE_FILLS[group] ?? 'bg-paper-grey';
}
