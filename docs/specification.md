# Discere — spécification

Source de vérité du fonctionnement de l'application. Toute décision qui change un comportement
visible est reportée ici dans le même commit que le code (voir `CLAUDE.md`).

## But

Petits jeux de révision pour un enfant de primaire (CM1 en 2026-2027). Le contenu suit
l'avancée du programme scolaire : le parent ouvre les chapitres au fur et à mesure qu'ils sont
vus en classe, et les questions ratées reviennent plus souvent.

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
- **Questions** d'un chapitre, de trois types :
  - *Choix multiple* : une bonne réponse et 1 à 5 mauvaises réponses proposées, mélangées ;
  - *Réponse à taper* : variantes acceptées séparées par « | » ;
  - *Vrai ou faux*.
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

L'enfant choisit un chapitre ou **« Tout mélanger »** (tous les chapitres en cours et en révision).

1. Pour chaque question, on tire d'abord un chapitre : *en cours* poids 3, *révision* poids 1.
2. Puis une question de ce chapitre, selon le dernier résultat de l'enfant : jamais vue 2,
   ratée la dernière fois 4, réussie la dernière fois 1. Pas de doublon dans une partie.
3. Un chapitre à générateur fabrique une nouvelle question à chaque tirage.

## Jeux

| Jeu | Déroulement | Score |
| --- | --- | --- |
| **Quiz** | 10 questions ; après chaque réponse : « Bravo ! » ou la bonne réponse, et l'explication | bonnes réponses / 10 |
| **Contre la montre** | 60 secondes, enchaînement rapide ; la bonne réponse s'affiche brièvement en cas d'erreur | nombre de bonnes réponses |
| **Les paires** | 6 questions à relier à leur réponse (questions de 70 caractères au plus, réponses de 24 au plus, toutes différentes, pas de vrai/faux) | paires trouvées du premier coup / 6 |

Les paires ne sont proposées que si le chapitre fournit au moins 4 paires possibles.

**Étoiles** en fin de partie : 3 à partir de 90 % de réussite, 2 à partir de 70 %, 1 à partir
de 50 %. Pour « Contre la montre », le pourcentage est calculé sur au moins 10 réponses.
L'écran de fin liste les questions ratées avec la bonne réponse.

## Espace parent

- **Programme** : chapitres par matière, changement de statut en un clic, ajout d'un chapitre.
- **Chapitre** : titre, matière, période, statut, générateur ; ajout, modification et
  suppression des questions ; lien « Essayer les jeux de ce chapitre ».
- **Suivi** (30 derniers jours) : réussite par chapitre, questions « à retravailler » (ratées la
  dernière fois qu'elles sont tombées), dernières parties.
- **Enfants et appareils** : ajout d'un enfant, lien d'appareil à copier, création d'un nouveau
  lien (l'ancien cesse de fonctionner).

## Données et sécurité

- Lecture publique : matières, chapitres non « à venir » et leurs questions (contenu scolaire,
  rien de personnel).
- Réservé aux parents : enfants, parties (`rounds`), réponses (`answers`), chapitres à venir.
- L'enfant passe par deux fonctions identifiées par son jeton : `get_learner` (prénom et dernier
  résultat par question) et `record_round` (enregistre une partie et au plus 200 réponses).

## Décisions validées

- Même socle technique que tournoi-jeux : React + TypeScript + Vite, Supabase (projet `discere`,
  Paris), Netlify.
- Pas de compte enfant : appareil relié par lien secret.
- Contenu de départ : CM1, période 1 (exemples à ajuster par le parent).

## Historique des mises à jour

- 2026-10-18 : première version (trois jeux, programme par chapitres, suivi parent).
