import { ArrowLeft, Dumbbell, Target, BarChart3, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { getExerciseById } from '@fitin/core';
import { clsx } from 'clsx';

interface ExerciseDetailProps {
  exerciseId: string;
  onBack: () => void;
}

const DIFFICULTY_STYLES: Record<string, React.CSSProperties> = {
  beginner: { backgroundColor: '#B5FF3C', color: '#000' },
  intermediate: { backgroundColor: '#FFD803', color: '#000' },
  advanced: { backgroundColor: '#FF4444', color: '#fff' },
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
      <div className="px-4 py-6 text-center">
        <p className="text-gray-400 font-bold text-lg">Exercise not found</p>
        <button onClick={onBack} className="btn-primary mt-4">Go Back</button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-black font-black uppercase tracking-wide hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft size={22} strokeWidth={3} />
        <span className="text-sm">Back to plan</span>
      </button>

      {/* Exercise Header */}
      <div className="card mb-6">
        <h1 className="text-3xl font-black text-black mb-3 uppercase tracking-tight">{exercise.name}</h1>
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="badge" style={DIFFICULTY_STYLES[exercise.difficulty] || DIFFICULTY_STYLES.beginner}>
            {exercise.difficulty}
          </span>
          <span className="badge" style={{ backgroundColor: '#00B4D8', color: '#000' }}>
            {exercise.equipment}
          </span>
        </div>

        {/* Exercise Video */}
        <div className="rounded-xl border-[3px] border-black overflow-hidden" style={{ backgroundColor: '#FFFDF7', boxShadow: '4px 4px 0px 0px #000' }}>
          {!mediaError ? (
            <iframe
              key={exercise.id}
              src={buildEmbedUrl(getVideoId(exercise.id, exercise.muscleGroup))}
              title={`${exercise.name} demonstration`}
              className="w-full h-64"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onError={() => setMediaError(true)}
            />
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#FFFDF7' }}>
              <Dumbbell size={48} className="text-gray-300" strokeWidth={2} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {exercise.muscleGroup} exercise
              </p>
            </div>
          )}
          <div className="px-4 py-3 border-t-[3px] border-black" style={{ backgroundColor: '#FFD803' }}>
            <p className="text-xs font-black text-black uppercase tracking-widest text-center">
              {exercise.muscleGroup} — {exercise.equipment}
            </p>
          </div>
        </div>
      </div>

      {/* Muscles Worked */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Target size={20} className="text-brand-600" strokeWidth={3} />
          <h2 className="font-black text-lg text-black uppercase">Muscles Worked</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge" style={{ backgroundColor: '#22c55e', color: '#fff' }}>
            {exercise.muscleGroup} (primary)
          </span>
          {exercise.secondaryMuscles.map((m) => (
            <span key={m} className="badge" style={{ backgroundColor: '#FFD803', color: '#000' }}>
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Default Sets & Reps */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-brand-600" strokeWidth={3} />
          <h2 className="font-black text-lg text-black uppercase">Recommended Volume</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border-[3px] border-black p-5 text-center" style={{ backgroundColor: '#B5FF3C', boxShadow: '2px 2px 0px 0px #000' }}>
            <p className="text-4xl font-black text-black">{exercise.defaultSets}</p>
            <p className="text-xs font-bold text-gray-700 mt-1 uppercase">Sets</p>
          </div>
          <div className="rounded-xl border-[3px] border-black p-5 text-center" style={{ backgroundColor: '#00B4D8', boxShadow: '2px 2px 0px 0px #000' }}>
            <p className="text-4xl font-black text-black">{exercise.defaultReps}</p>
            <p className="text-xs font-bold text-black/70 mt-1 uppercase">Reps</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks size={20} className="text-brand-600" strokeWidth={3} />
          <h2 className="font-black text-lg text-black uppercase">Step-by-Step</h2>
        </div>
        <ol className="space-y-3">
          {exercise.instructions.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg border-2 border-black text-sm font-black flex items-center justify-center" style={{ backgroundColor: '#FFD803', boxShadow: '2px 2px 0px 0px #000' }}>
                {i + 1}
              </span>
              <p className="text-sm font-medium text-gray-800 leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
