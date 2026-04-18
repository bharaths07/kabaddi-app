create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text unique,
  photo text,
  email text
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  email text,
  city text,
  state text,
  avatar_url text,
  date_of_birth date,
  is_profile_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists email text;
alter table profiles add column if not exists city text;
alter table profiles add column if not exists state text;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists date_of_birth date;
alter table profiles add column if not exists is_profile_complete boolean not null default false;
alter table profiles add column if not exists subscription_tier text default 'free';
alter table profiles add column if not exists subscription_status text default 'active';
alter table profiles add column if not exists created_at timestamptz not null default now();

alter table profiles add column if not exists updated_at timestamptz not null default now();

alter table profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on profiles;
create policy "Profiles are readable by everyone"
on profiles for select
using (true);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    email,
    avatar_url,
    created_at,
    updated_at
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.phone,
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  on conflict (id) do update
    set phone = coalesce(excluded.phone, profiles.phone),
        email = coalesce(excluded.email, profiles.email),
        updated_at = now();

  return new;
exception
  when others then
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  start_date date,
  end_date date,
  venue text,
  level text,
  format text,
  join_code text unique,
  organizer_id uuid references users(id),
  
  -- Missing Config Columns
  contact_phone text,
  organizer_name text,
  created_by uuid,
  city_state text,
  all_out_points int default 2,
  raid_timer int default 30,
  players_on_court int default 7,
  squad_size int default 12,
  half_duration int default 20,
  do_or_die boolean default true,
  courts int default 1,
  super_tackle boolean default true,
  bonus_line boolean default true,
  entry_fee text,
  prize text,
  setup_status jsonb default '{}'::jsonb
);

-- Ensure match_scorers exists (often used as alias for fixture_scorers)
create table if not exists public.match_scorers (
  match_id uuid references public.fixtures(id) on delete cascade,
  user_id uuid references auth.users(id),
  assigned_at timestamptz default now(),
  status text,
  primary key (match_id, user_id)
);

-- Note: `match_scorers` and `fixture_scorers` are logically similar. 
-- In this app, `fixture_scorers` is preferred for consistency with the component names.



create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  name text not null,
  slug text unique,
  city text,
  short text,
  logo text,
  color text,
  status text
);


create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  slug text unique,
  role text,
  number int,
  photo text,
  is_claimed boolean default false,
  claimed_by uuid references profiles(id) on delete set null
);


create table if not exists fixtures (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  round int,
  team_home_id uuid references teams(id),
  team_guest_id uuid references teams(id),
  ts timestamptz,
  court text,
  status text
);

create table if not exists fixture_scorers (
  fixture_id uuid references fixtures(id) on delete cascade,
  user_id uuid references users(id),
  status text,
  primary key (fixture_id, user_id)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid references fixtures(id) on delete cascade,
  ts timestamptz not null default now(),
  type text not null,
  payload jsonb
);

-- 14. Kabaddi Live Scoring Tables
create table if not exists public.kabaddi_matches (
  id uuid primary key references public.fixtures(id) on delete cascade,
  home_score int default 0,
  guest_score int default 0,
  raid_number int default 0,
  current_time int default 1200, -- 20 mins in seconds
  is_timer_running boolean default false,
  status text default 'upcoming' check (status in ('upcoming', 'live', 'completed')),
  updated_at timestamptz default now()
);

create table if not exists public.raid_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.fixtures(id) on delete cascade not null,
  raid_number int not null,
  raider_id uuid references public.players(id) on delete cascade,
  defending_team text check (defending_team in ('home', 'guest')),
  points_scored int default 0,
  touch_points int default 0,
  is_bonus boolean default false,
  is_super_raid boolean default false,
  is_super_tackle boolean default false,
  is_do_or_die boolean default false,
  type text default 'raid' check (type in ('raid', 'tackle', 'empty', 'technical')),
  defender_ids uuid[] default array[]::uuid[],
  success boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.player_match_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade not null,
  match_id uuid references public.fixtures(id) on delete cascade not null,
  raids int default 0,
  raid_pts int default 0, 
  successful_raids int default 0,
  empty_raids int default 0,
  super_raids int default 0,
  bonus_pts int default 0,     
  tackles int default 0,
  tackle_pts int default 0,
  super_tackles int default 0,
  total_pts int default 0,
  created_at timestamptz default now(),
  unique(player_id, match_id)
);

alter table public.kabaddi_matches enable row level security;
alter table public.raid_events enable row level security;
alter table public.player_match_stats enable row level security;

create policy "Kabaddi matches are public" on public.kabaddi_matches for select using (true);
create policy "Raid events are public" on public.raid_events for select using (true);
create policy "Player stats are public" on public.player_match_stats for select using (true);

create policy "Scorers can update match data"
  on public.kabaddi_matches for update
  using (
    exists (
      select 1 from public.fixture_scorers
      where fixture_id = id
      and user_id = auth.uid()
    )
  );

create policy "Scorers can insert raid events"
  on public.raid_events for insert
  with check (
    exists (
      select 1 from public.fixture_scorers
      where fixture_id = match_id
      and user_id = auth.uid()
    )
  );


-- 1. Create feed_posts table
create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('photo', 'announcement', 'achievement', 'result')),
  caption text,
  image_url text,
  likes_count int default 0,
  tournament_id uuid references public.tournaments(id) on delete set null,
  match_id uuid references public.kabaddi_matches(id) on delete set null,
  created_at timestamptz default now() not null
);

