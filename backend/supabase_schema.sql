-- ============================================================
-- CropInsure Phase 1 schema
-- Run this whole file in the Supabase SQL editor
-- (project: gvbghmrifckwgqqakmro)
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. farmers (profile row 1:1 with auth.users)
-- ============================================================
create table if not exists public.farmers (
  id              uuid primary key references auth.users(id) on delete cascade,
  phone           text unique,
  full_name       text,
  is_verified     boolean not null default false,
  agri_score      int  not null default 0 check (agri_score between 0 and 900),
  current_week    int  not null default 1,
  loan_tier_key   text not null default 'LOCKED',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $func$
begin
  insert into public.farmers (id, phone)
  values (new.id, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$func$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. land_records (Week 1 verification target)
-- ============================================================
create table if not exists public.land_records (
  id              uuid primary key default gen_random_uuid(),
  farmer_id       uuid not null references public.farmers(id) on delete cascade,
  survey_number   text,
  area_acres      numeric,
  district        text default 'Mangaluru',
  lat             double precision,
  lng             double precision,
  verified        boolean not null default false,
  verified_at     timestamptz,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 3. claims (now owned by farmer, not orphaned)
-- ============================================================
create table if not exists public.claims (
  id                   bigint generated always as identity primary key,
  farmer_id            uuid not null references public.farmers(id) on delete cascade,
  crop                 text,
  pathogen             text,
  damage_percentage    int,
  recommended_action   text,
  estimated_payout     numeric,
  image_url            text,
  status               text not null default 'pending',
  source               text not null default 'app',
  raw_analysis         jsonb,
  lat                  double precision,
  lng                  double precision,
  weather_temp         numeric,
  weather_condition    text,
  created_at           timestamptz not null default now()
);

create index if not exists claims_farmer_id_idx on public.claims(farmer_id);

-- ============================================================
-- 4. score_log (backs AgriContext.scoreLog)
-- ============================================================
create table if not exists public.score_log (
  id            bigint generated always as identity primary key,
  farmer_id     uuid not null references public.farmers(id) on delete cascade,
  reason        text not null,
  category      text not null,
  week_id       text,
  points_delta  int not null,
  result_score  int not null,
  created_at    timestamptz not null default now()
);

create index if not exists score_log_farmer_id_idx on public.score_log(farmer_id);

-- ============================================================
-- 5. Row Level Security
-- ============================================================
alter table public.farmers      enable row level security;
alter table public.land_records enable row level security;
alter table public.claims       enable row level security;
alter table public.score_log    enable row level security;

drop policy if exists "farmers_select_own" on public.farmers;
create policy "farmers_select_own" on public.farmers
  for select using (auth.uid() = id);

drop policy if exists "farmers_update_own" on public.farmers;
create policy "farmers_update_own" on public.farmers
  for update using (auth.uid() = id);

drop policy if exists "land_select_own" on public.land_records;
create policy "land_select_own" on public.land_records
  for select using (auth.uid() = farmer_id);

drop policy if exists "land_insert_own" on public.land_records;
create policy "land_insert_own" on public.land_records
  for insert with check (auth.uid() = farmer_id);

drop policy if exists "land_update_own" on public.land_records;
create policy "land_update_own" on public.land_records
  for update using (auth.uid() = farmer_id);

drop policy if exists "claims_select_own" on public.claims;
create policy "claims_select_own" on public.claims
  for select using (auth.uid() = farmer_id);

drop policy if exists "claims_insert_own" on public.claims;
create policy "claims_insert_own" on public.claims
  for insert with check (auth.uid() = farmer_id);

drop policy if exists "claims_update_own" on public.claims;
create policy "claims_update_own" on public.claims
  for update using (auth.uid() = farmer_id);

drop policy if exists "score_log_select_own" on public.score_log;
create policy "score_log_select_own" on public.score_log
  for select using (auth.uid() = farmer_id);

drop policy if exists "score_log_insert_own" on public.score_log;
create policy "score_log_insert_own" on public.score_log
  for insert with check (auth.uid() = farmer_id);

-- ============================================================
-- 6. Realtime publication for claims
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'claims'
  ) then
    alter publication supabase_realtime add table public.claims;
  end if;
end $$;
