import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadError, Loading } from '../../components/Loading';
import { contentsFor, useChildData } from '../../lib/childData';
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
  const [result, setResult] = useState<RoundResult | null>(null);

  const ready = state.status === 'ready' ? state.data : null;
  const contents = useMemo(() => (ready ? contentsFor(ready.catalog, scope) : []), [ready, scope]);
  const stats = ready?.learner?.items ?? {};

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
      setResult(r);
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
    <main className="page child">
      <div className="game-header">
        <Link className="back" to={`/jouer/${scope}`}>← Jeux</Link>
        <span className="game-name">{GAME_LABEL[game]}</span>
      </div>

      {result ? (
        <Resultat result={result} game={game} scope={scope} token={ready.token} onReplay={replay} />
      ) : deck.length === 0 ? (
        <p className="muted">Pas assez de questions pour ce jeu.</p>
      ) : game === 'quiz' ? (
        <Quiz key={round} deck={deck} onFinish={finish} />
      ) : game === 'chrono' ? (
        <Chrono key={round} makeDeck={makeChronoDeck} onFinish={finish} />
      ) : (
        <Paires key={round} deck={deck} onFinish={finish} />
      )}
    </main>
  );
}
