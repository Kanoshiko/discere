-- Français : le son [k] (c, qu, cc, k, ch, ck, cqu, q), d'après la leçon fournie,
-- et deux mots de la remarque sur [ks] (expert, accent) ajoutés au chapitre [ks].
do $$
declare
  c uuid;
  k uuid;
begin
  insert into public.chapters (subject_id, title, period, status, position)
  values ('francais', 'Le son [k] : c, qu, cc, k, ch, ck, q', 2, 'en_cours', 8) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___lasse', 'c', array['k','qu','ch']::text[], 'Devant a, o, u ou une consonne, la lettre c fait [k] : classe.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? dé___ouverte', 'c', array['qu','cc','k']::text[], 'Devant a, o, u ou une consonne, la lettre c fait [k] : découverte.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___rème', 'c', array['k','ch','qu']::text[], 'Devant a, o, u ou une consonne, la lettre c fait [k] : crème.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___aserne', 'c', array['k','qu','cc']::text[], 'Devant a, o, u ou une consonne, la lettre c fait [k] : caserne.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___atre (le nombre 4)', 'qu', array['c','k','cc']::text[], 'On écrit qu : quatre.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? co___ille', 'qu', array['c','k','cc']::text[], 'On écrit qu : coquille. Avec un c seul devant i, on lirait [s].'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___arante (le nombre 40)', 'qu', array['c','k','cc']::text[], 'On écrit qu : quarante, comme quatre.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___itter', 'qu', array['k','c','ch']::text[], 'On écrit qu : quitter. Avec un c seul devant i, on lirait [s].'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? a___rocher', 'cc', array['c','k','qu']::text[], 'Ici le son [k] s''écrit cc : accrocher.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? o___uper', 'cc', array['c','k','qu']::text[], 'Ici le son [k] s''écrit cc : occuper.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? a___ueil', 'cc', array['c','qu','k']::text[], 'Ici le son [k] s''écrit cc : accueil.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? a___almie', 'cc', array['c','k','qu']::text[], 'Ici le son [k] s''écrit cc : accalmie.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___iwi', 'k', array['qu','c','ch']::text[], 'Mot écrit avec un k (rare) : kiwi.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___ilomètre', 'k', array['qu','c','ch']::text[], 'Mot écrit avec un k (rare) : kilomètre.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___angourou', 'k', array['c','qu','ch']::text[], 'Mot écrit avec un k (rare) : kangourou.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___oala', 'k', array['c','qu','ch']::text[], 'Mot écrit avec un k (rare) : koala.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ___orale (on y chante)', 'ch', array['c','k','qu']::text[], 'Ici ch se prononce [k] : chorale.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? or___estre', 'ch', array['qu','k','c']::text[], 'Ici ch se prononce [k] : orchestre.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? é___o (la voix qui revient)', 'ch', array['c','k','qu']::text[], 'Ici ch se prononce [k] : écho.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? ti___et (de bus)', 'ck', array['k','qu','c']::text[], 'Mot écrit avec ck (rare) : ticket.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? sto___', 'ck', array['k','c','q']::text[], 'Mot écrit avec ck (rare) : stock.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? a___érir (obtenir)', 'cqu', array['qu','cc','c']::text[], 'Mot très rare écrit avec cqu : acquérir.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? cin___ (le nombre 5)', 'q', array['c','k','que']::text[], 'En fin de mot, q seul (très rare) : cinq.'),
    (c, 'choix', 'Quelle écriture du son [k] manque ? co___ (l''oiseau)', 'q', array['c','k','que']::text[], 'En fin de mot, q seul (très rare) : coq.'),
    (c, 'choix', 'Dans ta leçon, quelle écriture du son [k] est « très fréquente » ?', 'c', array['qu','k','cc']::text[], 'Le c est « très fréquent » ; qu est « fréquent », cc « assez fréquent », k, ch et ck « rares ».'),
    (c, 'choix', 'La lettre c fait le son [k] devant…', 'a, o, u et les consonnes', array['e, i et y','toutes les lettres']::text[], 'Devant e, i et y, le c fait [s] : ceci, cinéma, cygne.'),
    (c, 'choix', 'Dans « accrocher », les lettres cc se prononcent…', '[k]', array['[ks]','[s]']::text[], 'Devant a, o, u ou une consonne, cc fait [k] : accrocher, occuper.'),
    (c, 'choix', 'Dans « accent », les lettres cc se prononcent…', '[ks]', array['[k]','[s]']::text[], 'Devant e ou i, cc fait [ks] : accent, accélérer.');

  select id into k from public.chapters where subject_id = 'francais' and title = 'Le son [ks] : x, xc, cc';
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (k, 'choix', 'Quelle écriture du son [ks] manque ? e___pert', 'x', array['xc','cc']::text[], 'Expert : le x se prononce [ks].'),
    (k, 'choix', 'Quelle écriture du son [ks] manque ? a___ent (sur une lettre)', 'cc', array['x','xc']::text[], 'Accent : devant e, cc se prononce [ks].');
end;
$$;
