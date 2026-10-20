-- Histoire : les cinq grandes périodes, la Préhistoire (vestiges, art, frise) et les premiers hommes,
-- d'après la leçon et les fiches corrigées fournies par le parent.
do $$
declare
  c uuid;
begin
  insert into public.chapters (subject_id, title, period, status, position)
  values ('histoire', 'Les cinq grandes périodes de l''Histoire', 1, 'en_cours', 2) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'choix', 'Combien y a-t-il de grandes périodes dans l''Histoire ?', 'cinq', array['trois','quatre','six']::text[], 'Préhistoire → Antiquité → Moyen Âge → Temps modernes → Époque contemporaine.'),
    (c, 'choix', 'Quelle est la période la plus ancienne ?', 'la Préhistoire', array['l''Antiquité','le Moyen Âge','les Temps modernes']::text[], 'Préhistoire → Antiquité → Moyen Âge → Temps modernes → Époque contemporaine.'),
    (c, 'choix', 'Quelle période vient juste après la Préhistoire ?', 'l''Antiquité', array['le Moyen Âge','les Temps modernes','l''Époque contemporaine']::text[], 'Préhistoire → Antiquité → Moyen Âge → Temps modernes → Époque contemporaine.'),
    (c, 'choix', 'Quelle période vient juste après l''Antiquité ?', 'le Moyen Âge', array['la Préhistoire','les Temps modernes','l''Époque contemporaine']::text[], 'Préhistoire → Antiquité → Moyen Âge → Temps modernes → Époque contemporaine.'),
    (c, 'choix', 'Quelle période vient juste après le Moyen Âge ?', 'les Temps modernes', array['l''Antiquité','la Préhistoire','l''Époque contemporaine']::text[], 'Préhistoire → Antiquité → Moyen Âge → Temps modernes → Époque contemporaine.'),
    (c, 'choix', 'Quelle période vient juste après les Temps modernes ?', 'l''Époque contemporaine', array['le Moyen Âge','l''Antiquité','la Préhistoire']::text[], 'Préhistoire → Antiquité → Moyen Âge → Temps modernes → Époque contemporaine.'),
    (c, 'choix', 'Quelle période vient juste avant le Moyen Âge ?', 'l''Antiquité', array['la Préhistoire','les Temps modernes','l''Époque contemporaine']::text[], 'Préhistoire → Antiquité → Moyen Âge → Temps modernes → Époque contemporaine.'),
    (c, 'choix', 'Quelle période vient juste avant l''Époque contemporaine ?', 'les Temps modernes', array['le Moyen Âge','l''Antiquité','la Préhistoire']::text[], 'Préhistoire → Antiquité → Moyen Âge → Temps modernes → Époque contemporaine.'),
    (c, 'choix', 'Dans quelle période vivons-nous aujourd''hui ?', 'l''Époque contemporaine', array['les Temps modernes','le Moyen Âge','l''Antiquité']::text[], 'Elle a commencé avec la Révolution française, en 1789.'),
    (c, 'choix', 'Quel événement marque la fin de la Préhistoire et le début de l''Antiquité ?', 'l''apparition de l''écriture', array['la chute de l''Empire romain','la découverte de l''Amérique','la Révolution française']::text[], 'Vers -3 300 : avec l''écriture, l''Histoire commence.'),
    (c, 'choix', 'Quel événement marque la fin de l''Antiquité et le début du Moyen Âge ?', 'la chute de l''Empire romain', array['l''apparition de l''écriture','la découverte de l''Amérique','la Révolution française']::text[], 'En 476.'),
    (c, 'choix', 'Quel événement marque la fin du Moyen Âge et le début des Temps modernes ?', 'la découverte de l''Amérique', array['la chute de l''Empire romain','l''apparition de l''écriture','la Révolution française']::text[], 'En 1492.'),
    (c, 'choix', 'Quel événement marque la fin des Temps modernes et le début de l''Époque contemporaine ?', 'la Révolution française', array['la découverte de l''Amérique','la chute de l''Empire romain','l''apparition de l''écriture']::text[], 'En 1789.'),
    (c, 'choix', 'Vers quelle date apparaît l''écriture ?', '-3 300', array['476','1492','1789']::text[], 'Vers -3 300, soit il y a environ 5 300 ans.'),
    (c, 'choix', 'En quelle année a lieu la chute de l''Empire romain ?', '476', array['-3 300','1492','1789']::text[], null),
    (c, 'choix', 'En quelle année a lieu la découverte de l''Amérique ?', '1492', array['476','1789','-3 300']::text[], null),
    (c, 'choix', 'En quelle année commence la Révolution française ?', '1789', array['1492','476','1914']::text[], null),
    (c, 'choix', 'Que se passe-t-il en 476 ?', 'la chute de l''Empire romain', array['la découverte de l''Amérique','la Révolution française','l''apparition de l''écriture']::text[], 'Fin de l''Antiquité, début du Moyen Âge.'),
    (c, 'choix', 'Que se passe-t-il en 1492 ?', 'la découverte de l''Amérique', array['la Révolution française','la chute de l''Empire romain','l''apparition de l''écriture']::text[], 'Fin du Moyen Âge, début des Temps modernes.'),
    (c, 'choix', 'Que se passe-t-il en 1789 ?', 'la Révolution française', array['la découverte de l''Amérique','la chute de l''Empire romain','l''apparition de l''écriture']::text[], 'Fin des Temps modernes, début de l''Époque contemporaine.'),
    (c, 'choix', 'Quel événement est arrivé en premier ?', 'l''apparition de l''écriture', array['la chute de l''Empire romain','la découverte de l''Amérique','la Révolution française']::text[], '-3 300, puis 476, puis 1492, puis 1789.'),
    (c, 'choix', 'Quel événement est le plus récent ?', 'la Révolution française', array['la découverte de l''Amérique','la chute de l''Empire romain','l''apparition de l''écriture']::text[], '-3 300, puis 476, puis 1492, puis 1789.'),
    (c, 'choix', 'La Préhistoire, c''est la période avant…', 'l''invention de l''écriture', array['la chute de l''Empire romain','la découverte de l''Amérique','la Révolution française']::text[], null),
    (c, 'vrai_faux', 'La Préhistoire est la plus longue des cinq périodes.', 'vrai', '{}'::text[], 'Elle dure des millions d''années, jusqu''à l''apparition de l''écriture vers -3 300.'),
    (c, 'vrai_faux', 'Le Moyen Âge vient avant l''Antiquité.', 'faux', '{}'::text[], 'Préhistoire → Antiquité → Moyen Âge → Temps modernes → Époque contemporaine.'),
    (c, 'vrai_faux', 'La Révolution française marque le début du Moyen Âge.', 'faux', '{}'::text[], 'Elle marque le début de l''Époque contemporaine, en 1789.');

  insert into public.chapters (subject_id, title, period, status, position)
  values ('histoire', 'La Préhistoire : vestiges et art', 1, 'en_cours', 3) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'choix', 'Ce qui reste du passé (bâtiments, monuments, objets, traces dans le sol), ce sont des…', 'vestiges', array['ancêtres','outils','alliages']::text[], 'Vestiges : ce qui reste du passé.'),
    (c, 'choix', 'La période la plus ancienne du passé de l''humanité, avant l''invention de l''écriture, c''est…', 'la Préhistoire', array['l''Antiquité','le Moyen Âge','l''Époque contemporaine']::text[], null),
    (c, 'choix', 'Les personnes de notre famille qui ont vécu très longtemps avant nous sont nos…', 'ancêtres', array['vestiges','voisins','descendants']::text[], null),
    (c, 'choix', 'Depuis combien de temps environ des gens vivent-ils dans notre pays ?', 'un million d''années', array['dix mille ans','mille ans','un milliard d''années']::text[], 'Des vestiges très anciens le prouvent.'),
    (c, 'choix', 'Pourquoi les vestiges de la Préhistoire sont-ils très rares ?', 'ils ont été détruits, ont disparu ou sont enfouis', array['personne ne les a cherchés','les hommes ne fabriquaient rien','il n''y avait personne en France']::text[], 'Avec le temps, ils ont été détruits ou ont disparu, profondément enfouis dans le sol.'),
    (c, 'choix', 'Les vestiges découverts nous donnent des indices sur…', 'la manière dont vivaient nos ancêtres', array['la météo de demain','les rois de France','la vie des dinosaures']::text[], null),
    (c, 'vrai_faux', 'Parmi les vestiges, on trouve aussi des œuvres d''art.', 'vrai', '{}'::text[], 'Comme nous, les hommes préhistoriques aimaient créer de belles choses.'),
    (c, 'choix', 'Dans les grottes comme Chauvet, qu''est-ce que l''homme préhistorique ne peignait jamais ?', 'lui-même', array['le feu','les animaux']::text[], 'Il n''a jamais reproduit sa propre image sur les parois.'),
    (c, 'choix', 'Les animaux peints dans la grotte Chauvet étaient surtout…', 'ceux qui n''étaient pas mangés', array['ceux qui venaient d''être mangés','ceux qui avaient tué des hommes de la tribu']::text[], 'Ce sont surtout de grands mammifères carnassiers, qui n''étaient pas chassés.'),
    (c, 'choix', 'Que signifie le mot « carnassier » ?', 'qui mange de la viande', array['qui mange de l''herbe','qui mange des cadavres']::text[], null),
    (c, 'choix', 'Pourquoi les hommes préhistoriques peignaient-ils ces animaux ?', 'pour obtenir leur puissance', array['car ils en avaient peur','pour qu''ils protègent leur grotte']::text[], 'Ils voulaient sûrement s''approprier leurs qualités.'),
    (c, 'choix', 'Quel vestige est le plus ancien ?', 'une dent humaine (550 000 ans)', array['une pointe de lance en silex','une tombe de deux femmes','une hache en pierre et bois de cerf']::text[], 'Dent : 550 000 ans ; pointe de lance : 19 000 ans ; tombe : 7 000 ans ; hache : 5 000 ans.'),
    (c, 'choix', 'Quel vestige est le plus récent ?', 'une hache en pierre et bois de cerf', array['une dent humaine','une pointe de lance en silex','une tombe de deux femmes']::text[], 'La hache a environ 5 000 ans.'),
    (c, 'choix', 'Quel âge a environ la pointe de lance en silex ?', '19 000 ans', array['550 000 ans','7 000 ans','5 000 ans']::text[], null),
    (c, 'choix', 'Quel âge a environ la tombe de deux femmes ?', '7 000 ans', array['19 000 ans','550 000 ans','5 000 ans']::text[], null),
    (c, 'choix', 'Qu''est-ce qui est le plus ancien ?', 'la pointe de lance (19 000 ans)', array['la tombe (7 000 ans)','la hache (5 000 ans)']::text[], 'Plus le nombre d''années est grand, plus c''est ancien.');

  insert into public.chapters (subject_id, title, period, status, position)
  values ('histoire', 'Les premiers hommes', 1, 'en_cours', 4) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'choix', 'Qui est le premier primate à se déplacer debout ?', 'l''Australopithèque', array['Homo habilis','Homo erectus','l''homme de Neandertal']::text[], 'Né vers -4,5 millions d''années, en Afrique.'),
    (c, 'choix', 'Qui est le premier homme à se servir d''outils ?', 'Homo habilis', array['l''Australopithèque','Homo erectus','Homo sapiens']::text[], 'Né vers -2,4 millions d''années, en Afrique.'),
    (c, 'choix', 'Qui est le premier homme à savoir faire du feu ?', 'Homo erectus', array['Homo habilis','l''homme de Neandertal','Homo sapiens']::text[], 'Né vers -1,9 million d''années ; il vivait en Afrique, en Europe et en Asie.'),
    (c, 'choix', 'Qui est le premier homme à enterrer ses morts ?', 'l''homme de Neandertal', array['Homo erectus','Homo habilis','Homo sapiens']::text[], 'Né vers -350 000 ans ; il vivait en Europe et en Asie.'),
    (c, 'choix', 'Qui est le premier homme à créer des œuvres d''art ?', 'Homo sapiens', array['l''homme de Neandertal','Homo erectus','Homo habilis']::text[], 'Né vers -200 000 ans ; il vit dans le monde entier.'),
    (c, 'choix', 'Qu''est-ce que l''Australopithèque a été le premier à faire ?', 'se déplacer debout', array['se servir d''outils','faire du feu','enterrer ses morts']::text[], null),
    (c, 'choix', 'Qu''est-ce qu''Homo habilis a été le premier à faire ?', 'se servir d''outils', array['faire du feu','se déplacer debout','créer des œuvres d''art']::text[], null),
    (c, 'choix', 'Qu''est-ce qu''Homo erectus a été le premier à faire ?', 'faire du feu', array['se servir d''outils','enterrer ses morts','créer des œuvres d''art']::text[], null),
    (c, 'choix', 'Qu''est-ce que l''homme de Neandertal a été le premier à faire ?', 'enterrer ses morts', array['faire du feu','créer des œuvres d''art','se servir d''outils']::text[], null),
    (c, 'choix', 'Qu''est-ce qu''Homo sapiens a été le premier à faire ?', 'créer des œuvres d''art', array['enterrer ses morts','faire du feu','se déplacer debout']::text[], null),
    (c, 'choix', 'Lequel est apparu en premier ?', 'l''Australopithèque', array['Homo habilis','Homo erectus','Homo sapiens']::text[], 'Australopithèque → Homo habilis → Homo erectus → homme de Neandertal → Homo sapiens.'),
    (c, 'choix', 'Qui est apparu juste après l''Australopithèque ?', 'Homo habilis', array['Homo erectus','l''homme de Neandertal','Homo sapiens']::text[], 'Australopithèque → Homo habilis → Homo erectus → homme de Neandertal → Homo sapiens.'),
    (c, 'choix', 'Qui est apparu juste après Homo habilis ?', 'Homo erectus', array['l''Australopithèque','l''homme de Neandertal','Homo sapiens']::text[], 'Australopithèque → Homo habilis → Homo erectus → homme de Neandertal → Homo sapiens.'),
    (c, 'choix', 'Qui est apparu juste après Homo erectus ?', 'l''homme de Neandertal', array['Homo habilis','Homo sapiens','l''Australopithèque']::text[], 'Australopithèque → Homo habilis → Homo erectus → homme de Neandertal → Homo sapiens.'),
    (c, 'choix', 'Qui est apparu juste après l''homme de Neandertal ?', 'Homo sapiens', array['Homo erectus','Homo habilis','l''Australopithèque']::text[], 'Australopithèque → Homo habilis → Homo erectus → homme de Neandertal → Homo sapiens.'),
    (c, 'choix', 'Lequel est apparu le plus récemment ?', 'Homo sapiens', array['l''homme de Neandertal','Homo erectus','l''Australopithèque']::text[], 'Australopithèque → Homo habilis → Homo erectus → homme de Neandertal → Homo sapiens.'),
    (c, 'choix', 'Vers quand est né l''Australopithèque ?', '-4,5 millions d''années', array['-2,4 millions d''années','-1,9 million d''années','-200 000 ans']::text[], null),
    (c, 'choix', 'Vers quand est né Homo habilis ?', '-2,4 millions d''années', array['-4,5 millions d''années','-1,9 million d''années','-350 000 ans']::text[], null),
    (c, 'choix', 'Vers quand est né Homo erectus ?', '-1,9 million d''années', array['-2,4 millions d''années','-350 000 ans','-4,5 millions d''années']::text[], null),
    (c, 'choix', 'Vers quand est né l''homme de Neandertal ?', '-350 000 ans', array['-200 000 ans','-1,9 million d''années','-2,4 millions d''années']::text[], null),
    (c, 'choix', 'Vers quand est né Homo sapiens ?', '-200 000 ans', array['-350 000 ans','-1,9 million d''années','-4,5 millions d''années']::text[], null),
    (c, 'choix', 'Où vivait l''Australopithèque ?', 'en Afrique', array['en Europe et en Asie','dans le monde entier','en Amérique']::text[], null),
    (c, 'choix', 'Où vivait Homo habilis ?', 'en Afrique', array['en Europe et en Asie','dans le monde entier','en Amérique']::text[], null),
    (c, 'choix', 'Où vivait Homo erectus ?', 'en Afrique, en Europe et en Asie', array['seulement en Afrique','dans le monde entier','en Amérique']::text[], null),
    (c, 'choix', 'Où vivait l''homme de Neandertal ?', 'en Europe et en Asie', array['seulement en Afrique','dans le monde entier','en Amérique']::text[], null),
    (c, 'choix', 'Où vit Homo sapiens ?', 'dans le monde entier', array['seulement en Afrique','en Europe et en Asie','seulement en Europe']::text[], null),
    (c, 'vrai_faux', 'Homo erectus savait faire du feu avant qu''Homo habilis apparaisse.', 'faux', '{}'::text[], 'Homo habilis (-2,4 millions d''années) est apparu avant Homo erectus (-1,9 million d''années).'),
    (c, 'vrai_faux', 'Nous, les humains d''aujourd''hui, sommes des Homo sapiens.', 'vrai', '{}'::text[], null);
end;
$$;
