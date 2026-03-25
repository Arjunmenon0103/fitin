import { NavLink } from 'react-router-dom';
import { Dumbbell, UtensilsCrossed, LayoutDashboard, User, Home, MessageSquare, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { useIsAdmin } from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/app', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/meals', icon: UtensilsCrossed, label: 'Meals' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const isAdmin = useIsAdmin();
  const navItems = isAdmin ? [...NAV_ITEMS, { to: '/admin', icon: Shield, label: 'Admin' }] : NAV_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neo-yellow border-t-3 border-black md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-black uppercase tracking-wider transition-all',
                isActive ? 'text-black' : 'text-gray-600 hover:text-black'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={clsx('p-1 rounded-lg', isActive && 'bg-white border-2 border-black shadow-neo-sm')}>
                  <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
