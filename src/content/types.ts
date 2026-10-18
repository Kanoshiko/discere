export type ItemKind = 'choix' | 'saisie' | 'vrai_faux';
export type ChapterStatus = 'a_venir' | 'en_cours' | 'revision';
export type GameId = 'quiz' | 'chrono' | 'paires';
export type Element = 'feu' | 'air' | 'eau' | 'terre';

export interface Subject {
  id: string;
  name: string;
  color: string;
  element: Element;
  position: number;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  grade: string;
  period: number | null;
  status: ChapterStatus;
  generator: string | null;
  position: number;
}

export interface Item {
  id: string;
  chapter_id: string;
  kind: ItemKind;
  prompt: string;
  /** Bonne réponse ; en saisie, variantes séparées par « | ». */
  answer: string;
  distractors: string[];
  explanation: string | null;
}

/** Question prête à être posée, issue d'un item ou d'un générateur. */
export interface Question {
  /** Identifiant unique dans une partie (évite les doublons). */
  key: string;
  itemId: string | null;
  chapterId: string;
  kind: ItemKind;
  prompt: string;
  answer: string;
  /** Propositions mélangées (bonne réponse comprise) pour choix et vrai_faux. */
  options: string[];
  explanation: string | null;
}

/** Historique de l'enfant sur une question déjà vue (question écrite ou calcul généré). */
export interface ItemStat {
  seen: number;
  last_correct: boolean;
  /** Nombre de jours différents où la question a été réussie depuis la dernière erreur. */
  streak_days?: number;
  /** Date de la dernière réponse (ISO). */
  last_seen?: string;
}

/** Clé de suivi d'une question : id de la question écrite, ou « chapitre|énoncé » pour un calcul. */
export function statKey(q: { itemId: string | null; chapterId: string; prompt: string }): string {
  return q.itemId ?? `${q.chapterId}|${q.prompt}`;
}

export const STATUS_LABEL: Record<ChapterStatus, string> = {
  a_venir: 'À venir',
  en_cours: 'En cours',
  revision: 'Révision',
};

export const KIND_LABEL: Record<ItemKind, string> = {
  choix: 'Choix multiple',
  saisie: 'Réponse à taper',
  vrai_faux: 'Vrai ou faux',
};

export const GAME_LABEL: Record<GameId, string> = {
  quiz: 'Entraînement',
  chrono: 'Duel éclair',
  paires: 'Harmonie',
};
