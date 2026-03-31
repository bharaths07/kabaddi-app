-- Migration to add Onboarding fields
-- Run this in Supabase SQL Editor

-- 1. Add new columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS favorite_game text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now());

-- 2. Create index for fast username lookup
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- 3. Create Storage Bucket for Avatars (if not exists)
-- Note: This usually requires using the Dashboard or Storage API, 
-- but we can try inserting into storage.buckets if permissions allow.
-- If this fails, please Create a Public Bucket named 'avatars' in the Dashboard.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 4. Storage Policies (Allow public read, authenticated upload)
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' );
