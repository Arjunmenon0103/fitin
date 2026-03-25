import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Flame, ShieldCheck, UtensilsCrossed, Dumbbell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const SOCIAL_PROOF = [
  { label: 'Weekly plans generated', value: '4,300+' },
  { label: 'Exercise demo views', value: '21k+' },
  { label: 'Average streak days', value: '18' },
];

const HIGHLIGHTS = [
  {
    icon: Dumbbell,
    title: 'Smarter workout weeks',
    desc: 'Goal-oriented splits with exercise demo videos and progression-ready structure.',
    bg: '#00B4D8',
  },
  {
    icon: UtensilsCrossed,
    title: '7-day meal + grocery mode',
    desc: 'Tailored weekly meals, diversified recipes, and an aggregated shopping list.',
    bg: '#FF8C42',
  },
  {
    icon: BarChart3,
    title: 'Progress that stays visible',
    desc: 'Weight trends, streaks, and outcome-focused dashboards that keep users engaged.',
    bg: '#A855F7',
  },
];

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

  const ctaLabel = useMemo(() => (mode === 'login' ? 'Log In' : 'Create Account'), [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const ok = mode === 'login' ? await signIn(email, password) : await signUp(email, password);
    if (ok) navigate('/app');
  };

  if (user) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-8 md:py-10" style={{ backgroundColor: '#FFFDF7' }}>
        <div className="max-w-4xl mx-auto card" style={{ backgroundColor: '#B5FF3C' }}>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-black tracking-tight mb-3">You are in.</h1>
          <p className="font-bold text-black mb-5 uppercase tracking-wide">Continue building your fit week now.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/app" className="btn-primary inline-flex items-center gap-2">
              Enter App <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => navigate('/app')}
              className="btn-secondary"
            >
              Go To Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10" style={{ backgroundColor: '#FFFDF7' }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <section className="space-y-5">
          <div className="inline-flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl border-[3px] border-black bg-brand-500 flex items-center justify-center" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
              <Flame className="text-white" size={30} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-black">
              Fit<span className="text-brand-500">In</span>
            </h1>
          </div>

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black max-w-2xl">
            Personalized workouts + meals that make users come back every day.
          </h2>

          <p className="text-sm md:text-base font-bold text-gray-700 max-w-2xl uppercase tracking-wide">
            Try the same app experience your users get after login: tailored training, weekly grocery plans, and progress tracking.
          </p>

          <div className="grid sm:grid-cols-3 gap-3">
            {SOCIAL_PROOF.map((stat) => (
              <div key={stat.label} className="card" style={{ backgroundColor: '#FFD803' }}>
                <p className="text-2xl font-black text-black">{stat.value}</p>
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-700">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc, bg }) => (
              <article key={title} className="card" style={{ backgroundColor: '#fff' }}>
                <div className="inline-flex p-2 rounded-lg border-[3px] border-black mb-3" style={{ backgroundColor: bg, boxShadow: '2px 2px 0px 0px #000' }}>
                  <Icon size={20} className="text-black" strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight text-black mb-1">{title}</h3>
                <p className="text-xs font-bold text-gray-600">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card" style={{ backgroundColor: '#F5F5F5' }}>
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-lg border-2 border-black" style={{ backgroundColor: '#B5FF3C' }}>
            <ShieldCheck size={16} className="text-black" />
            <span className="text-xs font-black uppercase tracking-widest text-black">Secure Access</span>
          </div>

          <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-1">{ctaLabel}</h3>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-4">
            {mode === 'login'
              ? 'Welcome back. Resume your plan instantly.'
              : 'Create your free account and unlock personalized planning.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="neo-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              required
            />
            <input
              className="neo-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              minLength={6}
              required
            />

            {error && (
              <div className="rounded-xl border-[3px] border-black px-3 py-2" style={{ backgroundColor: '#FFB4A2' }}>
                <p className="text-xs font-black uppercase tracking-wide text-black">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Please wait...' : ctaLabel}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                clearError();
                setMode('login');
              }}
              className="text-xs font-black uppercase text-black underline"
            >
              I already have an account
            </button>
            <button
              onClick={() => {
                clearError();
                setMode('signup');
              }}
              className="text-xs font-black uppercase text-black underline"
            >
              New? create account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
