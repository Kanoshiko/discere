// Appels côté enfant : contenu public + fonctions identifiées par le jeton de l'appareil.
import { supabase } from './supabase';
import type { Chapter, GameId, Item, ItemStat, Question, Subject } from '../content/types';

export interface Catalog {
  subjects: Subject[];
  chapters: Chapter[];
  items: Item[];
}

/** Matières, chapitres visibles (en cours / révision) et leurs questions. */
export async function fetchCatalog(): Promise<Catalog> {
  const [s, c, i] = await Promise.all([
    supabase.from('subjects').select('id, name, color, position').order('position'),
    supabase
      .from('chapters')
      .select('id, subject_id, title, grade, period, status, generator, position')
      .neq('status', 'a_venir')
      .order('position'),
    supabase.from('items').select('id, chapter_id, kind, prompt, answer, distractors, explanation'),
  ]);
  const error = s.error ?? c.error ?? i.error;
  if (error) throw new Error(error.message);
  return { subjects: s.data ?? [], chapters: (c.data ?? []) as Chapter[], items: (i.data ?? []) as Item[] };
}

export interface Learner {
  name: string;
  grade: string;
  items: Record<string, ItemStat>;
}

export async function fetchLearner(token: string): Promise<Learner | null> {
  const { data, error } = await supabase.rpc('get_learner', { p_token: token });
  if (error) throw new Error(error.message);
  return (data as Learner | null) ?? null;
}

export interface AnswerRecord {
  question: Question;
  given: string;
  correct: boolean;
}

export async function recordRound(
  token: string,
  game: GameId,
  chapterId: string | null,
  score: number,
  total: number,
  durationS: number,
  answers: AnswerRecord[],
) {
  const { error } = await supabase.rpc('record_round', {
    p_token: token,
    p_game: game,
    p_chapter_id: chapterId,
    p_score: score,
    p_total: total,
    p_duration_s: Math.min(7200, Math.max(0, Math.round(durationS))),
    p_answers: answers.slice(0, 200).map((a) => ({
      item_id: a.question.itemId,
      chapter_id: a.question.chapterId,
      prompt: a.question.prompt,
      given: a.given,
      correct: a.correct,
    })),
  });
  if (error) throw new Error(error.message);
}
