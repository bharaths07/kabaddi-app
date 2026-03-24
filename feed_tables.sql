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

-- 7. Ensure profiles table is related to auth.users (already in schema.sql but making sure)
-- This allows the select profiles!inner(...) join to work.
-- NOTE: In Supabase, the relationship from feed_posts.user_id to profiles.id 
-- is inferred because both point to auth.users(id).
