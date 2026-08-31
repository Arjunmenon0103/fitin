import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Trash2, Flame, Scale, Dumbbell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { saveProfile } from '../lib/db';
import type { Gender, ActivityLevel, Region, FitnessGoal, UserProfile } from '@fitin/core';

const STEPS = ['Basics', 'Body', 'Activity', 'Region'];

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; desc: string }[] = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
  { id: 'light', label: 'Light', desc: '1 to 3 days a week of light exercise' },
  { id: 'moderate', label: 'Moderate', desc: '3 to 5 days a week of moderate exercise' },
  { id: 'active', label: 'Active', desc: '6 to 7 days a week of hard exercise' },
  { id: 'very_active', label: 'Very active', desc: 'Athlete or physical job' },
];

const GOALS: { id: FitnessGoal; label: string; icon: LucideIcon }[] = [
  { id: 'lose_weight', label: 'Lose weight', icon: Flame },
  { id: 'maintain', label: 'Maintain', icon: Scale },
  { id: 'build_muscle', label: 'Build muscle', icon: Dumbbell },
];

const REGIONS: { id: Region; name: string; cuisine: string }[] = [
  { id: 'india', name: 'India', cuisine: 'Dal, roti, sabzi, curd' },
  { id: 'germany', name: 'Germany', cuisine: 'Rye bread, quark, hearty plates' },
  { id: 'usa', name: 'USA', cuisine: 'Oats, chicken, salads, wraps' },
];

const EMPTY_FORM: Partial<UserProfile> = {
  name: '',
  age: 25,
  gender: 'male',
  heightCm: 170,
  weightKg: 70,
  targetWeightKg: 65,
  activityLevel: 'moderate',
  goal: 'lose_weight',
  region: 'india',
};

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
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <div className="rise">
        <span className="eyebrow">Step {step + 1} of {STEPS.length}</span>
        <h1 className="mt-2 text-[2rem] leading-[0.95] md:text-[2.75rem]">
          {isOnboarded ? 'Edit your profile.' : 'Tell us about you.'}
        </h1>
      </div>

      {/* Step rail. Each dot is clickable so people can jump back. */}
      <nav aria-label="Profile steps" className="mt-7 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <button
              onClick={() => setStep(i)}
              aria-current={i === step ? 'step' : undefined}
              aria-label={`Step ${i + 1}: ${s}`}
              className={clsx(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-colors',
                i < step && 'bg-violet-500 text-white',
                i === step && 'bg-violet-500 text-white ring-4 ring-violet-100',
                i > step && 'bg-paper-grey text-ink-faint'
              )}
            >
              {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={clsx('h-px flex-1', i < step ? 'bg-violet-500' : 'bg-ink/10')}
              />
            )}
          </div>
        ))}
      </nav>

      <div className="rise mt-5 panel md:p-8" style={{ '--i': 1 } as React.CSSProperties}>
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-[1.35rem] leading-none">Basics</h2>
            <div>
              <label htmlFor="p-name" className="field-label">
                Name
              </label>
              <input
                id="p-name"
                type="text"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                className="field"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="p-age" className="field-label">
                Age
              </label>
              <input
                id="p-age"
                type="number"
                value={form.age}
                onChange={(e) => update({ age: Number(e.target.value) })}
                className="field"
                min={10}
                max={100}
              />
            </div>
            <fieldset>
              <legend className="field-label">Gender</legend>
              <div className="mt-1 flex gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => update({ gender: g.id })}
                    aria-pressed={form.gender === g.id}
                    className={clsx('pill flex-1', form.gender === g.id && 'pill-on')}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-[1.35rem] leading-none">Body</h2>
            <div>
              <label htmlFor="p-height" className="field-label">
                Height (cm)
              </label>
              <input
                id="p-height"
                type="number"
                value={form.heightCm}
                onChange={(e) => update({ heightCm: Number(e.target.value) })}
                className="field"
                min={100}
                max={250}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="p-weight" className="field-label">
                  Current weight (kg)
                </label>
                <input
                  id="p-weight"
                  type="number"
                  value={form.weightKg}
                  onChange={(e) => update({ weightKg: Number(e.target.value) })}
                  className="field"
                  min={30}
                  max={300}
                />
              </div>
              <div>
                <label htmlFor="p-target" className="field-label">
                  Target weight (kg)
                </label>
                <input
                  id="p-target"
                  type="number"
                  value={form.targetWeightKg}
                  onChange={(e) => update({ targetWeightKg: Number(e.target.value) })}
                  className="field"
                  min={30}
                  max={300}
                />
                <span className="field-hint">Used to set your calorie target.</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-[1.35rem] leading-none">Activity and goal</h2>
            <fieldset>
              <legend className="field-label">Activity level</legend>
              <div className="mt-2 space-y-2">
                {ACTIVITY_LEVELS.map((a) => {
                  const on = form.activityLevel === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => update({ activityLevel: a.id })}
                      aria-pressed={on}
                      className={clsx(
                        'w-full rounded-field px-4 py-3 text-left transition-colors',
                        on
                          ? 'bg-violet-500 text-white'
                          : 'bg-paper text-ink hover:bg-paper-grey border border-ink/20'
                      )}
                    >
                      <span className="block text-[14px] font-bold">{a.label}</span>
                      <span
                        className={clsx(
                          'mt-0.5 block text-[13px]',
                          on ? 'text-violet-100' : 'text-ink-soft'
                        )}
                      >
                        {a.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset>
              <legend className="field-label">Goal</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {GOALS.map(({ id, label, icon: Icon }) => {
                  const on = form.goal === id;
                  return (
                    <button
                      key={id}
                      onClick={() => update({ goal: id })}
                      aria-pressed={on}
                      className={clsx(
                        'flex flex-col items-center gap-2 rounded-field px-3 py-5 transition-colors',
                        on
                          ? 'bg-violet-500 text-white'
                          : 'bg-paper text-ink hover:bg-paper-grey border border-ink/20'
                      )}
                    >
                      <Icon size={20} strokeWidth={1.75} />
                      <span className="text-[13px] font-bold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[1.35rem] leading-none">Region</h2>
              <p className="mt-2 text-[14px] text-ink-soft">
                This sets the cuisine your meal plan is built from.
              </p>
            </div>
            <div className="space-y-2">
              {REGIONS.map((r) => {
                const on = form.region === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => update({ region: r.id })}
                    aria-pressed={on}
                    className={clsx(
                      'w-full rounded-field px-4 py-3 text-left transition-colors',
                      on
                        ? 'bg-violet-500 text-white'
                        : 'bg-paper text-ink hover:bg-paper-grey border border-ink/20'
                    )}
                  >
                    <span className="block text-[15px] font-bold">{r.name}</span>
                    <span
                      className={clsx(
                        'mt-0.5 block text-[13px]',
                        on ? 'text-violet-100' : 'text-ink-soft'
                      )}
                    >
                      {r.cuisine}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-ghost flex-1">
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="btn-primary flex-1"
          >
            Next <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        ) : (
          <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
            <Check size={16} strokeWidth={2.5} /> {saving ? 'Saving' : 'Save profile'}
          </button>
        )}
      </div>

      {isOnboarded && (
        <button
          onClick={() => {
            reset();
            setForm(EMPTY_FORM);
            setStep(0);
          }}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 text-[13px] font-bold text-ink-faint transition-colors hover:text-wine"
        >
          <Trash2 size={14} strokeWidth={2} /> Reset profile
        </button>
      )}
    </div>
  );
}
