-- SQL Migration: Add Claiming Columns to Players Table
-- This script adds 'is_claimed' and 'claimed_by' columns to support the athlete verification flow.

-- 1. Add 'is_claimed' column
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false;

-- 2. Add 'claimed_by' column referencing the profiles table
-- Profiles table is assumed to be the user identity table following Supabase Auth.
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Add index for faster lookups by claiming user
CREATE INDEX IF NOT EXISTS idx_players_claimed_by ON public.players(claimed_by);

-- 4. Set RLS (if players table has RLS enabled)
-- Ensure public can read claim status but only system/admins can modify outside the app logic
-- (App logic handles verification before updating)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players are public" ON public.players;
CREATE POLICY "Players are public" ON public.players FOR SELECT USING (true);
