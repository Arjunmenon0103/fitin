import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<() => void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
  setIsAdmin: (isAdmin: boolean) => void;
  clearError: () => void;
}

function setAuthState(set: (partial: Partial<AuthState>) => void, session: Session | null) {
  set({
    session,
    user: session?.user ?? null,
    isAdmin: false,
    loading: false,
    initialized: true,
  });
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAdmin: false,
  initialized: false,
  loading: true,
  error: null,

  refreshAdminStatus: async () => {
    if (!hasSupabaseConfig || !supabase) {
      set({ isAdmin: false });
      return;
    }

    const { data, error } = await supabase.rpc('is_admin_user');
    if (error) {
      set({ isAdmin: false });
      return;
    }

    set({ isAdmin: Boolean(data) });
  },

  setIsAdmin: (isAdmin) => set({ isAdmin }),

  initialize: async () => {
    if (!hasSupabaseConfig || !supabase) {
      set({
        initialized: true,
        loading: false,
        error: 'Supabase is not configured. Add env vars to enable login.',
      });
      return () => {};
    }

    const client = supabase;

    set({ loading: true });

    const { data, error } = await client.auth.getSession();
    if (error) {
      set({
        error: error.message,
        initialized: true,
        loading: false,
      });
    } else {
      setAuthState(set, data.session);
      if (data.session?.user) {
        const { data: isAdminData } = await client.rpc('is_admin_user');
        set({ isAdmin: Boolean(isAdminData) });
      }
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      setAuthState(set, session);
      if (!session) return;
      const { data: isAdminData } = await client.rpc('is_admin_user');
      set({ isAdmin: Boolean(isAdminData) });
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signIn: async (email, password) => {
    if (!hasSupabaseConfig || !supabase) {
      set({ error: 'Supabase is not configured. Add env vars to enable login.' });
      return false;
    }

    const client = supabase;

    set({ loading: true, error: null });
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }

    setAuthState(set, data.session);
    const { data: isAdminData } = await client.rpc('is_admin_user');
    set({ isAdmin: Boolean(isAdminData) });
    return true;
  },

  signUp: async (email, password) => {
    if (!hasSupabaseConfig || !supabase) {
      set({ error: 'Supabase is not configured. Add env vars to enable login.' });
      return false;
    }

    const client = supabase;

    set({ loading: true, error: null });
    const { data, error } = await client.auth.signUp({ email, password });

    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }

    setAuthState(set, data.session ?? null);
    if (!data.session) {
      set({
        loading: false,
        initialized: true,
        error: 'Signup successful. Please verify your email and then log in.',
      });
    }

    return true;
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut();
    set({ user: null, session: null, isAdmin: false, loading: false, initialized: true, error: null });
  },

  clearError: () => set({ error: null }),
}));

export function useIsAdmin(): boolean {
  return useAuthStore((state) => state.isAdmin);
}
