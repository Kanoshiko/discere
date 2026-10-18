-- Fonctions de progression (suite de 20261018140000_elements_progression.sql).
-- get_learner renvoie en plus, par matière, les bonnes réponses et les « faiblesses vaincues »
-- (bonne réponse à une question ratée la fois précédente), et la liste des parchemins.
create or replace function public.get_learner(p_token uuid)
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
               (array_agg(a.correct order by a.answered_at desc, a.id desc))[1] as last_correct
        from public.answers a
        where a.learner_id = l.id and a.item_id is not null
        group by a.item_id
      ) s
    ), '{}'::jsonb),
    'subjects', coalesce((
      select jsonb_object_agg(s.subject_id, jsonb_build_object('correct', s.correct, 'vanquished', s.vanquished))
      from (
        select c.subject_id,
               count(*) filter (where x.correct)::int as correct,
               count(*) filter (where x.correct and x.prev_correct = false)::int as vanquished
        from (
          select a.chapter_id, a.correct,
                 case when a.item_id is not null then
                   lag(a.correct) over (partition by a.item_id order by a.answered_at, a.id)
                 end as prev_correct
          from public.answers a
          where a.learner_id = l.id
        ) x
        join public.chapters c on c.id = x.chapter_id
        group by c.subject_id
      ) s
    ), '{}'::jsonb),
    'scrolls', coalesce((
      select jsonb_agg(sc.chapter_id order by sc.earned_at)
      from public.scrolls sc
      where sc.learner_id = l.id
    ), '[]'::jsonb)
  )
  from public.learners l
  where l.token = p_token;
$$;

-- Enregistre la partie (comme record_round) puis attribue les parchemins :
-- un chapitre est maîtrisé quand, sur ses 20 dernières réponses (15 au moins),
-- 80 % sont justes.
create function public.finish_round(
  p_token uuid,
  p_game text,
  p_chapter_id uuid,
  p_score int,
  p_total int,
  p_duration_s int,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_learner uuid;
  v_round uuid;
  v_new jsonb;
begin
  v_round := public.record_round(p_token, p_game, p_chapter_id, p_score, p_total, p_duration_s, p_answers);
  select l.id into v_learner from public.learners l where l.token = p_token;

  with touched as (
    select distinct a.chapter_id from public.answers a
    where a.round_id = v_round and a.chapter_id is not null
  ),
  stats as (
    select t.chapter_id, count(*) as n, count(*) filter (where r.correct) as ok
    from touched t
    cross join lateral (
      select a.correct from public.answers a
      where a.learner_id = v_learner and a.chapter_id = t.chapter_id
      order by a.answered_at desc, a.id desc
      limit 20
    ) r
    group by t.chapter_id
  ),
  ins as (
    insert into public.scrolls (learner_id, chapter_id)
    select v_learner, s.chapter_id from stats s
    where s.n >= 15 and s.ok >= 0.8 * s.n
    on conflict do nothing
    returning chapter_id
  )
  select coalesce(jsonb_agg(ins.chapter_id), '[]'::jsonb) into v_new from ins;

  return jsonb_build_object('round_id', v_round, 'new_scrolls', v_new);
end;
$$;

revoke all on function public.finish_round(uuid, text, uuid, int, int, int, jsonb) from public;
grant execute on function public.finish_round(uuid, text, uuid, int, int, int, jsonb) to anon, authenticated;
