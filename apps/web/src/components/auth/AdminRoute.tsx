import { Navigate, Outlet } from 'react-router-dom';
import { useIsAdmin } from '../../store/authStore';

export default function AdminRoute() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
