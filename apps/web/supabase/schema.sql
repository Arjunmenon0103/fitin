create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age int not null,
  gender text not null,
  height_cm int not null,
  weight_kg numeric not null,
  target_weight_kg numeric not null,
  activity_level text not null,
  region text not null,
  goal text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric not null,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

create table if not exists app_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  event_type text not null default 'view',
  path text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists admin_emails (
  email text primary key,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  category text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  week_start date not null,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_weight_entries_user_date on weight_entries(user_id, date);
create index if not exists idx_app_events_created_at on app_events(created_at desc);
create index if not exists idx_app_events_user_email on app_events(user_email);
create index if not exists idx_feedback_user_created_at on feedback(user_id, created_at desc);
create index if not exists idx_feedback_reviewed on feedback(reviewed);

alter table profiles enable row level security;
alter table weight_entries enable row level security;
alter table app_events enable row level security;
alter table feedback enable row level security;
alter table admin_emails enable row level security;

insert into admin_emails(email)
values ('30may1991@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select
    lower(coalesce(auth.jwt() ->> 'email', '')) = '30may1991@gmail.com'
    or exists (
      select 1 from public.admin_emails a
      where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

create policy "profiles own select" on profiles
  for select using (auth.uid() = id);

create policy "profiles own upsert" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles own update" on profiles
  for update using (auth.uid() = id);

create policy "profiles admin read" on profiles
  for select using (public.is_admin_user());

create policy "weight own read" on weight_entries
  for select using (auth.uid() = user_id);

create policy "weight own write" on weight_entries
  for insert with check (auth.uid() = user_id);

create policy "weight own update" on weight_entries
  for update using (auth.uid() = user_id);

create policy "app events own insert" on app_events
  for insert with check (auth.uid() = user_id);

create policy "app events admin read" on app_events
  for select using (public.is_admin_user());

create policy "feedback own read" on feedback
  for select using (auth.uid() = user_id);

create policy "feedback own insert" on feedback
  for insert with check (auth.uid() = user_id);

create policy "feedback admin read" on feedback
  for select using (public.is_admin_user());

create policy "admin emails admin read" on admin_emails
  for select using (public.is_admin_user());

create policy "admin emails admin insert" on admin_emails
  for insert with check (public.is_admin_user());

create policy "admin emails admin delete" on admin_emails
  for delete using (public.is_admin_user());

-- Promote first admin manually (replace with your auth user UUID)
-- update profiles set is_admin = true where id = '00000000-0000-0000-0000-000000000000';
