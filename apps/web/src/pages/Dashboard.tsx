import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, TrendingDown, TrendingUp, Target, Flame, Plus, Calendar, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserStore } from '../store/userStore';
import { calculateBMI, getBMICategory } from '@fitin/core';
import { useAuthStore } from '../store/authStore';
import { saveWeightEntry, deleteWeightEntry as deleteWeightEntryDb } from '../lib/db';

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { profile, weightEntries, isOnboarded, addWeightEntry, removeWeightEntry } = useUserStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showInput, setShowInput] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  if (!isOnboarded || !profile) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto text-center">
        <Scale className="mx-auto text-black mb-4" size={64} strokeWidth={2.5} />
        <h1 className="text-3xl font-black text-black mb-2 uppercase">Dashboard</h1>
        <p className="text-gray-500 font-bold mb-6 uppercase text-sm">Set up your profile to start tracking</p>
        <Link to="/profile" className="btn-primary inline-block">Set Up Profile</Link>
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
    let cutoff = new Date();
    if (timeRange === '7d') cutoff.setDate(now.getDate() - 7);
    else if (timeRange === '30d') cutoff.setDate(now.getDate() - 30);
    else if (timeRange === '90d') cutoff.setDate(now.getDate() - 90);
    else return weightEntries;
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return weightEntries.filter((e) => e.date >= cutoffStr);
  };

  const filteredEntries = filterEntries();
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weightKg : profile.weightKg;
  const startWeight = profile.weightKg;
  const weightChange = latestWeight - startWeight;
  const bmi = calculateBMI(latestWeight, profile.heightCm);
  const bmiCategory = getBMICategory(bmi);
  const goalDiff = Math.abs(latestWeight - profile.targetWeightKg);
  const goalTotal = Math.abs(startWeight - profile.targetWeightKg);
  const goalProgress = goalTotal > 0 ? Math.min(100, Math.round(((goalTotal - goalDiff) / goalTotal) * 100)) : 100;

  // Streak calculation
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

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">Dashboard</h1>
        <button
          onClick={() => setShowInput(!showInput)}
          className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
        >
          <Plus size={16} strokeWidth={3} /> Log Weight
        </button>
      </div>

      {/* Quick Weight Input */}
      {showInput && (
        <div className="card mb-6 flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">Today's weight (kg)</label>
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder={todayEntry ? String(todayEntry.weightKg) : String(latestWeight)}
              className="neo-input"
              step={0.1}
              min={20}
              max={300}
              autoFocus
            />
          </div>
          <button onClick={handleAddWeight} className="btn-primary py-2 px-6">
            Save
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center" style={{ backgroundColor: '#B5FF3C' }}>
          <Scale size={20} className="mx-auto text-black mb-2" strokeWidth={2.5} />
          <p className="text-2xl font-black text-black">{latestWeight}</p>
          <p className="text-[10px] font-bold text-gray-700 uppercase">Current (kg)</p>
        </div>
        <div className="card text-center" style={{ backgroundColor: weightChange <= 0 ? '#22c55e' : '#FF4444' }}>
          {weightChange <= 0 ? (
            <TrendingDown size={20} className="mx-auto text-white mb-2" strokeWidth={2.5} />
          ) : (
            <TrendingUp size={20} className="mx-auto text-white mb-2" strokeWidth={2.5} />
          )}
          <p className="text-2xl font-black text-white">
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
          </p>
          <p className="text-[10px] font-bold text-white/80 uppercase">Change (kg)</p>
        </div>
        <div className="card text-center" style={{ backgroundColor: '#A855F7' }}>
          <Target size={20} className="mx-auto text-white mb-2" strokeWidth={2.5} />
          <p className="text-2xl font-black text-white">{bmi}</p>
          <p className="text-[10px] font-bold text-white/80 uppercase">BMI ({bmiCategory})</p>
        </div>
        <div className="card text-center" style={{ backgroundColor: '#FFD803' }}>
          <Flame size={20} className="mx-auto text-black mb-2" strokeWidth={2.5} />
          <p className="text-2xl font-black text-black">{streak}</p>
          <p className="text-[10px] font-bold text-gray-700 uppercase">Day Streak</p>
        </div>
      </div>

      {/* Progress Ring */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-black uppercase">Goal Progress</h2>
          <span className="text-xs font-black uppercase bg-[#FFD803] border-2 border-black px-2 py-1 rounded-lg">{profile.targetWeightKg} kg target</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#22c55e"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${goalProgress * 2.64} ${264 - goalProgress * 2.64}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-black">{goalProgress}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold text-gray-500 uppercase text-xs">Start</span>
              <span className="font-black">{startWeight} kg</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold text-gray-500 uppercase text-xs">Current</span>
              <span className="font-black">{latestWeight} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-gray-500 uppercase text-xs">Goal</span>
              <span className="font-black text-brand-600">{profile.targetWeightKg} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-black" strokeWidth={2.5} />
            <h2 className="font-black text-black uppercase">Weight History</h2>
          </div>
          <div className="flex gap-1">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border-2 border-black transition-all duration-150 ${
                  r === timeRange ? 'bg-brand-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '3px solid #000', fontSize: '13px', fontWeight: 800, boxShadow: '4px 4px 0px 0px #000' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4">
              <h3 className="text-xs font-black uppercase text-gray-600 mb-2">Recent entries</h3>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {[...weightEntries].slice(-8).reverse().map((entry) => (
                  <div
                    key={entry.date}
                    className="rounded-xl border-[3px] border-black px-3 py-2 flex items-center justify-between"
                    style={{ backgroundColor: '#FFFDF7', boxShadow: '2px 2px 0px 0px #000' }}
                  >
                    <div>
                      <p className="text-xs font-black uppercase text-black">{entry.date}</p>
                      <p className="text-sm font-bold text-gray-700">{entry.weightKg} kg</p>
                    </div>
                    <button
                      onClick={() => handleDeleteWeight(entry.date)}
                      className="px-2.5 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wide inline-flex items-center gap-1"
                      style={{ backgroundColor: '#FFB4A2', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-[#FFFDF7] rounded-xl border-[3px] border-black" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
            <Scale className="mx-auto text-black mb-3" size={40} strokeWidth={2.5} />
            <p className="text-sm font-bold text-gray-500 uppercase">No weight entries yet. Log your first weight above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
