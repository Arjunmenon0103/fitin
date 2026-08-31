import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { loadProfile, loadWeightEntries } from '../../lib/db';
import { useUserStore } from '../../store/userStore';

const RESET_PATH = '/reset-password';

export default function AuthBootstrap() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const recoveryMode = useAuthStore((s) => s.recoveryMode);
  const setProfile = useUserStore((s) => s.setProfile);
  const setWeightEntries = useUserStore((s) => s.setWeightEntries);
  const resetUserStore = useUserStore((s) => s.reset);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const run = async () => {
      cleanup = await initialize();
    };

    run();

    return () => {
      if (cleanup) cleanup();
    };
  }, [initialize]);

  /*
   * Supabase only honours a redirectTo that is on the project's allowlist; any
   * other value silently falls back to the Site URL. So a recovery link can land
   * on any route, where the session just signs the user in and the reason they
   * clicked disappears. Wherever it lands, send them to the reset screen.
   */
  useEffect(() => {
    if (recoveryMode && pathname !== RESET_PATH) {
      navigate(RESET_PATH, { replace: true });
    }
  }, [recoveryMode, pathname, navigate]);

  useEffect(() => {
    const hydrate = async () => {
      if (!user) {
        resetUserStore();
        return;
      }

      const [profile, weights] = await Promise.all([
        loadProfile(user.id),
        loadWeightEntries(user.id),
      ]);

      if (profile) setProfile(profile);
      setWeightEntries(weights);
    };

    hydrate();
  }, [user, setProfile, setWeightEntries, resetUserStore]);

  return null;
}
