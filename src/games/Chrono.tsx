import { useCallback, useEffect, useRef, useState } from 'react';
import QuestionView from '../components/QuestionView';
import { displayAnswer, isCorrect } from '../content/answers';
import type { Question } from '../content/types';
import type { AnswerRecord } from '../lib/api';
import type { RoundResult } from './types';

export const CHRONO_SECONDS = 60;

interface Props {
  /** Fournit un nouveau paquet de questions quand le précédent est épuisé. */
  makeDeck: () => Question[];
  onFinish: (result: RoundResult) => void;
}

/** Contre la montre : un maximum de bonnes réponses en 60 secondes. */
export default function Chrono({ makeDeck, onFinish }: Props) {
  const [queue, setQueue] = useState<Question[]>(() => makeDeck());
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(0);
  const [flash, setFlash] = useState<'ok' | 'ko' | null>(null);
  const [left, setLeft] = useState(CHRONO_SECONDS);
  const answers = useRef<AnswerRecord[]>([]);
  const start = useRef(Date.now());
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    const list = answers.current;
    onFinish({ score: list.filter((a) => a.correct).length, total: list.length, durationS: CHRONO_SECONDS, answers: list });
  }, [onFinish]);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, CHRONO_SECONDS - Math.floor((Date.now() - start.current) / 1000));
      setLeft(remaining);
      if (remaining === 0) finish();
    }, 250);
    return () => clearInterval(timer);
  }, [finish]);

  const question = queue[index];

  function answer(given: string) {
    const correct = isCorrect(given, question.answer);
    answers.current = [...answers.current, { question, given, correct }];
    setFlash(correct ? 'ok' : 'ko');
    setTimeout(() => {
      setFlash(null);
      setTurn((t) => t + 1);
      if (index + 1 < queue.length) {
        setIndex(index + 1);
      } else {
        setQueue(makeDeck());
        setIndex(0);
      }
    }, correct ? 300 : 700);
  }

  if (!question) return <p>Pas assez de questions pour ce jeu.</p>;
  const score = answers.current.filter((a) => a.correct).length;

  return (
    <div className={flash ? `game flash-${flash}` : 'game'}>
      <div className="game-top">
        <span className={left <= 10 ? 'timer urgent' : 'timer'} aria-live="off">{left} s</span>
        <span>Score : {score}</span>
      </div>
      <div className="progress" aria-hidden="true">
        <div style={{ width: `${(left / CHRONO_SECONDS) * 100}%` }} />
      </div>
      <QuestionView key={`${turn}-${question.key}`} question={question} onAnswer={answer} disabled={flash !== null || left === 0} compact />
      {flash === 'ko' && (
        <p className="chrono-correction" role="status">
          Réponse : <strong>{displayAnswer(question.answer)}</strong>
        </p>
      )}
    </div>
  );
}
