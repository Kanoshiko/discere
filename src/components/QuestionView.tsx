import { useState, type FormEvent } from 'react';
import { isCorrect } from '../content/answers';
import type { Question } from '../content/types';

interface Props {
  question: Question;
  onAnswer: (given: string) => void;
  disabled?: boolean;
  /** Pour le jeu chronométré : boutons plus compacts. */
  compact?: boolean;
  /** Réponse déjà donnée : colore la bonne proposition et l'erreur éventuelle. */
  given?: string;
}

function looksNumeric(answer: string): boolean {
  return /^[\d\s.,|-]+$/.test(answer);
}

/** Énoncé et zone de réponse, selon le type de question. */
export default function QuestionView({ question, onAnswer, disabled = false, compact = false, given }: Props) {
  const [typed, setTyped] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    if (typed.trim() !== '') onAnswer(typed);
  }

  function optionClass(opt: string): string {
    if (given === undefined) return 'option';
    if (isCorrect(opt, question.answer)) return 'option right';
    return opt === given ? 'option wrong' : 'option';
  }

  return (
    <div className={compact ? 'question compact' : 'question'}>
      <p className="question-prompt">{question.prompt}</p>

      {question.kind === 'saisie' ? (
        <form className="answer-form" onSubmit={submit}>
          <label className="sr-only" htmlFor="answer">Ta réponse</label>
          <input
            id="answer"
            className="answer-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            inputMode={looksNumeric(question.answer) ? 'numeric' : 'text'}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            disabled={disabled}
            placeholder="Ta réponse"
          />
          <button className="btn primary" type="submit" disabled={disabled || typed.trim() === ''}>
            Valider
          </button>
        </form>
      ) : (
        <div className={question.options.length <= 2 ? 'options two' : 'options'}>
          {question.options.map((opt) => (
            <button key={opt} type="button" className={optionClass(opt)} disabled={disabled} onClick={() => onAnswer(opt)}>
              {question.kind === 'vrai_faux' ? (opt === 'vrai' ? 'Vrai' : 'Faux') : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
