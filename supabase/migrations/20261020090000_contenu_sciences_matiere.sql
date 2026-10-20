-- Sciences : leçons ST1 (diversité et usages de la matière) et ST2 (propriétés de la matière),
-- d'après les leçons et fiches d'exercices corrigées fournies par le parent.
do $$
declare
  c uuid;
begin
  insert into public.chapters (subject_id, title, period, status, position)
  values ('sciences', 'La matière : diversité et usages', 1, 'en_cours', 1) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'choix', 'De quoi est constitué tout ce qui nous entoure, y compris nous-mêmes ?', 'de matière', array['d''air','d''eau','d''énergie']::text[], 'Tout ce qui nous entoure, y compris nous-mêmes, est constitué de matière.'),
    (c, 'choix', 'La matière, c''est tout ce que l''on peut toucher ou peser, c''est-à-dire tout ce qui a…', 'une masse', array['une couleur','une odeur','une forme']::text[], 'La matière, c''est tout ce qui a une masse.'),
    (c, 'vrai_faux', 'Les êtres vivants sont faits de matière.', 'vrai', '{}'::text[], 'La matière forme l''ensemble des objets et des êtres vivants.'),
    (c, 'vrai_faux', 'L''air est de la matière.', 'vrai', '{}'::text[], 'L''air a une masse : c''est de la matière à l''état gazeux.'),
    (c, 'choix', 'Sous combien d''états trouve-t-on généralement la matière ?', 'trois', array['deux','quatre','cinq']::text[], 'Trois états : solide, liquide et gazeux.'),
    (c, 'choix', 'Quels sont les trois états de la matière ?', 'solide, liquide, gazeux', array['chaud, tiède, froid','dur, mou, liquide','solide, liquide, glacé']::text[], null),
    (c, 'choix', 'Un glaçon, c''est de l''eau à l''état…', 'solide', array['liquide','gazeux']::text[], null),
    (c, 'choix', 'La vapeur d''eau, c''est de l''eau à l''état…', 'gazeux', array['solide','liquide']::text[], null),
    (c, 'vrai_faux', 'La matière peut être transformée.', 'vrai', '{}'::text[], 'Par exemple, l''eau peut geler ou s''évaporer, le bois peut brûler.'),
    (c, 'choix', 'Quand on utilise des matières pour fabriquer des objets, on parle de…', 'matériaux', array['minerais','aliments','outils']::text[], null),
    (c, 'choix', 'Un matériau, c''est…', 'une matière que l''Homme travaille pour fabriquer des objets', array['un outil pour construire','un objet déjà fabriqué','un être vivant']::text[], 'Matériau : matière d''origine naturelle ou artificielle que l''Homme travaille pour fabriquer des objets.'),
    (c, 'choix', 'En combien de grandes familles classe-t-on les matériaux ?', 'quatre', array['deux','trois','six']::text[], 'Métalliques, minéraux, organiques et composites.'),
    (c, 'choix', 'Les matériaux métalliques se trouvent dans les sols sous forme de…', 'minerais', array['plastiques','cristaux de sel','sable']::text[], null),
    (c, 'choix', 'Un alliage, c''est…', 'un métal combiné avec d''autres éléments', array['un mélange d''eau et de sucre','une matière plastique','un matériau d''origine animale']::text[], 'Alliage : combinaison d''un métal avec un ou plusieurs autres éléments.'),
    (c, 'choix', 'Le fer, le cuivre et l''aluminium sont des matériaux…', 'métalliques', array['minéraux','organiques','composites']::text[], null),
    (c, 'choix', 'La céramique, le verre et la pierre sont des matériaux…', 'minéraux', array['métalliques','organiques','composites']::text[], 'Les matériaux minéraux (ou céramiques) sont issus de matières minérales d''origine naturelle.'),
    (c, 'choix', 'Le bois, le cuir et la laine sont des matériaux…', 'organiques', array['métalliques','minéraux','composites']::text[], 'Les matériaux organiques sont d''origine animale ou végétale.'),
    (c, 'choix', 'Les matières plastiques sont fabriquées surtout à partir…', 'du pétrole', array['du sable','du fer','du bois']::text[], 'Les plastiques sont des matériaux organiques synthétiques fabriqués surtout à partir du pétrole.'),
    (c, 'choix', 'Un matériau formé de plusieurs matériaux juxtaposés est un matériau…', 'composite', array['métallique','minéral','organique']::text[], null),
    (c, 'vrai_faux', 'Le plastique existe tel quel dans la nature.', 'faux', '{}'::text[], 'Le plastique est fabriqué par l''Homme : il est d''origine artificielle.'),
    (c, 'vrai_faux', 'Les matériaux sont choisis pour répondre à des besoins précis.', 'vrai', '{}'::text[], null);

  insert into public.chapters (subject_id, title, period, status, position)
  values ('sciences', 'Quelques propriétés de la matière', 1, 'en_cours', 2) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'choix', 'Quelle propriété ? Capacité d''un matériau à coller à son support.', 'adhérence', array['élasticité','dureté','solubilité']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité d''un matériau à s''enflammer.', 'combustibilité', array['conductivité thermique','solubilité','densité']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité d''un matériau à transmettre l''électricité.', 'conductibilité électrique', array['magnétisme','conductivité thermique','adhérence']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité de transmettre la chaleur plus ou moins rapidement.', 'conductivité thermique', array['conductibilité électrique','combustibilité','densité']::text[], null),
    (c, 'choix', 'Quelle propriété ? Masse d''un matériau par rapport à son volume.', 'densité', array['dureté','rigidité','solubilité']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité à résister à la pression.', 'dureté', array['densité','élasticité','flexibilité']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité d''un matériau à s''étirer puis à reprendre sa forme initiale.', 'élasticité', array['flexibilité','adhérence','rigidité']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité d''un matériau à être souple.', 'flexibilité', array['élasticité','dureté','miscibilité']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité d''un matériau à attirer des matériaux métalliques.', 'magnétisme', array['adhérence','conductibilité électrique','densité']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité de deux liquides à se mélanger de façon homogène.', 'miscibilité', array['solubilité','élasticité','adhérence']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité d''un matériau à résister à la déformation due à un autre matériau.', 'rigidité', array['flexibilité','élasticité','solubilité']::text[], null),
    (c, 'choix', 'Quelle propriété ? Capacité d''un matériau à se dissoudre plus ou moins dans un autre.', 'solubilité', array['miscibilité','densité','combustibilité']::text[], null),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? Un cube de bois pèse 60 g, un cube de plomb de même taille pèse 280 g.', 'densité', array['dureté','rigidité','solubilité']::text[], 'À taille égale, le plomb est bien plus lourd que le bois : il est plus dense.'),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? Sous un poids de 1 kg, une planche de bois reste droite, une planche de plastique se courbe.', 'flexibilité', array['élasticité','densité','adhérence']::text[], 'Le plastique se courbe : il est flexible (souple).'),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? On étire un élastique entre ses mains, puis il reprend sa forme.', 'élasticité', array['flexibilité','dureté','adhérence']::text[], 'Il s''étire puis reprend sa forme initiale : c''est l''élasticité.'),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? On chauffe de l''eau dans une casserole posée sur le feu.', 'conductivité thermique', array['combustibilité','solubilité','conductibilité électrique']::text[], 'La chaleur du feu passe à travers le métal de la casserole jusqu''à l''eau.'),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? On met un morceau de sucre dans l''eau : il disparaît.', 'solubilité', array['miscibilité','densité','combustibilité']::text[], 'Le sucre se dissout dans l''eau : il est soluble.'),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? Dans un circuit avec une pile, la lampe reste éteinte avec du bois et s''allume avec du cuivre.', 'conductibilité électrique', array['conductivité thermique','magnétisme','dureté']::text[], 'Le cuivre transmet l''électricité, le bois non.'),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? Un aimant attire des trombones.', 'magnétisme', array['adhérence','conductibilité électrique','densité']::text[], null),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? Sur une pente, un bloc de caoutchouc reste en place, un bloc de plastique glisse.', 'adhérence', array['dureté','élasticité','densité']::text[], 'Le caoutchouc colle à son support : il adhère.'),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? Une pointe s''enfonce dans le polystyrène mais pas dans l''acier.', 'dureté', array['densité','flexibilité','élasticité']::text[], 'L''acier résiste à la pression : il est dur.'),
    (c, 'choix', 'Quelle propriété cette expérience montre-t-elle ? On verse du lait dans de l''eau : on obtient un seul liquide homogène.', 'miscibilité', array['solubilité','densité','adhérence']::text[], 'Deux liquides qui se mélangent de façon homogène sont miscibles.'),
    (c, 'choix', 'Les pneus sont en caoutchouc. Quelle propriété recherche-t-on ?', 'adhérence', array['dureté','combustibilité','magnétisme']::text[], 'Le caoutchouc des pneus colle à la route : il ne glisse pas.'),
    (c, 'choix', 'Les collants sont en nylon. Quelle propriété recherche-t-on ?', 'élasticité', array['dureté','adhérence','densité']::text[], 'Le nylon s''étire puis reprend sa forme.'),
    (c, 'choix', 'On met du bois dans un poêle. Quelle propriété du bois utilise-t-on ?', 'combustibilité', array['conductivité thermique','dureté','élasticité']::text[], 'Le bois s''enflamme : il est combustible.'),
    (c, 'choix', 'Un aimant en métal attire des trombones. Quelle propriété ?', 'magnétisme', array['adhérence','conductibilité électrique','élasticité']::text[], null),
    (c, 'choix', 'Une cocotte est en fonte. Quelle propriété recherche-t-on ?', 'conductivité thermique', array['combustibilité','élasticité','magnétisme']::text[], 'La fonte transmet bien la chaleur pour cuire les aliments. On dit aussi conductibilité thermique.'),
    (c, 'choix', 'Des élastiques en caoutchouc : quelle propriété recherche-t-on ?', 'élasticité', array['flexibilité','dureté','solubilité']::text[], null),
    (c, 'choix', 'Les matériaux métalliques sont souvent utilisés pour leur très grande…', 'résistance', array['légèreté','fragilité','solubilité']::text[], null),
    (c, 'choix', 'Pourquoi utilise-t-on le cuivre dans les fils électriques ?', 'il conduit l''électricité', array['il est élastique','il brûle bien','il se dissout dans l''eau']::text[], 'Le cuivre a une bonne conductibilité électrique.'),
    (c, 'choix', 'Les matériaux minéraux sont durs mais…', 'fragiles', array['souples','élastiques','solubles']::text[], 'Ils se cassent facilement.'),
    (c, 'choix', 'Le caoutchouc est un matériau organique…', 'déformable et élastique', array['dur et fragile','qui conduit l''électricité','magnétique']::text[], null),
    (c, 'vrai_faux', 'Les matériaux minéraux résistent à de très fortes températures.', 'vrai', '{}'::text[], null),
    (c, 'vrai_faux', 'Les matières plastiques conduisent l''électricité.', 'faux', '{}'::text[], 'Les matériaux organiques et les plastiques ne conduisent pas l''électricité.'),
    (c, 'vrai_faux', 'Les matériaux organiques et les plastiques brûlent.', 'vrai', '{}'::text[], null),
    (c, 'vrai_faux', 'Les matériaux minéraux conduisent l''électricité.', 'faux', '{}'::text[], 'Les matériaux minéraux ne conduisent pas l''électricité.'),
    (c, 'vrai_faux', 'Le fer, le zinc et l''aluminium sont de bons conducteurs d''électricité.', 'vrai', '{}'::text[], null),
    (c, 'vrai_faux', 'Les métaux se cassent si on les frappe d''un coup sec.', 'faux', '{}'::text[], 'Les métaux ne cassent pas d''un coup sec ; les matériaux minéraux, si.'),
    (c, 'vrai_faux', 'Le zinc et l''aluminium peuvent se plier facilement.', 'vrai', '{}'::text[], null);
end;
$$;
