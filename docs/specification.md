# Discere — spécification

Source de vérité du fonctionnement de l'application. Toute décision qui change un comportement
visible est reportée ici dans le même commit que le code (voir `CLAUDE.md`).

## But

Petits jeux de révision pour un enfant de primaire (CM1 en 2026-2027). Le contenu suit
l'avancée du programme scolaire : le parent ouvre les chapitres au fur et à mesure qu'ils sont
vus en classe, et les questions ratées reviennent plus souvent.

## Univers des quatre éléments

Thème choisi avec l'enfant, inspiré des séries où l'on maîtrise les éléments (dessins et
vocabulaire originaux : ni personnage, ni logo, ni symbole officiel).

- Chaque matière est rattachée à un **élément** : feu, air, eau ou terre. Par défaut :
  Mathématiques = feu, Français = air, Histoire = terre, Sciences = eau, Anglais = air.
  Le parent le change dans « Programme ».
- L'élément donne ses couleurs, son emblème, son motif de fond et son animation de réussite aux
  cartes de chapitre et aux pages de jeu. Le mélange de tous les chapitres s'appelle
  **« L'épreuve de l'Avatar »** (thème violet, quatre éléments).
- Noms des jeux : **Entraînement** (quiz), **Duel éclair** (contre la montre),
  **Harmonie** (paires), **Frise du temps** (remettre dans l'ordre).

## Rôles

- **Enfant** : pas de compte. Son appareil (tablette, ordinateur) est relié une fois par un
  lien secret `/appareil/:token` ouvert par le parent ; l'appareil mémorise le jeton.
  Sans jeton, on peut jouer en **mode essai** : rien n'est enregistré.
- **Parent** (admin) : se connecte par lien magique envoyé par e-mail (`/parent`). Seules les
  adresses de la table `admins` ont accès.

## Contenu

- **Matières** : Mathématiques, Français, Histoire, Sciences, Anglais (table `subjects`).
- **Chapitre** : une notion du programme (« Homophones : a / à »), rattachée à une matière, une
  classe (CE2, CM1, CM2, 6e) et une période scolaire (1 à 5, facultative).
- **Statut d'un chapitre** :
  - *À venir* : pas encore vu en classe, invisible pour l'enfant ;
  - *En cours* : travaillé en ce moment ;
  - *Révision* : déjà vu, revient de temps en temps.
- **Questions** d'un chapitre, de quatre types :
  - *Choix multiple* : une bonne réponse et 1 à 5 mauvaises réponses proposées, mélangées ;
  - *Réponse à taper* : variantes acceptées séparées par « | » ;
  - *Vrai ou faux* ;
  - *Frise* (remettre dans l'ordre) : 3 à 10 étapes rangées dans le bon ordre, chacune avec un
    détail facultatif (une date) montré après la correction. L'enfant voit les étiquettes
    mélangées (jamais déjà dans le bon ordre), les touche dans l'ordre pour les poser sur la
    frise, et peut retirer une étiquette posée. La réponse est juste si tout l'ordre est juste ;
    la correction marque chaque place juste ou fausse et montre la frise complète.
  Chaque question peut avoir une explication montrée après la réponse.
- **Questions générées** : un chapitre peut utiliser un générateur de calcul mental au lieu de
  questions écrites (`src/content/generators.ts`) : tables de multiplication (2 à 10),
  multiplier par 10 / 100 / 1 000, compléments à 100, doubles et moitiés. Quand un générateur
  est choisi, les questions écrites du chapitre ne sont pas utilisées.

### Correction des réponses tapées

Majuscules, espaces en trop, point final et apostrophe typographique ne comptent pas.
Les **accents comptent** (« a » ≠ « à »). Pour les nombres, les espaces de milliers sont ignorés
et la virgule vaut le point (« 80 600 » = « 80600 »).

## Choix des questions

L'enfant choisit un chapitre ou **« L'épreuve de l'Avatar »** (tous les chapitres en cours et en
révision).

1. Pour chaque question, on tire d'abord un chapitre : *en cours* poids 3, *révision* poids 1.
2. Puis une question de ce chapitre, par **répétition espacée** (boîtes de Leitner) :
   - chaque question déjà vue est dans une **boîte** : 0 si elle a été ratée la dernière fois ;
     sinon 1 à 4 selon le nombre de **jours différents** où elle a été réussie depuis sa dernière
     erreur (4 = quatre jours ou plus) ;
   - poids de tirage : boîte 0 → 8, jamais vue → 4, boîte 1 → 3, boîte 2 → 2, boîte 3 → 1,
     boîte 4 → 0,5 ;
   - une question réussie est **à revoir** (poids doublé) quand son délai est passé depuis la
     dernière fois qu'elle est tombée : 1 jour (boîte 1), 3 jours (2), 7 jours (3), 14 jours (4).
   Pas de doublon dans une partie.
3. Un chapitre à générateur garde la trace de chaque calcul posé (« 7 × 8 = ? »). Il propose
   soit un calcul à revoir (raté la dernière fois, ou réussi mais à revoir, mêmes poids), soit un
   nouveau calcul (poids 4).

## Jeux

| Jeu | Déroulement | Score |
| --- | --- | --- |
| **Entraînement** (quiz) | 10 questions ; après chaque réponse : « Bravo ! » ou la bonne réponse, et l'explication | bonnes réponses / 10 |
| **Duel éclair** (contre la montre) | 60 secondes, enchaînement rapide ; la bonne réponse s'affiche brièvement en cas d'erreur | nombre de bonnes réponses |
| **Frise du temps** | jusqu'à 5 frises du chapitre ; proposé seulement s'il y a au moins une frise | frises entièrement justes / nombre de frises |
| **Harmonie** (paires) | 6 questions à relier à leur réponse (questions de 70 caractères au plus, réponses de 24 au plus, toutes différentes, pas de vrai/faux) | paires trouvées du premier coup / 6 |

Les frises apparaissent aussi dans l'Entraînement, jamais dans le Duel éclair ni dans Harmonie.
Harmonie n'est proposé que si le chapitre fournit au moins 4 paires possibles.

**Étoiles** en fin de partie : 3 à partir de 90 % de réussite, 2 à partir de 70 %, 1 à partir
de 50 %. Pour le Duel éclair, le pourcentage est calculé sur au moins 10 réponses.
L'écran de fin liste les questions ratées avec la bonne réponse.

## Progression

Seulement pour un appareil relié à un enfant (pas en mode essai). Rien ne se perd jamais.

- **Points** : 10 par bonne réponse, plus 20 quand l'enfant réussit une question ou un calcul
  qu'il avait raté la fois précédente (« faiblesse vaincue »). Les points d'une question vont à l'élément
  de sa matière.
- **Rangs** par élément : Novice (0), Apprenti (150), Disciple (600), Maître (1 500 points),
  affichés « Apprenti du feu », « Maître de l'eau »…
- **Avatar** : quand les quatre éléments ont atteint le rang de Maître.
- **Parchemins** : un par chapitre, gagné pour toujours quand, sur les 20 dernières réponses du
  chapitre (15 au moins), 80 % sont justes.
- Fin de partie : points gagnés par élément, nouveau rang, Avatar, parchemin gagné.
- Accueil : les quatre éléments avec rang et points manquants, parchemin gagné ou à gagner sur
  chaque chapitre.

## Espace parent

- **Programme** : chapitres par matière, élément de chaque matière, changement de statut en un
  clic, ajout d'un chapitre.
- **Chapitre** : titre, matière, période, statut, générateur ; ajout, modification et
  suppression des questions ; lien « Essayer les jeux de ce chapitre ».
- **Suivi** : rangs par élément, parchemins, nombre de questions solides (boîte 3 ou 4), en cours
  d'apprentissage (1 ou 2) et ratées la dernière fois ; sur 30 jours : réussite par chapitre, questions « à retravailler » (ratées la
  dernière fois qu'elles sont tombées), dernières parties.
- **Enfants et appareils** : ajout d'un enfant, lien d'appareil à copier, création d'un nouveau
  lien (l'ancien cesse de fonctionner).

## Données et sécurité

- Lecture publique : matières, chapitres non « à venir » et leurs questions (contenu scolaire,
  rien de personnel).
- Réservé aux parents : enfants, parties (`rounds`), réponses (`answers`), chapitres à venir.
- L'enfant passe par des fonctions identifiées par son jeton : `get_learner` (prénom, historique
  par question écrite et par calcul généré — dernier résultat, jours de réussite depuis la
  dernière erreur, dernière date —, bonnes réponses et faiblesses vaincues par matière,
  parchemins) et
  `finish_round` (enregistre une partie et au plus 200 réponses via `record_round`, puis
  attribue les parchemins).

## Décisions validées

- Même socle technique que tournoi-jeux : React + TypeScript + Vite, Supabase (projet `discere`,
  Paris), Netlify.
- Pas de compte enfant : appareil relié par lien secret.
- Contenu de départ : CM1, période 1 (exemples à ajuster par le parent).
- Univers des quatre éléments et progression (rangs, Avatar, parchemins) ; récompenses réelles
  et série de jours remises à plus tard.

## Historique des mises à jour

- 2026-10-18 : première version (trois jeux, programme par chapitres, suivi parent).
- 2026-10-18 : univers des quatre éléments (thème par matière, jeux renommés), points, rangs,
  Avatar et parchemins.
- 2026-10-18 : répétition espacée (boîtes de Leitner, délais de révision) et retour des calculs
  ratés dans les chapitres à générateur ; faiblesses vaincues comptées aussi pour les calculs.
- 2026-10-20 : jeu Frise du temps et type de question « frise » (remettre des étapes dans
  l'ordre) ; frises d'histoire (périodes, événements, premiers hommes, vestiges).
- 2026-10-20 : une frise peut compter 10 étapes ; la frise « ranger les dates » (simple tri de
  nombres) est remplacée par une frise qui mêle les 5 périodes et les 4 événements qui les séparent.
