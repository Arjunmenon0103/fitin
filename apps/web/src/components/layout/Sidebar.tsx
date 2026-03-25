import { NavLink } from 'react-router-dom';
import { Dumbbell, UtensilsCrossed, LayoutDashboard, User, Home, Flame, MessageSquare, Shield, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useIsAdmin, useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/app', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workout Plan' },
  { to: '/meals', icon: UtensilsCrossed, label: 'Meal Planner' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
];

export default function Sidebar() {
  const isAdmin = useIsAdmin();
  const signOut = useAuthStore((s) => s.signOut);
  const navItems = isAdmin ? [...NAV_ITEMS, { to: '/admin', icon: Shield, label: 'Admin' }] : NAV_ITEMS;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-neo-yellow border-r-3 border-black fixed left-0 top-0">
      <div className="flex items-center gap-3 px-6 h-16 border-b-3 border-black bg-brand-500">
        <Flame className="text-white" size={28} />
        <span className="text-2xl font-black text-white tracking-tight">
          Fit<span className="text-black">In</span>
        </span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-150',
                isActive
                  ? 'bg-white text-black border-3 border-black shadow-neo-sm'
                  : 'text-gray-800 hover:bg-white/60 hover:border-2 hover:border-black/30'
              )
            }
          >
            <Icon size={20} strokeWidth={2.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t-3 border-black space-y-3">
        <button
          onClick={signOut}
          className="w-full px-3 py-2 rounded-lg border-[3px] border-black bg-white text-black font-black uppercase text-xs tracking-wider inline-flex items-center justify-center gap-2"
          style={{ boxShadow: '2px 2px 0px 0px #000' }}
        >
          <LogOut size={14} /> Logout
        </button>
        <p className="text-xs font-bold text-gray-700 uppercase">FitIn</p>
      </div>
    </aside>
  );
}
