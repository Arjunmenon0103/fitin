import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';
import Wordmark from '../components/brand/Wordmark';
import { useAuthStore } from '../store/authStore';

export default function PublicHome() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const ctaLabel = useMemo(() => (mode === 'login' ? 'Sign in' : 'Create account'), [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const ok = mode === 'login' ? await signIn(email, password) : await signUp(email, password);
    if (ok) navigate('/app');
  };

  const switchMode = (next: 'login' | 'signup') => {
    clearError();
    setMode(next);
  };

  if (user) {
    return (
      <div className="min-h-[100dvh] bg-paper px-4 py-6 md:px-8 md:py-10">
        <div className="rise mx-auto max-w-3xl rounded-panel bg-surface-yellow p-8 md:p-12">
          <Wordmark className="text-2xl" />
          <h1 className="mt-10 text-[2.75rem] leading-[0.95] md:text-[4rem]">You are already in.</h1>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ink-soft">
            Your plan is where you left it.
          </p>
          <Link to="/app" className="btn-primary mt-8">
            Continue <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-paper">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Wordmark className="text-[22px]" />
        <a
          href="#access"
          className="text-sm font-bold text-ink-soft transition-colors hover:text-ink"
        >
          Sign in
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
        {/* Hero: editorial panel left, the account form is the CTA on the right. */}
        <section className="grid gap-4 md:grid-cols-[1.15fr_0.85fr] md:gap-6">
          <div className="rise flex flex-col justify-between rounded-panel bg-surface-yellow p-8 md:p-12">
            <div>
              <h1 className="max-w-[14ch] text-[2.75rem] leading-[0.95] md:text-[4.25rem]">
                Your training week, already planned.
              </h1>
              <p className="mt-6 max-w-[40ch] text-[16px] leading-relaxed text-ink-soft">
                Workouts that progress, meals with a grocery list, and a weight chart that keeps
                you honest.
              </p>
            </div>
            {/* TODO: hero photograph, 4:5 portrait, ~900x1125. Kitchen counter or
                gym floor, warm daylight, no stock-photo gym posing. */}
            <p className="note mt-10">Free, and it stays free.</p>
          </div>

          <div
            id="access"
            className="rise panel self-start scroll-mt-20 md:p-8"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            <div
              className="flex gap-1 rounded-full bg-paper-grey p-1"
              role="tablist"
              aria-label="Account"
            >
              {(['login', 'signup'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={mode === value}
                  onClick={() => switchMode(value)}
                  className={clsx(
                    'flex-1 rounded-full px-4 py-2 text-[13px] font-bold transition-colors',
                    mode === value ? 'bg-violet-500 text-white' : 'text-ink-soft hover:text-ink'
                  )}
                >
                  {value === 'login' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>

            <h2 className="mt-6 text-2xl">
              {mode === 'login' ? 'Welcome back.' : 'Start this week.'}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              {mode === 'login'
                ? 'Pick up the plan you were already on.'
                : 'An email and a password is all it takes.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              <div>
                <label htmlFor="account-email" className="field-label">
                  Email address
                </label>
                <input
                  id="account-email"
                  className="field"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="account-password" className="field-label">
                  Password
                </label>
                <input
                  id="account-password"
                  className="field"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                {mode === 'signup' && (
                  <span className="field-hint">At least 6 characters.</span>
                )}
                {error && <span className="field-error">{error}</span>}
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'One moment...' : ctaLabel}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[14px]">
              <Link
                to="/forgot-password"
                className="font-bold text-violet-500 underline underline-offset-2"
              >
                Forgot your password?
              </Link>
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="font-semibold text-ink-soft hover:text-ink"
              >
                {mode === 'login' ? 'No account yet?' : 'Already signed up?'}
              </button>
            </div>
          </div>
        </section>

        {/* Asymmetric grid: one tall cell plus two stacked. Three items, three cells. */}
        <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-[1fr_1fr] md:gap-6">
          <article className="rise flex flex-col justify-between rounded-panel bg-surface-blue p-8 md:p-10">
            <Dumbbell size={28} strokeWidth={1.75} className="text-ink" />
            <div className="mt-16 md:mt-24">
              <h2 className="text-[2rem] leading-[0.95] md:text-[2.5rem]">
                A split that actually moves forward.
              </h2>
              <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">
                Push pull legs, upper lower, full body or a bro split. Every lift comes with a
                demo video and a sets and reps target.
              </p>
            </div>
          </article>

          <div className="grid gap-4 md:gap-6">
            <article
              className="rise rounded-panel bg-surface-pink p-8 md:p-10"
              style={{ '--i': 1 } as React.CSSProperties}
            >
              <UtensilsCrossed size={28} strokeWidth={1.75} className="text-ink" />
              <h2 className="mt-8 text-[1.75rem] leading-[0.95] md:text-[2rem]">
                Seven days of meals, one shopping list.
              </h2>
              <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-ink-soft">
                Indian, German or American cooking, built to your calorie target. The grocery
                list adds itself up.
              </p>
            </article>

            <article
              className="rise rounded-panel bg-surface-periwinkle p-8 md:p-10"
              style={{ '--i': 2 } as React.CSSProperties}
            >
              <BarChart3 size={28} strokeWidth={1.75} className="text-ink" />
              <h2 className="mt-8 text-[1.75rem] leading-[0.95] md:text-[2rem]">
                Proof you are getting somewhere.
              </h2>
              <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-ink-soft">
                Log your weight, watch the line, keep the streak.
              </p>
            </article>
          </div>
        </section>

        {/* Full-width band. Different layout family, closes the page on one idea. */}
        <section className="rise mt-4 rounded-panel bg-ink px-8 py-16 text-center md:mt-6 md:px-12 md:py-24">
          <h2 className="mx-auto max-w-[20ch] text-[2rem] leading-[1] text-white md:text-[3.25rem]">
            The plan you keep is the one that works.
          </h2>
          <a href="#access" className="btn-secondary mt-8">
            Create your account <ArrowRight size={16} strokeWidth={2.5} />
          </a>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6">
          <Wordmark className="text-lg" />
          <p className="text-[13px] text-ink-faint">Fitness and meal planning, free to use.</p>
        </div>
      </footer>
    </div>
  );
}
