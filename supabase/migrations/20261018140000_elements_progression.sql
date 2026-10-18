-- Thème des quatre éléments et progression de l'enfant.
-- Chaque matière est rattachée à un élément (modifiable par le parent).
alter table public.subjects
  add column element text not null default 'air' check (element in ('feu', 'air', 'eau', 'terre'));

update public.subjects set element = 'feu'   where id = 'maths';
update public.subjects set element = 'terre' where id = 'histoire';
update public.subjects set element = 'eau'   where id = 'sciences';
-- français et anglais : air (valeur par défaut)

-- Parchemins : un par chapitre maîtrisé, gagnés pour toujours.
create table public.scrolls (
  learner_id uuid not null references public.learners(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (learner_id, chapter_id)
);
alter table public.scrolls enable row level security;
create policy scrolls_admin_all on public.scrolls
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
