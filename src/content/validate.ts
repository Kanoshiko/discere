import { parseStep, type ItemKind } from './types';

export interface ItemDraft {
  kind: ItemKind;
  prompt: string;
  answer: string;
  distractors: string[];
  /** Question « ordre » : étapes dans le bon ordre (« étiquette » ou « étiquette|détail »). */
  steps: string[];
  explanation: string;
}

/** Mêmes règles que les contraintes de la table `items` ; renvoie le premier problème. */
export function validateItem(d: ItemDraft): string | null {
  const prompt = d.prompt.trim();
  if (prompt.length === 0) return 'La question est vide.';
  if (prompt.length > 300) return 'La question dépasse 300 caractères.';
  if (d.kind === 'ordre') {
    const steps = d.steps.map((x) => x.trim()).filter(Boolean);
    if (steps.length < 3) return 'Une frise a besoin d’au moins 3 étapes.';
    if (steps.length > 8) return 'Pas plus de 8 étapes.';
    const labels = steps.map((x) => parseStep(x).label.toLowerCase());
    if (labels.some((l) => l.length === 0)) return 'Une étape n’a pas de nom.';
    if (labels.some((l) => l.length > 60)) return 'Le nom d’une étape dépasse 60 caractères.';
    if (new Set(labels).size !== labels.length) return 'Deux étapes portent le même nom.';
    if (d.explanation.trim().length > 300) return 'L’explication dépasse 300 caractères.';
    return null;
  }
  const answer = d.answer.trim();
  const distractors = d.distractors.map((x) => x.trim()).filter(Boolean);
  if (answer.length === 0) return 'La bonne réponse est vide.';
  if (answer.length > 100) return 'La bonne réponse dépasse 100 caractères.';
  if (d.kind === 'vrai_faux' && answer !== 'vrai' && answer !== 'faux') return 'La réponse doit être « vrai » ou « faux ».';
  if (d.kind === 'choix') {
    if (distractors.length === 0) return 'Ajoute au moins une mauvaise réponse.';
    if (distractors.length > 5) return 'Pas plus de 5 mauvaises réponses.';
    if (answer.includes('|')) return 'Le choix multiple n’accepte qu’une bonne réponse (pas de « | »).';
    if (distractors.some((x) => x.toLowerCase() === answer.toLowerCase())) return 'Une mauvaise réponse est identique à la bonne.';
  }
  if (d.explanation.trim().length > 300) return 'L’explication dépasse 300 caractères.';
  return null;
}

/** Valeurs à enregistrer, nettoyées. */
export function cleanItem(d: ItemDraft) {
  return {
    kind: d.kind,
    prompt: d.prompt.trim(),
    // pour une frise, la réponse est dans steps
    answer: d.kind === 'ordre' ? 'ordre' : d.answer.trim(),
    distractors: d.kind === 'choix' ? d.distractors.map((x) => x.trim()).filter(Boolean) : [],
    steps: d.kind === 'ordre' ? d.steps.map((x) => x.trim()).filter(Boolean) : [],
    explanation: d.explanation.trim() || null,
  };
}
