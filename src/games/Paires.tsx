import { useMemo, useRef, useState } from 'react';
import { displayAnswer } from '../content/answers';
import { shuffle } from '../content/random';
import type { Question } from '../content/types';
import type { RoundResult } from './types';

export const PAIRS = 6;

/** Questions assez courtes pour tenir sur une carte. */
export function fitsPair(q: Question): boolean {
  return (q.kind === 'choix' || q.kind === 'saisie') && q.prompt.length <= 70 && displayAnswer(q.answer).length <= 24;
}

interface Props {
  deck: Question[];
  onFinish: (result: RoundResult) => void;
}

/** Les paires : relier chaque question à sa réponse. */
export default function Paires({ deck, onFinish }: Props) {
  const answersOrder = useMemo(() => shuffle(deck, Math.random), [deck]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const firstMiss = useRef<Record<string, string>>({});
  const start = useRef(Date.now());

  function pickAnswer(q: Question) {
    if (!selected || matched.has(q.key)) return;
    if (q.key === selected) {
      const next = new Set(matched).add(q.key);
      setMatched(next);
      setSelected(null);
      if (next.size === deck.length) {
        const answers = deck.map((d) => ({
          question: d,
          given: firstMiss.current[d.key] ?? displayAnswer(d.answer),
          correct: !(d.key in firstMiss.current),
        }));
        onFinish({
          score: answers.filter((a) => a.correct).length,
          total: deck.length,
          durationS: (Date.now() - start.current) / 1000,
          answers,
        });
      }
    } else {
      if (!(selected in firstMiss.current)) firstMiss.current[selected] = displayAnswer(q.answer);
      setWrong(q.key);
      setTimeout(() => setWrong(null), 600);
    }
  }

  return (
    <div className="game">
      <div className="game-top">
        <span>Touche une question, puis sa réponse.</span>
        <span>{matched.size} / {deck.length}</span>
      </div>
      <div className="pairs">
        <div className="pairs-col">
          {deck.map((q) => (
            <button
              key={q.key}
              type="button"
              className={`pair-card${selected === q.key ? ' selected' : ''}${matched.has(q.key) ? ' matched' : ''}`}
              disabled={matched.has(q.key)}
              aria-pressed={selected === q.key}
              onClick={() => setSelected(q.key)}
            >
              {q.prompt}
            </button>
          ))}
        </div>
        <div className="pairs-col">
          {answersOrder.map((q) => (
            <button
              key={q.key}
              type="button"
              className={`pair-card answer${matched.has(q.key) ? ' matched' : ''}${wrong === q.key ? ' wrong' : ''}`}
              disabled={matched.has(q.key)}
              onClick={() => pickAnswer(q)}
            >
              {displayAnswer(q.answer)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
