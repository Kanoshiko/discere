import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { displayAnswer } from '../content/answers';
import type { GameId } from '../content/types';
import { recordRound } from '../lib/api';
import { starsFor } from './deck';
import type { RoundResult } from './types';

interface Props {
  result: RoundResult;
  game: GameId;
  scope: string;
  token: string | null;
  onReplay: () => void;
}

const MESSAGES = ['Continue, tu progresses !', 'Pas mal du tout !', 'Très bien !', 'Champion !'];

export default function Resultat({ result, game, scope, token, onReplay }: Props) {
  const [save, setSave] = useState<'pending' | 'ok' | 'error' | 'off'>(token ? 'pending' : 'off');
  const sent = useRef(false);
  const stars = game === 'chrono' ? starsFor(result.score, Math.max(result.total, 10)) : starsFor(result.score, result.total);
  const mistakes = result.answers.filter((a) => !a.correct);

  function send() {
    if (!token) return;
    setSave('pending');
    recordRound(token, game, scope === 'melange' ? null : scope, result.score, result.total, result.durationS, result.answers)
      .then(() => setSave('ok'))
      .catch(() => setSave('error'));
  }

  useEffect(() => {
    // une seule fois, même si React rejoue l'effet en mode strict
    if (sent.current) return;
    sent.current = true;
    send();
  }, []);

  return (
    <div className="result">
      <p className="stars" aria-label={`${stars} étoile${stars > 1 ? 's' : ''} sur 3`}>
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= stars ? 'star on' : 'star'} aria-hidden="true">★</span>
        ))}
      </p>
      <h2>{MESSAGES[stars]}</h2>
      <p className="result-score">
        {game === 'chrono'
          ? `${result.score} bonne${result.score > 1 ? 's' : ''} réponse${result.score > 1 ? 's' : ''} en 60 secondes`
          : `${result.score} / ${result.total}`}
      </p>

      {save === 'error' && (
        <p className="error" role="alert">
          Ton score n'a pas pu être enregistré.{' '}
          <button type="button" className="link-button" onClick={send}>Réessayer</button>
        </p>
      )}
      {save === 'off' && <p className="muted">Mode essai : le score n'est pas enregistré sur cet appareil.</p>}

      <div className="result-actions">
        <button type="button" className="btn primary" onClick={onReplay}>Rejouer</button>
        <Link className="btn" to={`/jouer/${scope}`}>Un autre jeu</Link>
        <Link className="btn" to="/">Accueil</Link>
      </div>

      {mistakes.length > 0 && (
        <section className="mistakes">
          <h3>À revoir</h3>
          <ul>
            {mistakes.map((m, i) => (
              <li key={i}>
                <span>{m.question.prompt}</span>
                <span>
                  <strong>{displayAnswer(m.question.answer)}</strong>
                  {m.given && <span className="muted"> (tu as répondu : {m.given})</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
