-- Enable RLS on teams table
alter table public.teams enable row level security;

-- Create policy to allow authenticated users to create teams
create policy "Authenticated users can create teams"
on public.teams
for insert
with check (auth.role() = 'authenticated');

-- Create policy to allow users to read all teams (or restrict as needed)
create policy "Teams are viewable by everyone"
on public.teams
for select
using (true);

-- Create policy to allow users to update their own teams
create policy "Users can update their own teams"
on public.teams
for update
using (auth.uid() = created_by);

-- Ensure created_by column exists and is a UUID
-- (If it was text before, we might need to cast, but usually it's uuid)
-- alter table public.teams alter column created_by type uuid using created_by::uuid;
