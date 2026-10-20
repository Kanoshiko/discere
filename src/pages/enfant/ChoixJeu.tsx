import { Link, useParams } from 'react-router-dom';
import { LoadError, Loading } from '../../components/Loading';
import { contentsFor, themeFor, useChildData } from '../../lib/childData';
import { ElementIcon } from '../../components/Element';
import { buildDeck } from '../../games/deck';
import { fitsPair, PAIRS } from '../../games/Paires';
import { seeded } from '../../content/random';
import { GAME_LABEL, type GameId } from '../../content/types';

const GAMES: { id: GameId; text: string }[] = [
  { id: 'quiz', text: '10 questions, avec la correction à chaque fois.' },
  { id: 'chrono', text: 'Un maximum de bonnes réponses en 60 secondes.' },
  { id: 'paires', text: 'Relie chaque question à sa réponse.' },
  { id: 'frise', text: 'Remets les étapes dans l’ordre sur la frise.' },
];

export default function ChoixJeu() {
  const { scope = 'melange' } = useParams();
  const state = useChildData();

  if (state.status === 'loading') return <main className="page child"><Loading /></main>;
  if (state.status === 'error') return <main className="page child"><LoadError message={state.message} onRetry={state.reload} /></main>;

  const { catalog } = state.data;
  const contents = contentsFor(catalog, scope);
  const chapter = catalog.chapters.find((c) => c.id === scope);
  const title = scope === 'melange' ? 'L’épreuve de l’Avatar' : chapter?.title;
  const theme = themeFor(catalog, scope);

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
  const friseCount = contents.reduce((n, c) => n + c.items.filter((i) => i.kind === 'ordre').length, 0);
  const onlyFrises = friseCount > 0 && contents.every((c) => !c.chapter.generator && c.items.every((i) => i.kind === 'ordre'));
  const games = GAMES.filter((g) => (g.id === 'frise' ? friseCount > 0 : g.id !== 'chrono' || !onlyFrises));

  return (
    <main className="page child themed" data-element={theme}>
      <Link className="back" to="/">← Accueil</Link>
      <h1 className="page-title">
        <ElementIcon element={theme} size={44} />
        {title}
      </h1>
      {!anyQuestion ? (
        <p className="muted">Ce chapitre n'a pas encore de questions.</p>
      ) : (
        <div className="game-list">
          {games.map((g) =>
            g.id === 'paires' && !pairsPossible ? (
              <div key={g.id} className="big-card disabled" aria-disabled="true">
                <span className="big-card-title">{GAME_LABEL[g.id]}</span>
                <span>Pas assez de questions courtes ici pour ce jeu.</span>
              </div>
            ) : (
              <Link key={g.id} className={`big-card game-${g.id}`} to={`/jouer/${scope}/${g.id}`}>
                <span className="big-card-title">{GAME_LABEL[g.id]}</span>
                <span>{g.text}</span>
              </Link>
            ),
          )}
        </div>
      )}
    </main>
  );
}
