-- ================================================================
-- MIGRATION v3 — participants + fix results
-- Coller dans Supabase > SQL Editor et exécuter
-- ================================================================

-- 1. Table des participants (lookup unique par prénom+nom)
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  created_at timestamptz default now(),
  unique (first_name, last_name)
);

alter table participants enable row level security;
create policy "Public insert participants" on participants for insert with check (true);
create policy "Public select participants" on participants for select using (true);

-- 2. Recréer la table results (drop v2 si existante)
drop table if exists results;

create table results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  participant_id uuid references participants(id) on delete cascade not null,
  score int not null check (score >= 0),
  total int not null check (total > 0),
  percent int not null check (percent >= 0 and percent <= 100),
  completed_at timestamptz default now()
);

alter table results enable row level security;
create policy "Public insert results" on results for insert with check (true);
create policy "Public select results" on results for select using (true);
