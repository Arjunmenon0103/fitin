import { useEffect, useState } from 'react';
import {
  RefreshCw,
  UserPlus,
  Trash2,
  ChevronDown,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Monitor,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
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

const PRIMARY_ADMIN = '30may1991@gmail.com';

/*
 * Pipeline status. `fill` tints the chip, `rule` tints the left rule on the card.
 * Categorical only. Actions stay on the violet accent.
 */
const STATUS_CONFIG: Record<string, { fill: string; rule: string; label: string; icon: LucideIcon }> = {
  auto_fixable: { fill: 'bg-surface-cyan', rule: '#A4F6F8', label: 'Auto-fixable', icon: Zap },
  needs_cascade: { fill: 'bg-surface-gold', rule: '#FFD24A', label: 'Needs Cascade', icon: Monitor },
  in_progress: { fill: 'bg-surface-blue', rule: '#DDFCFC', label: 'In progress', icon: Clock },
  testing: { fill: 'bg-surface-periwinkle', rule: '#D7CDF1', label: 'Testing', icon: AlertTriangle },
  completed: { fill: 'bg-surface-yellow', rule: '#FAED8F', label: 'Completed', icon: CheckCircle2 },
  rejected: { fill: 'bg-surface-rose', rule: '#FEB6FA', label: 'Rejected', icon: XCircle },
  parked: { fill: 'bg-paper-grey', rule: '#E2E1DD', label: 'Parked', icon: User },
  pending: { fill: 'bg-surface-amber', rule: '#FBBE63', label: 'Pending', icon: Clock },
};

const OWNER_LABELS: Record<string, string> = {
  agent: 'Agent (auto)',
  cascade: 'Cascade (dev session)',
  human: 'Human (product call)',
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
    points: [
      'Web: React + Vite + React Router',
      'Mobile: Expo Router + React Native + EAS build',
      'Shared business logic package in monorepo',
      'Same Supabase project powers both clients',
    ],
  },
  {
    title: 'Data flow and security',
    teen: 'When you log in, the app gets a secure session. Every profile or weight update goes safely to the cloud and loads back when you open the app again.',
    architect:
      'Supabase Auth issues sessions; client SDK uses secure storage/session persistence. Data access through Postgres tables with RLS policies and admin RPC for elevated checks (`is_admin_user`).',
    points: [
      'Authentication with Supabase Auth',
      'Postgres tables for profiles, weight logs, feedback, analytics events',
      'Admin role resolved through `admin_emails` + RPC',
      'Per-user data isolation via RLS',
    ],
  },
  {
    title: 'Testing and release path',
    teen: 'We make an APK, upload it to Firebase App Distribution, and invite testers by email. Later, we switch to Google Play when you want public release.',
    architect:
      'Current channel is direct binary distribution for rapid QA. Expo/EAS generates APK/AAB artifacts; Firebase App Distribution manages tester cohort, release notes, and download/install flow.',
    points: [
      'Preview builds as APK for quick testing',
      'Production builds as AAB for Play Store later',
      'Firebase handles small private tester groups',
      'Play Console is only needed for public launch',
    ],
  },
] as const;

const COST_LINES = [
  { item: 'Supabase (MVP stage)', estimate: '$0-$25/mo', detail: 'Free tier first, then paid when usage grows.' },
  { item: 'Expo/EAS builds', estimate: '$0-$29/mo', detail: 'Free usage possible; paid tiers for faster CI/build quotas.' },
  { item: 'Firebase App Distribution', estimate: '$0', detail: 'No charge for tester distribution workflows.' },
  { item: 'Domain + hosting (web)', estimate: '$0-$20/mo', detail: 'Depends on provider and traffic.' },
  { item: 'Google Play account (later)', estimate: '$25 one-time', detail: 'Only needed when publishing publicly.' },
] as const;

