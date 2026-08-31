import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute() {
  const location = useLocation();
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper px-4">
        <div className="w-full max-w-sm space-y-3" aria-busy="true" aria-live="polite">
          <div className="h-10 w-2/3 rounded-full bg-paper-grey" />
          <div className="h-32 rounded-panel bg-paper-grey" />
          <div className="h-32 rounded-panel bg-paper-grey" />
          <span className="sr-only">Loading FitIn</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
