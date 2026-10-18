// Appels réservés aux parents (la RLS refuse tout autre utilisateur).
import { supabase } from './supabase';
import type { Chapter, ChapterStatus, GameId, Item, Subject } from '../content/types';
import type { ItemDraft } from '../content/validate';
import { cleanItem } from '../content/validate';

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function listSubjects(): Promise<Subject[]> {
  return check(await supabase.from('subjects').select('id, name, color, position').order('position'));
}

export async function listChapters(): Promise<Chapter[]> {
  return check(
    await supabase
      .from('chapters')
      .select('id, subject_id, title, grade, period, status, generator, position')
      .order('position'),
  );
}

export async function getChapter(id: string): Promise<Chapter> {
  return check(
    await supabase
      .from('chapters')
      .select('id, subject_id, title, grade, period, status, generator, position')
      .eq('id', id)
      .single(),
  );
}

/** Nombre de questions par chapitre. */
export async function itemCounts(): Promise<Record<string, number>> {
  const rows = check(await supabase.from('items').select('chapter_id')) as { chapter_id: string }[];
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.chapter_id] = (counts[r.chapter_id] ?? 0) + 1;
  return counts;
}

export interface ChapterDraft {
  subject_id: string;
  title: string;
  grade: string;
  period: number | null;
  status: ChapterStatus;
  generator: string | null;
}

export async function createChapter(d: ChapterDraft, position: number): Promise<Chapter> {
  return check(
    await supabase
      .from('chapters')
      .insert({ ...d, title: d.title.trim(), position })
      .select('id, subject_id, title, grade, period, status, generator, position')
      .single(),
  );
}

export async function updateChapter(id: string, patch: Partial<ChapterDraft>) {
  check(await supabase.from('chapters').update(patch).eq('id', id));
}

export async function deleteChapter(id: string) {
  check(await supabase.from('chapters').delete().eq('id', id));
}

export async function listItems(chapterId: string): Promise<Item[]> {
  return check(
    await supabase
      .from('items')
      .select('id, chapter_id, kind, prompt, answer, distractors, explanation')
      .eq('chapter_id', chapterId)
      .order('created_at'),
  );
}

export async function createItem(chapterId: string, d: ItemDraft) {
  check(await supabase.from('items').insert({ chapter_id: chapterId, ...cleanItem(d) }));
}

export async function updateItem(id: string, d: ItemDraft) {
  check(await supabase.from('items').update(cleanItem(d)).eq('id', id));
}

export async function deleteItem(id: string) {
  check(await supabase.from('items').delete().eq('id', id));
}

export interface LearnerRow {
  id: string;
  name: string;
  grade: string;
  token: string;
}

export async function listLearners(): Promise<LearnerRow[]> {
  return check(await supabase.from('learners').select('id, name, grade, token').order('created_at'));
}

export async function createLearner(name: string, grade: string) {
  check(await supabase.from('learners').insert({ name: name.trim(), grade }));
}

/** Nouveau jeton : l'ancien lien d'appareil cesse de fonctionner. */
export async function renewLearnerToken(id: string) {
  check(await supabase.from('learners').update({ token: crypto.randomUUID() }).eq('id', id));
}

export interface RoundRow {
  id: string;
  game: GameId;
  chapter_id: string | null;
  score: number;
  total: number;
  duration_s: number;
  played_at: string;
}

export async function listRounds(learnerId: string, limit = 30): Promise<RoundRow[]> {
  return check(
    await supabase
      .from('rounds')
      .select('id, game, chapter_id, score, total, duration_s, played_at')
      .eq('learner_id', learnerId)
      .order('played_at', { ascending: false })
      .limit(limit),
  );
}

export interface AnswerRow {
  item_id: string | null;
  chapter_id: string | null;
  prompt: string;
  given: string;
  correct: boolean;
  answered_at: string;
}

/** Réponses des `days` derniers jours, les plus récentes d'abord. */
export async function listAnswers(learnerId: string, days = 30): Promise<AnswerRow[]> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  return check(
    await supabase
      .from('answers')
      .select('item_id, chapter_id, prompt, given, correct, answered_at')
      .eq('learner_id', learnerId)
      .gte('answered_at', since)
      .order('answered_at', { ascending: false })
      .limit(3000),
  );
}
