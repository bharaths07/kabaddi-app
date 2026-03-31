-- Card Matches Persistence Schema (Safe to re-run)

create table if not exists public.card_matches (
  id text primary key,
  game_id text not null,
  state_json jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.card_match_events (
  id text primary key,
  match_id text references public.card_matches(id) on delete cascade,
  type text not null,
  player_id text,
  payload_json jsonb not null default '{}'::jsonb,
  timestamp timestamp with time zone not null
);

alter table public.card_matches enable row level security;
alter table public.card_match_events enable row level security;

create policy "Card matches viewable by everyone" on public.card_matches for select using (true);
create policy "Card match events viewable by everyone" on public.card_match_events for select using (true);

create policy "Authenticated users can upsert card matches" on public.card_matches
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update card matches" on public.card_matches
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can insert match events" on public.card_match_events
  for insert with check (auth.role() = 'authenticated');
