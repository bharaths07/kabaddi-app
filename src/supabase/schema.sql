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
  organizer_id uuid references users(id)
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  name text not null,
  short text,
  color text,
  status text
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  role text,
  number int
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
