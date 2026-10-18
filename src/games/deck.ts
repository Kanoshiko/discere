import { displayAnswer, normalize } from '../content/answers';
import { GENERATORS } from '../content/generators';
import { shuffle, weightedIndex, type Rng } from '../content/random';
import type { Chapter, Item, ItemStat, Question } from '../content/types';

export interface ChapterContent {
  chapter: Chapter;
  items: Item[];
}

export interface DeckOptions {
  /** Ne garder que les questions acceptées par ce filtre. */
  filter?: (q: Question) => boolean;
  /** Interdire deux questions ayant la même réponse (jeu des paires). */
  uniqueAnswers?: boolean;
}

/** Un chapitre « en cours » revient trois fois plus souvent qu'un chapitre « en révision ». */
export function chapterWeight(chapter: Chapter): number {
  return chapter.status === 'en_cours' ? 3 : 1;
}

/** Question jamais vue : 2 ; ratée la dernière fois : 4 ; réussie la dernière fois : 1. */
export function itemWeight(stat: ItemStat | undefined): number {
  if (!stat) return 2;
  return stat.last_correct ? 1 : 4;
}

export function itemToQuestion(item: Item, rng: Rng): Question {
  let options: string[] = [];
  if (item.kind === 'choix') options = shuffle([displayAnswer(item.answer), ...item.distractors], rng);
  if (item.kind === 'vrai_faux') options = ['vrai', 'faux'];
  return {
    key: `item:${item.id}`,
    itemId: item.id,
    chapterId: item.chapter_id,
    kind: item.kind,
    prompt: item.prompt,
    answer: item.answer,
    options,
    explanation: item.explanation,
  };
}

export function generatedQuestion(chapter: Chapter, rng: Rng): Question | null {
  const gen = chapter.generator ? GENERATORS[chapter.generator] : undefined;
  if (!gen) return null;
  const g = gen.make(rng);
  return {
    key: `gen:${chapter.id}:${g.prompt}`,
    itemId: null,
    chapterId: chapter.id,
    kind: 'saisie',
    prompt: g.prompt,
    answer: g.answer,
    options: [],
    explanation: g.explanation,
  };
}

/**
 * Tire `count` questions sans doublon parmi les chapitres donnés.
 * Chaque question choisit d'abord un chapitre (pondéré par son statut), puis
 * une question de ce chapitre (pondérée par le dernier résultat de l'enfant),
 * ou en génère une. Renvoie moins de `count` questions si le contenu est épuisé.
 */
export function buildDeck(
  contents: readonly ChapterContent[],
  stats: Readonly<Record<string, ItemStat>>,
  count: number,
  rng: Rng,
  options: DeckOptions = {},
): Question[] {
  const deck: Question[] = [];
  const usedKeys = new Set<string>();
  const usedAnswers = new Set<string>();
  const exhausted = new Set<number>();

  const accept = (q: Question) =>
    !usedKeys.has(q.key) &&
    (!options.uniqueAnswers || !usedAnswers.has(normalize(displayAnswer(q.answer)))) &&
    (!options.filter || options.filter(q));

  while (deck.length < count) {
    const weights = contents.map((c, i) => {
      if (exhausted.has(i)) return 0;
      if (!c.chapter.generator && c.items.length === 0) return 0;
      return chapterWeight(c.chapter);
    });
    const ci = weightedIndex(weights, rng);
    if (ci < 0) break;
    const { chapter, items } = contents[ci];

    let question: Question | null = null;
    if (chapter.generator) {
      for (let tries = 0; tries < 30 && !question; tries++) {
        const q = generatedQuestion(chapter, rng);
        if (q && accept(q)) question = q;
      }
    } else {
      const candidates = items.map((item) => itemToQuestion(item, rng)).filter(accept);
      const ii = weightedIndex(candidates.map((q) => itemWeight(stats[q.itemId!])), rng);
      if (ii >= 0) question = candidates[ii];
    }

    if (!question) {
      exhausted.add(ci);
      continue;
    }
    deck.push(question);
    usedKeys.add(question.key);
    usedAnswers.add(normalize(displayAnswer(question.answer)));
  }
  return deck;
}

/** Étoiles de fin de partie : 3 à partir de 90 %, 2 à partir de 70 %, 1 à partir de 50 %. */
export function starsFor(score: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0;
  const r = score / total;
  if (r >= 0.9) return 3;
  if (r >= 0.7) return 2;
  if (r >= 0.5) return 1;
  return 0;
}
