create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text unique,
  photo text,
  email text
);

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  venue text,
  level text,
  format text,
  join_code text unique,
  organizer_id uuid references users(id)
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  name text not null,
  short text,
  color text,
  status text
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  role text,
  number int
);

create table if not exists fixtures (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  round int,
  team_home_id uuid references teams(id),
  team_guest_id uuid references teams(id),
  ts timestamptz,
  court text,
  status text
);

create table if not exists fixture_scorers (
  fixture_id uuid references fixtures(id) on delete cascade,
  user_id uuid references users(id),
  status text,
  primary key (fixture_id, user_id)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid references fixtures(id) on delete cascade,
  ts timestamptz not null default now(),
  type text not null,
  payload jsonb
);
