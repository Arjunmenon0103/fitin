import { useState, useEffect } from 'react';
import { Dumbbell, Clock, ChevronRight, RefreshCw, Flame } from 'lucide-react';
import { clsx } from 'clsx';
import { useWorkoutStore } from '../store/workoutStore';
import {
  getExerciseById,
  SPLIT_LABELS,
  SPLIT_DESCRIPTIONS,
  DAY_NAMES,
} from '@fitin/core';
import type { SplitType, WorkoutDay } from '@fitin/core';
import ExerciseDetail from './ExerciseDetail';

const SPLITS: SplitType[] = ['ppl', 'upper_lower', 'full_body', 'bro_split'];

const MUSCLE_COLORS: Record<string, string> = {
  chest: 'bg-[#FF6B9D] text-white',
  back: 'bg-[#00B4D8] text-white',
  shoulders: 'bg-[#FFD803] text-black',
  biceps: 'bg-[#A855F7] text-white',
  triceps: 'bg-[#FF8C42] text-white',
  legs: 'bg-[#22c55e] text-white',
  core: 'bg-[#FF8C42] text-white',
  glutes: 'bg-[#A855F7] text-white',
  calves: 'bg-[#00B4D8] text-white',
  forearms: 'bg-[#FFD803] text-black',
};

export default function WorkoutWeek() {
  const { currentPlan, splitType, setSplitType, regeneratePlan } = useWorkoutStore();
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentPlan) {
      regeneratePlan();
    }
  }, [currentPlan, regeneratePlan]);

  if (!currentPlan) return null;

  if (selectedExerciseId) {
    return (
      <ExerciseDetail
        exerciseId={selectedExerciseId}
        onBack={() => setSelectedExerciseId(null)}
      />
    );
  }

  const day = currentPlan.days[selectedDay];

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">Workout Plan</h1>
          <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wide">{SPLIT_LABELS[splitType]} — {SPLIT_DESCRIPTIONS[splitType]}</p>
        </div>
        <button
          onClick={regeneratePlan}
          className="p-3 rounded-xl border-[3px] border-black bg-[#FFD803] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px]"
          style={{ boxShadow: '2px 2px 0px 0px #000' }}
          title="Regenerate plan"
        >
          <RefreshCw size={20} className="text-black" strokeWidth={3} />
        </button>
      </div>

      {/* Split Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {SPLITS.map((s) => (
          <button
            key={s}
            onClick={() => setSplitType(s)}
            className={clsx(
              'px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap uppercase tracking-wider transition-all duration-150 border-[3px] border-black',
              s === splitType
                ? 'bg-brand-500 text-white'
                : 'bg-white text-black hover:translate-x-[1px] hover:translate-y-[1px]'
            )}
            style={{ boxShadow: s === splitType ? '2px 2px 0px 0px #000' : '2px 2px 0px 0px #000' }}
          >
            {SPLIT_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Day Cards — Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {currentPlan.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={clsx(
              'flex-shrink-0 w-28 p-3 rounded-xl text-left transition-all duration-150 border-[3px] border-black',
              i === selectedDay
                ? 'bg-brand-500 text-white'
                : d.isRestDay
                ? 'bg-gray-200 text-gray-500'
                : 'bg-white text-black hover:translate-x-[1px] hover:translate-y-[1px]'
            )}
            style={{ boxShadow: i === selectedDay ? '4px 4px 0px 0px #000' : '2px 2px 0px 0px #000' }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{DAY_NAMES[i]}</p>
            <p className="text-sm font-black mt-1 truncate uppercase">
              {d.isRestDay ? 'Rest' : d.targetMuscles.slice(0, 2).join(' & ')}
            </p>
            {!d.isRestDay && (
              <div className="flex items-center gap-1 mt-2 text-[10px] font-bold opacity-70">
                <Dumbbell size={10} strokeWidth={3} />
                <span>{d.exercises.length}</span>
                <Clock size={10} strokeWidth={3} className="ml-1" />
                <span>{d.estimatedMinutes}m</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected Day Detail */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{day.label}</h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              {day.targetMuscles.map((m) => (
                <span key={m} className={clsx('badge', MUSCLE_COLORS[m] || 'bg-gray-200 text-black')}>
                  {m}
                </span>
              ))}
            </div>
          </div>
          {!day.isRestDay && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs font-black uppercase">
                <Clock size={14} strokeWidth={3} />
                <span>{day.estimatedMinutes} min</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs font-black uppercase">
                <Dumbbell size={14} strokeWidth={3} />
                <span>{day.exercises.length} exercises</span>
              </div>
            </div>
          )}
        </div>

        {day.isRestDay ? (
          <div className="text-center py-12 bg-[#FFFDF7] rounded-xl border-[3px] border-black" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
            <Flame className="mx-auto text-[#FFD803] mb-3" size={48} strokeWidth={2.5} />
            <p className="text-black font-black uppercase text-lg">Rest & Recover</p>
            <p className="text-sm font-bold text-gray-500 mt-1">Your muscles grow during rest days</p>
          </div>
        ) : (
          <div className="space-y-3">
            {day.exercises.map((we, i) => {
              const exercise = getExerciseById(we.exerciseId);
              if (!exercise) return null;
              return (
                <button
                  key={`${we.exerciseId}-${i}`}
                  onClick={() => setSelectedExerciseId(we.exerciseId)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl bg-white border-2 border-black text-left transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px]"
                  style={{ boxShadow: '2px 2px 0px 0px #000' }}
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={18} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-black truncate uppercase">{exercise.name}</p>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {we.sets}×{we.reps} reps • {we.restSeconds}s rest
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx('badge text-[10px]', MUSCLE_COLORS[exercise.muscleGroup] || 'bg-gray-200')}>
                      {exercise.muscleGroup}
                    </span>
                    <ChevronRight size={18} className="text-black" strokeWidth={3} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
