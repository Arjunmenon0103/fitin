import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight, Check, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { saveProfile } from '../lib/db';
import type { Gender, ActivityLevel, Region, FitnessGoal, UserProfile } from '@fitin/core';

const STEPS = ['Basic Info', 'Body Stats', 'Activity & Goals', 'Region'];

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; desc: string }[] = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
  { id: 'light', label: 'Light', desc: '1–3 days/week light exercise' },
  { id: 'moderate', label: 'Moderate', desc: '3–5 days/week moderate exercise' },
  { id: 'active', label: 'Active', desc: '6–7 days/week hard exercise' },
  { id: 'very_active', label: 'Very Active', desc: 'Athlete or physical job' },
];

const GOALS: { id: FitnessGoal; label: string; emoji: string }[] = [
  { id: 'lose_weight', label: 'Lose Weight', emoji: '🔥' },
  { id: 'maintain', label: 'Maintain', emoji: '⚖️' },
  { id: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
];

const REGIONS: { id: Region; flag: string; name: string }[] = [
  { id: 'india', flag: '🇮🇳', name: 'India' },
  { id: 'germany', flag: '🇩🇪', name: 'Germany' },
  { id: 'usa', flag: '🇺🇸', name: 'USA' },
];

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { profile, isOnboarded, setProfile, reset } = useUserStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<UserProfile>>({
    name: profile?.name || '',
    age: profile?.age || 25,
    gender: profile?.gender || 'male',
    heightCm: profile?.heightCm || 170,
    weightKg: profile?.weightKg || 70,
    targetWeightKg: profile?.targetWeightKg || 65,
    activityLevel: profile?.activityLevel || 'moderate',
    goal: profile?.goal || 'lose_weight',
    region: profile?.region || 'india',
  });

  const update = (fields: Partial<UserProfile>) => setForm((prev) => ({ ...prev, ...fields }));

  const handleSave = async () => {
    const nextProfile = {
      ...form,
      createdAt: profile?.createdAt || new Date().toISOString(),
    } as UserProfile;

    setSaving(true);
    setProfile(nextProfile);

    if (user) {
      await saveProfile(user.id, nextProfile);
    }

    setSaving(false);
    navigate('/app');
  };

  const canProceed = () => {
    if (step === 0) return (form.name?.length ?? 0) > 0 && (form.age ?? 0) > 0;
    if (step === 1) return (form.heightCm ?? 0) > 0 && (form.weightKg ?? 0) > 0;
    return true;
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-black text-black mb-2 uppercase tracking-tight">
        {isOnboarded ? 'Edit Profile' : 'Set Up Profile'}
      </h1>
      <p className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-wide">
        {isOnboarded ? 'Update your details anytime' : 'Personalize your workout and meal plans'}
      </p>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setStep(i)}
              className={clsx(
                'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black transition-all duration-150 border-2 border-black',
                i < step
                  ? 'bg-brand-500 text-white'
                  : i === step
                  ? 'bg-[#FFD803] text-black'
                  : 'bg-white text-gray-400'
              )}
              style={{ boxShadow: i === step ? '2px 2px 0px 0px #000' : 'none' }}
            >
              {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div className={clsx('h-[3px] flex-1 rounded', i < step ? 'bg-brand-500' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="card mb-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-black uppercase">Basic Info</h2>
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                className="neo-input"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => update({ age: Number(e.target.value) })}
                className="neo-input"
                min={10}
                max={100}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Gender</label>
              <div className="flex gap-3">
                {GENDERS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => update({ gender: g.id })}
                    className={clsx(
                      'flex-1 py-3 rounded-xl font-black text-sm uppercase border-[3px] border-black transition-all duration-150',
                      form.gender === g.id
                        ? 'bg-brand-500 text-white'
                        : 'bg-white text-black hover:translate-x-[1px] hover:translate-y-[1px]'
                    )}
                    style={{ boxShadow: form.gender === g.id ? '2px 2px 0px 0px #000' : '2px 2px 0px 0px #000' }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-black uppercase">Body Stats</h2>
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">Height (cm)</label>
              <input
                type="number"
                value={form.heightCm}
                onChange={(e) => update({ heightCm: Number(e.target.value) })}
                className="neo-input"
                min={100}
                max={250}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">Current Weight (kg)</label>
              <input
                type="number"
                value={form.weightKg}
                onChange={(e) => update({ weightKg: Number(e.target.value) })}
                className="neo-input"
                min={30}
                max={300}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">Target Weight (kg)</label>
              <input
                type="number"
                value={form.targetWeightKg}
                onChange={(e) => update({ targetWeightKg: Number(e.target.value) })}
                className="neo-input"
                min={30}
                max={300}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-black uppercase">Activity & Goals</h2>
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Activity Level</label>
              <div className="space-y-2">
                {ACTIVITY_LEVELS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => update({ activityLevel: a.id })}
                    className={clsx(
                      'w-full p-3 rounded-xl text-left transition-all duration-150 border-[3px] border-black',
                      form.activityLevel === a.id
                        ? 'bg-brand-500 text-white'
                        : 'bg-white text-black hover:translate-x-[1px] hover:translate-y-[1px]'
                    )}
                    style={{ boxShadow: '2px 2px 0px 0px #000' }}
                  >
                    <p className={clsx('text-sm font-black uppercase', form.activityLevel === a.id ? 'text-white' : 'text-black')}>{a.label}</p>
                    <p className={clsx('text-xs font-bold', form.activityLevel === a.id ? 'text-white/80' : 'text-gray-500')}>{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Fitness Goal</label>
              <div className="flex gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => update({ goal: g.id })}
                    className={clsx(
                      'flex-1 p-4 rounded-xl text-center transition-all duration-150 border-[3px] border-black',
                      form.goal === g.id
                        ? 'bg-brand-500 text-white'
                        : 'bg-white text-black hover:translate-x-[1px] hover:translate-y-[1px]'
                    )}
                    style={{ boxShadow: '2px 2px 0px 0px #000' }}
                  >
                    <span className="text-2xl block mb-1">{g.emoji}</span>
                    <span className="text-xs font-black uppercase">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-black uppercase">Select Region</h2>
            <p className="text-sm font-bold text-gray-500 uppercase">This determines your meal plan cuisine</p>
            <div className="grid grid-cols-3 gap-3">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => update({ region: r.id })}
                  className={clsx(
                    'p-6 rounded-xl text-center transition-all duration-150 border-[3px] border-black',
                    form.region === r.id
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-black hover:translate-x-[1px] hover:translate-y-[1px]'
                  )}
                  style={{ boxShadow: form.region === r.id ? '4px 4px 0px 0px #000' : '2px 2px 0px 0px #000' }}
                >
                  <span className="text-4xl block mb-2">{r.flag}</span>
                  <span className="text-xs font-black uppercase tracking-wider">{r.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className={clsx('btn-primary flex-1 flex items-center justify-center gap-2', !canProceed() && 'opacity-50 cursor-not-allowed')}
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
            <Check size={16} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        )}
      </div>

      {/* Reset */}
      {isOnboarded && (
        <button
          onClick={() => {
            reset();
            setForm({ name: '', age: 25, gender: 'male', heightCm: 170, weightKg: 70, targetWeightKg: 65, activityLevel: 'moderate', goal: 'lose_weight', region: 'india' });
            setStep(0);
          }}
          className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-black uppercase text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 size={14} /> Reset Profile
        </button>
      )}
    </div>
  );
}
