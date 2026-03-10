create extension if not exists "pgcrypto";

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_path text not null unique,
  public_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  jersey_number integer,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  timestamp_seconds integer not null check (timestamp_seconds >= 0),
  event_type text not null check (
    event_type in (
      '2pt made',
      '2pt missed',
      '3pt made',
      'turnover',
      'rebound',
      'foul',
      'assist',
      'steal'
    )
  ),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.event_players (
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, player_id)
);

create index if not exists idx_events_video_timestamp
  on public.events (video_id, timestamp_seconds);

create index if not exists idx_players_name
  on public.players (name);

alter table public.videos enable row level security;
alter table public.players enable row level security;
alter table public.events enable row level security;
alter table public.event_players enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'videos' and policyname = 'service_role_all_videos'
  ) then
    create policy service_role_all_videos on public.videos
      for all to service_role using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'players' and policyname = 'service_role_all_players'
  ) then
    create policy service_role_all_players on public.players
      for all to service_role using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'events' and policyname = 'service_role_all_events'
  ) then
    create policy service_role_all_events on public.events
      for all to service_role using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_players' and policyname = 'service_role_all_event_players'
  ) then
    create policy service_role_all_event_players on public.event_players
      for all to service_role using (true) with check (true);
  end if;
end $$;
