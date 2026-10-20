import { useState } from 'react';
import { ORDER_SEPARATOR } from '../content/answers';
import type { Question } from '../content/types';

interface Props {
  question: Question;
  onAnswer: (given: string) => void;
  disabled: boolean;
  /** Réponse déjà donnée : affiche la correction. */
  given?: string;
}

/**
 * Frise : l'enfant touche les étiquettes dans l'ordre pour les poser sur la frise ;
 * toucher une étiquette posée la retire.
 */
export default function OrderBoard({ question, onAnswer, disabled, given }: Props) {
  const [placed, setPlaced] = useState<string[]>([]);
  const order = given !== undefined ? given.split(ORDER_SEPARATOR) : placed;
  const pool = question.options.filter((o) => !order.includes(o));
  const done = given !== undefined;

  return (
    <div className="order">
      <ol className="order-line" aria-label="Ta frise">
        {question.steps.map((step, i) => {
          const label = order[i];
          const state = done ? (label === step.label ? ' right' : ' wrong') : '';
          return (
            <li key={i} className={`order-slot${label ? ' filled' : ''}${state}`}>
              <span className="order-num" aria-hidden="true">{i + 1}</span>
              {label ? (
                <button
                  type="button"
                  className="order-chip placed"
                  disabled={disabled || done}
                  onClick={() => setPlaced(placed.filter((p) => p !== label))}
                  aria-label={`${label}, en position ${i + 1}. Toucher pour retirer.`}
                >
                  {label}
                </button>
              ) : (
                <span className="order-empty">…</span>
              )}
              {done && (
                <span className="order-correction">
                  {label !== step.label && <strong>{step.label}</strong>}
                  {step.detail && <span className="muted"> {step.detail}</span>}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {!done && (
        <>
          <p className="order-hint">Touche les étiquettes dans l’ordre. Touche une étiquette posée pour la retirer.</p>
          <div className="order-pool" aria-label="Étiquettes à placer">
            {pool.map((label) => (
              <button key={label} type="button" className="order-chip" disabled={disabled} onClick={() => setPlaced([...placed, label])}>
                {label}
              </button>
            ))}
          </div>
          <div className="order-actions">
            <button type="button" className="btn" disabled={disabled || placed.length === 0} onClick={() => setPlaced([])}>
              Recommencer
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={disabled || placed.length !== question.steps.length}
              onClick={() => onAnswer(placed.join(ORDER_SEPARATOR))}
            >
              Valider
            </button>
          </div>
        </>
      )}
    </div>
  );
}
