import { useEffect, useState } from 'react';
import { BarChart3, Users, Eye, MessageSquare, RefreshCw, UserPlus, Trash2, ChevronDown, Bot, Zap, Clock, CheckCircle2, XCircle, AlertTriangle, User, Monitor } from 'lucide-react';
import {
  addAdminEmail,
  getAdminEmails,
  getFeedbackAgentJobs,
  getAdminNotifications,
  getAdminOverview,
  markFeedbackReviewed,
  removeAdminEmail,
  runFeedbackAgent,
  setAdminNotificationStatus,
} from '../lib/db';
import type { AdminNotification, FeedbackAgentJob } from '../lib/db';
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

const STATUS_CONFIG: Record<string, { bg: string; label: string; icon: typeof Bot }> = {
  auto_fixable: { bg: '#B5FF3C', label: 'AUTO-FIXABLE', icon: Zap },
  needs_cascade: { bg: '#FFD803', label: 'NEEDS CASCADE', icon: Monitor },
  in_progress: { bg: '#00B4D8', label: 'IN PROGRESS', icon: Clock },
  testing: { bg: '#C4B5FD', label: 'TESTING', icon: AlertTriangle },
  completed: { bg: '#86EFAC', label: 'COMPLETED', icon: CheckCircle2 },
  rejected: { bg: '#FFB4A2', label: 'REJECTED', icon: XCircle },
  parked: { bg: '#E5E7EB', label: 'PARKED (HUMAN)', icon: User },
  pending: { bg: '#FDE68A', label: 'PENDING', icon: Clock },
};

const OWNER_CONFIG: Record<string, { bg: string; label: string }> = {
  agent: { bg: '#B5FF3C', label: 'AGENT (auto)' },
  cascade: { bg: '#FFD803', label: 'CASCADE (dev session)' },
  human: { bg: '#FFB4A2', label: 'HUMAN (product decision)' },
};

const APP_FLOW_DIAGRAM = `
USER (PHONE/WEB BROWSER)
        |
        v
[WEB APP: React + Vite] <-----> [MOBILE APP: React Native + Expo]
        |                                  |
        | HTTPS API calls                  | HTTPS API calls
        +---------------+------------------+
                        |
                        v
                [SUPABASE BACKEND]
      +----------------+-------------------+
      |                |                   |
      v                v                   v
 [AUTH]         [POSTGRES DB]       [ROW LEVEL SECURITY]
 login/signup   profiles, weights,   each user only sees
 sessions       feedback, admin      their own data
                        |
                        v
                 [ADMIN CONSOLE]
          app metrics + feedback + admin users
                        |
                        v
         [DISTRIBUTION LAYER FOR TESTING]
             Expo build artifact -> Firebase App Distribution
`;

const ARCHITECTURE_TOPICS = [
  {
    title: 'How web and mobile are created',
    teen: 'We build two apps using JavaScript/TypeScript. One runs in browser (web), one runs on Android (mobile). Both talk to the same Supabase backend, so your data stays in sync.',
    architect:
      'Monorepo with shared package (`@fitin/core`), web built via Vite + React, mobile built via Expo + React Native. Shared domain model, separate presentation layers, common backend integration pattern.',
    points: ['Web: React + Vite + React Router', 'Mobile: Expo Router + React Native + EAS build', 'Shared business logic package in monorepo', 'Same Supabase project powers both clients'],
  },
  {
    title: 'Data flow and security',
    teen: 'When you log in, the app gets a secure session. Every profile or weight update goes safely to the cloud and loads back when you open the app again.',
    architect:
      'Supabase Auth issues sessions; client SDK uses secure storage/session persistence. Data access through Postgres tables with RLS policies and admin RPC for elevated checks (`is_admin_user`).',
    points: ['Authentication with Supabase Auth', 'Postgres tables for profiles, weight logs, feedback, analytics events', 'Admin role resolved through `admin_emails` + RPC', 'Per-user data isolation via RLS'],
  },
  {
    title: 'Testing and release path',
    teen: 'We make an APK, upload it to Firebase App Distribution, and invite testers by email. Later, we switch to Google Play when you want public release.',
    architect:
      'Current channel is direct binary distribution for rapid QA. Expo/EAS generates APK/AAB artifacts; Firebase App Distribution manages tester cohort, release notes, and download/install flow.',
    points: ['Preview builds as APK for quick testing', 'Production builds as AAB for Play Store later', 'Firebase handles small private tester groups', 'Play Console is only needed for public launch'],
  },
] as const;

