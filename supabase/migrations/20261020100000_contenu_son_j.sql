-- Français : le son [j] (i, il, ille, ill, y) et le son [nj] (gn, ni), d'après la leçon fournie.
do $$
declare
  c uuid;
begin
  insert into public.chapters (subject_id, title, period, status, position)
  values ('francais', 'Le son [j] : i, il, ille, ill, y', 1, 'en_cours', 7) returning id into c;
  insert into public.items (chapter_id, kind, prompt, answer, distractors, explanation) values
    (c, 'choix', 'Quelle écriture du son [j] manque ? s___ècle', 'i', array['ill','y','il']::text[], 'Entre une consonne et une voyelle, le son [j] s''écrit le plus souvent i : siècle.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? v___olet', 'i', array['ill','y','il']::text[], 'Entre une consonne et une voyelle, le son [j] s''écrit le plus souvent i : violet.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? pap___er', 'i', array['ill','y','il']::text[], 'Entre une consonne et une voyelle, le son [j] s''écrit le plus souvent i : papier.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? mil___eu', 'i', array['ill','y','il']::text[], 'Entre une consonne et une voyelle, le son [j] s''écrit le plus souvent i : milieu.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? orte___ (au bout du pied)', 'il', array['ille','ill','y']::text[], 'À la fin d''un mot masculin, on écrit il : un orteil.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? déta___', 'il', array['ille','ill','y']::text[], 'À la fin d''un mot masculin, on écrit il : un détail.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? chevreu___', 'il', array['ille','ill','i']::text[], 'À la fin d''un mot masculin, on écrit il : un chevreuil.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? fenou___ (un légume)', 'il', array['ille','ill','y']::text[], 'À la fin d''un mot masculin, on écrit il : le fenouil.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? grenou___', 'ille', array['il','ill','y']::text[], 'À la fin d''un mot féminin, on écrit ille : une grenouille.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? bata___', 'ille', array['il','ill','y']::text[], 'À la fin d''un mot féminin, on écrit ille : une bataille.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? grose___ (un petit fruit)', 'ille', array['il','ill','y']::text[], 'À la fin d''un mot féminin, on écrit ille : une groseille.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? qu___ (au bowling)', 'ille', array['il','ill','y']::text[], 'À la fin d''un mot féminin, on écrit ille : une quille.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? feu___eton', 'ill', array['il','ille','y']::text[], 'À l''intérieur d''un mot, on écrit souvent ill : feuilleton.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? b___et', 'ill', array['il','i','y']::text[], 'À l''intérieur d''un mot, on écrit souvent ill : billet.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? ta___eur', 'ill', array['il','ille','y']::text[], 'À l''intérieur d''un mot, on écrit souvent ill : tailleur.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? émerve___er', 'ill', array['il','i','y']::text[], 'À l''intérieur d''un mot, on écrit souvent ill : émerveiller.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? pa___er (donner de l''argent)', 'y', array['ill','i','il']::text[], 'Ce mot s''écrit avec un y : payer.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? cra___on', 'y', array['ill','i','il']::text[], 'Ce mot s''écrit avec un y : crayon.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? envo___er', 'y', array['ill','i','il']::text[], 'Ce mot s''écrit avec un y : envoyer.'),
    (c, 'choix', 'Quelle écriture du son [j] manque ? les ___eux (pour voir)', 'y', array['i','ill','il']::text[], 'Ce mot s''écrit avec un y : les yeux.'),
    (c, 'choix', 'Quelle écriture du son [nj] manque ? monta___e', 'gn', array['ni','n']::text[], 'Le son [nj] s''écrit très souvent gn : montagne.'),
    (c, 'choix', 'Quelle écriture du son [nj] manque ? ga___er', 'gn', array['ni','n']::text[], 'Le son [nj] s''écrit très souvent gn : gagner.'),
    (c, 'choix', 'Quelle écriture du son [nj] manque ? pa___er (pour les courses)', 'ni', array['gn','n']::text[], 'Ici le son [nj] s''écrit ni : panier.'),
    (c, 'choix', 'Quelle écriture du son [nj] manque ? der___er', 'ni', array['gn','n']::text[], 'Ici le son [nj] s''écrit ni : dernier.'),
    (c, 'choix', 'Quelle est l''écriture la plus fréquente du son [j] ?', 'i', array['ill','y','il']::text[], 'Le i, entre une consonne et une voyelle : siècle, papier.'),
    (c, 'choix', 'Entre une consonne et une voyelle, le son [j] s''écrit le plus souvent…', 'i', array['ill','y']::text[], 'Siècle, violet, papier, milieu.'),
    (c, 'choix', 'À la fin d''un mot masculin, le son [j] s''écrit…', 'il', array['ille','y']::text[], 'Un orteil, un détail, un chevreuil.'),
    (c, 'choix', 'À la fin d''un mot féminin, le son [j] s''écrit…', 'ille', array['il','y']::text[], 'Une grenouille, une bataille, une groseille.'),
    (c, 'choix', 'À l''intérieur d''un mot, le son [j] s''écrit souvent…', 'ill', array['il','ille']::text[], 'Feuilleton, billet, tailleur.'),
    (c, 'choix', 'Le son [nj] s''écrit très souvent…', 'gn', array['ni','ny']::text[], 'Montagne, gagner. Quelquefois ni : panier, dernier.');
end;
$$;
