-- Omega TV Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/dvzwpwlgucsdyrkhrpah/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ===========================================
-- PRAYERS
-- ===========================================
create table if not exists prayers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  topic text not null,
  content text not null,
  pray_count integer default 0,
  is_approved boolean default false,
  is_answered boolean default false,
  created_at timestamptz default now()
);

alter table prayers enable row level security;
create policy "Anyone can read approved prayers" on prayers for select using (is_approved = true);
create policy "Anyone can insert prayers" on prayers for insert with check (true);
create policy "Service role full access on prayers" on prayers for all using (auth.role() = 'service_role');

-- ===========================================
-- SUBSCRIBERS
-- ===========================================
create table if not exists subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  name text,
  segments text[] default '{"newsletter"}',
  is_verified boolean default false,
  created_at timestamptz default now()
);

alter table subscribers enable row level security;
create policy "Service role full access on subscribers" on subscribers for all using (auth.role() = 'service_role');
create policy "Anyone can insert subscribers" on subscribers for insert with check (true);

-- ===========================================
-- NEWSLETTERS
-- ===========================================
create table if not exists newsletters (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author text not null default 'Omega',
  content text not null,
  is_published boolean default false,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table newsletters enable row level security;
create policy "Anyone can read published newsletters" on newsletters for select using (is_published = true);
create policy "Service role full access on newsletters" on newsletters for all using (auth.role() = 'service_role');

-- ===========================================
-- SERIES (TV Shows / Programs)
-- ===========================================
create table if not exists series (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  description text,
  host text,
  poster_vertical text,
  poster_horizontal text,
  status text default 'active',
  created_at timestamptz default now()
);

alter table series enable row level security;
create policy "Anyone can read series" on series for select using (true);
create policy "Service role full access on series" on series for all using (auth.role() = 'service_role');

-- ===========================================
-- SEASONS
-- ===========================================
create table if not exists seasons (
  id uuid default uuid_generate_v4() primary key,
  series_id uuid not null references series(id) on delete cascade,
  season_number integer not null,
  title text,
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table seasons enable row level security;
create policy "Anyone can read seasons" on seasons for select using (true);
create policy "Service role full access on seasons" on seasons for all using (auth.role() = 'service_role');

-- ===========================================
-- EPISODES
-- ===========================================
create table if not exists episodes (
  id uuid default uuid_generate_v4() primary key,
  series_id uuid not null references series(id) on delete cascade,
  season_id uuid not null references seasons(id) on delete cascade,
  bunny_video_id text not null,
  title text not null,
  episode_number integer not null,
  duration integer,
  description text,
  thumbnail_custom text,
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table episodes enable row level security;
create policy "Anyone can read episodes" on episodes for select using (true);
create policy "Service role full access on episodes" on episodes for all using (auth.role() = 'service_role');

-- ===========================================
-- TESTIMONIALS
-- ===========================================
create table if not exists testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  content text not null,
  is_approved boolean default false,
  created_at timestamptz default now()
);

alter table testimonials enable row level security;
create policy "Anyone can read approved testimonials" on testimonials for select using (is_approved = true);
create policy "Anyone can insert testimonials" on testimonials for insert with check (true);
create policy "Service role full access on testimonials" on testimonials for all using (auth.role() = 'service_role');