const COST_LINES = [
  { item: 'Supabase (MVP stage)', estimate: '$0-$25/mo', detail: 'Free tier first, then paid when usage grows.' },
  { item: 'Expo/EAS builds', estimate: '$0-$29/mo', detail: 'Free usage possible; paid tiers for faster CI/build quotas.' },
  { item: 'Firebase App Distribution', estimate: '$0', detail: 'No charge for tester distribution workflows.' },
  { item: 'Domain + hosting (web)', estimate: '$0-$20/mo', detail: 'Depends on provider and traffic.' },
  { item: 'Google Play account (later)', estimate: '$25 one-time', detail: 'Only needed when publishing publicly.' },
] as const;

export default function Admin() {
  const refreshAdminStatus = useAuthStore((s) => s.refreshAdminStatus);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewState>(EMPTY_OVERVIEW);
  const [agentJobs, setAgentJobs] = useState<FeedbackAgentJob[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminActionNotice, setAdminActionNotice] = useState<string | null>(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [agentRunNotice, setAgentRunNotice] = useState<string | null>(null);
  const [agentRunLoading, setAgentRunLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingNotificationId, setUpdatingNotificationId] = useState<number | null>(null);
  const [pipelineFilter, setPipelineFilter] = useState<string>('all');

  const refresh = async () => {
    setLoading(true);
    const [data, emails, notif, jobs] = await Promise.all([
      getAdminOverview(),
      getAdminEmails(),
      getAdminNotifications(),
      getFeedbackAgentJobs(),
    ]);
    setOverview(data);
    setAdminEmails(emails.map((entry) => entry.email));
    setNotifications(notif);
    setAgentJobs(jobs);
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

  const handleNotificationStatus = async (notificationId: number, status: AdminNotification['status'], assignedTo?: AdminNotification['assigned_to']) => {
    setUpdatingNotificationId(notificationId);
    await setAdminNotificationStatus(notificationId, status, assignedTo ? { assigned_to: assignedTo } : undefined);
    setUpdatingNotificationId(null);
    await refresh();
  };

  const handleRunFeedbackAgent = async () => {
    setAgentRunLoading(true);
    setAgentRunNotice(null);
    const result = await runFeedbackAgent('admin');
    setAgentRunLoading(false);

    if (result.error) {
      setAgentRunNotice(`Agent run failed: ${result.error}`);
      return;
    }

    const jobId = result.data?.jobId;
    setAgentRunNotice(
      typeof jobId === 'number'
        ? `Job #${jobId} completed. Check pipeline below.`
        : 'Agent run completed. Refresh to see updates.'
    );
    await refresh();
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

  const filteredNotifications = pipelineFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.status === pipelineFilter);

  const statusCounts = notifications.reduce((acc, n) => {
    acc[n.status] = (acc[n.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black dark:text-slate-100">Admin Console</h1>
        <button onClick={refresh} className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {overview.error && (
        <div className="mb-4 rounded-xl border-[3px] border-black p-3" style={{ backgroundColor: '#FFB4A2' }}>
          <p className="text-xs font-black uppercase tracking-wide text-black">{overview.error}</p>
        </div>
      )}

      {/* Stats row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card bg-[#B5FF3C] dark:bg-[#8BC34A] dark:border-slate-100">
          <Users size={18} className="text-black dark:text-slate-900 mb-1" />
          <p className="text-2xl font-black text-black dark:text-slate-900">{overview.totalProfiles}</p>
          <p className="text-[10px] font-black uppercase text-gray-700 dark:text-slate-800">Users</p>
        </div>
        <div className="card bg-[#00B4D8] dark:bg-[#0288D1]">
          <Eye size={18} className="text-black dark:text-white mb-1" />
          <p className="text-2xl font-black text-black dark:text-white">{overview.totalViews7d}</p>
          <p className="text-[10px] font-black uppercase text-gray-700 dark:text-slate-300">Views (7d)</p>
        </div>
        <div className="card bg-[#FFD803] dark:bg-[#FBC02D] dark:border-slate-100">
          <BarChart3 size={18} className="text-black dark:text-slate-900 mb-1" />
          <p className="text-2xl font-black text-black dark:text-slate-900">{overview.activeUsers7d}</p>
          <p className="text-[10px] font-black uppercase text-gray-700 dark:text-slate-800">Active (7d)</p>
        </div>
        <div className="card bg-[#FF8C42] dark:bg-[#E65100]">
          <MessageSquare size={18} className="text-black dark:text-white mb-1" />
          <p className="text-2xl font-black text-black dark:text-white">{overview.pendingFeedback}</p>
          <p className="text-[10px] font-black uppercase text-gray-700 dark:text-slate-300">Unreviewed</p>
        </div>
      </section>

      {/* ===== MAIN SECTION: Feedback Pipeline ===== */}
      <section className="card mb-6 bg-[#FFFDF7] dark:bg-slate-900 border-[3px] border-black" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Bot size={24} className="text-black dark:text-slate-100" />
            <div>
              <h2 className="text-xl font-black uppercase text-black dark:text-slate-100">Feedback Pipeline</h2>
              <p className="text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 mt-0.5">
                Agent triages feedback. Simple fixes = auto. Complex = parked for Cascade or human.
              </p>
            </div>
          </div>
          <button
            onClick={handleRunFeedbackAgent}
            disabled={agentRunLoading}
            className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-2"
          >
            <RefreshCw size={14} className={agentRunLoading ? 'animate-spin' : ''} />
            {agentRunLoading ? 'Running...' : 'Run Agent'}
          </button>
        </div>

        {agentRunNotice && (
          <div className="rounded-xl border-[3px] border-black px-3 py-2 mb-3 bg-[#ECFCCB] dark:bg-slate-800">
            <p className="text-[11px] font-black uppercase tracking-wide text-black dark:text-slate-100">{agentRunNotice}</p>
          </div>
        )}

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setPipelineFilter('all')}
            className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
            style={{
              backgroundColor: pipelineFilter === 'all' ? '#000' : '#F3F4F6',
              color: pipelineFilter === 'all' ? '#FFF' : '#000',
              boxShadow: '2px 2px 0px 0px #000',
            }}
          >
            All ({notifications.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = statusCounts[key] || 0;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setPipelineFilter(key)}
                className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                style={{
                  backgroundColor: pipelineFilter === key ? cfg.bg : '#F3F4F6',
                  color: '#000',
                  boxShadow: '2px 2px 0px 0px #000',
                }}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Pipeline items */}
        {loading ? (
          <p className="text-xs font-black uppercase text-gray-500 dark:text-slate-400 py-4">Loading pipeline...</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="text-xs font-black uppercase text-gray-500 dark:text-slate-400 py-4">
            {notifications.length === 0 ? 'No feedback processed yet. Click "Run Agent" to start.' : 'No items match this filter.'}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => {
              const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
              const oc = OWNER_CONFIG[item.assigned_to] || OWNER_CONFIG.agent;
              const StatusIcon = sc.icon;
              const isUpdating = updatingNotificationId === item.id;

              return (
                <article
                  key={item.id}
                  className="rounded-xl border-[3px] border-black dark:border-slate-600 p-4 bg-white dark:bg-slate-800"
                  style={{ boxShadow: '3px 3px 0px 0px #000', borderLeftWidth: '6px', borderLeftColor: sc.bg }}
                >
                  {/* Row 1: Status + Owner + Complexity */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border-[2px] border-black text-[10px] font-black uppercase"
                      style={{ backgroundColor: sc.bg }}
                    >
                      <StatusIcon size={11} /> {sc.label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md border-[2px] border-black text-[10px] font-black uppercase"
                      style={{ backgroundColor: oc.bg }}
                    >
                      {oc.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-md border-[2px] border-black text-[10px] font-black uppercase bg-white dark:bg-slate-700 dark:text-slate-100">
                      {item.complexity}
                    </span>
                    <span className="px-2 py-0.5 rounded-md border-[2px] border-black text-[10px] font-black uppercase bg-white dark:bg-slate-700 dark:text-slate-100">
                      {item.change_scope}
                    </span>
                  </div>

                  {/* Row 2: Summary */}
                  <p className="text-sm font-bold text-black dark:text-slate-100 mb-1">{item.summary}</p>

                  {/* Row 3: Agent action / resolution notes */}
                  {item.agent_action && (
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                      Agent action: {item.agent_action}
                    </p>
                  )}
                  {item.resolution_notes && (
                    <p className="text-[11px] font-medium text-gray-600 dark:text-slate-400 mb-2">
                      {item.resolution_notes}
                    </p>
                  )}

                  {/* Row 4: Timestamp */}
                  <p className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 mb-3">
                    {new Date(item.created_at).toLocaleString()}
                    {item.approved_at && ` — Done: ${new Date(item.approved_at).toLocaleString()}`}
                  </p>

                  {/* Row 5: Actions */}
                  <div className="flex flex-wrap gap-2">
                    {item.status === 'auto_fixable' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'completed', 'agent')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#86EFAC', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Mark Done'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'needs_cascade', 'cascade')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#FFD803', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Send to Cascade'}
                        </button>
                      </>
                    )}
                    {item.status === 'needs_cascade' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'in_progress', 'cascade')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#00B4D8', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Start in Cascade'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'parked', 'human')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#E5E7EB', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Park'}
                        </button>
                      </>
                    )}
                    {item.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'testing')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#C4B5FD', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Move to Testing'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'completed')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#86EFAC', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Mark Done'}
                        </button>
                      </>
                    )}
                    {item.status === 'testing' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'completed')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#86EFAC', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Test Passed'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'in_progress', 'cascade')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#FFB4A2', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Test Failed — Back'}
                        </button>
                      </>
                    )}
                    {item.status === 'parked' && (
                      <button
                        onClick={() => handleNotificationStatus(item.id, 'needs_cascade', 'cascade')}
                        disabled={isUpdating}
                        className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                        style={{ backgroundColor: '#FFD803', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                      >
                        {isUpdating ? '...' : 'Unpark → Cascade'}
                      </button>
                    )}
                    {(item.status === 'completed' || item.status === 'rejected') && (
                      <span className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 py-1">
                        {item.status === 'completed' ? 'Done' : 'Rejected'} — no actions
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'needs_cascade', 'cascade')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#FFD803', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Send to Cascade'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'rejected')}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: '#FFB4A2', color: '#000', boxShadow: '2px 2px 0px 0px #000' }}
                        >
                          {isUpdating ? '...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Agent Run History (compact) */}
      <details className="card mb-6 bg-[#FFF2CC] dark:bg-slate-900 rounded-xl border-[3px] border-black" style={{ boxShadow: '2px 2px 0px 0px #000' }}>
        <summary className="list-none cursor-pointer flex items-center justify-between px-1">
          <h2 className="text-sm font-black uppercase text-black dark:text-slate-100">Agent Run History ({agentJobs.length})</h2>
          <ChevronDown size={16} className="text-black dark:text-slate-100" />
        </summary>
        <div className="mt-3 space-y-2 max-h-[240px] overflow-auto pr-1">
          {agentJobs.length === 0 ? (
            <p className="text-xs font-black uppercase text-gray-500 dark:text-slate-400">No runs yet.</p>
          ) : agentJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-lg border-[2px] border-black p-2 bg-white dark:bg-slate-800 flex flex-wrap items-center gap-2"
              style={{ boxShadow: '1px 1px 0px 0px #000' }}
            >
              <span className="text-[10px] font-black uppercase text-black dark:text-slate-100">#{job.id}</span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-black uppercase border border-black"
                style={{
                  backgroundColor: job.status === 'completed' ? '#86EFAC' : job.status === 'failed' ? '#FFB4A2' : '#FDE68A',
                }}
              >
                {job.status}
              </span>
              <span className="text-[10px] font-bold text-gray-600 dark:text-slate-400 flex-1">
                {job.result_summary || job.error_message || 'Processing...'}
              </span>
              <span className="text-[10px] font-black text-gray-400 dark:text-slate-500">
                {job.finished_at ? new Date(job.finished_at).toLocaleString() : '...'}
              </span>
            </div>
          ))}
        </div>
      </details>

      {/* Bottom row: Raw Feedback + Admin Access + Top Users */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <section className="card lg:col-span-2">
          <h2 className="text-lg font-black uppercase text-black dark:text-slate-100 mb-3">Raw Feedback</h2>
          {loading ? (
            <p className="text-xs font-black uppercase text-gray-500">Loading...</p>
          ) : overview.latestFeedback.length === 0 ? (
            <p className="text-xs font-black uppercase text-gray-500">No feedback yet.</p>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
              {overview.latestFeedback.map((item) => (
                <article key={item.id} className="rounded-xl border-[2px] border-black p-3 bg-[#FFFDF7] dark:bg-slate-800 flex items-start gap-3" style={{ boxShadow: '2px 2px 0px 0px #000' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded border border-black text-[10px] font-black uppercase" style={{ backgroundColor: '#FFD803' }}>{item.category}</span>
                      <span className="text-[10px] font-black uppercase text-gray-500">{item.rating}/5</span>
                      <span className="text-[10px] font-black text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-medium text-black dark:text-slate-100 mb-0.5">{item.comment}</p>
                    <p className="text-[10px] font-black uppercase text-gray-400">{item.user_email || 'Unknown'}</p>
                  </div>
                  <button
                    onClick={() => toggleReviewed(item.id, !item.reviewed)}
                    disabled={updatingId === item.id}
                    className="shrink-0 px-2 py-1 rounded-lg border-[2px] border-black text-[10px] font-black uppercase"
                    style={{
                      backgroundColor: item.reviewed ? '#86EFAC' : '#FFB4A2',
                      color: '#000',
                      boxShadow: '1px 1px 0px 0px #000',
                      opacity: updatingId === item.id ? 0.6 : 1,
                    }}
                  >
                    {updatingId === item.id ? '...' : item.reviewed ? 'Reviewed' : 'Review'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="card">
            <h2 className="text-sm font-black uppercase text-black dark:text-slate-100 mb-2">Admin Access</h2>
            <div className="flex gap-2 mb-2">
              <input
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                type="email"
                placeholder="admin@email.com"
                className="neo-input text-xs"
              />
              <button onClick={handleAddAdmin} disabled={adminActionLoading} className="btn-primary px-2 py-1 text-[10px] inline-flex items-center gap-1">
                <UserPlus size={12} /> Add
              </button>
            </div>
            {adminActionNotice && (
              <p className="text-[10px] font-black uppercase text-black dark:text-slate-100 mb-2">{adminActionNotice}</p>
            )}
            <div className="space-y-1 max-h-40 overflow-auto">
              {adminEmails.map((email) => (
                <div key={email} className="flex items-center justify-between gap-1 rounded-lg border border-black px-2 py-1 bg-white dark:bg-slate-800">
                  <p className="text-[10px] font-black text-black dark:text-slate-100 truncate">{email}</p>
                  <button
                    onClick={() => handleRemoveAdmin(email)}
                    disabled={adminActionLoading || email === '30may1991@gmail.com'}
                    className="shrink-0 text-[10px] font-black uppercase text-red-600 hover:text-red-800"
                  >
                    {email === '30may1991@gmail.com' ? '' : <Trash2 size={10} />}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="text-sm font-black uppercase text-black dark:text-slate-100 mb-2">Top Users (7d)</h2>
            {overview.topUsers.length === 0 ? (
              <p className="text-[10px] font-black uppercase text-gray-500">No data.</p>
            ) : (
              <div className="space-y-1">
                {overview.topUsers.slice(0, 5).map((item) => (
                  <div key={item.email} className="flex items-center justify-between gap-1 rounded-lg border border-black px-2 py-1 bg-white dark:bg-slate-800">
                    <p className="text-[10px] font-black text-black dark:text-slate-100 truncate">{item.email}</p>
                    <span className="text-[10px] font-black text-emerald-700">{item.views}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="card mt-6 bg-[#E6F6FF] dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-black uppercase text-black dark:text-slate-100">Architecture & Cost Learning Board</h2>
            <p className="text-xs font-black uppercase text-gray-700 dark:text-slate-400 mt-1">Beginner friendly + architect level in one place</p>
          </div>
          <span className="badge" style={{ backgroundColor: '#B5FF3C', color: '#000' }}>Version 1 (Local)</span>
        </div>

        <details open className="rounded-xl border-[3px] border-black mb-3 bg-[#FFFDF7] dark:bg-slate-800" style={{ boxShadow: '2px 2px 0px 0px #000' }}>
          <summary className="list-none cursor-pointer px-3 py-3 flex items-center justify-between">
            <span className="text-xs md:text-sm font-black uppercase tracking-wide text-black dark:text-slate-100">Full system diagram</span>
            <ChevronDown size={16} className="text-black dark:text-slate-100" />
          </summary>
          <div className="px-3 pb-3">
            <pre className="rounded-lg border-[2px] border-black p-3 text-[11px] md:text-xs font-black text-black dark:text-slate-100 overflow-x-auto bg-[#F8FAFC] dark:bg-slate-900">
              {APP_FLOW_DIAGRAM}
            </pre>
          </div>
        </details>

        {ARCHITECTURE_TOPICS.map((topic) => (
          <details key={topic.title} className="rounded-xl border-[3px] border-black mb-3 bg-[#FFFDF7] dark:bg-slate-800" style={{ boxShadow: '2px 2px 0px 0px #000' }}>
            <summary className="list-none cursor-pointer px-3 py-3 flex items-center justify-between">
              <span className="text-xs md:text-sm font-black uppercase tracking-wide text-black dark:text-slate-100">{topic.title}</span>
              <ChevronDown size={16} className="text-black dark:text-slate-100" />
            </summary>
            <div className="px-3 pb-3 grid md:grid-cols-2 gap-3">
              <div className="rounded-lg border-[2px] border-black p-3 bg-[#FEF3C7] dark:bg-slate-900">
                <p className="text-[11px] font-black uppercase tracking-wide text-black dark:text-slate-100 mb-1">Explain like I am 15</p>
                <p className="text-sm text-black dark:text-slate-100 font-medium">{topic.teen}</p>
              </div>
              <div className="rounded-lg border-[2px] border-black p-3 bg-[#DBEAFE] dark:bg-slate-800">
                <p className="text-[11px] font-black uppercase tracking-wide text-black dark:text-slate-100 mb-1">Cloud architect view</p>
                <p className="text-sm text-black dark:text-slate-100 font-medium">{topic.architect}</p>
              </div>
              <div className="md:col-span-2 rounded-lg border-[2px] border-black p-3 bg-[#ECFCCB] dark:bg-slate-900">
                <p className="text-[11px] font-black uppercase tracking-wide text-black dark:text-slate-100 mb-2">Key points</p>
                <ul className="grid md:grid-cols-2 gap-2">
                  {topic.points.map((point) => (
                    <li key={point} className="text-xs font-black text-black dark:text-slate-100">• {point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        ))}

        <details className="rounded-xl border-[3px] border-black bg-[#FFFDF7] dark:bg-slate-800" style={{ boxShadow: '2px 2px 0px 0px #000' }}>
          <summary className="list-none cursor-pointer px-3 py-3 flex items-center justify-between">
            <span className="text-xs md:text-sm font-black uppercase tracking-wide text-black dark:text-slate-100">Cost snapshot (MVP estimate)</span>
            <ChevronDown size={16} className="text-black dark:text-slate-100" />
          </summary>
          <div className="px-3 pb-3">
            <div className="rounded-lg border-[2px] border-black overflow-hidden bg-white dark:bg-slate-900">
              {COST_LINES.map((line) => (
                <div key={line.item} className="grid md:grid-cols-3 gap-2 px-3 py-2 border-b border-black/20 last:border-b-0">
                  <p className="text-xs font-black uppercase text-black dark:text-slate-100">{line.item}</p>
                  <p className="text-xs font-black text-black dark:text-slate-100">{line.estimate}</p>
                  <p className="text-xs font-medium text-gray-800 dark:text-slate-300">{line.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
