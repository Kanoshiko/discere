import { describe, expect, it } from 'vitest';
import { displayAnswer, expectedAnswer, isCorrect, isCorrectFor, normalize } from './answers';

describe('normalize', () => {
  it('ignore la casse et les espaces', () => {
    expect(normalize('  Finissons  ')).toBe('finissons');
    expect(normalize('les   druides')).toBe('les druides');
  });
  it('regroupe les chiffres', () => {
    expect(normalize('304 020')).toBe('304020');
    expect(normalize('2,5')).toBe('2.5');
  });
  it('garde les accents', () => {
    expect(normalize('à')).not.toBe(normalize('a'));
  });
});

describe('isCorrect', () => {
  it('accepte les nombres écrits avec espaces', () => {
    expect(isCorrect('80 600', '80600')).toBe(true);
    expect(isCorrect('80600', '80 600')).toBe(true);
  });
  it('accepte les variantes', () => {
    expect(isCorrect('Clovis Ier', 'Clovis | Clovis Ier')).toBe(true);
    expect(displayAnswer('Clovis | Clovis Ier')).toBe('Clovis');
  });
  it('refuse une réponse vide ou fausse', () => {
    expect(isCorrect('', 'es')).toBe(false);
    expect(isCorrect('est', 'es')).toBe(false);
    expect(isCorrect('a', 'à')).toBe(false);
  });
  it('tolère un point final et l’apostrophe typographique', () => {
    expect(isCorrect('veux.', 'veux')).toBe(true);
    expect(isCorrect('l’eau', "l'eau")).toBe(true);
  });
});

describe('isCorrectFor (frise)', () => {
  const q = { kind: 'ordre', answer: 'ordre', steps: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] };
  it('vérifie l’ordre complet', () => {
    expect(isCorrectFor(q, 'A → B → C')).toBe(true);
    expect(isCorrectFor(q, 'A → C → B')).toBe(false);
    expect(expectedAnswer(q)).toBe('A → B → C');
  });
  it('corrige les autres types comme avant', () => {
    expect(isCorrectFor({ kind: 'saisie', answer: '80600', steps: [] }, '80 600')).toBe(true);
  });
});
