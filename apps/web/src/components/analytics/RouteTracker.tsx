import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackView } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';

export default function RouteTracker() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const lastTrackedRef = useRef<string>('');

  useEffect(() => {
    if (!user) return;
    const currentPath = `${location.pathname}${location.search}`;
    if (currentPath === lastTrackedRef.current) return;

    lastTrackedRef.current = currentPath;
    trackView(currentPath, user.id, user.email || null);
  }, [location.pathname, location.search, user]);

  return null;
}
