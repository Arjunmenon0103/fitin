import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, TrendingDown, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';
import { useUserStore } from '../store/userStore';
import { calculateBMI, getBMICategory } from '@fitin/core';
import { useAuthStore } from '../store/authStore';
import { saveWeightEntry, deleteWeightEntry as deleteWeightEntryDb } from '../lib/db';

type TimeRange = '7d' | '30d' | '90d' | 'all';

const RANGES: TimeRange[] = ['7d', '30d', '90d', 'all'];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { profile, weightEntries, isOnboarded, addWeightEntry, removeWeightEntry } = useUserStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showInput, setShowInput] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  if (!isOnboarded || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
        <div className="rise rounded-panel bg-surface-yellow p-8 md:p-12">
          <h1 className="max-w-[14ch] text-[2.25rem] leading-[0.95] md:text-[3rem]">
            Nothing to chart yet.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-soft">
            Add your height, weight and target and the trend line starts on your first log.
          </p>
          <Link to="/profile" className="btn-primary mt-8">
            Set up your profile
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = weightEntries.find((e) => e.date === today);

  const handleAddWeight = async () => {
    const w = parseFloat(newWeight);
    if (w > 0) {
      const entry = { date: today, weightKg: w };
      addWeightEntry(entry);
      if (user) await saveWeightEntry(user.id, entry);
      setNewWeight('');
      setShowInput(false);
    }
  };

  const handleDeleteWeight = async (date: string) => {
    removeWeightEntry(date);
    if (user) {
      await deleteWeightEntryDb(user.id, date);
    }
  };

  const filterEntries = () => {
    const now = new Date();
    const cutoff = new Date();
    if (timeRange === '7d') cutoff.setDate(now.getDate() - 7);
    else if (timeRange === '30d') cutoff.setDate(now.getDate() - 30);
    else if (timeRange === '90d') cutoff.setDate(now.getDate() - 90);
    else return weightEntries;
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return weightEntries.filter((e) => e.date >= cutoffStr);
  };

  const filteredEntries = filterEntries();
  const latestWeight =
    weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weightKg : profile.weightKg;
  const startWeight = profile.weightKg;
  const weightChange = latestWeight - startWeight;
  const bmi = calculateBMI(latestWeight, profile.heightCm);
  const bmiCategory = getBMICategory(bmi);
  const goalDiff = Math.abs(latestWeight - profile.targetWeightKg);
  const goalTotal = Math.abs(startWeight - profile.targetWeightKg);
  const goalProgress =
    goalTotal > 0 ? Math.min(100, Math.round(((goalTotal - goalDiff) / goalTotal) * 100)) : 100;

  // Consecutive days logged, counting back from today.
  let streak = 0;
  const sortedDates = weightEntries.map((e) => e.date).sort().reverse();
  if (sortedDates.length > 0) {
    const checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const chartData = filteredEntries.map((e) => ({
    date: e.date.slice(5),
    weight: e.weightKg,
  }));

  const TrendIcon = weightChange <= 0 ? TrendingDown : TrendingUp;
  // Circumference of r=42 is 264. Dash length is the filled arc.
  const arc = (goalProgress / 100) * 264;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <div className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Progress</span>
          <h1 className="mt-2 text-[2.25rem] leading-[0.95] md:text-[3rem]">
            {latestWeight}
            <span className="ml-2 font-sans text-[1.25rem] font-bold text-ink-soft">kg today</span>
          </h1>
        </div>
        <button onClick={() => setShowInput(!showInput)} className="btn-primary">
          <Plus size={16} strokeWidth={2.5} /> Log weight
        </button>
      </div>

      {showInput && (
        <div className="mt-5 flex flex-wrap items-end gap-3 rounded-panel bg-paper-warm p-5">
          <div className="min-w-[180px] flex-1">
            <label htmlFor="weight-today" className="field-label">
              Today&rsquo;s weight (kg)
            </label>
            <input
              id="weight-today"
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder={todayEntry ? String(todayEntry.weightKg) : String(latestWeight)}
              className="field"
              step={0.1}
              min={20}
              max={300}
              autoFocus
            />
          </div>
          <button onClick={handleAddWeight} className="btn-primary" disabled={!newWeight.trim()}>
            Save
          </button>
        </div>
      )}

      {/* Goal panel carries the headline number; the three small readouts support it. */}
      <div
        className="rise mt-4 grid gap-4 md:mt-6 md:grid-cols-[1.1fr_0.9fr] md:gap-6"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <div className="rounded-panel bg-surface-yellow p-7">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Toward your goal</span>
            <span className="chip-outline">{profile.targetWeightKg} kg target</span>
          </div>
          <div className="mt-6 flex items-center gap-6">
            <div className="relative h-24 w-24 flex-shrink-0">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(20,20,20,0.12)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#3B308F"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${arc} ${264 - arc}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-[19px]">
                {goalProgress}%
              </span>
            </div>
            <dl className="flex-1 space-y-1.5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Start</dt>
                <dd className="font-bold">{startWeight} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Current</dt>
                <dd className="font-bold">{latestWeight} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Goal</dt>
                <dd className="font-bold text-violet-500">{profile.targetWeightKg} kg</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:gap-4">
          <div className="tile flex flex-col justify-between md:flex-row md:items-center">
            <span className="text-[12px] font-bold text-ink-soft">Change</span>
            <span className="mt-2 flex items-center gap-1.5 font-display text-[22px] leading-none md:mt-0">
              <TrendIcon size={16} strokeWidth={2} className="text-violet-500" />
              {weightChange > 0 ? '+' : ''}
              {weightChange.toFixed(1)}
            </span>
          </div>
          <div className="tile flex flex-col justify-between md:flex-row md:items-center">
            <span className="text-[12px] font-bold text-ink-soft">BMI</span>
            <span className="mt-2 font-display text-[22px] leading-none md:mt-0">
              {bmi}
              <span className="ml-1.5 font-sans text-[12px] font-semibold text-ink-soft">
                {bmiCategory}
              </span>
            </span>
          </div>
          <div className="tile flex flex-col justify-between md:flex-row md:items-center">
            <span className="text-[12px] font-bold text-ink-soft">Streak</span>
            <span className="mt-2 font-display text-[22px] leading-none md:mt-0">
              {streak}
              <span className="ml-1.5 font-sans text-[12px] font-semibold text-ink-soft">
                {streak === 1 ? 'day' : 'days'}
              </span>
            </span>
          </div>
        </div>
      </div>

      <section
        className="rise panel mt-4 md:mt-6"
        style={{ '--i': 2 } as React.CSSProperties}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[1.35rem] leading-none">Weight history</h2>
          <div className="flex gap-1.5">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                aria-pressed={r === timeRange}
                className={clsx('pill px-3.5 py-1.5', r === timeRange && 'pill-on')}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <>
            <div className="mt-5">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(20,20,20,0.10)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#8A8681' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(20,20,20,0.12)' }}
                  />
                  <YAxis
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tick={{ fontSize: 11, fill: '#8A8681' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(20,20,20,0.2)', strokeDasharray: '2 4' }}
                    contentStyle={{
                      borderRadius: 16,
                      border: '1px solid rgba(20,20,20,0.12)',
                      boxShadow: '0 12px 28px -12px rgba(20,20,20,0.24)',
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: '#8A8681', fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#3B308F"
                    strokeWidth={2}
                    dot={{ fill: '#3B308F', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 border-t border-ink/10 pt-4">
              <h3 className="eyebrow">Recent entries</h3>
              <ul className="mt-3 max-h-56 divide-y divide-ink/10 overflow-auto">
                {[...weightEntries]
                  .slice(-8)
                  .reverse()
                  .map((entry) => (
                    <li key={entry.date} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-[14px] font-bold">{entry.weightKg} kg</p>
                        <p className="text-[12px] text-ink-soft">{entry.date}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteWeight(entry.date)}
                        aria-label={`Delete entry for ${entry.date}`}
                        className="rounded-full p-2 text-ink-faint transition-colors hover:bg-paper-grey hover:text-ink"
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-tile bg-paper-warm px-6 py-12 text-center">
            <Scale className="mx-auto text-ink-faint" size={28} strokeWidth={1.75} />
            <p className="mt-3 text-[15px] font-bold">No entries in this range</p>
            <p className="mt-1 text-[14px] text-ink-soft">
              Log today&rsquo;s weight and the line starts here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
