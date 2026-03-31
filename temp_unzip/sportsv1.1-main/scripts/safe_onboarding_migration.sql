-- Safe Migration to add Onboarding fields
-- Run this in Supabase SQL Editor

-- 1. Add new columns to profiles (Safe to re-run)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS favorite_game text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now());

-- 2. Create index for fast username lookup (Safe to re-run)
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- 3. Create Storage Bucket for Avatars (Safe to re-run)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 4. Storage Policies (Safely drop first to avoid errors)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;
END $$;

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' );
