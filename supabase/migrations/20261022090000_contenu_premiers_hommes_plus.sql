-- Les premiers hommes : questions supplémentaires (réponses à taper, vrai ou faux, comparaisons, enquêtes).
do $$
declare
  c uuid;
begin
  select id into c from public.chapters where subject_id = 'histoire' and title = 'Les premiers hommes';
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'saisie', 'Complète : l''Australopithèque est le premier primate à se déplacer ___.', 'debout', '{}'::text[], 'Il est né vers -4,5 millions d''années, en Afrique.'),
    (c, 'saisie', 'Complète : Homo habilis est le premier homme à se servir d''___.', 'outils|des outils', '{}'::text[], 'Homo habilis : premier homme à se servir d''outils.'),
    (c, 'saisie', 'Complète : Homo erectus est le premier homme à savoir faire du ___.', 'feu', '{}'::text[], 'Homo erectus : premier homme à savoir faire du feu.'),
    (c, 'saisie', 'Complète : l''homme de Neandertal est le premier homme à ___ ses morts.', 'enterrer', '{}'::text[], 'L''homme de Neandertal : premier homme à enterrer ses morts.'),
    (c, 'saisie', 'Complète : Homo sapiens est le premier homme à créer des œuvres d''___.', 'art', '{}'::text[], 'Homo sapiens : premier homme à créer des œuvres d''art.'),
    (c, 'saisie', 'Le premier homme à savoir faire du feu s''appelle Homo ___.', 'erectus|homo erectus', '{}'::text[], 'Homo erectus, né vers -1,9 million d''années.'),
    (c, 'saisie', 'Le premier homme à se servir d''outils s''appelle Homo ___.', 'habilis|homo habilis', '{}'::text[], 'Homo habilis, né vers -2,4 millions d''années.'),
    (c, 'saisie', 'Le premier homme à créer des œuvres d''art s''appelle Homo ___.', 'sapiens|homo sapiens', '{}'::text[], 'Homo sapiens, né vers -200 000 ans.'),
    (c, 'vrai_faux', 'L''Australopithèque vivait en Afrique.', 'vrai', '{}'::text[], null),
    (c, 'vrai_faux', 'L''homme de Neandertal vivait en Afrique.', 'faux', '{}'::text[], 'Il vivait en Europe et en Asie.'),
    (c, 'vrai_faux', 'Homo erectus vivait en Afrique, en Europe et en Asie.', 'vrai', '{}'::text[], null),
    (c, 'vrai_faux', 'Homo habilis a été le premier à savoir faire du feu.', 'faux', '{}'::text[], 'Homo habilis : les outils. Le feu, c''est Homo erectus.'),
    (c, 'vrai_faux', 'Homo sapiens est apparu avant l''homme de Neandertal.', 'faux', '{}'::text[], 'Neandertal vers -350 000 ans, Homo sapiens vers -200 000 ans.'),
    (c, 'vrai_faux', 'L''Australopithèque est apparu il y a environ 4,5 millions d''années.', 'vrai', '{}'::text[], null),
    (c, 'vrai_faux', 'L''homme de Neandertal a été le premier à créer des œuvres d''art.', 'faux', '{}'::text[], 'Neandertal : enterrer ses morts. Les œuvres d''art, c''est Homo sapiens.'),
    (c, 'choix', 'Lequel de ces hommes ne vivait pas en Afrique ?', 'l''homme de Neandertal', array['Homo habilis','Homo erectus','l''Australopithèque']::text[], 'L''homme de Neandertal vivait en Europe et en Asie.'),
    (c, 'choix', 'Quel est le premier homme à vivre aussi en Europe et en Asie ?', 'Homo erectus', array['Homo habilis','l''Australopithèque','Homo sapiens']::text[], 'Avant lui, l''Australopithèque et Homo habilis vivaient seulement en Afrique.'),
    (c, 'choix', 'Lequel vit aujourd''hui dans le monde entier ?', 'Homo sapiens', array['l''homme de Neandertal','Homo erectus','Homo habilis']::text[], 'C''est nous !'),
    (c, 'choix', 'Qui est apparu avant : Homo erectus ou l''homme de Neandertal ?', 'Homo erectus', array['l''homme de Neandertal']::text[], 'Homo erectus vers -1,9 million d''années, Neandertal vers -350 000 ans.'),
    (c, 'choix', 'Qui est apparu avant : Homo habilis ou l''Australopithèque ?', 'l''Australopithèque', array['Homo habilis']::text[], 'L''Australopithèque vers -4,5 millions d''années, Homo habilis vers -2,4 millions.'),
    (c, 'choix', 'Qui est apparu avant : l''homme de Neandertal ou Homo sapiens ?', 'l''homme de Neandertal', array['Homo sapiens']::text[], 'Neandertal vers -350 000 ans, Homo sapiens vers -200 000 ans.'),
    (c, 'choix', 'Qui est apparu avant : Homo habilis ou Homo erectus ?', 'Homo habilis', array['Homo erectus']::text[], 'Homo habilis vers -2,4 millions d''années, Homo erectus vers -1,9 million.'),
    (c, 'choix', 'Enquête : on découvre une peinture dans une grotte. Quel homme a pu la peindre ?', 'Homo sapiens', array['l''homme de Neandertal','Homo erectus','Homo habilis']::text[], 'Homo sapiens est le premier à créer des œuvres d''art.'),
    (c, 'choix', 'Enquête : on trouve un outil en pierre vieux de 2 millions d''années. Qui a pu le fabriquer ?', 'Homo habilis', array['Homo sapiens','l''homme de Neandertal','l''Australopithèque']::text[], 'Homo habilis (vers -2,4 millions d''années) est le premier à se servir d''outils.'),
    (c, 'choix', 'Enquête : on trouve les traces d''un feu vieilles d''un million d''années. Qui l''a allumé ?', 'Homo erectus', array['Homo habilis','Homo sapiens','l''Australopithèque']::text[], 'Homo erectus sait faire du feu. Neandertal et Homo sapiens ne sont pas encore apparus.');
end;
$$;
