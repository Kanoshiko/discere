import { describe, expect, it } from 'vitest';
import { boxOf, buildDeck, factsToReview, itemToQuestion, itemWeight, starsFor, type ChapterContent } from './deck';
import { seeded } from '../content/random';
import type { Chapter, Item } from '../content/types';

function chapter(id: string, over: Partial<Chapter> = {}): Chapter {
  return { id, subject_id: 'maths', title: id, grade: 'CM1', period: 1, status: 'en_cours', generator: null, position: 0, ...over };
}

function items(chapterId: string, n: number): Item[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${chapterId}-${i}`,
    chapter_id: chapterId,
    kind: 'saisie' as const,
    prompt: `Question ${i}`,
    answer: `r${i}`,
    distractors: [],
    explanation: null,
  }));
}

describe('buildDeck', () => {
  it('tire le nombre demandé sans doublon', () => {
    const contents: ChapterContent[] = [{ chapter: chapter('a'), items: items('a', 15) }];
    const deck = buildDeck(contents, {}, 10, seeded(1));
    expect(deck).toHaveLength(10);
    expect(new Set(deck.map((q) => q.key)).size).toBe(10);
  });

  it("s'arrête quand le contenu est épuisé", () => {
    const contents: ChapterContent[] = [{ chapter: chapter('a'), items: items('a', 4) }];
    expect(buildDeck(contents, {}, 10, seeded(1))).toHaveLength(4);
    expect(buildDeck([], {}, 10, seeded(1))).toHaveLength(0);
  });

  it('complète avec un générateur', () => {
    const contents: ChapterContent[] = [
      { chapter: chapter('a'), items: items('a', 2) },
      { chapter: chapter('t', { generator: 'tables_multiplication' }), items: [] },
    ];
    const deck = buildDeck(contents, {}, 12, seeded(3));
    expect(deck).toHaveLength(12);
    expect(deck.filter((q) => q.itemId === null).length).toBeGreaterThanOrEqual(10);
  });

  it('fait revenir plus souvent les questions ratées', () => {
    const its = items('a', 10);
    const contents: ChapterContent[] = [{ chapter: chapter('a'), items: its }];
    const now = Date.parse('2026-10-18T12:00:00Z');
    const yesterday = '2026-10-17T12:00:00Z';
    const stats = Object.fromEntries(its.map((it, i) => [it.id, { seen: 1, last_correct: i !== 0, streak_days: 3, last_seen: yesterday }]));
    let firstDrawnFailed = 0;
    for (let s = 0; s < 400; s++) {
      if (buildDeck(contents, stats, 1, seeded(s), {}, now)[0].itemId === 'a-0') firstDrawnFailed++;
    }
    // poids 8 contre 9 × 1 : environ 47 % des tirages (10 % sans répétition espacée)
    expect(firstDrawnFailed).toBeGreaterThan(150);
  });

  it('privilégie les chapitres en cours', () => {
    const contents: ChapterContent[] = [
      { chapter: chapter('cours'), items: items('cours', 50) },
      { chapter: chapter('revu', { status: 'revision' }), items: items('revu', 50) },
    ];
    const deck = buildDeck(contents, {}, 40, seeded(7));
    const enCours = deck.filter((q) => q.chapterId === 'cours').length;
    expect(enCours).toBeGreaterThan(24);
  });

  it('peut exiger des réponses toutes différentes', () => {
    const its = items('a', 8).map((it, i) => ({ ...it, answer: i < 4 ? 'même' : `r${i}` }));
    const deck = buildDeck([{ chapter: chapter('a'), items: its }], {}, 8, seeded(2), { uniqueAnswers: true });
    expect(deck).toHaveLength(5);
  });
});

describe('répétition espacée', () => {
  const now = Date.parse('2026-10-18T12:00:00Z');
  const ago = (days: number) => new Date(now - days * 86_400_000).toISOString();

  it('range les questions dans des boîtes', () => {
    expect(boxOf(undefined)).toBeNull();
    expect(boxOf({ seen: 3, last_correct: false })).toBe(0);
    expect(boxOf({ seen: 3, last_correct: true, streak_days: 0 })).toBe(1);
    expect(boxOf({ seen: 3, last_correct: true, streak_days: 2 })).toBe(2);
    expect(boxOf({ seen: 9, last_correct: true, streak_days: 7 })).toBe(4);
  });

  it('fait revenir une question réussie quand son délai est passé', () => {
    const box3 = (days: number) => ({ seen: 3, last_correct: true, streak_days: 3, last_seen: ago(days) });
    expect(itemWeight(box3(2), now)).toBe(1);
    expect(itemWeight(box3(8), now)).toBe(2);
    expect(itemWeight({ seen: 1, last_correct: false, last_seen: ago(0) }, now)).toBe(8);
    expect(itemWeight(undefined, now)).toBe(4);
  });

  it('reprend les calculs ratés d’un chapitre à générateur', () => {
    const t = chapter('t', { generator: 'tables_multiplication' });
    const stats = {
      't|7 × 8 = ?': { seen: 2, last_correct: false, last_seen: ago(1) },
      't|6 × 6 = ?': { seen: 1, last_correct: true, streak_days: 1, last_seen: ago(0) },
      'autre|3 × 3 = ?': { seen: 1, last_correct: false },
    };
    const review = factsToReview(t, stats, now);
    expect(review.map((r) => r.question.prompt)).toEqual(['7 × 8 = ?']);
    expect(review[0].question.answer).toBe('56');

    let seven = 0;
    for (let s = 0; s < 200; s++) {
      if (buildDeck([{ chapter: t, items: [] }], stats, 1, seeded(s), {}, now)[0].prompt === '7 × 8 = ?') seven++;
    }
    // poids 8 contre 4 pour un nouveau calcul : environ deux tirages sur trois
    expect(seven).toBeGreaterThan(110);
  });
});

describe('itemToQuestion', () => {
  it('mélange la bonne réponse parmi les propositions', () => {
    const q = itemToQuestion(
      { id: 'x', chapter_id: 'a', kind: 'choix', prompt: 'p', answer: 'a', distractors: ['à'], explanation: null },
      seeded(5),
    );
    expect([...q.options].sort()).toEqual(['a', 'à']);
  });
});

describe('starsFor', () => {
  it('donne les étoiles selon le pourcentage', () => {
    expect(starsFor(9, 10)).toBe(3);
    expect(starsFor(7, 10)).toBe(2);
    expect(starsFor(5, 10)).toBe(1);
    expect(starsFor(4, 10)).toBe(0);
    expect(starsFor(0, 0)).toBe(0);
  });
});
