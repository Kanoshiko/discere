# Discere — contexte pour Claude Code

Petits jeux de révision pour un enfant de primaire (CM1 en 2026-2027), dont le contenu suit
l'avancée du programme scolaire. Interface **en français**, tutoiement. L'enfant joue sur
tablette ou ordinateur ; le parent gère le programme depuis `/parent`.

- Base : Supabase, projet `discere` (ref `brteqdjzfrhlcuwpmagj`, région Paris)
- Site : https://discere-etzh.netlify.app (Netlify, projet `discere-etzh`, déploiement automatique de `main`)
- La base de production contient les résultats réels de l'enfant : ne jamais vider ni
  réinitialiser des tables sans accord explicite. Faire les essais dans une transaction annulée
  (`begin; … rollback;`).

## Spécification : `docs/specification.md` (à tenir à jour)

Source de vérité du fonctionnement. Toute décision qui change un comportement visible (jeux,
score, choix des questions, correction, parcours enfant ou parent) y est reportée **dans le même
commit** que le code, avec une ligne datée dans « Historique des mises à jour ». Si une demande
contredit la spécification, le signaler et demander laquelle fait foi avant de coder.

## Ajouter du contenu

Le parent ajoute chapitres et questions depuis `/parent`. Pour un gros ajout demandé à Claude
(par exemple « le chapitre sur les fractions »), écrire une migration de contenu
`supabase/migrations/AAAAMMJJHHMMSS_contenu_xxx.sql` sur le modèle de `20261018100100_contenu_cm1.sql`,
avec des questions vérifiées (orthographe rectifiée de 1990 pour les nombres en lettres,
explications courtes adressées à l'enfant). Un nouveau générateur de calcul se code dans
`src/content/generators.ts` avec son test.

## Stack et commandes

React 19 + TypeScript + Vite, React Router, `@supabase/supabase-js`, Vitest. Pas de framework CSS
(`src/styles.css`, variables sur `:root`).

```bash
npm install
cp .env.example .env.local   # URL + clé publishable Supabase (publiques par conception)
npm run dev
npm test                     # Vitest, src/**/*.test.ts
npm run build                # tsc + vite build
```

Toujours lancer `npm test` et `npm run build` avant de commiter.

## Organisation

```
src/content/     types.ts, answers.ts (correction), generators.ts (calcul mental),
                 validate.ts (questions saisies par le parent), random.ts — TypeScript pur, testé
src/games/       deck.ts (choix des questions, étoiles), progress.ts (suivi) — testés ;
                 Quiz, Chrono, Paires, Resultat (composants)
src/lib/         supabase.ts, api.ts (enfant), parentApi.ts, auth.ts (lien magique),
                 deviceStore.ts (jeton de l'appareil), childData.ts
src/pages/enfant/  Accueil, Appareil (/appareil/:token), ChoixJeu, Partie
src/pages/parent/  ParentLayout (garde), Login, Programme, Chapitre, Suivi, Enfants
supabase/migrations/  schéma, RLS, fonctions et contenu — appliqués dans l'ordre
docs/specification.md
```

## Sécurité (à préserver)

- Le navigateur n'a que la clé **publishable**. Jamais de clé `service_role`/secret dans le code,
  le dépôt ou Netlify.
- Toutes les tables ont la RLS. Lecture publique : `subjects`, `chapters` et `items` des
  chapitres non « à venir ». Le reste : parents seuls (`private.is_admin()`, schéma non exposé).
  Les règles de lecture publique ne doivent pas appeler `private.is_admin()` (le rôle `anon` n'y
  a pas droit).
- Parent = e-mail présent dans `public.admins` (minuscules).
- L'enfant passe par `get_learner(token)` et `record_round(token, …)` (`security definer`).
- Après chaque migration : `get_advisors` (sécurité) et un test des droits en rôle `anon` /
  `authenticated` dans une transaction annulée. Les deux avertissements sur `get_learner` et
  `record_round` (appelables par `anon`) sont voulus.

## Migrations et déploiement

- Nouvelle migration = nouveau fichier `supabase/migrations/AAAAMMJJHHMMSS_nom.sql`.
- Appliquer la migration sur Supabase *avant* de pousser sur `main` du code qui en dépend.
- Préférer les migrations additives ; l'outil MCP Supabase bloque les `drop` (préférer
  `alter policy`, `create or replace`).
- Si l'outil MCP ne peut pas appliquer une migration, donner le fichier à coller dans le SQL
  Editor : https://supabase.com/dashboard/project/brteqdjzfrhlcuwpmagj/sql/new

## Conventions UI

- Français, tutoiement. Pas d'emoji.
- Côté enfant : gros boutons (≥ 48 px), couleurs vives, textes courts et encourageants.
- Côté parent : sobre, menu latéral à partir de 700 px.
- Accessibilité : vrais `<button>`/`<label>`, `role="alert"` pour les erreurs, contraste ≥ 4,5:1.
- Polices : Fredoka (titres), Andika (texte, conçue pour les jeunes lecteurs).

## Prochaines étapes possibles

1. Ajouter les chapitres des périodes suivantes au fil de l'année.
2. Nouveaux jeux (dictée de mots, remettre dans l'ordre, frise chronologique).
3. Récompenses / série de jours joués.
4. E-mail de connexion en français (Supabase → Authentication → Email templates).
