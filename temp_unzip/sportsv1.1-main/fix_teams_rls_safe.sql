-- Safe Policy Migration Script
-- 1. Enable RLS (idempotent)
alter table public.teams enable row level security;

-- 2. Safely recreate "Authenticated users can create teams"
drop policy if exists "Authenticated users can create teams" on public.teams;
create policy "Authenticated users can create teams"
on public.teams
for insert
with check (auth.role() = 'authenticated');

-- 3. Safely recreate "Teams are viewable by everyone"
drop policy if exists "Teams are viewable by everyone" on public.teams;
create policy "Teams are viewable by everyone"
on public.teams
for select
using (true);

-- 4. Safely recreate "Users can update their own teams"
drop policy if exists "Users can update their own teams" on public.teams;
create policy "Users can update their own teams"
on public.teams
for update
using (auth.uid() = created_by);
