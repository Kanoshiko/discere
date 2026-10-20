-- Jeu Frise : nouveau type de question « ordre » (remettre des étapes dans l'ordre).
-- steps : les étapes dans le bon ordre, 3 à 8 ; chaque étape peut porter un détail après « | »
-- (ex. « Moyen Âge|de 476 à 1492 »), montré après la correction.
-- Pour une question « ordre », answer vaut « ordre » (la réponse est dans steps).
alter table public.items
  add column steps text[] not null default '{}' check (cardinality(steps) <= 8);

alter table public.items drop constraint items_kind_check;
alter table public.items add constraint items_kind_check
  check (kind in ('choix', 'saisie', 'vrai_faux', 'ordre'));
alter table public.items add constraint items_ordre_steps
  check (kind <> 'ordre' or cardinality(steps) between 3 and 8);

alter table public.rounds drop constraint rounds_game_check;
alter table public.rounds add constraint rounds_game_check
  check (game in ('quiz', 'chrono', 'paires', 'frise'));
