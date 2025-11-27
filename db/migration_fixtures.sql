-- Create fixtures table
create table if not exists public.fixtures (
  id text primary key, -- External ID (e.g., from Mackolik/Iddaa)
  home_team text not null,
  away_team text not null,
  league text,
  match_time timestamp with time zone not null,
  odds jsonb, -- Store odds as JSON: { "1": 2.10, "X": 3.00, "2": 2.50 }
  score text, -- e.g., "2-1"
  status text default 'NOT_STARTED', -- NOT_STARTED, LIVE, FINISHED
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.fixtures enable row level security;

-- Policies
create policy "Public fixtures are viewable by everyone."
  on public.fixtures for select
  using ( true );

create policy "Admins can insert fixtures."
  on public.fixtures for insert
  with check (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()::text
      and public.users.role = 'Admin'
    )
  );

create policy "Admins can update fixtures."
  on public.fixtures for update
  using (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()::text
      and public.users.role = 'Admin'
    )
  );
