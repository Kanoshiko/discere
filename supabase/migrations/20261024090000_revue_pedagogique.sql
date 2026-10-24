-- Revue pédagogique des questions (validée par le parent le 2026-10-24) :
-- 42 questions redondantes supprimées, 11 réécritures.
-- Les réponses déjà données aux questions supprimées sont détachées (item_id = null)
-- avant la suppression : elles restent comptées dans les points de l'enfant.
do $$
declare
  suppr text[] := array[
    -- Premiers hommes
    '74ed29b8','25bee51a','4fca43e6','ccc8016c','20d3da8b',
    '1149b152','67469cdf','b0c944ce',
    '04173539','b05481e2',
    '164d4d75','ca593545','193587cf','6aaf82e4',
    '541573cb','f054a9df','8c243ca2',
    'e928acc0','afd3e5e7','ae27d54a','46ea82f2',
    -- Cinq grandes périodes
    'edfb24fd','79f89751','6f6de854','e4e07d3c',
    'c57bc0af','35bdb6d6','45fa2d20',
    'caa3cbc5','e76c837c','96f59bb9','fdfeb142','b1c3198f',
    -- Préhistoire : vestiges et art
    '8de359e8','922a5b66','f1839826',
    -- La matière
    '138898dc','46423299',
    -- Propriétés de la matière
    'f16767b2','0326c9d6',
    -- Le son [ks]
    '4081597a','883958b9'
  ];
  ids uuid[];
begin
  select array_agg(id) into ids from public.items where left(id::text, 8) = any (suppr);
  if cardinality(ids) <> 42 or cardinality(suppr) <> 42 then
    raise exception 'Revue : % questions trouvées pour % identifiants', cardinality(ids), cardinality(suppr);
  end if;
  update public.answers set item_id = null where item_id = any (ids);
  delete from public.items where id = any (ids);

  -- R1 : une espèce « apparaît », elle ne « naît » pas.
  update public.items set prompt = replace(prompt, 'Vers quand est né ', 'Vers quand est apparu ')
  where prompt like 'Vers quand est né %';

  -- R2 : la consigne avant la définition.
  update public.items
  set prompt = 'De quelle propriété est-ce la définition : « ' || rtrim(substr(prompt, 20), '.') || ' » ?'
  where prompt like 'Quelle propriété ? %';

  -- R3, R4 : dire ce qu'on observe, sans idée fausse.
  update public.items
  set prompt = 'Quelle propriété cette expérience montre-t-elle ? On pose une casserole d''eau sur le feu : la chaleur traverse le métal et l''eau chauffe.'
  where left(id::text, 8) = '7358acba';
  update public.items
  set prompt = 'Quelle propriété cette expérience montre-t-elle ? On met un morceau de sucre dans l''eau : on ne le voit plus, mais l''eau a un goût sucré.',
      explanation = 'Le sucre ne disparaît pas : il se dissout dans l''eau. Il est soluble.'
  where left(id::text, 8) = '61ac05ca';

  -- R5
  update public.items set prompt = 'Dans « accélérer », les lettres cc se prononcent [ks].'
  where left(id::text, 8) = 'fa040892';

  -- R6
  update public.items set prompt = 'Dans ta leçon, quelle écriture du son [j] est « très fréquente » ?',
      explanation = 'Le i est « très fréquent » ; il, ille, ill et y sont « assez fréquents ». Exemples : siècle, papier.'
  where left(id::text, 8) = '6790e154';

  -- R7
  update public.items set distractors = array['la vie au Moyen Âge','les rois de France','la vie des dinosaures']::text[]
  where left(id::text, 8) = '699e3777';

  -- R8 : la bonne réponse ne doit pas se trahir par sa forme.
  update public.items set answer = '-52', distractors = array['476','800','-3 300']::text[],
      explanation = 'En -52 (52 avant J.-C.), Vercingétorix se rend à Jules César.'
  where left(id::text, 8) = '6eaa1766';
end;
$$;
