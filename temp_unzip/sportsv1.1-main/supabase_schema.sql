-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Alter TEAMS table to add sport_id
alter table if exists public.teams 
add column if not exists sport_id text default 's1';

-- 2. Create PLAYERS table
create table if not exists public.players (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  first_name text not null,
  last_name text,
  avatar_url text,
  active boolean default true,
  status text default 'active',
  stats jsonb default '{}'::jsonb,
  history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create ACHIEVEMENTS table
create table if not exists public.achievements (
  id text primary key, -- Using text id as per frontend logic (Date.now().toString())
  type text not null,
  title text not null,
  description text,
  player_id uuid references public.players(id), -- Assuming player_id links to players table
  match_id uuid references public.matches(id),
  date timestamp with time zone,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create CERTIFICATES table
create table if not exists public.certificates (
  id text primary key,
  type text not null,
  title text not null,
  description text,
  player_id uuid references public.players(id),
  match_id uuid references public.matches(id),
  achievement_id text references public.achievements(id),
  tournament_id uuid references public.tournaments(id),
  template_id text default 'default',
  recipient_name text,
  date timestamp with time zone,
  issue_date timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references auth.users(id),
  verification_hash text default 'pending',
  status text default 'issued',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create FEED_ITEMS table
create table if not exists public.feed_items (
  id text primary key,
  type text not null,
  title text not null,
  content text,
  published_at timestamp with time zone default timezone('utc'::text, now()),
  related_entity_id text,
  visibility text default 'public',
  author_id uuid references auth.users(id),
  author_name text,
  author_type text,
  likes_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  media jsonb default '[]'::jsonb,
  hashtags text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create MATCH_SCORERS table
create table if not exists public.match_scorers (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches(id) not null,
  user_id uuid references auth.users(id) not null,
  assigned_by uuid references auth.users(id),
  assigned_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(match_id, user_id)
);

-- Enable Row Level Security (RLS)
alter table public.players enable row level security;
alter table public.achievements enable row level security;
alter table public.certificates enable row level security;
alter table public.feed_items enable row level security;
alter table public.match_scorers enable row level security;

-- Create basic RLS policies (Open for development, restrict for production)

-- Players: Public read, authenticated create/update
create policy "Players are viewable by everyone" on public.players for select using (true);
create policy "Users can insert their own player profile" on public.players for insert with check (auth.uid() = user_id);
create policy "Users can update their own player profile" on public.players for update using (auth.uid() = user_id);

-- Achievements: Public read, authenticated create
create policy "Achievements are viewable by everyone" on public.achievements for select using (true);
create policy "Authenticated users can create achievements" on public.achievements for insert with check (auth.role() = 'authenticated');

-- Certificates: Public read, authenticated create
create policy "Certificates are viewable by everyone" on public.certificates for select using (true);
create policy "Authenticated users can create certificates" on public.certificates for insert with check (auth.role() = 'authenticated');

-- Feed Items: Public read, authenticated create
create policy "Feed items are viewable by everyone" on public.feed_items for select using (true);
create policy "Authenticated users can create feed items" on public.feed_items for insert with check (auth.role() = 'authenticated');

-- Match Scorers: Public read, authenticated create/delete
create policy "Match scorers are viewable by everyone" on public.match_scorers for select using (true);
create policy "Authenticated users can assign scorers" on public.match_scorers for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can remove scorers" on public.match_scorers for delete using (auth.role() = 'authenticated');
