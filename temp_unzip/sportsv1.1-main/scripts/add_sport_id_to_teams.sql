-- Migration to add missing sport_id to teams table
-- Run this in Supabase SQL Editor

ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS sport_id text DEFAULT 's1';

-- Update RLS policies to be safer (optional but recommended)
-- Ensure sport_id is visible
-- (Existing select policy covers this as it uses TRUE)
