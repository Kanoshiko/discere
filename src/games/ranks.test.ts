import { describe, expect, it } from 'vitest';
import { isAvatar, rankFor, roundGains, xpByElement, xpOf } from './ranks';
import type { Element } from '../content/types';

describe('rankFor', () => {
  it('donne le rang et l’avancement', () => {
    expect(rankFor(0)).toEqual({ index: 0, name: 'Novice', toNext: 150, progress: 0 });
    expect(rankFor(150).name).toBe('Apprenti');
    expect(rankFor(375)).toMatchObject({ name: 'Apprenti', toNext: 225, progress: 0.5 });
    expect(rankFor(5000)).toEqual({ index: 3, name: 'Maître', toNext: null, progress: 1 });
  });
});

describe('xp', () => {
  it('compte 10 par bonne réponse et 20 par faiblesse vaincue', () => {
    expect(xpOf({ correct: 12, vanquished: 1 })).toBe(140);
    expect(xpOf(undefined)).toBe(0);
  });
  it('additionne les matières d’un même élément', () => {
    const el: Record<string, Element> = { francais: 'air', anglais: 'air', maths: 'feu' };
    const xp = xpByElement(
      { francais: { correct: 2, vanquished: 0 }, anglais: { correct: 1, vanquished: 1 }, maths: { correct: 1, vanquished: 0 }, inconnue: { correct: 9, vanquished: 0 } },
      (id) => el[id],
    );
    expect(xp).toEqual({ air: 50, feu: 10, eau: 0, terre: 0 });
  });
  it('reconnaît l’Avatar', () => {
    expect(isAvatar({ feu: 1500, air: 1500, eau: 1500, terre: 1500 })).toBe(true);
    expect(isAvatar({ feu: 1500, air: 1500, eau: 1500, terre: 1499 })).toBe(false);
  });
});

describe('roundGains', () => {
  const q = (itemId: string | null, chapterId = 'c', prompt = 'p') => ({ itemId, chapterId, prompt });
  it('donne le bonus quand une question ratée est réussie', () => {
    const gains = roundGains(
      [
        { question: q('i1'), correct: true }, // ratée avant la partie : 30
        { question: q('i2'), correct: false },
        { question: q('i2'), correct: true }, // ratée plus tôt dans la partie : 30
        { question: q('i3'), correct: true }, // jamais vue : 10
        { question: q(null, 'c', '2 × 3 = ?'), correct: true }, // calcul jamais vu : 10
        { question: q(null, 'c', '7 × 8 = ?'), correct: true }, // calcul raté avant la partie : 30
      ],
      { i1: { seen: 1, last_correct: false }, 'c|7 × 8 = ?': { seen: 1, last_correct: false } },
      () => 'eau',
    );
    expect(gains.eau).toBe(110);
  });
  it('ignore les chapitres sans élément', () => {
    expect(roundGains([{ question: q('i1'), correct: true }], {}, () => undefined)).toEqual({ feu: 0, air: 0, eau: 0, terre: 0 });
  });
});
