import { Link } from 'react-router-dom';
import { Dumbbell, UtensilsCrossed, LayoutDashboard, User, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useUserStore } from '../store/userStore';

const DESTINATIONS = [
  {
    to: '/workout',
    icon: Dumbbell,
    title: 'Workout plan',
    desc: 'Your split for the week, with a demo for every lift.',
    fill: 'bg-surface-blue',
  },
  {
    to: '/meals',
    icon: UtensilsCrossed,
    title: 'Meal planner',
    desc: 'Seven days of food and the grocery list that goes with it.',
    fill: 'bg-surface-pink',
  },
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    title: 'Progress',
    desc: 'Weight, trend and streak in one chart.',
    fill: 'bg-surface-periwinkle',
  },
  {
    to: '/profile',
    icon: User,
    title: 'Profile',
    desc: 'Goal, activity level and region.',
    fill: 'bg-surface-orange',
  },
];

export default function Home() {
  const { isOnboarded, profile } = useUserStore();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      {!isOnboarded ? (
        <Link
          to="/profile"
          className="rise group flex flex-col justify-between rounded-panel bg-surface-yellow p-8 transition-shadow hover:shadow-lift md:p-12"
        >
          <h1 className="max-w-[16ch] text-[2.25rem] leading-[0.95] md:text-[3.25rem]">
            Tell us who we are planning for.
          </h1>
          <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-ink-soft">
            Four short steps. After that your workouts and meals are built around your goal.
          </p>
          <span className="btn-primary mt-8 self-start">
            Set up your profile <ArrowRight size={16} strokeWidth={2.5} />
          </span>
        </Link>
      ) : (
        <div className="rise rounded-panel bg-surface-yellow p-8 md:p-12">
          <h1 className="max-w-[16ch] text-[2.25rem] leading-[0.95] md:text-[3.25rem]">
            Welcome back, {profile?.name}.
          </h1>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="chip-outline capitalize">{profile?.goal.replace('_', ' ')}</span>
            <span className="chip-outline capitalize">
              {profile?.activityLevel.replace('_', ' ')}
            </span>
            <span className="chip-outline capitalize">{profile?.region}</span>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:mt-6 md:gap-6">
        {DESTINATIONS.map(({ to, icon: Icon, title, desc, fill }, i) => (
          <Link
            key={to}
            to={to}
            className={`rise group rounded-panel ${fill} p-7 transition-shadow hover:shadow-lift`}
            style={{ '--i': i + 1 } as React.CSSProperties}
          >
            <div className="flex items-start justify-between">
              <Icon size={24} strokeWidth={1.75} className="text-ink" />
              <ArrowUpRight
                size={20}
                strokeWidth={2}
                className="text-ink-soft transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
            <h2 className="mt-10 text-[1.5rem] leading-[1]">{title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
