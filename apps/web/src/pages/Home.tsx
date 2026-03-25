import { Link } from 'react-router-dom';
import { Dumbbell, UtensilsCrossed, LayoutDashboard, User, Flame, ArrowRight } from 'lucide-react';
import { useUserStore } from '../store/userStore';

const FEATURES = [
  {
    to: '/workout',
    icon: Dumbbell,
    title: 'Workout Plan',
    desc: 'Structured weekly splits with animated exercise demos',
    bg: 'bg-[#00B4D8]',
    text: 'text-white',
  },
  {
    to: '/meals',
    icon: UtensilsCrossed,
    title: 'Meal Planner',
    desc: 'Regional meals + full week grocery list',
    bg: 'bg-[#FF8C42]',
    text: 'text-white',
  },
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard',
    desc: 'Track your weight daily and see progress charts',
    bg: 'bg-[#A855F7]',
    text: 'text-white',
  },
  {
    to: '/profile',
    icon: User,
    title: 'Profile',
    desc: 'Set your goals, activity level & region',
    bg: 'bg-[#B5FF3C]',
    text: 'text-black',
  },
];

export default function Home() {
  const { isOnboarded, profile } = useUserStore();

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-brand-500 border-[3px] border-black flex items-center justify-center" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
            <Flame className="text-white" size={32} />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-black uppercase tracking-tighter">
            Fit<span className="text-brand-500">In</span>
          </h1>
        </div>
        <p className="text-base font-bold text-gray-500 max-w-md mx-auto uppercase tracking-wide">
          Personalized fitness and meal planning built for consistency.
        </p>
      </div>

      {/* Onboarding CTA */}
      {!isOnboarded && (
        <Link
          to="/profile"
          className="block mb-8 p-6 rounded-xl bg-brand-500 text-white border-[3px] border-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px]"
          style={{ boxShadow: '6px 6px 0px 0px #000' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-1">Get Started</h2>
              <p className="text-brand-100 text-sm font-bold">
                Set up your profile to unlock personalized plans
              </p>
            </div>
            <ArrowRight size={28} strokeWidth={3} />
          </div>
        </Link>
      )}

      {/* Welcome back */}
      {isOnboarded && profile && (
        <div className="mb-8 card" style={{ backgroundColor: '#FFD803' }}>
          <h2 className="text-xl font-black text-black mb-1 uppercase">
            Welcome back, {profile.name}! 👋
          </h2>
          <p className="text-gray-800 text-sm font-bold uppercase tracking-wide">
            Goal: {profile.goal.replace('_', ' ')} • {profile.region.toUpperCase()} •{' '}
            {profile.activityLevel.replace('_', ' ')} activity
          </p>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map(({ to, icon: Icon, title, desc, bg, text }) => (
          <Link
            key={to}
            to={to}
            className="card group"
          >
            <div className={`inline-flex p-3 rounded-xl border-[3px] border-black ${bg} ${text} mb-3`} style={{ boxShadow: '2px 2px 0px 0px #000' }}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-black mb-1 uppercase tracking-tight group-hover:text-brand-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm font-medium text-gray-600">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">FitIn</p>
      </div>
    </div>
  );
}
