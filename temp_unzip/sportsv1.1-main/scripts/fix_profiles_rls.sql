-- Fix Profiles RLS Policies
-- This ensures that users can ALWAYS see, insert, and update their own profile.

-- 1. Enable RLS (just in case)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
    -- Drop potential default policies from templates
    DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
    DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
END $$;

-- 3. Create new, permissive policies

-- Allow everyone to read profiles (needed for finding opponents, social feed, etc.)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING ( true );

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- 4. Grant basic permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon; -- For public profile pages
