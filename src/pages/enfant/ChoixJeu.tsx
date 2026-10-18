import { Link, useParams } from 'react-router-dom';
import { LoadError, Loading } from '../../components/Loading';
import { contentsFor, useChildData } from '../../lib/childData';
import { buildDeck } from '../../games/deck';
import { fitsPair, PAIRS } from '../../games/Paires';
import { seeded } from '../../content/random';
import type { GameId } from '../../content/types';

const GAMES: { id: GameId; title: string; text: string }[] = [
  { id: 'quiz', title: 'Quiz', text: '10 questions, avec la correction à chaque fois.' },
  { id: 'chrono', title: 'Contre la montre', text: 'Un maximum de bonnes réponses en 60 secondes.' },
  { id: 'paires', title: 'Les paires', text: 'Relie chaque question à sa réponse.' },
];

export default function ChoixJeu() {
  const { scope = 'melange' } = useParams();
  const state = useChildData();

  if (state.status === 'loading') return <main className="page child"><Loading /></main>;
  if (state.status === 'error') return <main className="page child"><LoadError message={state.message} onRetry={state.reload} /></main>;

  const { catalog } = state.data;
  const contents = contentsFor(catalog, scope);
  const chapter = catalog.chapters.find((c) => c.id === scope);
  const title = scope === 'melange' ? 'Tout mélanger' : chapter?.title;

  if (contents.length === 0) {
    return (
      <main className="page child">
        <p className="error" role="alert">Ce chapitre n'est pas disponible.</p>
        <Link className="btn" to="/">Retour à l'accueil</Link>
      </main>
    );
  }

  const pairsPossible = buildDeck(contents, {}, PAIRS, seeded(1), { filter: fitsPair, uniqueAnswers: true }).length >= 4;
  const anyQuestion = buildDeck(contents, {}, 1, seeded(1)).length > 0;

  return (
    <main className="page child">
      <Link className="back" to="/">← Accueil</Link>
      <h1 className="page-title">{title}</h1>
      {!anyQuestion ? (
        <p className="muted">Ce chapitre n'a pas encore de questions.</p>
      ) : (
        <div className="game-list">
          {GAMES.map((g) =>
            g.id === 'paires' && !pairsPossible ? (
              <div key={g.id} className="big-card disabled" aria-disabled="true">
                <span className="big-card-title">{g.title}</span>
                <span>Pas assez de questions courtes ici pour ce jeu.</span>
              </div>
            ) : (
              <Link key={g.id} className={`big-card game-${g.id}`} to={`/jouer/${scope}/${g.id}`}>
                <span className="big-card-title">{g.title}</span>
                <span>{g.text}</span>
              </Link>
            ),
          )}
        </div>
      )}
    </main>
  );
}
