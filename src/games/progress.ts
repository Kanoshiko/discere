// Statistiques pour la page de suivi des parents.

export interface AnswerLike {
  item_id: string | null;
  chapter_id: string | null;
  prompt: string;
  given: string;
  correct: boolean;
  answered_at: string;
}

export interface ChapterAccuracy {
  chapterId: string;
  answered: number;
  correct: number;
}

/** Taux de réussite par chapitre. */
export function accuracyByChapter(answers: readonly AnswerLike[]): ChapterAccuracy[] {
  const map = new Map<string, ChapterAccuracy>();
  for (const a of answers) {
    if (!a.chapter_id) continue;
    const acc = map.get(a.chapter_id) ?? { chapterId: a.chapter_id, answered: 0, correct: 0 };
    acc.answered++;
    if (a.correct) acc.correct++;
    map.set(a.chapter_id, acc);
  }
  return [...map.values()];
}

export interface ToReview {
  prompt: string;
  chapterId: string | null;
  lastGiven: string;
  misses: number;
}

/**
 * Questions dont la DERNIÈRE réponse est fausse, les plus souvent ratées d'abord.
 * Les questions générées (item_id null) sont regroupées par énoncé.
 * `answers` doit être trié du plus récent au plus ancien.
 */
export function stillToReview(answers: readonly AnswerLike[], max = 15): ToReview[] {
  const byKey = new Map<string, { last: AnswerLike; misses: number }>();
  for (const a of answers) {
    const key = a.item_id ?? `prompt:${a.prompt}`;
    const entry = byKey.get(key);
    if (!entry) byKey.set(key, { last: a, misses: a.correct ? 0 : 1 });
    else if (!a.correct) entry.misses++;
  }
  return [...byKey.values()]
    .filter((e) => !e.last.correct)
    .sort((x, y) => y.misses - x.misses || y.last.answered_at.localeCompare(x.last.answered_at))
    .slice(0, max)
    .map((e) => ({ prompt: e.last.prompt, chapterId: e.last.chapter_id, lastGiven: e.last.given, misses: e.misses }));
}
