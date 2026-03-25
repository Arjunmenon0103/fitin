import type { UserProfile, WeightEntry } from '@fitin/core';
import { hasSupabaseConfig, supabase } from './supabase';

export interface AppFeedback {
  id: string;
  user_email: string | null;
  category: string;
  rating: number;
  comment: string;
  week_start: string;
  reviewed: boolean;
  created_at: string;
}

export interface AdminEmailEntry {
  email: string;
  created_at: string;
}

export async function markFeedbackReviewed(feedbackId: string, reviewed: boolean) {
  if (!hasSupabaseConfig || !supabase) return { error: 'Supabase is not configured' };

  const { error } = await supabase
    .from('feedback')
    .update({ reviewed })
    .eq('id', feedbackId);

  return { error: error?.message };
}

export async function loadProfile(userId: string): Promise<UserProfile | null> {
  if (!hasSupabaseConfig || !supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('name, age, gender, height_cm, weight_kg, target_weight_kg, activity_level, region, goal, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    name: data.name,
    age: data.age,
    gender: data.gender,
    heightCm: data.height_cm,
    weightKg: Number(data.weight_kg),
    targetWeightKg: Number(data.target_weight_kg),
    activityLevel: data.activity_level,
    region: data.region,
    goal: data.goal,
    createdAt: data.created_at,
  } as UserProfile;
}

export async function saveProfile(userId: string, profile: UserProfile) {
  if (!hasSupabaseConfig || !supabase) return;

  await supabase.from('profiles').upsert({
    id: userId,
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    height_cm: profile.heightCm,
    weight_kg: profile.weightKg,
    target_weight_kg: profile.targetWeightKg,
    activity_level: profile.activityLevel,
    region: profile.region,
    goal: profile.goal,
    created_at: profile.createdAt,
  });
}

export async function loadWeightEntries(userId: string): Promise<WeightEntry[]> {
  if (!hasSupabaseConfig || !supabase) return [];

  const { data, error } = await supabase
    .from('weight_entries')
    .select('date, weight_kg')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error || !data) return [];

  return data.map((entry) => ({
    date: entry.date,
    weightKg: Number(entry.weight_kg),
  }));
}

export async function saveWeightEntry(userId: string, entry: WeightEntry) {
  if (!hasSupabaseConfig || !supabase) return;

  await supabase.from('weight_entries').upsert({
    user_id: userId,
    date: entry.date,
    weight_kg: entry.weightKg,
  });
}

export async function deleteWeightEntry(userId: string, date: string) {
  if (!hasSupabaseConfig || !supabase) return { error: 'Supabase is not configured' };

  const { error } = await supabase
    .from('weight_entries')
    .delete()
    .eq('user_id', userId)
    .eq('date', date);

  return { error: error?.message };
}

export async function trackView(path: string, userId: string, userEmail: string | null) {
  if (!hasSupabaseConfig || !supabase) return;

  await supabase.from('app_events').insert({
    user_id: userId,
    user_email: userEmail,
    event_type: 'view',
    path,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 240) : null,
  });
}

export async function submitFeedback(input: {
  userId: string;
  userEmail: string | null;
  category: string;
  rating: number;
  comment: string;
  weekStart: string;
}) {
  if (!hasSupabaseConfig || !supabase) return { error: 'Supabase is not configured' };

  const { error } = await supabase.from('feedback').insert({
    user_id: input.userId,
    user_email: input.userEmail,
    category: input.category,
    rating: input.rating,
    comment: input.comment,
    week_start: input.weekStart,
  });

  return { error: error?.message };
}

export async function getMyFeedback(userId: string): Promise<AppFeedback[]> {
  if (!hasSupabaseConfig || !supabase) return [];

  const { data, error } = await supabase
    .from('feedback')
    .select('id, user_email, category, rating, comment, week_start, reviewed, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error || !data) return [];
  return data as AppFeedback[];
}

export async function getAdminOverview() {
  if (!hasSupabaseConfig || !supabase) {
    return {
      totalViews7d: 0,
      activeUsers7d: 0,
      totalProfiles: 0,
      pendingFeedback: 0,
      latestFeedback: [] as AppFeedback[],
      topUsers: [] as { email: string; views: number }[],
      error: 'Supabase is not configured',
    };
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();

  const [eventsResult, profilesResult, pendingFeedbackResult, feedbackResult] = await Promise.all([
    supabase
      .from('app_events')
      .select('user_email, created_at, path')
      .gte('created_at', sinceIso),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .eq('reviewed', false),
    supabase
      .from('feedback')
      .select('id, user_email, category, rating, comment, week_start, reviewed, created_at')
      .order('created_at', { ascending: false })
      .limit(25),
  ]);

  const events = eventsResult.data || [];
  const userViewCounts = new Map<string, number>();

  for (const event of events) {
    const key = event.user_email || 'unknown';
    userViewCounts.set(key, (userViewCounts.get(key) || 0) + 1);
  }

  const topUsers = [...userViewCounts.entries()]
    .map(([email, views]) => ({ email, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  return {
    totalViews7d: events.length,
    activeUsers7d: userViewCounts.size,
    totalProfiles: profilesResult.count || 0,
    pendingFeedback: pendingFeedbackResult.count || 0,
    latestFeedback: (feedbackResult.data || []) as AppFeedback[],
    topUsers,
    error:
      eventsResult.error?.message ||
      profilesResult.error?.message ||
      pendingFeedbackResult.error?.message ||
      feedbackResult.error?.message ||
      null,
  };
}

export async function getAdminEmails(): Promise<AdminEmailEntry[]> {
  if (!hasSupabaseConfig || !supabase) return [];

  const { data, error } = await supabase
    .from('admin_emails')
    .select('email, created_at')
    .order('email', { ascending: true });

  if (error || !data) return [];
  return data as AdminEmailEntry[];
}

export async function addAdminEmail(email: string) {
  if (!hasSupabaseConfig || !supabase) return { error: 'Supabase is not configured' };

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { error: 'Admin email is required' };

  const userId = (await supabase.auth.getUser()).data.user?.id || null;
  const { error } = await supabase.from('admin_emails').upsert({
    email: normalizedEmail,
    created_by: userId,
  });

  return { error: error?.message };
}

export async function removeAdminEmail(email: string) {
  if (!hasSupabaseConfig || !supabase) return { error: 'Supabase is not configured' };

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { error: 'Admin email is required' };

  const { error } = await supabase
    .from('admin_emails')
    .delete()
    .eq('email', normalizedEmail);

  return { error: error?.message };
}
