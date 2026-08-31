import { ArrowLeft, Dumbbell } from 'lucide-react';
import { useState } from 'react';
import { getExerciseById } from '@fitin/core';
import { clsx } from 'clsx';
import { muscleFill } from '../lib/muscleFills';

interface ExerciseDetailProps {
  exerciseId: string;
  onBack: () => void;
}

const DIFFICULTY_FILLS: Record<string, string> = {
  beginner: 'bg-surface-cyan',
  intermediate: 'bg-surface-gold',
  advanced: 'bg-surface-rose',
};

const EXERCISE_VIDEO_BY_ID: Record<string, string> = {
  'chest-1': 'rT7DgCr-3pg',
  'chest-2': 'eozdVDA78K0',
  'back-1': 'eGo4IYlbE5g',
  'back-2': 'pYcpY20QaE8',
  'shoulders-1': 'qEwKCR5JCog',
  'biceps-1': 'kwG2ipFRgfo',
  'triceps-1': '2-LAMcpzODU',
  'legs-1': 'YaXPRqUwItQ',
  'core-1': '1919eTCoESo',
};

const MUSCLE_VIDEO_FALLBACKS: Record<string, string[]> = {
  chest: ['rT7DgCr-3pg', 'eozdVDA78K0', 'SCVCLChPQFY'],
  back: ['eGo4IYlbE5g', 'pYcpY20QaE8', 'roCP6wCXPqo'],
  shoulders: ['qEwKCR5JCog', 'B-aVuyhvLHU', '3VcKaXpzqRo'],
  biceps: ['kwG2ipFRgfo', 'ykJmrZ5v0Oo', 'in7PaeYlhrM'],
  triceps: ['2-LAMcpzODU', 'nRiJVZDpdL0', '6SS6K3lAwZ8'],
  legs: ['YaXPRqUwItQ', 'aclHkVaku9U', 'Dy28eq2PjcM'],
  core: ['1919eTCoESo', 'JB2oyawG9KI', 'AnYl6Nk9GOA'],
  glutes: ['v7AYKMP6rOE', 'xqvCmoLULNY', 'pSHjTRCQxIw'],
  calves: ['YMmgqO8Jo-k', 'gwLzBJYoWlI', 'wxwY7GXxL4k'],
  forearms: ['rY1-NA9V6ko', 'l4mQ0n5xV6Y', 'Ej4WzltO1DA'],
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getVideoId(exerciseId: string, muscleGroup: string): string {
  if (EXERCISE_VIDEO_BY_ID[exerciseId]) return EXERCISE_VIDEO_BY_ID[exerciseId];
  const pool = MUSCLE_VIDEO_FALLBACKS[muscleGroup] || ['rT7DgCr-3pg'];
  return pool[hashString(exerciseId) % pool.length];
}

function buildEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`;
}

export default function ExerciseDetail({ exerciseId, onBack }: ExerciseDetailProps) {
  const exercise = getExerciseById(exerciseId);
  const [mediaError, setMediaError] = useState(false);

  if (!exercise) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
        <div className="rounded-panel bg-paper-warm px-6 py-14 text-center">
          <p className="font-display text-[1.5rem] leading-none">We lost that exercise</p>
          <p className="mx-auto mt-2 max-w-[36ch] text-[14px] text-ink-soft">
            It is no longer in the library. Head back and pick another lift.
          </p>
          <button onClick={onBack} className="btn-primary mt-6">
            Back to plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <button
        onClick={onBack}
        className="rise inline-flex items-center gap-2 text-[13px] font-bold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} strokeWidth={2} /> Back to plan
      </button>

      <header className="rise mt-5" style={{ '--i': 1 } as React.CSSProperties}>
        <h1 className="max-w-[18ch] text-[2rem] leading-[0.95] md:text-[2.75rem]">
          {exercise.name}
        </h1>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span
            className={clsx(
              'chip capitalize',
              DIFFICULTY_FILLS[exercise.difficulty] ?? DIFFICULTY_FILLS.beginner
            )}
          >
            {exercise.difficulty}
          </span>
          <span className="chip-outline capitalize">{exercise.equipment}</span>
          <span className={clsx('chip capitalize', muscleFill(exercise.muscleGroup))}>
            {exercise.muscleGroup}
          </span>
        </div>
      </header>

      <div
        className="rise mt-6 overflow-hidden rounded-panel border border-ink/10 bg-paper-warm"
        style={{ '--i': 2 } as React.CSSProperties}
      >
        {!mediaError ? (
          <iframe
            key={exercise.id}
            src={buildEmbedUrl(getVideoId(exercise.id, exercise.muscleGroup))}
            title={`${exercise.name} demonstration`}
            className="aspect-video w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            onError={() => setMediaError(true)}
          />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3">
            <Dumbbell size={28} className="text-ink-faint" strokeWidth={1.75} />
            <p className="text-[14px] font-bold text-ink-soft">Demo unavailable right now</p>
            <p className="max-w-[34ch] text-center text-[13px] text-ink-faint">
              The steps below carry the full movement.
            </p>
          </div>
        )}
      </div>

      <div
        className="rise mt-4 grid gap-4 md:mt-6 md:grid-cols-[0.9fr_1.1fr] md:gap-6"
        style={{ '--i': 3 } as React.CSSProperties}
      >
        <div className="space-y-4">
          <div className="rounded-panel bg-surface-yellow p-7">
            <span className="eyebrow">Recommended volume</span>
            <p className="mt-4 font-display text-[3rem] leading-[0.9]">
              {exercise.defaultSets}
              <span className="mx-1.5 text-ink-soft">&times;</span>
              {exercise.defaultReps}
            </p>
            <p className="mt-2 text-[14px] text-ink-soft">sets by reps</p>
          </div>

          <div className="panel">
            <h2 className="text-[1.1rem] leading-none">Muscles worked</h2>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className={clsx('chip capitalize', muscleFill(exercise.muscleGroup))}>
                {exercise.muscleGroup} (primary)
              </span>
              {exercise.secondaryMuscles.map((m) => (
                <span key={m} className="chip-outline capitalize">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="panel">
          <h2 className="text-[1.1rem] leading-none">Step by step</h2>
          <ol className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-4 py-3.5">
                <span className="flex-shrink-0 font-display text-[17px] text-ink-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[14px] leading-relaxed text-ink-soft">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
