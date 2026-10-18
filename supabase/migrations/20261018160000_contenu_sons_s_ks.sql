-- Français : le son [s] (s, ss, c, ç, sc, t, x) et le son [ks] (x, xc, cc).
-- Mots donnés par le parent ; chaque question cache la ou les lettres qui font le son.
do $$
declare
  c uuid;
begin
  insert into public.chapters (subject_id, title, period, status, position)
  values ('francais', 'Le son [s] : s, ss, c, ç, sc, t, x', 1, 'en_cours', 5) returning id into c;

  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation)
  select c, 'choix', 'Quelle écriture du son [s] manque ? ' || p, a, d, e
  from (values
    ('traver___er', 's', '{ss,c,sc}'::text[], 'Après une consonne (ici r), un seul s suffit : traverser.'),
    ('___ène (au théâtre)', 'sc', '{s,c,ss}'::text[], 'Scène s’écrit avec sc, comme piscine.'),
    ('hame___on (pour pêcher)', 'ç', '{c,s,ss}'::text[], 'Devant o, le c prend une cédille pour faire [s] : hameçon.'),
    ('___inéma', 'c', '{s,ss,sc}'::text[], 'Devant i, la lettre c fait [s] : cinéma.'),
    ('pi___ine', 'sc', '{c,ss,s}'::text[], 'Piscine s’écrit avec sc.'),
    ('dé___u', 'ç', '{c,ss,s}'::text[], 'Devant u, le c prend une cédille : déçu.'),
    ('e___calier', 's', '{ss,c,sc}'::text[], 'Devant une consonne (ici c), un seul s : escalier.'),
    ('récréa___ion', 't', '{ss,c,s}'::text[], 'Dans -tion, le t se prononce [s] : récréation.'),
    ('gla___age (sur un gâteau)', 'ç', '{c,ss,s}'::text[], 'Devant a, le c prend une cédille : glaçage.'),
    ('___alut', 's', '{c,ss,sc}'::text[], 'Salut commence par un s.'),
    ('essen___iel', 't', '{c,s,ss}'::text[], 'Dans essentiel, le t se prononce [s].'),
    ('soi___ante (le nombre 60)', 'x', '{ss,s,c}'::text[], 'Dans soixante, le x se prononce [s].'),
    ('gla___e', 'c', '{ss,s,ç}'::text[], 'Devant e, le c fait [s] sans cédille : glace.'),
    ('poi___on (dans l’eau)', 'ss', '{s,c,ç}'::text[], 'Entre deux voyelles, il faut ss : poisson. Avec un seul s, on lirait « poison » !'),
    ('jeune___e', 'ss', '{s,c,sc}'::text[], 'Entre deux voyelles, il faut ss : jeunesse.'),
    ('si___ (le nombre 6)', 'x', '{s,ss,ce}'::text[], 'Six se termine par un x qui se prononce [s].'),
    ('di___ (le nombre 10)', 'x', '{s,ss,ce}'::text[], 'Dix se termine par un x qui se prononce [s].'),
    ('de___in (au crayon)', 'ss', '{s,c,sc}'::text[], 'Entre deux voyelles, il faut ss : dessin. Avec un seul s, on lirait « dezin ».'),
    ('construc___ion', 't', '{s,ss,c}'::text[], 'Dans -tion, le t se prononce [s] : construction.'),
    ('___eci', 'c', '{s,ss,sc}'::text[], 'Devant e, la lettre c fait [s] : ceci.'),
    ('prophé___ie', 't', '{c,s,ss}'::text[], 'Dans prophétie, le t se prononce [s].'),
    ('a___enseur', 'sc', '{ss,s,c}'::text[], 'Ascenseur commence par asc, comme descendre.'),
    ('tre___e (de cheveux)', 'ss', '{s,c,ç}'::text[], 'Entre deux voyelles, il faut ss : tresse.'),
    ('te___t', 's', '{ss,c,x}'::text[], 'Devant une consonne (ici t), un seul s : test.'),
    ('le ___ygne (l’oiseau blanc)', 'c', '{s,sc,ss}'::text[], 'Devant y, le c fait [s] : cygne. Attention, « signe » est un autre mot.')
  ) v(p, a, d, e);

  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'choix', 'Entre deux voyelles, pour faire le son [s] avec la lettre s, on écrit…', 'ss', '{s,sc}', 'Un seul s entre deux voyelles se prononce [z], comme dans « rose ».'),
    (c, 'choix', 'Pour faire le son [s] avec un c devant a, o ou u, on écrit…', 'ç', '{c,cc}', 'La cédille : ça, glaçon, déçu.');

  insert into public.chapters (subject_id, title, period, status, position)
  values ('francais', 'Le son [ks] : x, xc, cc', 1, 'en_cours', 6) returning id into c;

  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation)
  select c, 'choix', 'Quelle écriture du son [ks] manque ? ' || p, a, d, e
  from (values
    ('e___ellent', 'xc', '{x,cc}'::text[], 'Excellent s’écrit avec xc, comme excès.'),
    ('ta___i', 'x', '{xc,cc}'::text[], 'Taxi : le x se prononce [ks].'),
    ('a___élérer', 'cc', '{x,xc}'::text[], 'Accélérer : devant é, cc se prononce [ks].'),
    ('e___térieur', 'x', '{xc,cc}'::text[], 'Extérieur : le x se prononce [ks].'),
    ('e___essif', 'xc', '{x,cc}'::text[], 'Excessif s’écrit avec xc, comme excellent.')
  ) v(p, a, d, e);

  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'vrai_faux', 'Dans « taxi », le x se prononce [ks].', 'vrai', '{}', null),
    (c, 'vrai_faux', 'Dans « six », le x se prononce [ks].', 'faux', '{}', 'Dans six et dix, le x se prononce [s].'),
    (c, 'vrai_faux', 'Dans « accélérer », les deux c se prononcent [ks].', 'vrai', '{}', 'Le premier c fait [k], le second fait [s] devant é : [ks].'),
    (c, 'vrai_faux', 'Dans « soixante », le x se prononce [ks].', 'faux', '{}', 'Dans soixante, le x se prononce [s].'),
    (c, 'vrai_faux', 'Dans « excellent », on entend [ks].', 'vrai', '{}', 'Ex-cellent : x et c ensemble font [ks].');
end;
$$;
