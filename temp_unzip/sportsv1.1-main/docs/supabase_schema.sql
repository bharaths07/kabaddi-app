-- Enable UUID extension (usually enabled by default in Supabase)
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Public User Data)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  avatar_url text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Safely drop trigger if exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. TEAMS
create table if not exists public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  short_name text,
  logo_url text,
  type text default 'club', -- club, corporate, etc.
  captain_id uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  active boolean default true
);

alter table public.teams enable row level security;

create policy "Teams are viewable by everyone" on public.teams for select using (true);
create policy "Authenticated users can create teams" on public.teams for insert with check (auth.role() = 'authenticated');
create policy "Creators can update their teams" on public.teams for update using (auth.uid() = created_by);


-- 3. TEAM MEMBERS
create table if not exists public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id), -- Nullable if we allow non-user players later
  player_name text, -- Fallback if not a real user
  role text default 'member', -- captain, vice-captain, member
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.team_members enable row level security;
create policy "Team members viewable by everyone" on public.team_members for select using (true);
create policy "Team creators can manage members" on public.team_members for all using (
  exists (select 1 from public.teams where id = team_members.team_id and created_by = auth.uid())
);


-- 4. TOURNAMENTS
create table if not exists public.tournaments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  start_date date,
  end_date date,
  status text check (status in ('upcoming', 'ongoing', 'completed')) default 'upcoming',
  location text,
  description text,
  banner_url text,
  organizer_id uuid references public.profiles(id),
  structure jsonb, -- Stores format, groups, rules
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tournaments enable row level security;
create policy "Tournaments viewable by everyone" on public.tournaments for select using (true);
create policy "Authenticated users can create tournaments" on public.tournaments for insert with check (auth.role() = 'authenticated');
create policy "Organizers can update tournaments" on public.tournaments for update using (auth.uid() = organizer_id);


-- 5. MATCHES
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references public.tournaments(id) on delete set null,
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  start_time timestamp with time zone,
  location text,
  status text check (status in ('scheduled', 'live', 'completed', 'abandoned', 'created')) default 'created',
  result text,
  winner_id uuid references public.teams(id),
  
  -- JSONB for complex game state (scorecard, innings, current batter/bowler)
  -- This allows us to evolve the scoring logic without constant schema migrations
  data jsonb default '{}'::jsonb,
  
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.matches enable row level security;
create policy "Matches viewable by everyone" on public.matches for select using (true);
create policy "Authenticated users can create matches" on public.matches for insert with check (auth.role() = 'authenticated');
create policy "Creators/Scorers can update matches" on public.matches for update using (
  auth.uid() = created_by 
  -- In future, add OR check for assigned scorers
);

-- 6. PLAYERS (Extended Profile / Career Stats)
-- Note: 'profiles' handles auth/user info. 'players' handles sport-specific stats & history.
create table if not exists public.players (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id), -- Nullable for managed players
  first_name text not null,
  last_name text,
  active boolean default true,
  status text default 'active',
  avatar_url text,
  stats jsonb default '{}'::jsonb,
  history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.players enable row level security;
create policy "Players viewable by everyone" on public.players for select using (true);
create policy "Authenticated users can create players" on public.players for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own player profile" on public.players for update using (auth.uid() = user_id);

-- 7. MATCH SCORERS
create table if not exists public.match_scorers (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(match_id, user_id)
);

alter table public.match_scorers enable row level security;
create policy "Scorers viewable by everyone" on public.match_scorers for select using (true);
create policy "Authenticated users can assign scorers" on public.match_scorers for insert with check (auth.role() = 'authenticated');
create policy "Scorers can remove themselves" on public.match_scorers for delete using (auth.uid() = user_id);

-- 8. ACHIEVEMENTS
create table if not exists public.achievements (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'man_of_match', 'hat_trick', etc.
  title text not null,
  player_id uuid references public.players(id),
  match_id uuid references public.matches(id),
  date timestamp with time zone default timezone('utc'::text, now()),
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.achievements enable row level security;
create policy "Achievements viewable by everyone" on public.achievements for select using (true);
create policy "System/Scorers can create achievements" on public.achievements for insert with check (auth.role() = 'authenticated');

-- 9. CERTIFICATES
create table if not exists public.certificates (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'participation', 'merit', etc.
  title text not null,
  player_id uuid references public.players(id),
  match_id uuid references public.matches(id),
  achievement_id uuid references public.achievements(id),
  date timestamp with time zone default timezone('utc'::text, now()),
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.certificates enable row level security;
create policy "Certificates viewable by everyone" on public.certificates for select using (true);
create policy "System/Scorers can create certificates" on public.certificates for insert with check (auth.role() = 'authenticated');

-- 10. FEED ITEMS
create table if not exists public.feed_items (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'match_result', 'milestone', 'news'
  title text not null,
  content text,
  published_at timestamp with time zone default timezone('utc'::text, now()),
  related_entity_id uuid, -- Polymorphic reference (match_id, player_id, etc.)
  visibility text default 'public',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feed_items enable row level security;
create policy "Public feed items viewable by everyone" on public.feed_items for select using (visibility = 'public');
create policy "Authenticated users can create feed items" on public.feed_items for insert with check (auth.role() = 'authenticated');
