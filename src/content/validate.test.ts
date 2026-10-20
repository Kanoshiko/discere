import { describe, expect, it } from 'vitest';
import { cleanItem, validateItem, type ItemDraft } from './validate';

const base: ItemDraft = { kind: 'choix', prompt: 'Léo ___ un vélo.', answer: 'a', distractors: ['à'], steps: [], explanation: '' };

describe('validateItem', () => {
  it('accepte une question complète', () => {
    expect(validateItem(base)).toBeNull();
  });
  it('exige une mauvaise réponse pour un QCM', () => {
    expect(validateItem({ ...base, distractors: ['  '] })).toMatch(/mauvaise réponse/);
  });
  it('refuse une mauvaise réponse identique à la bonne', () => {
    expect(validateItem({ ...base, distractors: ['A'] })).toMatch(/identique/);
  });
  it('limite vrai/faux à vrai ou faux', () => {
    expect(validateItem({ ...base, kind: 'vrai_faux', answer: 'oui' })).toMatch(/vrai/);
    expect(validateItem({ ...base, kind: 'vrai_faux', answer: 'faux' })).toBeNull();
  });
  it('refuse une question vide', () => {
    expect(validateItem({ ...base, prompt: ' ' })).toMatch(/vide/);
  });
});

describe('cleanItem', () => {
  it('retire les mauvaises réponses hors QCM et les blancs', () => {
    expect(cleanItem({ ...base, kind: 'saisie', distractors: ['x'], explanation: ' ' })).toEqual({
      kind: 'saisie', prompt: 'Léo ___ un vélo.', answer: 'a', distractors: [], steps: [], explanation: null,
    });
  });
});

describe('frise', () => {
  const frise: ItemDraft = { kind: 'ordre', prompt: 'Range les périodes.', answer: '', distractors: [], steps: ['Préhistoire|avant -3 300', 'Antiquité', ' ', 'Moyen Âge'], explanation: '' };
  it('accepte 3 étapes ou plus et ignore les lignes vides', () => {
    expect(validateItem(frise)).toBeNull();
    expect(cleanItem(frise)).toMatchObject({ answer: 'ordre', steps: ['Préhistoire|avant -3 300', 'Antiquité', 'Moyen Âge'] });
  });
  it('refuse moins de 3 étapes ou deux étapes identiques', () => {
    expect(validateItem({ ...frise, steps: ['A', 'B'] })).toMatch(/au moins 3/);
    expect(validateItem({ ...frise, steps: ['A', 'B|x', 'b'] })).toMatch(/même nom/);
  });
});
