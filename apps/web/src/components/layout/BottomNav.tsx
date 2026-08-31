import { NavLink } from 'react-router-dom';
import {
  Dumbbell,
  UtensilsCrossed,
  LayoutDashboard,
  User,
  Home,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useIsAdmin } from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/app', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/meals', icon: UtensilsCrossed, label: 'Meals' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Progress' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const isAdmin = useIsAdmin();
  const navItems = isAdmin
    ? [...NAV_ITEMS, { to: '/admin', icon: Shield, label: 'Admin' }]
    : NAV_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/10 bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className="flex h-full w-full flex-col items-center justify-center gap-1"
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                    isActive ? 'bg-violet-500 text-white' : 'text-ink-soft'
                  )}
                >
                  <Icon size={17} strokeWidth={2} />
                </span>
                <span
                  className={clsx(
                    'text-[10px] font-bold',
                    isActive ? 'text-ink' : 'text-ink-faint'
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
