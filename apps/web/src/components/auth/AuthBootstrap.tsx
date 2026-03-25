import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { loadProfile, loadWeightEntries } from '../../lib/db';
import { useUserStore } from '../../store/userStore';

export default function AuthBootstrap() {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
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
