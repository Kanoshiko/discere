import { displayAnswer, normalize } from '../content/answers';
import { GENERATORS } from '../content/generators';
import { shuffle, weightedIndex, type Rng } from '../content/random';
import { statKey, type Chapter, type Item, type ItemStat, type Question } from '../content/types';

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

/**
 * Répétition espacée, façon boîtes de Leitner. Boîte 0 : ratée la dernière fois ;
 * boîtes 1 à 4 : réussie depuis la dernière erreur, 1 à 4 jours différents (ou plus).
 */
export function boxOf(stat: ItemStat | undefined): number | null {
  if (!stat) return null;
  if (!stat.last_correct) return 0;
  return Math.min(4, Math.max(1, stat.streak_days ?? 1));
}

/** Poids de tirage par boîte, et poids d'une question jamais vue. */
export const BOX_WEIGHT = [8, 3, 2, 1, 0.5];
export const NEW_WEIGHT = 4;
/** Nombre de jours après lequel une question réussie est « à revoir » (poids doublé). */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14];

const DAY = 86_400_000;

export function isDue(stat: ItemStat | undefined, now: number): boolean {
  const box = boxOf(stat);
  if (box === null || box === 0 || !stat?.last_seen) return false;
  return now - Date.parse(stat.last_seen) >= BOX_INTERVAL_DAYS[box] * DAY;
}

export function itemWeight(stat: ItemStat | undefined, now: number = Date.now()): number {
  const box = boxOf(stat);
  if (box === null) return NEW_WEIGHT;
  return BOX_WEIGHT[box] * (isDue(stat, now) ? 2 : 1);
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

function fromGenerated(chapter: Chapter, g: { prompt: string; answer: string; explanation: string | null }): Question {
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

export function generatedQuestion(chapter: Chapter, rng: Rng): Question | null {
  const gen = chapter.generator ? GENERATORS[chapter.generator] : undefined;
  return gen ? fromGenerated(chapter, gen.make(rng)) : null;
}

/**
 * Calculs déjà posés dans ce chapitre qui méritent de revenir : ratés la dernière fois,
 * ou réussis mais « à revoir ».
 */
export function factsToReview(
  chapter: Chapter,
  stats: Readonly<Record<string, ItemStat>>,
  now: number,
): { question: Question; weight: number }[] {
  const gen = chapter.generator ? GENERATORS[chapter.generator] : undefined;
  if (!gen) return [];
  const prefix = `${chapter.id}|`;
  const out: { question: Question; weight: number }[] = [];
  for (const [key, stat] of Object.entries(stats)) {
    if (!key.startsWith(prefix)) continue;
    if (stat.last_correct && !isDue(stat, now)) continue;
    const g = gen.rebuild(key.slice(prefix.length));
    if (g) out.push({ question: fromGenerated(chapter, g), weight: itemWeight(stat, now) });
  }
  return out;
}

/**
 * Tire `count` questions sans doublon parmi les chapitres donnés.
 * Chaque question choisit d'abord un chapitre (pondéré par son statut), puis
 * une question de ce chapitre (pondérée par sa boîte de répétition espacée).
 * Pour un chapitre à générateur : un calcul à revoir, ou un nouveau calcul (poids NEW_WEIGHT).
 * Renvoie moins de `count` questions si le contenu est épuisé.
 */
export function buildDeck(
  contents: readonly ChapterContent[],
  stats: Readonly<Record<string, ItemStat>>,
  count: number,
  rng: Rng,
  options: DeckOptions = {},
  now: number = Date.now(),
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
      const review = factsToReview(chapter, stats, now).filter((r) => accept(r.question));
      const ri = weightedIndex([NEW_WEIGHT, ...review.map((r) => r.weight)], rng);
      if (ri > 0) question = review[ri - 1].question;
      for (let tries = 0; tries < 30 && !question; tries++) {
        const q = generatedQuestion(chapter, rng);
        if (q && accept(q)) question = q;
      }
    } else {
      const candidates = items.map((item) => itemToQuestion(item, rng)).filter(accept);
      const ii = weightedIndex(candidates.map((q) => itemWeight(stats[statKey(q)], now)), rng);
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
