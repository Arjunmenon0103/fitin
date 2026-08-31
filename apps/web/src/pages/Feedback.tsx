import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { getMyFeedback, submitFeedback } from '../lib/db';
import { useAuthStore } from '../store/authStore';

const CATEGORIES = [
  { id: 'bug', label: 'Bug' },
  { id: 'feature', label: 'Feature request' },
  { id: 'idea', label: 'Idea' },
  { id: 'ux', label: 'UI/UX' },
];

function currentWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = (day + 6) % 7;
  now.setDate(now.getDate() - diff);
  return now.toISOString().split('T')[0];
}

export default function Feedback() {
  const user = useAuthStore((s) => s.user);
  const [category, setCategory] = useState('feature');
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  const weekStart = useMemo(() => currentWeekStart(), []);

  const loadEntries = async () => {
    if (!user) return;
    setLoadingEntries(true);
    const data = await getMyFeedback(user.id);
    setEntries(data);
    setLoadingEntries(false);
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setNotice(null);

    const { error } = await submitFeedback({
      userId: user.id,
      userEmail: user.email || null,
      category,
      rating,
      comment,
      weekStart,
    });

    if (error) {
      setNotice({ kind: 'error', text: error });
      setSaving(false);
      return;
    }

    setComment('');
    setSaving(false);
    setNotice({ kind: 'ok', text: 'Submitted. This goes into the weekly review.' });
    await loadEntries();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Week of {weekStart}</span>
          <h1 className="mt-2 max-w-[18ch] text-[2.25rem] leading-[0.95] md:text-[3rem]">
            Tell us what is not working.
          </h1>
        </div>
        <button onClick={loadEntries} className="btn-ghost px-4 py-2.5 text-[13px]">
          <RefreshCw size={14} strokeWidth={2} /> Refresh
        </button>
      </header>

      <div
        className="rise mt-6 grid gap-4 md:grid-cols-[1fr_0.9fr] md:gap-6"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <form onSubmit={handleSubmit} className="rounded-panel bg-surface-yellow p-7 space-y-5">
          <fieldset>
            <legend className="field-label">Category</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  aria-pressed={category === item.id}
                  className={clsx('pill', category === item.id && 'pill-on')}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="fb-rating" className="field-label">
              Rating
              <span className="ml-2 font-display text-[17px] font-normal text-violet-500">
                {rating}/5
              </span>
            </label>
            <input
              id="fb-rating"
              type="range"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-1 w-full accent-violet-500"
            />
          </div>

          <div>
            <label htmlFor="fb-comment" className="field-label">
              What should improve?
            </label>
            <textarea
              id="fb-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              required
              className="field resize-none"
              placeholder="Bugs, missing features, friction points"
            />
          </div>

          {notice && (
            <p
              role="status"
              className={clsx(
                'text-[13px] font-semibold',
                notice.kind === 'error' ? 'text-wine' : 'text-ink-soft'
              )}
            >
              {notice.text}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={saving || !comment.trim()}>
            {saving ? 'Sending' : 'Send feedback'}
          </button>
        </form>

        <section className="panel">
          <h2 className="text-[1.35rem] leading-none">Your recent notes</h2>

          {loadingEntries ? (
            <div className="mt-5 space-y-3" aria-busy="true" aria-live="polite">
              <div className="h-16 rounded-tile bg-paper-grey" />
              <div className="h-16 rounded-tile bg-paper-grey" />
              <span className="sr-only">Loading your feedback</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="mt-5 rounded-tile bg-paper-warm px-5 py-10 text-center">
              <p className="text-[15px] font-bold">Nothing yet</p>
              <p className="mx-auto mt-1.5 max-w-[30ch] text-[14px] text-ink-soft">
                Your submissions show up here so you can see what you already flagged.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
              {entries.map((item) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip capitalize">{item.category}</span>
                    <span className="text-[12px] text-ink-faint">
                      {new Date(item.created_at).toLocaleDateString()} · {item.rating}/5
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{item.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
