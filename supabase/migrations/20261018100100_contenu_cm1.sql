-- Contenu de départ : CM1, début d'année. Les parents l'ajustent ensuite depuis /parent.
insert into public.subjects (id, name, color, position) values
  ('maths',    'Mathématiques', '#1D6FD8', 1),
  ('francais', 'Français',      '#C2410C', 2),
  ('histoire', 'Histoire',      '#7C3AED', 3),
  ('sciences', 'Sciences',      '#15803D', 4),
  ('anglais',  'Anglais',       '#BE185D', 5);

do $$
declare
  c uuid;
begin
  -- Mathématiques : chapitres à questions générées
  insert into public.chapters (subject_id, title, period, status, generator, position) values
    ('maths', 'Tables de multiplication',      1, 'revision', 'tables_multiplication',  1),
    ('maths', 'Multiplier par 10, 100, 1 000', 1, 'en_cours', 'multiplier_10_100_1000', 3),
    ('maths', 'Compléments à 100',             1, 'revision', 'complements_100',        4),
    ('maths', 'Doubles et moitiés',            1, 'en_cours', 'doubles_moities',        5);

  -- Mathématiques : grands nombres
  insert into public.chapters (subject_id, title, period, status, position)
  values ('maths', 'Les nombres jusqu''au million', 1, 'en_cours', 2) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'saisie', 'Écris en chiffres : trois-cent-quatre-mille-vingt', '304020', '{}', 'Trois-cent-quatre-mille : 304 000, plus vingt : 304 020.'),
    (c, 'choix', 'Dans 254 318, quel est le chiffre des milliers ?', '4', '{5,2,3}', '254 318 : le 4 est au rang des unités de mille.'),
    (c, 'choix', 'Dans 254 318, quel est le nombre de milliers ?', '254', '{4,25,"2 543"}', 'Le nombre de milliers, c''est tout ce qui est à gauche des centaines : 254.'),
    (c, 'choix', 'Quel est le plus grand nombre ?', '98 001', '{"89 999","97 999","9 801"}', 'On compare d''abord le nombre de chiffres, puis les chiffres de gauche à droite.'),
    (c, 'saisie', 'Écris en chiffres : quatre-vingt-mille-six-cents', '80600', '{}', null),
    (c, 'vrai_faux', '120 000 est plus petit que 102 000.', 'faux', '{}', '120 000 a 2 dizaines de mille, 102 000 n''en a aucune : 120 000 est plus grand.'),
    (c, 'saisie', 'Quel nombre vient juste après 99 999 ?', '100000', '{}', '99 999 + 1 = 100 000.'),
    (c, 'choix', 'Comment s''écrit 700 050 en lettres ?', 'sept-cent-mille-cinquante', '{sept-mille-cinquante,sept-cent-cinquante,soixante-dix-mille-cinquante}', null),
    (c, 'choix', 'Arrondis 47 820 au millier près.', '48 000', '{"47 000","50 000","47 800"}', '47 820 est plus près de 48 000 que de 47 000.'),
    (c, 'saisie', 'Combien y a-t-il de dizaines de mille dans 360 000 ?', '36', '{}', '360 000 = 36 × 10 000.'),
    (c, 'vrai_faux', 'Un million, c''est mille milliers.', 'vrai', '{}', '1 000 × 1 000 = 1 000 000.');

  -- Français : a / à
  insert into public.chapters (subject_id, title, period, status, position)
  values ('francais', 'Homophones : a / à', 1, 'revision', 1) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation)
  select c, 'choix', p, a, array[case when a = 'a' then 'à' else 'a' end],
         case when a = 'a' then 'On peut dire « avait » : c''est le verbe avoir.'
              else 'On ne peut pas dire « avait » : on écrit « à ».' end
  from (values
    ('Léo ___ un vélo rouge.', 'a'),
    ('Nous allons ___ la piscine.', 'à'),
    ('Il ___ mangé une pomme.', 'a'),
    ('Elle joue ___ la marelle.', 'à'),
    ('Mon frère ___ dix ans.', 'a'),
    ('Le train part ___ huit heures.', 'à'),
    ('Qui ___ pris mon crayon ?', 'a'),
    ('C''est une tarte ___ la fraise.', 'à'),
    ('Paul ___ peur du noir.', 'a'),
    ('Je pense ___ toi.', 'à')
  ) v(p, a);

  -- Français : et / est
  insert into public.chapters (subject_id, title, period, status, position)
  values ('francais', 'Homophones : et / est', 1, 'revision', 2) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation)
  select c, 'choix', p, a, array[case when a = 'et' then 'est' else 'et' end],
         case when a = 'est' then 'On peut dire « était » : c''est le verbe être.'
              else 'On peut dire « et puis » : c''est le mot qui relie.' end
  from (values
    ('Le chat ___ noir.', 'est'),
    ('J''ai un chien ___ un chat.', 'et'),
    ('Ma sœur ___ partie à l''école.', 'est'),
    ('Il fait chaud ___ beau.', 'et'),
    ('Où ___ ma trousse ?', 'est'),
    ('Je mange du pain ___ du fromage.', 'et'),
    ('Ce livre ___ passionnant.', 'est'),
    ('Tom ___ Lina jouent au ballon.', 'et'),
    ('La porte ___ fermée.', 'est'),
    ('Il chante ___ il danse.', 'et')
  ) v(p, a);

  -- Français : présent de l'indicatif
  insert into public.chapters (subject_id, title, period, status, position)
  values ('francais', 'Le présent de l''indicatif', 1, 'en_cours', 3) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, explanation)
  select c, 'saisie', 'Conjugue au présent : ' || p, a, e
  from (values
    ('Nous ___ (finir) nos devoirs.', 'finissons', 'Verbe du 2e groupe : nous finissons.'),
    ('Tu ___ (être) en retard.', 'es', 'Être : je suis, tu es, il est.'),
    ('Ils ___ (avoir) un chat.', 'ont', 'Avoir : nous avons, vous avez, ils ont.'),
    ('Je ___ (aller) à la plage.', 'vais', 'Aller : je vais, tu vas, il va.'),
    ('Vous ___ (faire) un gâteau.', 'faites', 'Faire : vous faites (pas « faisez »).'),
    ('Elle ___ (chanter) une chanson.', 'chante', 'Verbe en -er : elle chante.'),
    ('Nous ___ (manger) des pâtes.', 'mangeons', 'On garde le e pour faire le son « je » : mangeons.'),
    ('Ils ___ (prendre) le bus.', 'prennent', 'Prendre : ils prennent, avec deux n.'),
    ('Tu ___ (venir) avec moi ?', 'viens', 'Venir : je viens, tu viens, il vient.'),
    ('Vous ___ (dire) la vérité.', 'dites', 'Dire : vous dites (pas « disez »).'),
    ('On ___ (pouvoir) jouer dehors.', 'peut', 'Pouvoir : je peux, tu peux, il/on peut.'),
    ('Je ___ (vouloir) un verre d''eau.', 'veux', 'Vouloir : je veux, tu veux, il veut.')
  ) v(p, a, e);

  -- Français : nature des mots
  insert into public.chapters (subject_id, title, period, status, position)
  values ('francais', 'La nature des mots', 1, 'en_cours', 4) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation)
  select c, 'choix', 'Dans « ' || phrase || ' », quelle est la nature de « ' || mot || ' » ?', a,
         array_remove(array['nom', 'verbe', 'adjectif', 'déterminant'], a), e
  from (values
    ('Le chien aboie', 'chien', 'nom', 'On peut mettre « le » ou « un » devant : c''est un nom.'),
    ('La petite maison', 'petite', 'adjectif', 'Il dit comment est la maison : c''est un adjectif.'),
    ('Nous courons vite', 'courons', 'verbe', 'Il se conjugue (je cours, nous courons) : c''est un verbe.'),
    ('Mes amis arrivent', 'Mes', 'déterminant', 'Il est placé devant le nom « amis » : c''est un déterminant.'),
    ('Un oiseau chante', 'chante', 'verbe', 'Il se conjugue : c''est un verbe.'),
    ('Une robe bleue', 'bleue', 'adjectif', 'Il dit comment est la robe : c''est un adjectif.'),
    ('Ce gâteau est délicieux', 'Ce', 'déterminant', 'Il est placé devant le nom « gâteau » : c''est un déterminant.'),
    ('La maîtresse explique la leçon', 'leçon', 'nom', 'On peut dire « une leçon » : c''est un nom.'),
    ('Les grands arbres', 'grands', 'adjectif', 'Il dit comment sont les arbres : c''est un adjectif.'),
    ('Le soleil brille', 'brille', 'verbe', 'Il se conjugue : c''est un verbe.')
  ) v(phrase, mot, a, e);

  -- Histoire : avant la France
  insert into public.chapters (subject_id, title, period, status, position)
  values ('histoire', 'Avant la France : Gaulois, Romains, Francs', 1, 'a_venir', 1) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'choix', 'Quel chef gaulois a été vaincu à Alésia ?', 'Vercingétorix', '{"Jules César",Clovis,Charlemagne}', 'Vercingétorix s''est rendu à Jules César en 52 av. J.-C.'),
    (c, 'choix', 'En quelle année a eu lieu la bataille d''Alésia ?', '52 av. J.-C.', '{800,1515,496}', null),
    (c, 'choix', 'Comment appelait-on les prêtres gaulois ?', 'les druides', '{"les légionnaires","les chevaliers","les moines"}', null),
    (c, 'vrai_faux', 'Jules César était un général romain.', 'vrai', '{}', null),
    (c, 'choix', 'Quel roi des Francs a été baptisé vers 496 ?', 'Clovis', '{Vercingétorix,Charlemagne,"Louis XIV"}', null),
    (c, 'vrai_faux', 'Les Romains ont construit des routes, des aqueducs et des arènes en Gaule.', 'vrai', '{}', null),
    (c, 'choix', 'Comment appelle-t-on la civilisation née du mélange des Gaulois et des Romains ?', 'gallo-romaine', '{franque,celte,grecque}', null),
    (c, 'vrai_faux', 'Les Gaulois vivaient tous dans une seule grande ville.', 'faux', '{}', 'La Gaule était divisée en nombreux peuples, avec des villages et des oppidums.');
end;
$$;
