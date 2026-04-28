-- Supprimer les tables si elles existent déjà
drop table if exists questions;
drop table if exists quizzes;

-- Table des quiz
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  created_at timestamptz default now()
);

-- Table des questions
create table questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  text text not null,
  choices text[] not null,
  correct_index int not null check (correct_index >= 0 and correct_index <= 3),
  position int not null default 0
);

-- Accès public en lecture (pour jouer aux quiz)
alter table quizzes enable row level security;
alter table questions enable row level security;

create policy "Public read quizzes" on quizzes for select using (true);
create policy "Public read questions" on questions for select using (true);

-- Les écritures se font via la clé service (API routes Next.js)
create policy "Service insert quizzes" on quizzes for insert with check (true);
create policy "Service update quizzes" on quizzes for update using (true);
create policy "Service delete quizzes" on quizzes for delete using (true);

create policy "Service insert questions" on questions for insert with check (true);
create policy "Service update questions" on questions for update using (true);
create policy "Service delete questions" on questions for delete using (true);

-- Données de démonstration
insert into quizzes (id, title, description) values
  ('11111111-1111-1111-1111-111111111111', 'Culture générale', 'Testez vos connaissances générales !');

insert into questions (quiz_id, text, choices, correct_index, position) values
  ('11111111-1111-1111-1111-111111111111', 'Quelle est la capitale de la France ?', array['Berlin', 'Madrid', 'Paris', 'Rome'], 2, 0),
  ('11111111-1111-1111-1111-111111111111', 'Combien y a-t-il de couleurs dans l''arc-en-ciel ?', array['5', '6', '7', '8'], 2, 1),
  ('11111111-1111-1111-1111-111111111111', 'Quel est le plus grand océan du monde ?', array['Atlantique', 'Indien', 'Arctique', 'Pacifique'], 3, 2);
