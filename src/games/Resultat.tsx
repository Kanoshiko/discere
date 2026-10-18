import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { displayAnswer } from '../content/answers';
import type { Element, GameId } from '../content/types';
import { finishRound, type Catalog, type Learner } from '../lib/api';
import { chapterElementFn, learnerXp } from '../lib/childData';
import { ElementIcon, ScrollIcon } from '../components/Element';
import { starsFor } from './deck';
import { ELEMENTS, ELEMENT_OF, isAvatar, rankFor, roundGains } from './ranks';
import type { RoundResult } from './types';

interface Props {
  result: RoundResult;
  game: GameId;
  scope: string;
  token: string | null;
  catalog: Catalog;
  /** L'enfant tel qu'il était avant la partie (null en mode essai). */
  before: Learner | null;
  onReplay: () => void;
}

const MESSAGES = ['Continue, tu progresses !', 'Pas mal du tout !', 'Très bien !', 'Champion !'];

export default function Resultat({ result, game, scope, token, catalog, before, onReplay }: Props) {
  const [save, setSave] = useState<'pending' | 'ok' | 'error' | 'off'>(token ? 'pending' : 'off');
  const [newScrolls, setNewScrolls] = useState<string[]>([]);
  const sent = useRef(false);
  const stars = game === 'chrono' ? starsFor(result.score, Math.max(result.total, 10)) : starsFor(result.score, result.total);
  const mistakes = result.answers.filter((a) => !a.correct);

  const gains = before ? roundGains(result.answers, before.items, chapterElementFn(catalog)) : null;
  const xpBefore = before ? learnerXp(catalog, before) : null;
  const xpAfter = xpBefore && gains ? (Object.fromEntries(ELEMENTS.map((e) => [e, xpBefore[e] + gains[e]])) as Record<Element, number>) : null;
  const rankUps = xpBefore && xpAfter ? ELEMENTS.filter((e) => rankFor(xpAfter[e]).index > rankFor(xpBefore[e]).index) : [];
  const becameAvatar = xpBefore && xpAfter ? !isAvatar(xpBefore) && isAvatar(xpAfter) : false;

  function send() {
    if (!token) return;
    setSave('pending');
    finishRound(token, game, scope === 'melange' ? null : scope, result.score, result.total, result.durationS, result.answers)
      .then((scrolls) => {
        setNewScrolls(scrolls);
        setSave('ok');
      })
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

      {gains && ELEMENTS.some((e) => gains[e] > 0) && (
        <ul className="gains">
          {ELEMENTS.filter((e) => gains[e] > 0).map((e) => (
            <li key={e} data-element={e}>
              <ElementIcon element={e} size={28} />+{gains[e]} points {ELEMENT_OF[e]}
            </li>
          ))}
        </ul>
      )}

      {becameAvatar && (
        <p className="level-up" data-element="avatar">
          <ElementIcon element="avatar" size={44} className="burst burst-avatar" />
          Tu maîtrises les quatre éléments : tu es l’Avatar !
        </p>
      )}
      {xpAfter &&
        rankUps.map((e) => (
          <p key={e} className="level-up" data-element={e}>
            <ElementIcon element={e} size={44} className={`burst burst-${e}`} />
            Nouveau rang : {rankFor(xpAfter[e]).name} {ELEMENT_OF[e]} !
          </p>
        ))}
      {newScrolls.map((id) => (
        <p key={id} className="level-up scroll-won">
          <ScrollIcon earned size={44} />
          Parchemin gagné : {catalog.chapters.find((c) => c.id === id)?.title ?? 'chapitre maîtrisé'}
        </p>
      ))}

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

