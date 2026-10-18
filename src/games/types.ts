import type { AnswerRecord } from '../lib/api';

export interface RoundResult {
  score: number;
  total: number;
  durationS: number;
  answers: AnswerRecord[];
}
