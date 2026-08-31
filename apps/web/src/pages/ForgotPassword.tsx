import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import { useAuthStore } from '../store/authStore';

export default function ForgotPassword() {
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const ok = await sendPasswordReset(email.trim());
    if (ok) setSent(true);
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox."
        intro="The link is good for one hour. Open it on this device so we can sign you straight back in."
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-yellow">
          <MailCheck size={22} strokeWidth={2} className="text-ink" />
        </div>
        <h2 className="mt-5 text-2xl">Link sent</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          If an account exists for <span className="font-bold text-ink">{email}</span>, a reset
          link is on its way. Nothing after a minute or two? Check spam, then try again.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/" className="btn-primary">
            Back to sign in
          </Link>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              clearError();
            }}
            className="btn-ghost"
          >
            Use another email
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      intro="Give us the email you signed up with and we will send a link to set a new one."
      aside="Happens to everyone."
    >
      <h2 className="text-2xl">Reset your password</h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="reset-email" className="field-label">
            Email address
          </label>
          <input
            id="reset-email"
            className="field"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-describedby="reset-email-hint"
            aria-invalid={Boolean(error)}
            required
          />
          <span id="reset-email-hint" className="field-hint">
            We will only email you if this address has an account.
          </span>
          {error && <span className="field-error">{error}</span>}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading || !email.trim()}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-5 text-[14px] text-ink-soft">
        Remembered it?{' '}
        <Link to="/" className="font-bold text-violet-500 underline underline-offset-2">
          Sign in instead
        </Link>
      </p>
    </AuthShell>
  );
}
