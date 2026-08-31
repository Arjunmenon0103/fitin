import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, LinkIcon } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import { useAuthStore } from '../store/authStore';

const MIN_LENGTH = 8;

export default function ResetPassword() {
  const navigate = useNavigate();
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);
  const recoveryMode = useAuthStore((s) => s.recoveryMode);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const updatePassword = useAuthStore((s) => s.updatePassword);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reveal, setReveal] = useState(false);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  // The emailed link is exchanged for a session before we can act on it.
  const linkAccepted = recoveryMode || Boolean(user);

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= MIN_LENGTH && confirm === password;

  const validationError = useMemo(() => {
    if (!touched) return null;
    if (tooShort) return `Use at least ${MIN_LENGTH} characters.`;
    if (mismatch) return 'The two passwords do not match.';
    return null;
  }, [touched, tooShort, mismatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    clearError();
    const ok = await updatePassword(password);
    if (ok) setDone(true);
  };

  if (!initialized || (loading && !touched)) {
    return (
      <AuthShell title="One moment." intro="Checking your reset link.">
        <div className="space-y-3" aria-live="polite" aria-busy="true">
          <div className="h-4 w-1/3 rounded-full bg-paper-grey" />
          <div className="h-12 rounded-field bg-paper-grey" />
          <div className="h-4 w-1/3 rounded-full bg-paper-grey" />
          <div className="h-12 rounded-field bg-paper-grey" />
          <div className="h-12 rounded-full bg-paper-grey" />
          <span className="sr-only">Checking your reset link</span>
        </div>
      </AuthShell>
    );
  }

  if (!linkAccepted) {
    return (
      <AuthShell
        title="That link has expired."
        intro="Reset links last one hour and can only be used once. Ask for a fresh one."
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-orange">
          <LinkIcon size={22} strokeWidth={2} className="text-ink" />
        </div>
        <h2 className="mt-5 text-2xl">Link no longer valid</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          It may have expired, or it was already used to set a password.
        </p>
        <Link to="/forgot-password" className="btn-primary mt-6">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="You are all set." intro="Your password has been changed.">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-yellow">
          <KeyRound size={22} strokeWidth={2} className="text-ink" />
        </div>
        <h2 className="mt-5 text-2xl">Password updated</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          You are signed in on this device. Use the new password next time.
        </p>
        <button type="button" onClick={() => navigate('/app')} className="btn-primary mt-6">
          Go to your week
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password."
      intro="Pick something you have not used here before, then sign in and carry on."
      aside="Almost there."
    >
      <h2 className="text-2xl">New password</h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="new-password" className="field-label">
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              className="field pr-12"
              type={reveal ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-describedby="new-password-hint"
              aria-invalid={touched && tooShort}
              required
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2.5 text-ink-soft hover:bg-paper-grey hover:text-ink"
              aria-label={reveal ? 'Hide password' : 'Show password'}
            >
              {reveal ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
            </button>
          </div>
          <span id="new-password-hint" className="field-hint">
            At least {MIN_LENGTH} characters.
          </span>
        </div>

        <div>
          <label htmlFor="confirm-password" className="field-label">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            className="field"
            type={reveal ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={touched && mismatch}
            required
          />
          {validationError && <span className="field-error">{validationError}</span>}
          {error && !validationError && <span className="field-error">{error}</span>}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save new password'}
        </button>
      </form>
    </AuthShell>
  );
}
