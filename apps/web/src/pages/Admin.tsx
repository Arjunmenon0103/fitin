import { useEffect, useState } from 'react';
import { BarChart3, Users, Eye, MessageSquare, RefreshCw, UserPlus, Trash2 } from 'lucide-react';
import { addAdminEmail, getAdminEmails, getAdminOverview, markFeedbackReviewed, removeAdminEmail } from '../lib/db';
import { useAuthStore } from '../store/authStore';

interface OverviewState {
  totalViews7d: number;
  activeUsers7d: number;
  totalProfiles: number;
  pendingFeedback: number;
  latestFeedback: Array<{
    id: string;
    user_email: string | null;
    category: string;
    rating: number;
    comment: string;
    week_start: string;
    reviewed: boolean;
    created_at: string;
  }>;
  topUsers: { email: string; views: number }[];
  error: string | null;
}

const EMPTY_OVERVIEW: OverviewState = {
  totalViews7d: 0,
  activeUsers7d: 0,
  totalProfiles: 0,
  pendingFeedback: 0,
  latestFeedback: [],
  topUsers: [],
  error: null,
};

export default function Admin() {
  const refreshAdminStatus = useAuthStore((s) => s.refreshAdminStatus);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewState>(EMPTY_OVERVIEW);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminActionNotice, setAdminActionNotice] = useState<string | null>(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const [data, emails] = await Promise.all([getAdminOverview(), getAdminEmails()]);
    setOverview(data);
    setAdminEmails(emails.map((entry) => entry.email));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggleReviewed = async (feedbackId: string, reviewed: boolean) => {
    setUpdatingId(feedbackId);
    await markFeedbackReviewed(feedbackId, reviewed);
    setUpdatingId(null);
    await refresh();
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setAdminActionLoading(true);
    const { error } = await addAdminEmail(newAdminEmail);
    setAdminActionLoading(false);

    if (error) {
      setAdminActionNotice(error);
      return;
    }

    setAdminActionNotice('Admin added successfully.');
    setNewAdminEmail('');
    await refresh();
    await refreshAdminStatus();
  };

  const handleRemoveAdmin = async (email: string) => {
    if (email === '30may1991@gmail.com') {
      setAdminActionNotice('Primary admin cannot be removed.');
      return;
    }

    setAdminActionLoading(true);
    const { error } = await removeAdminEmail(email);
    setAdminActionLoading(false);

    if (error) {
      setAdminActionNotice(error);
      return;
    }

    setAdminActionNotice('Admin removed successfully.');
    await refresh();
    await refreshAdminStatus();
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">Admin Console</h1>
        <button onClick={refresh} className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {overview.error && (
        <div className="mb-4 rounded-xl border-[3px] border-black p-3" style={{ backgroundColor: '#FFB4A2' }}>
          <p className="text-xs font-black uppercase tracking-wide text-black">{overview.error}</p>
        </div>
      )}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card" style={{ backgroundColor: '#B5FF3C' }}>
          <Users size={20} className="text-black mb-2" />
          <p className="text-2xl font-black text-black">{overview.totalProfiles}</p>
          <p className="text-xs font-black uppercase text-gray-700">Total registered users</p>
        </div>
        <div className="card" style={{ backgroundColor: '#00B4D8' }}>
          <Eye size={20} className="text-black mb-2" />
          <p className="text-2xl font-black text-black">{overview.totalViews7d}</p>
          <p className="text-xs font-black uppercase text-gray-700">Views (last 7 days)</p>
        </div>
        <div className="card" style={{ backgroundColor: '#FFD803' }}>
          <BarChart3 size={20} className="text-black mb-2" />
          <p className="text-2xl font-black text-black">{overview.activeUsers7d}</p>
          <p className="text-xs font-black uppercase text-gray-700">Active users (7 days)</p>
        </div>
        <div className="card" style={{ backgroundColor: '#FF8C42' }}>
          <MessageSquare size={20} className="text-black mb-2" />
          <p className="text-2xl font-black text-black">{overview.pendingFeedback}</p>
          <p className="text-xs font-black uppercase text-gray-700">Pending feedback reviews</p>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="card">
          <h2 className="text-lg font-black uppercase text-black mb-3">Admin Access</h2>
          <p className="text-xs font-black uppercase text-gray-500 mb-3">Primary admin: 30may1991@gmail.com</p>

          <div className="flex gap-2 mb-3">
            <input
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              type="email"
              placeholder="new-admin@email.com"
              className="neo-input"
            />
            <button onClick={handleAddAdmin} disabled={adminActionLoading} className="btn-primary px-3 py-2 text-xs inline-flex items-center gap-1">
              <UserPlus size={14} /> Add
            </button>
          </div>

          {adminActionNotice && (
            <div className="rounded-xl border-[3px] border-black px-3 py-2 mb-3" style={{ backgroundColor: '#FFFDF7' }}>
              <p className="text-[11px] font-black uppercase tracking-wide text-black">{adminActionNotice}</p>
            </div>
          )}

          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {adminEmails.map((email) => (
              <div
                key={email}
                className="rounded-xl border-[3px] border-black px-3 py-2 flex items-center justify-between"
                style={{ backgroundColor: '#FFFDF7', boxShadow: '2px 2px 0px 0px #000' }}
              >
                <p className="text-xs font-black text-black">{email}</p>
                <button
                  onClick={() => handleRemoveAdmin(email)}
                  disabled={adminActionLoading || email === '30may1991@gmail.com'}
                  className="px-2 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1"
                  style={{ backgroundColor: email === '30may1991@gmail.com' ? '#E5E7EB' : '#FFB4A2', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="text-lg font-black uppercase text-black mb-3">Top Users by Views (7d)</h2>
          {loading ? (
            <p className="text-xs font-black uppercase text-gray-500">Loading usage...</p>
          ) : overview.topUsers.length === 0 ? (
            <p className="text-xs font-black uppercase text-gray-500">No tracked usage yet.</p>
          ) : (
            <div className="space-y-2">
              {overview.topUsers.map((item) => (
                <div key={item.email} className="rounded-xl border-[3px] border-black px-3 py-2 flex items-center justify-between" style={{ backgroundColor: '#FFFDF7', boxShadow: '2px 2px 0px 0px #000' }}>
                  <p className="text-xs font-black uppercase text-black">{item.email}</p>
                  <span className="badge" style={{ backgroundColor: '#B5FF3C', color: '#000' }}>{item.views} views</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="text-lg font-black uppercase text-black mb-3">Latest Feedback</h2>
          {loading ? (
            <p className="text-xs font-black uppercase text-gray-500">Loading feedback...</p>
          ) : overview.latestFeedback.length === 0 ? (
            <p className="text-xs font-black uppercase text-gray-500">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {overview.latestFeedback.map((item) => (
                <article key={item.id} className="rounded-xl border-[3px] border-black p-3" style={{ backgroundColor: '#FFFDF7', boxShadow: '2px 2px 0px 0px #000' }}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="badge" style={{ backgroundColor: '#FFD803', color: '#000' }}>{item.category}</span>
                    <span className="text-[11px] font-black uppercase text-gray-700">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-black uppercase text-gray-600 mb-1">{item.user_email || 'Unknown user'} • {item.rating}/5</p>
                  <p className="text-sm font-medium text-black mb-1">{item.comment}</p>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <p className="text-[11px] font-black uppercase text-gray-500">Week: {item.week_start}</p>
                    <button
                      onClick={() => toggleReviewed(item.id, !item.reviewed)}
                      disabled={updatingId === item.id}
                      className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: item.reviewed ? '#B5FF3C' : '#FFB4A2',
                        color: '#000',
                        boxShadow: '2px 2px 0px 0px #000',
                        opacity: updatingId === item.id ? 0.6 : 1,
                      }}
                    >
                      {updatingId === item.id ? 'Saving...' : item.reviewed ? 'Reviewed' : 'Mark Reviewed'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
