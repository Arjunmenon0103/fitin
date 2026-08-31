import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import WorkoutWeek from './pages/WorkoutWeek';
import MealPlanner from './pages/MealPlanner';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PublicHome from './pages/PublicHome';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';
import AuthBootstrap from './components/auth/AuthBootstrap';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import RouteTracker from './components/analytics/RouteTracker';

export default function App() {
  return (
    <>
      <AuthBootstrap />
      <RouteTracker />

      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/app" element={<Home />} />
            <Route path="/workout" element={<WorkoutWeek />} />
            <Route path="/meals" element={<MealPlanner />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feedback" element={<Feedback />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
