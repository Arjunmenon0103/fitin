import { useState, useEffect } from 'react';
import { Dumbbell, Clock, ChevronRight, RefreshCw, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { useWorkoutStore } from '../store/workoutStore';
import { getExerciseById, SPLIT_LABELS, SPLIT_DESCRIPTIONS, DAY_NAMES } from '@fitin/core';
import type { SplitType } from '@fitin/core';
import { muscleFill } from '../lib/muscleFills';
import ExerciseDetail from './ExerciseDetail';

const SPLITS: SplitType[] = ['ppl', 'upper_lower', 'full_body', 'bro_split'];

export default function WorkoutWeek() {
  const { currentPlan, splitType, setSplitType, regeneratePlan } = useWorkoutStore();
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentPlan) {
      regeneratePlan();
    }
  }, [currentPlan, regeneratePlan]);

  if (!currentPlan) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
        <div className="space-y-4" aria-busy="true" aria-live="polite">
          <div className="h-10 w-1/2 rounded-full bg-paper-grey" />
          <div className="h-24 rounded-panel bg-paper-grey" />
          <div className="h-64 rounded-panel bg-paper-grey" />
          <span className="sr-only">Building your week</span>
        </div>
      </div>
    );
  }

  if (selectedExerciseId) {
    return (
      <ExerciseDetail exerciseId={selectedExerciseId} onBack={() => setSelectedExerciseId(null)} />
    );
  }

  const day = currentPlan.days[selectedDay];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <div className="rise flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">{SPLIT_LABELS[splitType]}</span>
          <h1 className="mt-2 max-w-[16ch] text-[2.25rem] leading-[0.95] md:text-[3rem]">
            Your training week.
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
            {SPLIT_DESCRIPTIONS[splitType]}
          </p>
        </div>
        <button
          onClick={regeneratePlan}
          className="btn-ghost flex-shrink-0 px-4"
          aria-label="Regenerate this week's plan"
        >
          <RefreshCw size={16} strokeWidth={2} />
          <span className="hidden sm:inline">Regenerate</span>
        </button>
      </div>

      <div
        className="rise scrollbar-hide mt-6 flex gap-2 overflow-x-auto pb-1"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        {SPLITS.map((s) => (
          <button
            key={s}
            onClick={() => setSplitType(s)}
            aria-pressed={s === splitType}
            className={clsx('pill', s === splitType && 'pill-on')}
          >
            {SPLIT_LABELS[s]}
          </button>
        ))}
      </div>

      <div
        className="rise scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1"
        style={{ '--i': 2 } as React.CSSProperties}
      >
        {currentPlan.days.map((d, i) => {
          const on = i === selectedDay;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              aria-pressed={on}
              className={clsx(
                'w-28 flex-shrink-0 rounded-tile px-3 py-3 text-left transition-colors',
                on
                  ? 'bg-violet-500 text-white'
                  : 'border border-ink/20 bg-paper text-ink hover:bg-paper-grey'
              )}
            >
              <span
                className={clsx(
                  'block text-[11px] font-bold uppercase tracking-[0.12em]',
                  on ? 'text-violet-100' : 'text-ink-faint'
                )}
              >
                {DAY_NAMES[i]}
              </span>
              <span className="mt-1 block truncate text-[14px] font-bold">
                {d.isRestDay ? 'Rest' : d.targetMuscles.slice(0, 2).join(' & ')}
              </span>
              <span
                className={clsx(
                  'mt-1.5 block text-[11px] font-semibold',
                  on ? 'text-violet-100' : 'text-ink-faint'
                )}
              >
                {d.isRestDay ? 'Recovery' : `${d.exercises.length} lifts · ${d.estimatedMinutes}m`}
              </span>
            </button>
          );
        })}
      </div>

      <section className="rise panel mt-4" style={{ '--i': 3 } as React.CSSProperties}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[1.5rem] leading-none">{day.label}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {day.targetMuscles.map((m) => (
                <span key={m} className={clsx('chip capitalize', muscleFill(m))}>
                  {m}
                </span>
              ))}
            </div>
          </div>
          {!day.isRestDay && (
            <dl className="flex gap-5 text-[13px]">
              <div>
                <dt className="flex items-center gap-1.5 text-ink-soft">
                  <Clock size={13} strokeWidth={2} /> Time
                </dt>
                <dd className="mt-0.5 font-display text-[19px] leading-none">
                  {day.estimatedMinutes}m
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-ink-soft">
                  <Dumbbell size={13} strokeWidth={2} /> Lifts
                </dt>
                <dd className="mt-0.5 font-display text-[19px] leading-none">
                  {day.exercises.length}
                </dd>
              </div>
            </dl>
          )}
        </div>

        {day.isRestDay ? (
          <div className="mt-5 rounded-tile bg-surface-yellow px-6 py-14 text-center">
            <Moon className="mx-auto text-ink" size={26} strokeWidth={1.75} />
            <p className="mt-4 font-display text-[1.5rem] leading-none">Rest day</p>
            <p className="mx-auto mt-2 max-w-[34ch] text-[14px] text-ink-soft">
              Muscle is built between sessions, not during them. Walk, eat, sleep.
            </p>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-ink/10 border-t border-ink/10">
            {day.exercises.map((we, i) => {
              const exercise = getExerciseById(we.exerciseId);
              if (!exercise) return null;
              return (
                <li key={`${we.exerciseId}-${i}`}>
                  <button
                    onClick={() => setSelectedExerciseId(we.exerciseId)}
                    className="group flex w-full items-center gap-4 py-3.5 text-left transition-colors hover:bg-paper-warm"
                  >
                    <span className="w-6 flex-shrink-0 font-display text-[17px] text-ink-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold">{exercise.name}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-soft">
                        {we.sets} × {we.reps} reps · {we.restSeconds}s rest
                      </span>
                    </span>
                    <span
                      className={clsx(
                        'chip hidden capitalize sm:inline-flex',
                        muscleFill(exercise.muscleGroup)
                      )}
                    >
                      {exercise.muscleGroup}
                    </span>
                    <ChevronRight
                      size={18}
                      strokeWidth={2}
                      className="flex-shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
