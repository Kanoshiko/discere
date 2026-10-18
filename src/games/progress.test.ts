import { describe, expect, it } from 'vitest';
import { accuracyByChapter, stillToReview, type AnswerLike } from './progress';

const a = (item: string | null, correct: boolean, at: string, prompt = item ?? 'gen'): AnswerLike => ({
  item_id: item, chapter_id: 'c1', prompt, given: correct ? 'ok' : 'non', correct, answered_at: at,
});

describe('accuracyByChapter', () => {
  it('compte réponses et réussites', () => {
    expect(accuracyByChapter([a('i1', true, '2'), a('i2', false, '1')])).toEqual([
      { chapterId: 'c1', answered: 2, correct: 1 },
    ]);
  });
});

describe('stillToReview', () => {
  it('ne garde que les questions dont la dernière réponse est fausse', () => {
    // plus récent d'abord
    const list = stillToReview([
      a('i1', true, '4'),
      a('i2', false, '3'),
      a('i1', false, '2'),
      a('i2', false, '1'),
      a(null, false, '0', '7 × 8 = ?'),
    ]);
    expect(list.map((r) => r.prompt)).toEqual(['i2', '7 × 8 = ?']);
    expect(list[0].misses).toBe(2);
  });
});