/** Collapsible section styled as a hairline row, matching the rest of the console. */
function Disclosure({
  title,
  open,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="group border-t border-ink/10 last:border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3.5">
        <span className="text-[14px] font-bold">{title}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="text-ink-faint transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

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

    setAdminActionNotice('Admin added.');
    setNewAdminEmail('');
    await refresh();
    await refreshAdminStatus();
  };

  const handleNotificationStatus = async (
    notificationId: number,
    status: AdminNotification['status'],
    assignedTo?: AdminNotification['assigned_to']
  ) => {
    setUpdatingNotificationId(notificationId);
    await setAdminNotificationStatus(
      notificationId,
      status,
      assignedTo ? { assigned_to: assignedTo } : undefined
    );
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
        ? `Job #${jobId} completed. Check the pipeline below.`
        : 'Agent run completed. Refresh to see updates.'
    );
    await refresh();
  };

  const handleRemoveAdmin = async (email: string) => {
    if (email === PRIMARY_ADMIN) {
      setAdminActionNotice('The primary admin cannot be removed.');
      return;
    }

    setAdminActionLoading(true);
    const { error } = await removeAdminEmail(email);
    setAdminActionLoading(false);

    if (error) {
      setAdminActionNotice(error);
      return;
    }

    setAdminActionNotice('Admin removed.');
    await refresh();
    await refreshAdminStatus();
  };

  const filteredNotifications =
    pipelineFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.status === pipelineFilter);

  const statusCounts = notifications.reduce(
    (acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const STATS = [
    { label: 'Users', value: overview.totalProfiles },
    { label: 'Views (7d)', value: overview.totalViews7d },
    { label: 'Active (7d)', value: overview.activeUsers7d },
    { label: 'Unreviewed', value: overview.pendingFeedback },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Internal</span>
          <h1 className="mt-2 text-[2.25rem] leading-[0.95] md:text-[3rem]">Admin console.</h1>
        </div>
        <button onClick={refresh} className="btn-ghost px-4 py-2.5 text-[13px]">
          <RefreshCw size={14} strokeWidth={2} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      {overview.error && (
        <p role="alert" className="mt-4 text-[13px] font-semibold text-wine">
          {overview.error}
        </p>
      )}

      <dl
        className="rise mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-ink/10 py-6 lg:grid-cols-4"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        {STATS.map((s) => (
          <div key={s.label}>
            <dd className="font-display text-[2.25rem] leading-none">{s.value}</dd>
            <dt className="mt-2 text-[12px] font-semibold text-ink-soft">{s.label}</dt>
          </div>
        ))}
      </dl>

      {/* Feedback pipeline is the reason this page exists, so it leads. */}
      <section className="rise panel mt-6" style={{ '--i': 2 } as React.CSSProperties}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[1.5rem] leading-none">Feedback pipeline</h2>
            <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-ink-soft">
              The agent triages incoming feedback. Simple fixes run automatically. Anything complex
              is parked for a Cascade session or a human product call.
            </p>
          </div>
          <button
            onClick={handleRunFeedbackAgent}
            disabled={agentRunLoading}
            className="btn-primary px-5 py-2.5 text-[13px]"
          >
            <RefreshCw size={14} strokeWidth={2} className={agentRunLoading ? 'animate-spin' : ''} />
            {agentRunLoading ? 'Running' : 'Run agent'}
          </button>
        </div>

        {agentRunNotice && (
          <p role="status" className="mt-4 text-[13px] font-semibold text-ink-soft">
            {agentRunNotice}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-1.5">
          <button
            onClick={() => setPipelineFilter('all')}
            aria-pressed={pipelineFilter === 'all'}
            className={clsx('pill px-3.5 py-1.5', pipelineFilter === 'all' && 'pill-on')}
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
                aria-pressed={pipelineFilter === key}
                className={clsx('pill px-3.5 py-1.5', pipelineFilter === key && 'pill-on')}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="mt-5 space-y-3" aria-busy="true" aria-live="polite">
            <div className="h-28 rounded-tile bg-paper-grey" />
            <div className="h-28 rounded-tile bg-paper-grey" />
            <span className="sr-only">Loading pipeline</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="mt-5 rounded-tile bg-paper-warm px-6 py-10 text-center">
            <p className="text-[15px] font-bold">
              {notifications.length === 0 ? 'Pipeline is empty' : 'Nothing matches this filter'}
            </p>
            <p className="mx-auto mt-1.5 max-w-[40ch] text-[14px] text-ink-soft">
              {notifications.length === 0
                ? 'Run the agent to triage the feedback that has come in.'
                : 'Clear the filter to see the rest of the queue.'}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {filteredNotifications.map((item) => {
              const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
              const StatusIcon = sc.icon;
              const isUpdating = updatingNotificationId === item.id;
              const busy = isUpdating ? 'Saving' : null;

              return (
                <article
                  key={item.id}
                  className="rounded-tile border border-ink/10 bg-paper p-4"
                  style={{ borderLeftWidth: 5, borderLeftColor: sc.rule }}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={clsx('chip', sc.fill)}>
                      <StatusIcon size={12} strokeWidth={2} /> {sc.label}
                    </span>
                    <span className="chip-outline">
                      {OWNER_LABELS[item.assigned_to] || OWNER_LABELS.agent}
                    </span>
                    <span className="chip-outline capitalize">{item.complexity}</span>
                    <span className="chip-outline capitalize">{item.change_scope}</span>
                  </div>

                  <p className="mt-3 text-[15px] font-bold">{item.summary}</p>

                  {item.agent_action && (
                    <p className="mt-1.5 text-[13px] text-ink-soft">
                      Agent action: {item.agent_action}
                    </p>
                  )}
                  {item.resolution_notes && (
                    <p className="mt-1 text-[13px] text-ink-faint">{item.resolution_notes}</p>
                  )}

                  <p className="mt-3 text-[12px] text-ink-faint">
                    {new Date(item.created_at).toLocaleString()}
                    {item.approved_at && ` · done ${new Date(item.approved_at).toLocaleString()}`}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.status === 'auto_fixable' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'completed', 'agent')}
                          disabled={isUpdating}
                          className="btn-primary px-4 py-2 text-[12px]"
                        >
                          {busy || 'Mark done'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'needs_cascade', 'cascade')}
                          disabled={isUpdating}
                          className="btn-ghost px-4 py-2 text-[12px]"
                        >
                          {busy || 'Send to Cascade'}
                        </button>
                      </>
                    )}
                    {item.status === 'needs_cascade' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'in_progress', 'cascade')}
                          disabled={isUpdating}
                          className="btn-primary px-4 py-2 text-[12px]"
                        >
                          {busy || 'Start in Cascade'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'parked', 'human')}
                          disabled={isUpdating}
                          className="btn-ghost px-4 py-2 text-[12px]"
                        >
                          {busy || 'Park'}
                        </button>
                      </>
                    )}
                    {item.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'testing')}
                          disabled={isUpdating}
                          className="btn-primary px-4 py-2 text-[12px]"
                        >
                          {busy || 'Move to testing'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'completed')}
                          disabled={isUpdating}
                          className="btn-ghost px-4 py-2 text-[12px]"
                        >
                          {busy || 'Mark done'}
                        </button>
                      </>
                    )}
                    {item.status === 'testing' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'completed')}
                          disabled={isUpdating}
                          className="btn-primary px-4 py-2 text-[12px]"
                        >
                          {busy || 'Test passed'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'in_progress', 'cascade')}
                          disabled={isUpdating}
                          className="btn-danger px-4 py-2 text-[12px]"
                        >
                          {busy || 'Test failed, send back'}
                        </button>
                      </>
                    )}
                    {item.status === 'parked' && (
                      <button
                        onClick={() => handleNotificationStatus(item.id, 'needs_cascade', 'cascade')}
                        disabled={isUpdating}
                        className="btn-primary px-4 py-2 text-[12px]"
                      >
                        {busy || 'Unpark to Cascade'}
                      </button>
                    )}
                    {(item.status === 'completed' || item.status === 'rejected') && (
                      <span className="text-[12px] font-semibold text-ink-faint">
                        {item.status === 'completed' ? 'Done' : 'Rejected'}. No actions left.
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'needs_cascade', 'cascade')}
                          disabled={isUpdating}
                          className="btn-primary px-4 py-2 text-[12px]"
                        >
                          {busy || 'Send to Cascade'}
                        </button>
                        <button
                          onClick={() => handleNotificationStatus(item.id, 'rejected')}
                          disabled={isUpdating}
                          className="btn-danger px-4 py-2 text-[12px]"
                        >
                          {busy || 'Reject'}
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

      <section className="panel mt-4">
        <Disclosure title={`Agent run history (${agentJobs.length})`}>
          {agentJobs.length === 0 ? (
            <p className="text-[14px] text-ink-soft">No runs yet.</p>
          ) : (
            <ul className="max-h-60 divide-y divide-ink/10 overflow-auto border-t border-ink/10">
              {agentJobs.map((job) => (
                <li key={job.id} className="flex flex-wrap items-center gap-2 py-2.5">
                  <span className="text-[13px] font-bold tabular-nums">#{job.id}</span>
                  <span
                    className={clsx(
                      'chip capitalize',
                      job.status === 'completed'
                        ? 'bg-surface-yellow'
                        : job.status === 'failed'
                          ? 'bg-surface-rose'
                          : 'bg-surface-amber'
                    )}
                  >
                    {job.status}
                  </span>
                  <span className="min-w-[12ch] flex-1 text-[13px] text-ink-soft">
                    {job.result_summary || job.error_message || 'Processing'}
                  </span>
                  <span className="text-[12px] text-ink-faint">
                    {job.finished_at ? new Date(job.finished_at).toLocaleString() : 'Running'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Disclosure>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="panel lg:col-span-2">
          <h2 className="text-[1.35rem] leading-none">Raw feedback</h2>
          {loading ? (
            <div className="mt-5 space-y-3" aria-busy="true" aria-live="polite">
              <div className="h-20 rounded-tile bg-paper-grey" />
              <div className="h-20 rounded-tile bg-paper-grey" />
              <span className="sr-only">Loading feedback</span>
            </div>
          ) : overview.latestFeedback.length === 0 ? (
            <div className="mt-5 rounded-tile bg-paper-warm px-6 py-10 text-center">
              <p className="text-[15px] font-bold">No feedback yet</p>
              <p className="mx-auto mt-1.5 max-w-[36ch] text-[14px] text-ink-soft">
                Submissions from the feedback page land here first.
              </p>
            </div>
          ) : (
            <ul className="mt-4 max-h-[360px] divide-y divide-ink/10 overflow-auto border-t border-ink/10">
              {overview.latestFeedback.map((item) => (
                <li key={item.id} className="flex items-start gap-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="chip capitalize">{item.category}</span>
                      <span className="text-[12px] text-ink-faint">
                        {item.rating}/5 · {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{item.comment}</p>
                    <p className="mt-1 truncate text-[12px] text-ink-faint">
                      {item.user_email || 'Unknown'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleReviewed(item.id, !item.reviewed)}
                    disabled={updatingId === item.id}
                    className={clsx(
                      'flex-shrink-0 px-4 py-2 text-[12px]',
                      item.reviewed ? 'btn-ghost' : 'btn-primary'
                    )}
                  >
                    {updatingId === item.id ? 'Saving' : item.reviewed ? 'Reviewed' : 'Review'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          <section className="panel">
            <h2 className="text-[1.1rem] leading-none">Admin access</h2>
            <div className="mt-4">
              <label htmlFor="admin-email" className="field-label">
                Add an admin
              </label>
              <div className="flex gap-2">
                <input
                  id="admin-email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  type="email"
                  placeholder="admin@email.com"
                  className="field"
                />
                <button
                  onClick={handleAddAdmin}
                  disabled={adminActionLoading || !newAdminEmail.trim()}
                  className="btn-primary flex-shrink-0 px-4 py-2.5 text-[13px]"
                >
                  <UserPlus size={14} strokeWidth={2} /> Add
                </button>
              </div>
              {adminActionNotice && (
                <p role="status" className="field-hint">
                  {adminActionNotice}
                </p>
              )}
            </div>
            <ul className="mt-4 max-h-44 divide-y divide-ink/10 overflow-auto border-t border-ink/10">
              {adminEmails.map((email) => (
                <li key={email} className="flex items-center justify-between gap-2 py-2.5">
                  <span className="truncate text-[13px] font-semibold">{email}</span>
                  {email !== PRIMARY_ADMIN && (
                    <button
                      onClick={() => handleRemoveAdmin(email)}
                      disabled={adminActionLoading}
                      aria-label={`Remove ${email}`}
                      className="flex-shrink-0 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-paper-grey hover:text-wine"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2 className="text-[1.1rem] leading-none">Top users (7d)</h2>
            {overview.topUsers.length === 0 ? (
              <p className="mt-4 text-[14px] text-ink-soft">No data for this window.</p>
            ) : (
              <ul className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
                {overview.topUsers.slice(0, 5).map((item) => (
                  <li key={item.email} className="flex items-center justify-between gap-2 py-2.5">
                    <span className="truncate text-[13px] font-semibold">{item.email}</span>
                    <span className="text-[13px] font-bold tabular-nums text-violet-500">
                      {item.views}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="panel mt-4 md:p-8">
        <h2 className="text-[1.5rem] leading-none">Architecture and cost board</h2>
        <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-ink-soft">
          The same system explained twice: once plainly, once for an architect.
        </p>

        <div className="mt-6">
          <Disclosure title="Full system diagram" open>
            <pre className="overflow-x-auto rounded-tile bg-paper-warm p-4 font-mono text-[11px] leading-relaxed md:text-[12px]">
              {APP_FLOW_DIAGRAM}
            </pre>
          </Disclosure>

          {ARCHITECTURE_TOPICS.map((topic) => (
            <Disclosure key={topic.title} title={topic.title}>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-tile bg-surface-yellow p-4">
                  <span className="eyebrow">Explain it plainly</span>
                  <p className="mt-2 text-[14px] leading-relaxed">{topic.teen}</p>
                </div>
                <div className="rounded-tile bg-surface-blue p-4">
                  <span className="eyebrow">Architect view</span>
                  <p className="mt-2 text-[14px] leading-relaxed">{topic.architect}</p>
                </div>
                <ul className="grid gap-2 md:col-span-2 md:grid-cols-2">
                  {topic.points.map((point) => (
                    <li key={point} className="text-[13px] text-ink-soft">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Disclosure>
          ))}

          <Disclosure title="Cost snapshot (MVP estimate)">
            <ul className="divide-y divide-ink/10 border-t border-ink/10">
              {COST_LINES.map((line) => (
                <li key={line.item} className="grid gap-1 py-3 md:grid-cols-[1fr_auto_1.4fr] md:gap-4">
                  <span className="text-[14px] font-bold">{line.item}</span>
                  <span className="text-[14px] font-bold tabular-nums text-violet-500">
                    {line.estimate}
                  </span>
                  <span className="text-[13px] text-ink-soft">{line.detail}</span>
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      </section>
    </div>
  );
}
