import { NavLink } from 'react-router-dom';
import {
  Dumbbell,
  UtensilsCrossed,
  LayoutDashboard,
  User,
  Home,
  MessageSquare,
  Shield,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import Wordmark from '../brand/Wordmark';
import { useIsAdmin, useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/app', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workout plan' },
  { to: '/meals', icon: UtensilsCrossed, label: 'Meal planner' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
];

export default function Sidebar() {
  const isAdmin = useIsAdmin();
  const signOut = useAuthStore((s) => s.signOut);
  const navItems = isAdmin
    ? [...NAV_ITEMS, { to: '/admin', icon: Shield, label: 'Admin' }]
    : NAV_ITEMS;

  return (
    <aside className="fixed left-0 top-0 hidden h-[100dvh] w-64 flex-col border-r border-ink/10 bg-paper md:flex">
      <div className="flex h-16 items-center px-6">
        <Wordmark className="text-[22px]" />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-bold transition-colors',
                isActive
                  ? 'bg-violet-500 text-white'
                  : 'text-ink-soft hover:bg-paper-grey hover:text-ink'
              )
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink/10 p-3">
        <button onClick={signOut} className="btn-ghost w-full py-2.5 text-[13px]">
          <LogOut size={15} strokeWidth={2} /> Sign out
        </button>
      </div>
    </aside>
  );
}
