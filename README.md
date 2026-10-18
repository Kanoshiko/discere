# Discere

Petits jeux de révision pour l'école primaire, dont le contenu suit l'avancée du programme.

- **Enfant** : choisit un chapitre (ou « Tout mélanger ») et un jeu : Quiz, Contre la montre,
  Les paires. Les questions ratées reviennent plus souvent.
- **Parent** (`/parent`) : ouvre les chapitres au fil de l'année, écrit ses propres questions,
  suit les progrès et relie les appareils de l'enfant.

Site : https://discere-etzh.netlify.app — espace parent : `/parent`.

Fonctionnement détaillé : [`docs/specification.md`](docs/specification.md).

## Technologies

| Rôle | Outil |
| --- | --- |
| Interface | React + TypeScript, construit avec Vite |
| Base de données, connexion parent | Supabase (projet `discere`, région Paris) |
| Hébergement | Netlify, redéploiement automatique à chaque commit sur `main` |
| Tests | Vitest (`src/**/*.test.ts`) |

## Développer en local

```bash
npm install
cp .env.example .env.local
npm run dev                  # http://localhost:5173
npm test
```

## Secrets

Seules l'URL du projet et la clé *publishable* Supabase vont dans le navigateur ; elles sont
publiques par conception, la protection des données repose sur les règles RLS. La clé
*secret* / *service_role* n'est jamais nécessaire ni versionnée.

## Base de données

Les fichiers de `supabase/migrations/` sont appliqués dans l'ordre ; les rejouer recrée la base,
contenu de départ compris. Les parents sont les e-mails listés dans la table `admins`.
