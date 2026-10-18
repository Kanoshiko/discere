-- Répétition espacée et suivi des calculs générés.
-- get_learner renvoie, pour chaque question écrite (« items », clé = id) et pour chaque calcul
-- généré (« facts », clé = « id du chapitre|énoncé ») :
--   seen, last_correct, last_seen, et streak_days = nombre de jours DIFFÉRENTS où la question
--   a été réussie depuis la dernière erreur (sert à calculer la « boîte » côté client).
-- Les faiblesses vaincues comptent désormais aussi pour les calculs générés.
create or replace function public.get_learner(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with l as (
    select * from public.learners where token = p_token
  ),
  a as (
    select an.*, coalesce(an.item_id::text, an.chapter_id::text || '|' || an.prompt) as k
    from public.answers an
    join l on an.learner_id = l.id
    where an.item_id is not null or an.chapter_id is not null
  ),
  w as (
    select a.*,
           max(a.answered_at) filter (where not a.correct) over (partition by a.k) as last_wrong,
           lag(a.correct) over (partition by a.k order by a.answered_at, a.id) as prev_correct
    from a
  ),
  s as (
    select w.k,
           bool_or(w.item_id is not null) as is_item,
           count(*)::int as seen,
           (array_agg(w.correct order by w.answered_at desc, w.id desc))[1] as last_correct,
           max(w.answered_at) as last_seen,
           count(distinct (w.answered_at at time zone 'Europe/Paris')::date)
             filter (where w.correct and (w.last_wrong is null or w.answered_at > w.last_wrong))::int as streak_days
    from w
    group by w.k
  )
  select jsonb_build_object(
    'name', l.name,
    'grade', l.grade,
    'items', coalesce((
      select jsonb_object_agg(s.k, jsonb_build_object('seen', s.seen, 'last_correct', s.last_correct, 'streak_days', s.streak_days, 'last_seen', s.last_seen))
      from s where s.is_item
    ), '{}'::jsonb),
    'facts', coalesce((
      select jsonb_object_agg(s.k, jsonb_build_object('seen', s.seen, 'last_correct', s.last_correct, 'streak_days', s.streak_days, 'last_seen', s.last_seen))
      from s where not s.is_item
    ), '{}'::jsonb),
    'subjects', coalesce((
      select jsonb_object_agg(x.subject_id, jsonb_build_object('correct', x.correct, 'vanquished', x.vanquished))
      from (
        select c.subject_id,
               count(*) filter (where w.correct)::int as correct,
               count(*) filter (where w.correct and w.prev_correct = false)::int as vanquished
        from w
        join public.chapters c on c.id = w.chapter_id
        group by c.subject_id
      ) x
    ), '{}'::jsonb),
    'scrolls', coalesce((
      select jsonb_agg(sc.chapter_id order by sc.earned_at)
      from public.scrolls sc
      where sc.learner_id = l.id
    ), '[]'::jsonb)
  )
  from l;
$$;
