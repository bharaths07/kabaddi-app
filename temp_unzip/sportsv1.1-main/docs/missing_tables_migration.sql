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
