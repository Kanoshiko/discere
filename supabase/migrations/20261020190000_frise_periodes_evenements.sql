-- Une frise peut compter jusqu'à 10 étapes (5 périodes + 4 événements = 9).
alter table public.items drop constraint items_steps_check;
alter table public.items add constraint items_steps_check check (cardinality(steps) <= 10);
alter table public.items drop constraint items_ordre_steps;
alter table public.items add constraint items_ordre_steps
  check (kind <> 'ordre' or cardinality(steps) between 3 and 10);

-- La frise « Range les dates » (simple tri de nombres) devient périodes + événements mêlés.
update public.items
set prompt = 'Range les périodes et les événements qui les séparent, du plus ancien au plus récent.',
    steps = array[
      'Préhistoire|période',
      'Apparition de l''écriture|-3 300',
      'Antiquité|période',
      'Chute de l''Empire romain|476',
      'Moyen Âge|période',
      'Découverte de l''Amérique|1492',
      'Temps modernes|période',
      'Révolution française|1789',
      'Époque contemporaine|période'
    ]::text[],
    explanation = 'Chaque période se termine par un événement, qui ouvre la période suivante.'
where kind = 'ordre' and prompt = 'Range les dates, de la plus ancienne à la plus récente.';
