import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadError, Loading } from '../../components/Loading';
import { chapterElementFn, contentsFor, themeFor, useChildData } from '../../lib/childData';
import type { Learner } from '../../lib/api';
import { buildDeck } from '../../games/deck';
import Quiz from '../../games/Quiz';
import Chrono from '../../games/Chrono';
import Paires, { fitsPair, PAIRS } from '../../games/Paires';
import Resultat from '../../games/Resultat';
import type { RoundResult } from '../../games/types';
import { GAME_LABEL, type GameId } from '../../content/types';

const QUIZ_LENGTH = 10;

function isGame(value: string | undefined): value is GameId {
  return value === 'quiz' || value === 'chrono' || value === 'paires';
}

export default function Partie() {
  const { scope = 'melange', game } = useParams();
  const state = useChildData();
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ round: RoundResult; before: Learner | null } | null>(null);

  const ready = state.status === 'ready' ? state.data : null;
  const contents = useMemo(() => (ready ? contentsFor(ready.catalog, scope) : []), [ready, scope]);
  const stats = ready?.learner?.items ?? {};
  const elementOf = useMemo(() => (ready ? chapterElementFn(ready.catalog) : () => undefined), [ready]);
  // l'enfant tel qu'il est au moment de finir, avant le rechargement de ses statistiques
  const learnerNow = useRef<Learner | null>(null);
  learnerNow.current = ready?.learner ?? null;

  const deck = useMemo(() => {
    if (!ready || !isGame(game)) return [];
    if (game === 'paires') return buildDeck(contents, stats, PAIRS, Math.random, { filter: fitsPair, uniqueAnswers: true });
    return buildDeck(contents, stats, game === 'chrono' ? 40 : QUIZ_LENGTH, Math.random);
    // `round` : un nouveau paquet à chaque partie
  }, [ready, contents, game, round]);

  const makeChronoDeck = useCallback(() => buildDeck(contents, stats, 40, Math.random), [contents, stats]);
  const { reload } = state;
  const finish = useCallback(
    (r: RoundResult) => {
      setResult({ round: r, before: learnerNow.current });
      // l'enfant a progressé : ses statistiques serviront à la partie suivante
      reload();
    },
    [reload],
  );

  function replay() {
    setResult(null);
    setRound((r) => r + 1);
  }

  if (!isGame(game)) {
    return (
      <main className="page child">
        <p className="error" role="alert">Ce jeu n'existe pas.</p>
        <Link className="btn" to="/">Accueil</Link>
      </main>
    );
  }
  if (state.status === 'error') return <main className="page child"><LoadError message={state.message} onRetry={state.reload} /></main>;
  if (!ready) return <main className="page child"><Loading /></main>;

  return (
    <main className="page child themed" data-element={themeFor(ready.catalog, scope)}>
      <div className="game-header">
        <Link className="back" to={`/jouer/${scope}`}>← Jeux</Link>
        <span className="game-name">{GAME_LABEL[game]}</span>
      </div>

      {result ? (
        <Resultat result={result.round} before={result.before} catalog={ready.catalog} game={game} scope={scope} token={ready.token} onReplay={replay} />
      ) : deck.length === 0 ? (
        <p className="muted">Pas assez de questions pour ce jeu.</p>
      ) : game === 'quiz' ? (
        <Quiz key={round} deck={deck} onFinish={finish} elementOf={elementOf} />
      ) : game === 'chrono' ? (
        <Chrono key={round} makeDeck={makeChronoDeck} onFinish={finish} elementOf={elementOf} />
      ) : (
        <Paires key={round} deck={deck} onFinish={finish} />
      )}
    </main>
  );
}
