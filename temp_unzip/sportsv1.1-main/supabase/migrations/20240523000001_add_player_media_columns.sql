-- Add photos and highlights columns to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE players ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;
