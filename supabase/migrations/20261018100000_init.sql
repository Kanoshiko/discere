-- Schéma initial de Discere : petits jeux de révision pour l'école primaire.
-- Principe de sécurité : le navigateur n'utilise que la clé publique (publishable).
-- Toutes les tables ont la RLS. Le contenu scolaire visible (chapitres non « à venir »
-- et leurs questions) est en lecture publique ; tout le reste est réservé aux parents
-- (admins). L'enfant n'a pas de compte : son appareil porte un jeton secret
-- (learners.token) et passe par des fonctions SECURITY DEFINER.

-- ---------------------------------------------------------------------------
-- Parents (admins)
-- ---------------------------------------------------------------------------
create table public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

-- is_admin() n'a pas à être appelable via l'API : schéma non exposé.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Matières, chapitres, questions
-- ---------------------------------------------------------------------------
create table public.subjects (
  id text primary key check (id ~ '^[a-z_]{2,30}$'),
  name text not null check (char_length(name) between 1 and 40),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  position int not null default 0
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references public.subjects(id),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  grade text not null default 'CM1' check (grade in ('CE2', 'CM1', 'CM2', '6e')),
  period int check (period between 1 and 5),
  -- a_venir  : pas encore vu en classe, caché à l'enfant
  -- en_cours : travaillé en ce moment, revient le plus souvent
  -- revision : déjà vu, revient de temps en temps
  status text not null default 'a_venir' check (status in ('a_venir', 'en_cours', 'revision')),
  -- Clé d'un générateur de questions (src/content/generators.ts), facultatif.
  generator text check (generator ~ '^[a-z0-9_]{1,40}$'),
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index chapters_subject_idx on public.chapters (subject_id);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  -- choix : QCM ; saisie : réponse tapée ; vrai_faux
  kind text not null check (kind in ('choix', 'saisie', 'vrai_faux')),
  prompt text not null check (char_length(btrim(prompt)) between 1 and 300),
  -- Bonne réponse. En saisie, variantes acceptées séparées par « | ».
  answer text not null check (char_length(btrim(answer)) between 1 and 100),
  -- Mauvaises réponses proposées (QCM).
  distractors text[] not null default '{}' check (cardinality(distractors) <= 5),
  explanation text check (char_length(explanation) <= 300),
  created_at timestamptz not null default now(),
  check (kind <> 'choix' or cardinality(distractors) >= 1),
  check (kind <> 'vrai_faux' or answer in ('vrai', 'faux'))
);
create index items_chapter_idx on public.items (chapter_id);

-- ---------------------------------------------------------------------------
-- Enfants et résultats
-- ---------------------------------------------------------------------------
create table public.learners (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 30),
  grade text not null default 'CM1' check (grade in ('CE2', 'CM1', 'CM2', '6e')),
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Une partie jouée.
create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  game text not null check (game in ('quiz', 'chrono', 'paires')),
  -- null = mélange de plusieurs chapitres
  chapter_id uuid references public.chapters(id) on delete set null,
  score int not null check (score >= 0),
  total int not null check (total >= 0),
  duration_s int not null check (duration_s between 0 and 7200),
  played_at timestamptz not null default now()
);
create index rounds_learner_idx on public.rounds (learner_id, played_at desc);

-- Une réponse donnée. item_id est null pour une question générée.
create table public.answers (
  id bigint generated always as identity primary key,
  round_id uuid not null references public.rounds(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  prompt text not null,
  given text not null,
  correct boolean not null,
  answered_at timestamptz not null default now()
);
create index answers_learner_item_idx on public.answers (learner_id, item_id, answered_at desc);
create index answers_round_idx on public.answers (round_id);
create index answers_chapter_idx on public.answers (chapter_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.admins   enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.items    enable row level security;
alter table public.learners enable row level security;
alter table public.rounds   enable row level security;
alter table public.answers  enable row level security;

create policy admins_admin_all on public.admins
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy subjects_public_read on public.subjects
  for select to anon, authenticated using (true);
create policy subjects_admin_write on public.subjects
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- Les chapitres « à venir » ne sont visibles que des parents.
create policy chapters_public_read on public.chapters
  for select to anon, authenticated using (status <> 'a_venir' or (select private.is_admin()));
create policy chapters_admin_write on public.chapters
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy items_public_read on public.items
  for select to anon, authenticated using (
    exists (select 1 from public.chapters c where c.id = chapter_id and c.status <> 'a_venir')
    or (select private.is_admin())
  );
create policy items_admin_write on public.items
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy learners_admin_all on public.learners
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy rounds_admin_all on public.rounds
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy answers_admin_all on public.answers
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Fonctions de l'enfant (identifié par le jeton de son appareil)
-- ---------------------------------------------------------------------------

-- Prénom, classe, et dernier résultat par question déjà vue (pour faire revenir
-- plus souvent les questions ratées).
create function public.get_learner(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'name', l.name,
    'grade', l.grade,
    'items', coalesce((
      select jsonb_object_agg(s.item_id, jsonb_build_object('seen', s.seen, 'last_correct', s.last_correct))
      from (
        select a.item_id,
               count(*)::int as seen,
               (array_agg(a.correct order by a.answered_at desc))[1] as last_correct
        from public.answers a
        where a.learner_id = l.id and a.item_id is not null
        group by a.item_id
      ) s
    ), '{}'::jsonb)
  )
  from public.learners l
  where l.token = p_token;
$$;

-- Enregistre une partie et ses réponses.
-- p_answers : [{ "item_id": uuid|null, "chapter_id": uuid|null, "prompt": text, "given": text, "correct": bool }]
create function public.record_round(
  p_token uuid,
  p_game text,
  p_chapter_id uuid,
  p_score int,
  p_total int,
  p_duration_s int,
  p_answers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_learner uuid;
  v_round uuid;
begin
  select l.id into v_learner from public.learners l where l.token = p_token;
  if v_learner is null then
    raise exception 'Appareil non reconnu' using errcode = 'P0002';
  end if;
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) > 200 then
    raise exception 'Réponses invalides' using errcode = '22023';
  end if;

  insert into public.rounds (learner_id, game, chapter_id, score, total, duration_s)
  values (v_learner, p_game, p_chapter_id, p_score, p_total, p_duration_s)
  returning id into v_round;

  insert into public.answers (round_id, learner_id, item_id, chapter_id, prompt, given, correct)
  select v_round, v_learner,
         -- une question supprimée entre-temps est gardée sans lien
         (select i.id from public.items i where i.id = (a ->> 'item_id')::uuid),
         (select c.id from public.chapters c where c.id = (a ->> 'chapter_id')::uuid),
         left(coalesce(a ->> 'prompt', ''), 300),
         left(coalesce(a ->> 'given', ''), 100),
         coalesce((a ->> 'correct')::boolean, false)
  from jsonb_array_elements(p_answers) a;

  return v_round;
end;
$$;

revoke all on function public.get_learner(uuid) from public;
revoke all on function public.record_round(uuid, text, uuid, int, int, int, jsonb) from public;
grant execute on function public.get_learner(uuid) to anon, authenticated;
grant execute on function public.record_round(uuid, text, uuid, int, int, int, jsonb) to anon, authenticated;
