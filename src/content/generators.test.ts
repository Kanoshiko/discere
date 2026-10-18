import { describe, expect, it } from 'vitest';
import { GENERATORS, formatNumber } from './generators';
import { normalize } from './answers';
import { seeded } from './random';

describe('formatNumber', () => {
  it('sépare les milliers par une espace ordinaire', () => {
    expect(formatNumber(4500)).toBe('4 500');
    expect(formatNumber(56)).toBe('56');
  });
});

describe('générateurs', () => {
  const rng = seeded(42);
  for (const [key, gen] of Object.entries(GENERATORS)) {
    it(`${key} produit des calculs justes`, () => {
      for (let i = 0; i < 200; i++) {
        const q = gen.make(rng);
        const answer = Number(normalize(q.answer));
        expect(Number.isInteger(answer)).toBe(true);
        expect(answer).toBeGreaterThan(0);
        const nums = q.prompt.replace(/(\d) (\d)/g, '$1$2').match(/\d+/g)!.map(Number);
        if (q.prompt.includes('×')) expect(answer).toBe(nums[0] * nums[1]);
        else if (q.prompt.includes('= 100')) expect(answer + nums[0]).toBe(100);
        else if (q.prompt.startsWith('Le double')) expect(answer).toBe(nums[0] * 2);
        else if (q.prompt.startsWith('La moitié')) expect(answer * 2).toBe(nums[0]);
        else throw new Error(`question inattendue : ${q.prompt}`);
      }
    });
  }
});
