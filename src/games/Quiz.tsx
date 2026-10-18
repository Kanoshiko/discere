import { useRef, useState } from 'react';
import QuestionView from '../components/QuestionView';
import { displayAnswer, isCorrect } from '../content/answers';
import type { Question } from '../content/types';
import type { AnswerRecord } from '../lib/api';
import type { RoundResult } from './types';

interface Props {
  deck: Question[];
  onFinish: (result: RoundResult) => void;
}

/** Quiz : une question à la fois, correction et explication après chaque réponse. */
export default function Quiz({ deck, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [feedback, setFeedback] = useState<AnswerRecord | null>(null);
  const start = useRef(Date.now());
  const question = deck[index];

  function answer(given: string) {
    const record = { question, given, correct: isCorrect(given, question.answer) };
    setAnswers((list) => [...list, record]);
    setFeedback(record);
  }

  function next() {
    if (index + 1 >= deck.length) {
      onFinish({
        score: answers.filter((a) => a.correct).length,
        total: deck.length,
        durationS: (Date.now() - start.current) / 1000,
        answers,
      });
      return;
    }
    setIndex(index + 1);
    setFeedback(null);
  }

  return (
    <div className="game">
      <div className="game-top">
        <span>Question {index + 1} / {deck.length}</span>
        <span>{answers.filter((a) => a.correct).length} bonne{answers.filter((a) => a.correct).length > 1 ? 's' : ''} réponse{answers.filter((a) => a.correct).length > 1 ? 's' : ''}</span>
      </div>
      <div className="progress" aria-hidden="true">
        <div style={{ width: `${(index / deck.length) * 100}%` }} />
      </div>

      <QuestionView key={question.key} question={question} onAnswer={answer} disabled={feedback !== null} given={feedback?.given} />

      {feedback && (
        <div className={feedback.correct ? 'feedback ok' : 'feedback ko'} role="status">
          <p className="feedback-title">{feedback.correct ? 'Bravo !' : 'Pas tout à fait…'}</p>
          {!feedback.correct && (
            <p>
              La bonne réponse : <strong>{displayAnswer(question.answer)}</strong>
            </p>
          )}
          {question.explanation && <p className="feedback-explanation">{question.explanation}</p>}
          <button className="btn primary" type="button" onClick={next} autoFocus>
            {index + 1 >= deck.length ? 'Voir mon score' : 'Question suivante'}
          </button>
        </div>
      )}
    </div>
  );
}
