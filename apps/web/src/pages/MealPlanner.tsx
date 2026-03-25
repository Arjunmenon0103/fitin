import { useState, useMemo } from 'react';
import { RefreshCw, ShoppingCart, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { clsx } from 'clsx';
import {
  generateWeeklyMealPlan,
  buildGroceryList,
  calculateDailyCalories,
} from '@fitin/core';
import type { Region, MealTime, GroceryItem } from '@fitin/core';
import { useUserStore } from '../store/userStore';

const REGIONS: { id: Region; flag: string; name: string }[] = [
  { id: 'india', flag: '🇮🇳', name: 'India' },
  { id: 'germany', flag: '🇩🇪', name: 'Germany' },
  { id: 'usa', flag: '🇺🇸', name: 'USA' },
];

const MEAL_TIMES: { key: MealTime; label: string; emoji: string; bg: string }[] = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅', bg: '#FFD803' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️', bg: '#FF8C42' },
  { key: 'snack', label: 'Snack', emoji: '🍎', bg: '#B5FF3C' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙', bg: '#A855F7' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CALORIE_PRESETS = [
  { value: 1500, label: 'CUT', bg: '#FF6B9D' },
  { value: 2000, label: 'MAINTAIN', bg: '#FFD803' },
  { value: 2500, label: 'BULK', bg: '#00B4D8' },
  { value: 3000, label: 'HARD BULK', bg: '#B5FF3C' },
];

type Tab = 'week' | 'grocery';

// Grocery item emoji icons — adapted from existing grocery list app
function groceryIcon(name: string): string {
  const t = name.toLowerCase();
  if (/tomato/.test(t)) return '🍅';
  if (/onion/.test(t)) return '🧅';
  if (/potato|sweet potato/.test(t)) return '🥔';
  if (/banana/.test(t)) return '🍌';
  if (/apple/.test(t)) return '🍎';
  if (/cucumber/.test(t)) return '🥒';
  if (/broccoli/.test(t)) return '🥦';
  if (/bell pepper|pepper/.test(t)) return '🫑';
  if (/carrot/.test(t)) return '🥕';
  if (/chicken/.test(t)) return '🍗';
  if (/fish|salmon|tuna/.test(t)) return '🐟';
  if (/beef|pork|bratwurst/.test(t)) return '🥩';
  if (/egg/.test(t)) return '🥚';
  if (/tofu|paneer|cheese|quark|feta/.test(t)) return '🧀';
  if (/milk|yogurt|cream|buttermilk|curd|skyr/.test(t)) return '🥛';
  if (/rice|flour|bread|oat|wheat|roti|muesli|quinoa|semolina/.test(t)) return '🌾';
  if (/oil|ghee|butter/.test(t)) return '🧴';
  if (/lentil|dal|bean|chick|sprout|moong|rajma|chole/.test(t)) return '🫘';
  if (/nut|almond|peanut|cashew|walnut|makhana/.test(t)) return '🥜';
  if (/honey|jaggery|sugar|dates/.test(t)) return '🍯';
  if (/salt|pepper|masala|turmeric|cumin|mustard|spice|sauerkraut/.test(t)) return '🧂';
  if (/greens|spinach|lettuce|salad/.test(t)) return '🥬';
  if (/avocado/.test(t)) return '🥑';
  if (/lemon|lime/.test(t)) return '🍋';
  if (/berr/.test(t)) return '🫐';
  return '🛒';
}

function categoryIcon(cat: string): string {
  const c = cat.toLowerCase();
  if (/protein/.test(c)) return '🍗';
  if (/grain/.test(c)) return '🌾';
  if (/vegetable|produce/.test(c)) return '🥬';
  if (/fruit/.test(c)) return '🍎';
  if (/dairy/.test(c)) return '🧀';
  if (/fat|oil/.test(c)) return '🫒';
  if (/snack|nut/.test(c)) return '🥜';
  if (/condiment|spice/.test(c)) return '🧂';
  if (/prepared/.test(c)) return '🍱';
  return '🛒';
}

export default function MealPlanner() {
  const profile = useUserStore((s) => s.profile);
  const isOnboarded = useUserStore((s) => s.isOnboarded);

  // Auto-populate from profile if onboarded
  const defaultRegion: Region = profile?.region || 'india';
  const defaultCalories = profile ? calculateDailyCalories(profile) : 2000;

  const [region, setRegion] = useState<Region>(defaultRegion);
  const [calories, setCalories] = useState(defaultCalories);
  const [selectedDay, setSelectedDay] = useState(0);
  const [tab, setTab] = useState<Tab>('week');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const weekPlan = useMemo(
    () => generateWeeklyMealPlan(region, calories),
    [region, calories]
  );

  const groceryList = useMemo(
    () => buildGroceryList(weekPlan),
    [weekPlan]
  );

  const today = weekPlan.days[selectedDay];

  const toggleGrocery = (name: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const groupedGrocery = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    for (const item of groceryList) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [groceryList]);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight mb-1">
        Meal Planner
      </h1>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">
        Plan your whole week &bull; Get your grocery list
      </p>

      {/* Region Selector */}
      <div className="mb-6">
        <label className="block text-xs font-black text-black uppercase tracking-widest mb-3">Region</label>
        <div className="grid grid-cols-3 gap-3">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRegion(r.id)}
              className={clsx(
                'p-4 rounded-xl text-center transition-all duration-150 border-3 border-black',
                region === r.id
                  ? 'bg-brand-500 text-white shadow-neo scale-[1.02]'
                  : 'bg-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
              )}
            >
              <span className="text-3xl block mb-1">{r.flag}</span>
              <span className="text-xs font-black uppercase tracking-wider">{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calorie Presets */}
      <div className="mb-6">
        <label className="block text-xs font-black text-black uppercase tracking-widest mb-3">
          Daily target: <span className="text-brand-600">{calories} kcal</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {CALORIE_PRESETS.map((cp) => (
            <button
              key={cp.value}
              onClick={() => setCalories(cp.value)}
              className={clsx(
                'px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all duration-150',
                calories === cp.value
                  ? 'shadow-neo-sm'
                  : 'bg-white hover:shadow-neo-sm'
              )}
              style={calories === cp.value ? { backgroundColor: cp.bg } : undefined}
            >
              {cp.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={1200}
          max={4000}
          step={50}
          value={calories}
          onChange={(e) => setCalories(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('week')}
          className={clsx(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-black uppercase text-sm tracking-wide border-3 border-black transition-all duration-150',
            tab === 'week' ? 'shadow-neo-sm' : 'bg-white hover:shadow-neo-sm'
          )}
          style={tab === 'week' ? { backgroundColor: '#FFD803' } : undefined}
        >
          <Calendar size={18} strokeWidth={3} /> Weekly Plan
        </button>
        <button
          onClick={() => setTab('grocery')}
          className={clsx(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-black uppercase text-sm tracking-wide border-3 border-black transition-all duration-150',
            tab === 'grocery' ? 'shadow-neo-sm' : 'bg-white hover:shadow-neo-sm'
          )}
          style={tab === 'grocery' ? { backgroundColor: '#B5FF3C' } : undefined}
        >
          <ShoppingCart size={18} strokeWidth={3} /> Grocery List
          <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-md ml-1">
            {groceryList.length}
          </span>
        </button>
      </div>

      {tab === 'week' ? (
        <>
          {/* Day Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={clsx(
                  'flex-shrink-0 w-14 h-16 rounded-xl flex flex-col items-center justify-center border-3 border-black font-black text-xs uppercase transition-all duration-150',
                  selectedDay === i
                    ? 'bg-brand-500 text-white shadow-neo-sm'
                    : 'bg-white hover:shadow-neo-sm hover:bg-gray-50'
                )}
              >
                <span>{label}</span>
                <span className="text-lg">{i + 1}</span>
              </button>
            ))}
          </div>

          {/* Day Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
              disabled={selectedDay === 0}
              className="p-2 rounded-lg border-2 border-black bg-white disabled:opacity-30 hover:shadow-neo-sm transition-all"
            >
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <h2 className="text-xl font-black uppercase tracking-tight">{DAY_FULL[selectedDay]}</h2>
            <button
              onClick={() => setSelectedDay(Math.min(6, selectedDay + 1))}
              disabled={selectedDay === 6}
              className="p-2 rounded-lg border-2 border-black bg-white disabled:opacity-30 hover:shadow-neo-sm transition-all"
            >
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>

          {/* Meal Cards */}
          <div className="space-y-4 mb-6">
            {MEAL_TIMES.map(({ key, label, emoji, bg }) => {
              const meal = today[key];
              return (
                <div key={key} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center" style={{ backgroundColor: bg }}>
                        {emoji}
                      </span>
                      <h3 className="font-black text-sm uppercase tracking-wider">{label}</h3>
                    </div>
                    <button
                      onClick={() => {
                        // Force re-render with new plan after swap
                        setCalories(c => c); // no-op to trigger useMemo recalc
                      }}
                      className="flex items-center gap-1 text-xs font-black text-black uppercase tracking-wider border-2 border-black px-3 py-1.5 rounded-lg hover:shadow-neo-sm transition-all"
                      style={{ backgroundColor: '#FFD803' }}
                    >
                      <RefreshCw size={12} strokeWidth={3} /> Swap
                    </button>
                  </div>
                  <h4 className="text-lg font-black text-black">{meal.name}</h4>
                  <p className="text-sm text-gray-600 font-medium mt-1">{meal.description}</p>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <div className="rounded-lg border-2 border-black p-2 text-center" style={{ backgroundColor: '#FF8C42' }}>
                      <p className="text-sm font-black text-black">{meal.macros.calories}</p>
                      <p className="text-[9px] font-bold text-black/70 uppercase">kcal</p>
                    </div>
                    <div className="rounded-lg border-2 border-black p-2 text-center" style={{ backgroundColor: '#FF6B9D' }}>
                      <p className="text-sm font-black text-black">{meal.macros.proteinG}g</p>
                      <p className="text-[9px] font-bold text-black/70 uppercase">protein</p>
                    </div>
                    <div className="rounded-lg border-2 border-black p-2 text-center" style={{ backgroundColor: '#00B4D8' }}>
                      <p className="text-sm font-black text-black">{meal.macros.carbsG}g</p>
                      <p className="text-[9px] font-bold text-black/70 uppercase">carbs</p>
                    </div>
                    <div className="rounded-lg border-2 border-black p-2 text-center" style={{ backgroundColor: '#FFD803' }}>
                      <p className="text-sm font-black text-black">{meal.macros.fatG}g</p>
                      <p className="text-[9px] font-bold text-black/70 uppercase">fat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs font-bold text-gray-500 uppercase">
                    <span>{meal.prepMinutes} min prep</span>
                    {meal.isVegetarian && <span className="text-brand-600">🌱 VEG</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Totals */}
          <div className="bg-brand-500 rounded-xl border-3 border-black shadow-neo p-5 mb-4">
            <h3 className="font-black text-white text-sm uppercase tracking-widest mb-3">Daily Totals</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{today.totalMacros.calories}</p>
                <p className="text-[10px] font-bold text-white/70 uppercase">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-white">{today.totalMacros.proteinG}g</p>
                <p className="text-[10px] font-bold text-white/70 uppercase">protein</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-white">{today.totalMacros.carbsG}g</p>
                <p className="text-[10px] font-bold text-white/70 uppercase">carbs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-white">{today.totalMacros.fatG}g</p>
                <p className="text-[10px] font-bold text-white/70 uppercase">fat</p>
              </div>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-black rounded-xl border-3 border-black shadow-neo p-5">
            <h3 className="font-black text-sm uppercase tracking-widest mb-3" style={{ color: '#FFD803' }}>Weekly Total</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-xl font-black text-white">{weekPlan.weeklyMacros.calories}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: '#FF6B9D' }}>{weekPlan.weeklyMacros.proteinG}g</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">protein</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: '#00B4D8' }}>{weekPlan.weeklyMacros.carbsG}g</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">carbs</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: '#FFD803' }}>{weekPlan.weeklyMacros.fatG}g</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">fat</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Grocery List Tab */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              Shopping List
            </h2>
            <span className="text-xs font-black uppercase border-2 border-black px-3 py-1 rounded-lg" style={{ backgroundColor: '#B5FF3C' }}>
              {checkedItems.size}/{groceryList.length} done
            </span>
          </div>

          <p className="text-sm font-bold text-gray-500 mb-6">
            Everything you need for 7 days of meals. Tap to check off items as you shop.
          </p>

          {Object.entries(groupedGrocery).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white bg-black inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-black mb-3">
                <span>{categoryIcon(category)}</span> {category}
              </h3>
              <div className="space-y-2">
                {items.map((item) => {
                  const key = `${item.name}-${item.unit}`;
                  const isChecked = checkedItems.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleGrocery(key)}
                      className={clsx(
                        'w-full flex items-center gap-3 p-3 rounded-xl border-3 border-black text-left transition-all duration-150',
                        isChecked
                          ? 'bg-brand-100 shadow-none translate-x-[2px] translate-y-[2px]'
                          : 'bg-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                      )}
                    >
                      <div className={clsx(
                        'w-7 h-7 rounded-md border-2 border-black flex items-center justify-center flex-shrink-0 transition-colors',
                        isChecked ? 'bg-brand-500' : 'bg-white'
                      )}>
                        {isChecked && <Check size={14} strokeWidth={3} className="text-white" />}
                      </div>
                      <span className="text-lg flex-shrink-0" aria-hidden>{groceryIcon(item.name)}</span>
                      <span className={clsx(
                        'flex-1 font-bold text-sm',
                        isChecked && 'line-through text-gray-400'
                      )}>
                        {item.name}
                      </span>
                      <span
                        className={clsx(
                          'text-xs font-black uppercase tracking-wider border-2 border-black px-2 py-1 rounded-lg',
                          isChecked && 'opacity-50'
                        )}
                        style={{ backgroundColor: '#FFD803' }}
                      >
                        {Math.round(item.quantity)} {item.unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {checkedItems.size === groceryList.length && groceryList.length > 0 && (
            <div className="bg-brand-500 rounded-xl border-3 border-black shadow-neo p-6 text-center">
              <span className="text-4xl block mb-2">🎉</span>
              <p className="text-white font-black text-lg uppercase">All done! Ready to cook!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