-- 2. Create feed_likes table for tracking individual likes
create table if not exists public.feed_likes (
  post_id uuid references public.feed_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (post_id, user_id)
);

-- 3. Enable RLS
alter table public.feed_posts enable row level security;
alter table public.feed_likes enable row level security;

-- 4. RLS Policies for feed_posts
drop policy if exists "Everyone can view feed posts" on public.feed_posts;
create policy "Everyone can view feed posts"
  on public.feed_posts for select
  using (true);

drop policy if exists "Authenticated users can create feed posts" on public.feed_posts;
create policy "Authenticated users can create feed posts"
  on public.feed_posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own posts" on public.feed_posts;
create policy "Users can update their own posts"
  on public.feed_posts for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own posts" on public.feed_posts;
create policy "Users can delete their own posts"
  on public.feed_posts for delete
  using (auth.uid() = user_id);

-- 5. RLS Policies for feed_likes
drop policy if exists "Everyone can view feed likes" on public.feed_likes;
create policy "Everyone can view feed likes"
  on public.feed_likes for select
  using (true);

drop policy if exists "Authenticated users can like posts" on public.feed_likes;
create policy "Authenticated users can like posts"
  on public.feed_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can unlike posts" on public.feed_likes;
create policy "Users can unlike posts"
  on public.feed_likes for delete
  using (auth.uid() = user_id);

-- 6. Trigger to auto-increment/decrement likes_count on feed_posts
create or replace function public.handle_feed_like()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.feed_posts
    set likes_count = likes_count + 1
    where id = new.post_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.feed_posts
    set likes_count = likes_count - 1
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_feed_like on public.feed_likes;
create trigger on_feed_like
  after insert or delete on public.feed_likes
  for each row execute function public.handle_feed_like();

-- 7. Add comments_count to feed_posts (if not exists)
alter table public.feed_posts add column if not exists comments_count int default 0;

-- 8. Create feed_comments table
create table if not exists public.feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.feed_posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now() not null
);

alter table public.feed_comments enable row level security;

create policy "Everyone can view comments"
  on public.feed_comments for select
  using (true);

create policy "Authenticated users can comment"
  on public.feed_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.feed_comments for delete
  using (auth.uid() = user_id);

-- 9. Trigger to maintain comments_count
create or replace function public.handle_feed_comment()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.feed_posts
    set comments_count = comments_count + 1
    where id = new.post_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.feed_posts
    set comments_count = comments_count - 1
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_feed_comment
  after insert or delete on public.feed_comments
  for each row execute function public.handle_feed_comment();

-- 10. Create news_posts table (Official read-only updates)
create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('announcement', 'result', 'update')),
  title text not null,
  body text,
  image_url text,
  tournament_id uuid references public.tournaments(id) on delete set null,
  match_id uuid references public.fixtures(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.news_posts enable row level security;

create policy "Everyone can view news"
  on public.news_posts for select
  using (true);

create policy "Only organizers/admins can create news"
  on public.news_posts for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      -- and role in ('organizer', 'admin') -- Add role check if Roles table exists
    )
  );

-- 11. Ensure Foreign Key Relationships for PostgREST joins
-- This helps if tables were created without naming the constraints or if cache is stale
alter table if exists public.feed_posts 
  drop constraint if exists feed_posts_user_id_fkey,
  add constraint feed_posts_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;

alter table if exists public.feed_comments
  drop constraint if exists feed_comments_user_id_fkey,
  add constraint feed_comments_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;

alter table if exists public.news_posts
  drop constraint if exists news_posts_created_by_fkey,
  add constraint news_posts_created_by_fkey foreign key (created_by) references public.profiles(id) on delete set null;

-- 12. Pro Profile System Columns
alter table public.profiles add column if not exists banner_url text;
alter table public.profiles add column if not exists player_id text unique;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists team_name text;
alter table public.profiles add column if not exists jersey_number text;
alter table public.profiles add column if not exists bio text;

-- 13. Registration Requests Table
create table if not exists public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  team_name text not null,
  team_short text,
  team_color text,
  captain_name text,
  players jsonb default '[]',
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now() not null
);

alter table public.registration_requests enable row level security;

create policy "Users can view their own registration requests"
  on public.registration_requests for select
  using (auth.uid() = user_id);

create policy "Organizers can view requests for their tournaments"
  on public.registration_requests for select
  using (
    exists (
      select 1 from public.tournaments
      where tournaments.id = tournament_id
      and tournaments.organizer_id = auth.uid()
    )
  );

create policy "Authenticated users can submit registration requests"
  on public.registration_requests for insert
  with check (auth.uid() = user_id);

create policy "Organizers can update request status"
  on public.registration_requests for update
  using (
    exists (
      select 1 from public.tournaments
      where tournaments.id = tournament_id
      and tournaments.organizer_id = auth.uid()
    )
  );

-- MIGRATION SCRIPT (Run this if database is already created)
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';
-- ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS slug text UNIQUE;
-- ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS city text;
-- ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS logo text;
-- ALTER TABLE public.players ADD COLUMN IF NOT EXISTS slug text UNIQUE;
-- ALTER TABLE public.players ADD COLUMN IF NOT EXISTS photo text;
