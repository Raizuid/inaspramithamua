create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null check (length(trim(client_name)) > 0),
  event_type text not null default 'Wedding',
  city text not null check (length(trim(city)) > 0),
  appointment_date date not null,
  appointment_time time not null,
  income numeric(14,2) not null check (income >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists appointments_user_date_idx on public.appointments(user_id, appointment_date, appointment_time);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique(user_id, endpoint)
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

create table if not exists public.reminders_sent (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('h1','h3')),
  sent_at timestamptz not null default now(),
  unique(appointment_id, reminder_type)
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end; $$;
drop trigger if exists appointments_updated_at on public.appointments;
create trigger appointments_updated_at before update on public.appointments for each row execute function public.set_updated_at();

alter table public.appointments enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reminders_sent enable row level security;

drop policy if exists "appointments_select_own" on public.appointments;
drop policy if exists "appointments_insert_own" on public.appointments;
drop policy if exists "appointments_update_own" on public.appointments;
drop policy if exists "appointments_delete_own" on public.appointments;
create policy "appointments_select_own" on public.appointments for select using (auth.uid()=user_id);
create policy "appointments_insert_own" on public.appointments for insert with check (auth.uid()=user_id);
create policy "appointments_update_own" on public.appointments for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "appointments_delete_own" on public.appointments for delete using (auth.uid()=user_id);

drop policy if exists "push_select_own" on public.push_subscriptions;
drop policy if exists "push_insert_own" on public.push_subscriptions;
drop policy if exists "push_delete_own" on public.push_subscriptions;
create policy "push_select_own" on public.push_subscriptions for select using (auth.uid()=user_id);
create policy "push_insert_own" on public.push_subscriptions for insert with check (auth.uid()=user_id);
create policy "push_delete_own" on public.push_subscriptions for delete using (auth.uid()=user_id);

-- reminders_sent is intentionally not writable by the browser. Edge Function uses service role.
create policy "reminders_select_own" on public.reminders_sent for select using (exists(select 1 from public.appointments a where a.id=appointment_id and a.user_id=auth.uid()));
