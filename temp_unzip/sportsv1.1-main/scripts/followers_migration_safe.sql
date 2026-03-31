-- Create followers table for social features
create table if not exists followers (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- Index for performance
create index if not exists followers_follower_id_idx on followers(follower_id);
create index if not exists followers_following_id_idx on followers(following_id);

-- RLS Policies
alter table followers enable row level security;

-- Everyone can read followers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'followers'
        AND policyname = 'Followers are viewable by everyone'
    ) THEN
        create policy "Followers are viewable by everyone"
          on followers for select
          using ( true );
    END IF;
END
$$;

-- Authenticated users can follow others
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'followers'
        AND policyname = 'Authenticated users can create follows'
    ) THEN
        create policy "Authenticated users can create follows"
          on followers for insert
          with check ( auth.uid() = follower_id );
    END IF;
END
$$;

-- Authenticated users can unfollow
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'followers'
        AND policyname = 'Users can delete their own follows'
    ) THEN
        create policy "Users can delete their own follows"
          on followers for delete
          using ( auth.uid() = follower_id );
    END IF;
END
$$;

-- Add stats columns to profiles if not exists (for caching counts)
alter table profiles 
add column if not exists followers_count integer default 0,
add column if not exists following_count integer default 0;
