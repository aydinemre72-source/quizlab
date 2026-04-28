-- Table des résultats
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  score int not null,
  total int not null,
  percent int not null,
  completed_at timestamptz default now()
);

-- Accès public en écriture (pour soumettre un résultat)
alter table results enable row level security;

create policy "Public insert results" on results for insert with check (true);
create policy "Public read own results" on results for select using (true);
