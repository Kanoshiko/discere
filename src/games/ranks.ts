// Progression par élément : points, rangs, Avatar.
import { statKey, type Element, type ItemStat } from '../content/types';

export const ELEMENTS: Element[] = ['eau', 'terre', 'feu', 'air'];

export const ELEMENT_NAME: Record<Element, string> = { feu: 'Feu', air: 'Air', eau: 'Eau', terre: 'Terre' };
/** « Maître de l'eau », « Apprenti du feu »… */
export const ELEMENT_OF: Record<Element, string> = { feu: 'du feu', air: "de l'air", eau: "de l'eau", terre: 'de la terre' };

/** Une bonne réponse. */
export const XP_CORRECT = 10;
/** Bonus quand l'enfant réussit une question ratée la fois précédente. */
export const XP_VANQUISHED = 20;

export const RANKS = [
  { name: 'Novice', min: 0 },
  { name: 'Apprenti', min: 150 },
  { name: 'Disciple', min: 600 },
  { name: 'Maître', min: 1500 },
] as const;

export interface SubjectProgress {
  correct: number;
  vanquished: number;
}

export interface RankInfo {
  index: number;
  name: string;
  /** Points manquants pour le rang suivant (null au rang de Maître). */
  toNext: number | null;
  /** Avancement vers le rang suivant, de 0 à 1 (1 au rang de Maître). */
  progress: number;
}

export function xpOf(p: SubjectProgress | undefined): number {
  if (!p) return 0;
  return p.correct * XP_CORRECT + p.vanquished * XP_VANQUISHED;
}

export function rankFor(xp: number): RankInfo {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].min) index = i;
  const next = RANKS[index + 1];
  if (!next) return { index, name: RANKS[index].name, toNext: null, progress: 1 };
  const from = RANKS[index].min;
  return { index, name: RANKS[index].name, toNext: next.min - xp, progress: (xp - from) / (next.min - from) };
}

export function emptyXp(): Record<Element, number> {
  return { feu: 0, air: 0, eau: 0, terre: 0 };
}

/** Points par élément, à partir des points par matière. */
export function xpByElement(
  subjects: Readonly<Record<string, SubjectProgress>>,
  elementOfSubject: (subjectId: string) => Element | undefined,
): Record<Element, number> {
  const xp = emptyXp();
  for (const [id, p] of Object.entries(subjects)) {
    const el = elementOfSubject(id);
    if (el) xp[el] += xpOf(p);
  }
  return xp;
}

/** L'enfant devient Avatar quand les quatre éléments ont atteint le rang de Maître. */
export function isAvatar(xp: Record<Element, number>): boolean {
  const master = RANKS[RANKS.length - 1].min;
  return ELEMENTS.every((e) => xp[e] >= master);
}

export interface AnsweredLike {
  question: { itemId: string | null; chapterId: string; prompt: string };
  correct: boolean;
}

/**
 * Points gagnés pendant une partie, par élément. Même règle que la base :
 * 10 par bonne réponse, +20 si la question (ou le calcul) avait été ratée la fois
 * précédente (avant la partie, ou plus tôt dans la même partie).
 */
export function roundGains(
  answers: readonly AnsweredLike[],
  stats: Readonly<Record<string, ItemStat>>,
  elementOfChapter: (chapterId: string) => Element | undefined,
): Record<Element, number> {
  const gains = emptyXp();
  const last = new Map<string, boolean>();
  for (const a of answers) {
    const el = elementOfChapter(a.question.chapterId);
    const key = statKey(a.question);
    const previous = last.has(key) ? last.get(key) : stats[key]?.last_correct;
    if (el && a.correct) gains[el] += XP_CORRECT + (previous === false ? XP_VANQUISHED : 0);
    last.set(key, a.correct);
  }
  return gains;
}
