import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  Sunrise,
  Sun,
  Apple,
  Moon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { generateWeeklyMealPlan, buildGroceryList, calculateDailyCalories } from '@fitin/core';
import type { Region, MealTime, GroceryItem } from '@fitin/core';
import { useUserStore } from '../store/userStore';

const REGIONS: { id: Region; name: string }[] = [
  { id: 'india', name: 'India' },
  { id: 'germany', name: 'Germany' },
  { id: 'usa', name: 'USA' },
];

/* Meal-time fills are categorical, never a call to action. */
const MEAL_TIMES: { key: MealTime; label: string; icon: LucideIcon; fill: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: Sunrise, fill: 'bg-surface-gold' },
  { key: 'lunch', label: 'Lunch', icon: Sun, fill: 'bg-surface-orange' },
  { key: 'snack', label: 'Snack', icon: Apple, fill: 'bg-surface-cyan' },
  { key: 'dinner', label: 'Dinner', icon: Moon, fill: 'bg-surface-periwinkle' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CALORIE_PRESETS = [
  { value: 1500, label: 'Cut' },
  { value: 2000, label: 'Maintain' },
  { value: 2500, label: 'Bulk' },
  { value: 3000, label: 'Hard bulk' },
];

type Tab = 'week' | 'grocery';

export default function MealPlanner() {
  const profile = useUserStore((s) => s.profile);

  // Auto-populate from profile if onboarded.
  const defaultRegion: Region = profile?.region || 'india';
  const defaultCalories = profile ? calculateDailyCalories(profile) : 2000;

  const [region, setRegion] = useState<Region>(defaultRegion);
  const [calories, setCalories] = useState(defaultCalories);
  const [selectedDay, setSelectedDay] = useState(0);
  const [tab, setTab] = useState<Tab>('week');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const weekPlan = useMemo(() => generateWeeklyMealPlan(region, calories), [region, calories]);
  const groceryList = useMemo(() => buildGroceryList(weekPlan), [weekPlan]);

  const today = weekPlan.days[selectedDay];

  const toggleGrocery = (name: string) => {
    setCheckedItems((prev) => {
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

  const allChecked = groceryList.length > 0 && checkedItems.size === groceryList.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <header className="rise">
        <span className="eyebrow">Seven days</span>
        <h1 className="mt-2 max-w-[18ch] text-[2.25rem] leading-[0.95] md:text-[3rem]">
          A week of food, and the list to shop it.
        </h1>
      </header>

      {/* Controls: region and calorie target. */}
      <div
        className="rise mt-6 grid gap-4 rounded-panel bg-paper-warm p-5 md:grid-cols-2 md:gap-8 md:p-6"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <fieldset>
          <legend className="field-label">Cuisine</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRegion(r.id)}
                aria-pressed={region === r.id}
                className={clsx('pill', region === r.id && 'pill-on')}
              >
                {r.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="calorie-target" className="field-label">
            Daily target
            <span className="ml-2 font-display text-[17px] font-normal text-violet-500">
              {calories} kcal
            </span>
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {CALORIE_PRESETS.map((cp) => (
              <button
                key={cp.value}
                onClick={() => setCalories(cp.value)}
                aria-pressed={calories === cp.value}
                className={clsx('pill', calories === cp.value && 'pill-on')}
              >
                {cp.label}
              </button>
            ))}
          </div>
          <input
            id="calorie-target"
            type="range"
            min={1200}
            max={4000}
            step={50}
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="mt-4 w-full accent-violet-500"
          />
        </div>
      </div>

      <div
        className="rise mt-5 flex gap-2 border-b border-ink/10 pb-3"
        role="tablist"
        aria-label="Meal plan views"
        style={{ '--i': 2 } as React.CSSProperties}
      >
        <button
          role="tab"
          aria-selected={tab === 'week'}
          onClick={() => setTab('week')}
          className={clsx('pill', tab === 'week' && 'pill-on')}
        >
          <CalendarDays size={15} strokeWidth={2} /> Weekly plan
        </button>
        <button
          role="tab"
          aria-selected={tab === 'grocery'}
          onClick={() => setTab('grocery')}
          className={clsx('pill', tab === 'grocery' && 'pill-on')}
        >
          <ShoppingCart size={15} strokeWidth={2} /> Grocery list
          <span className={clsx('font-normal', tab === 'grocery' ? 'text-violet-100' : 'text-ink-faint')}>
            {groceryList.length}
          </span>
        </button>
      </div>

      {tab === 'week' ? (
        <>
          <div className="scrollbar-hide mt-5 flex gap-2 overflow-x-auto pb-1">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                aria-pressed={selectedDay === i}
                className={clsx('pill w-[4.5rem] flex-shrink-0 justify-center', selectedDay === i && 'pill-on')}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
              disabled={selectedDay === 0}
              aria-label="Previous day"
              className="rounded-full border border-ink/20 p-2.5 text-ink transition-colors hover:bg-paper-grey disabled:opacity-30"
            >
              <ChevronLeft size={17} strokeWidth={2} />
            </button>
            <h2 className="text-[1.5rem] leading-none">{DAY_FULL[selectedDay]}</h2>
            <button
              onClick={() => setSelectedDay(Math.min(6, selectedDay + 1))}
              disabled={selectedDay === 6}
              aria-label="Next day"
              className="rounded-full border border-ink/20 p-2.5 text-ink transition-colors hover:bg-paper-grey disabled:opacity-30"
            >
              <ChevronRight size={17} strokeWidth={2} />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {MEAL_TIMES.map(({ key, label, icon: Icon, fill }) => {
              const meal = today[key];
              return (
                <article key={key} className="panel">
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-ink',
                        fill
                      )}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <span className="eyebrow">{label}</span>
                    <span className="ml-auto text-[13px] text-ink-soft">
                      {meal.prepMinutes} min prep
                      {meal.isVegetarian && <span className="ml-2 chip-outline">Veg</span>}
                    </span>
                  </div>

                  <h3 className="mt-4 text-[1.35rem] leading-tight">{meal.name}</h3>
                  <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-ink-soft">
                    {meal.description}
                  </p>

                  <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-ink/10 pt-4">
                    {[
                      { label: 'kcal', value: meal.macros.calories },
                      { label: 'protein', value: `${meal.macros.proteinG}g` },
                      { label: 'carbs', value: `${meal.macros.carbsG}g` },
                      { label: 'fat', value: `${meal.macros.fatG}g` },
                    ].map((m) => (
                      <div key={m.label}>
                        <dd className="font-display text-[19px] leading-none">{m.value}</dd>
                        <dt className="mt-1 text-[11px] font-semibold text-ink-faint">{m.label}</dt>
                      </div>
                    ))}
                  </dl>
                </article>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-panel bg-surface-yellow p-7">
              <span className="eyebrow">{DAY_FULL[selectedDay]} total</span>
              <dl className="mt-5 grid grid-cols-4 gap-2">
                {[
                  { label: 'kcal', value: today.totalMacros.calories },
                  { label: 'protein', value: `${today.totalMacros.proteinG}g` },
                  { label: 'carbs', value: `${today.totalMacros.carbsG}g` },
                  { label: 'fat', value: `${today.totalMacros.fatG}g` },
                ].map((m) => (
                  <div key={m.label}>
                    <dd className="font-display text-[22px] leading-none">{m.value}</dd>
                    <dt className="mt-1 text-[11px] font-semibold text-ink-soft">{m.label}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-panel bg-ink p-7 text-white">
              <span className="eyebrow text-white/60">Week total</span>
              <dl className="mt-5 grid grid-cols-4 gap-2">
                {[
                  { label: 'kcal', value: weekPlan.weeklyMacros.calories },
                  { label: 'protein', value: `${weekPlan.weeklyMacros.proteinG}g` },
                  { label: 'carbs', value: `${weekPlan.weeklyMacros.carbsG}g` },
                  { label: 'fat', value: `${weekPlan.weeklyMacros.fatG}g` },
                ].map((m) => (
                  <div key={m.label}>
                    <dd className="font-display text-[22px] leading-none">{m.value}</dd>
                    <dt className="mt-1 text-[11px] font-semibold text-white/60">{m.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[1.5rem] leading-none">Shopping list</h2>
              <p className="mt-2 max-w-[52ch] text-[14px] text-ink-soft">
                Everything for seven days of meals. Tap an item to check it off as you shop.
              </p>
            </div>
            <span className="chip-outline">
              {checkedItems.size} of {groceryList.length} done
            </span>
          </div>

          {allChecked && (
            <div
              className="mt-5 rounded-panel bg-surface-yellow px-6 py-8 text-center"
              role="status"
            >
              <p className="font-display text-[1.5rem] leading-none">List cleared</p>
              <p className="mt-2 text-[14px] text-ink-soft">Everything is in the basket. Go cook.</p>
            </div>
          )}

          <div className="mt-6 space-y-8">
            {Object.entries(groupedGrocery).map(([category, items]) => (
              <section key={category}>
                <h3 className="eyebrow">{category}</h3>
                <ul className="mt-2 divide-y divide-ink/10 border-t border-ink/10">
                  {items.map((item) => {
                    const key = `${item.name}-${item.unit}`;
                    const isChecked = checkedItems.has(key);
                    return (
                      <li key={key}>
                        <button
                          onClick={() => toggleGrocery(key)}
                          aria-pressed={isChecked}
                          className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-paper-warm"
                        >
                          <span
                            className={clsx(
                              'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors',
                              isChecked
                                ? 'border-violet-500 bg-violet-500 text-white'
                                : 'border-ink/25 bg-paper'
                            )}
                          >
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </span>
                          <span
                            className={clsx(
                              'flex-1 text-[15px] font-semibold',
                              isChecked && 'text-ink-faint line-through'
                            )}
                          >
                            {item.name}
                          </span>
                          <span
                            className={clsx(
                              'text-[13px] font-bold tabular-nums',
                              isChecked ? 'text-ink-faint' : 'text-ink-soft'
                            )}
                          >
                            {Math.round(item.quantity)} {item.unit}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
