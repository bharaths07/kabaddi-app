-- Enhance profiles table with additional fields for comprehensive user management

-- 1. Add new columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS game_roles jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS email text, -- Optional display email, distinct from auth.email
ADD COLUMN IF NOT EXISTS phone text; -- Optional display phone, distinct from auth.phone

-- 2. Create index for performance on JSONB queries
CREATE INDEX IF NOT EXISTS profiles_game_roles_idx ON profiles USING gin (game_roles);

-- 3. Comment on columns
COMMENT ON COLUMN profiles.game_roles IS 'Stores role associations per game, e.g., {"Cricket": ["Batsman"], "Football": ["Striker"]}';
