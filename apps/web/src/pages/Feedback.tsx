import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
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
  const [notice, setNotice] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  const weekStart = useMemo(() => currentWeekStart(), []);

  const loadEntries = async () => {
    if (!user) return;
    const data = await getMyFeedback(user.id);
    setEntries(data);
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
      setNotice(error);
      setSaving(false);
      return;
    }

    setComment('');
    setSaving(false);
    setNotice('Feedback submitted. Thank you — this goes into weekly review.');
    await loadEntries();
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">Feedback</h1>
        <button onClick={loadEntries} className="btn-secondary py-2 px-4 text-xs flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-[0.95fr_1.05fr] gap-4">
        <form onSubmit={handleSubmit} className="card space-y-3" style={{ backgroundColor: '#FFD803' }}>
          <div className="inline-flex items-center gap-2">
            <MessageSquare size={18} className="text-black" />
            <h2 className="text-sm font-black uppercase tracking-widest text-black">Weekly Product Feedback</h2>
          </div>

          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Week starting: {weekStart}</p>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className={`rounded-xl border-[3px] border-black px-3 py-2 text-xs font-black uppercase transition-all ${
                    category === item.id ? 'bg-brand-500 text-white' : 'bg-white text-black'
                  }`}
                  style={{ boxShadow: '2px 2px 0px 0px #000' }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-black">Rating ({rating}/5)</label>
            <input
              type="range"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-black">What should improve?</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              required
              className="neo-input resize-none"
              placeholder="Share bug reports, ideas, missing features, or friction points..."
            />
          </div>

          {notice && (
            <div className="rounded-xl border-[3px] border-black px-3 py-2 bg-white">
              <p className="text-xs font-black uppercase tracking-wide text-black">{notice}</p>
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>

        <section className="card">
          <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">My Recent Feedback</h2>
          {entries.length === 0 ? (
            <p className="text-xs font-bold text-gray-500 uppercase">No feedback yet. Submit your first one this week.</p>
          ) : (
            <div className="space-y-3">
              {entries.map((item) => (
                <article key={item.id} className="rounded-xl border-[3px] border-black p-3" style={{ backgroundColor: '#FFFDF7', boxShadow: '2px 2px 0px 0px #000' }}>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="badge" style={{ backgroundColor: '#B5FF3C', color: '#000' }}>{item.category}</span>
                    <span className="text-[11px] font-black uppercase text-gray-700">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-700 mb-2 uppercase">Rating: {item.rating}/5</p>
                  <p className="text-sm font-medium text-black">{item.comment}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
