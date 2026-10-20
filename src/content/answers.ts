/**
 * Comparaison tolérante des réponses tapées par l'enfant.
 * - majuscules et espaces en trop ignorés ;
 * - accents CONSERVÉS (« a » et « à » sont deux réponses différentes) ;
 * - nombres : espaces de milliers ignorés, virgule ou point décimal acceptés ;
 * - apostrophes typographiques ramenées à « ' ».
 */
export function normalize(text: string): string {
  let s = text.normalize('NFC').toLowerCase().trim().replace(/[’`]/g, "'").replace(/\s+/g, ' ');
  // « 304 020 » → « 304020 », « 2,5 » → « 2.5 »
  if (/^-?[\d\s.,]+$/.test(s)) {
    s = s.replace(/\s/g, '').replace(',', '.');
  }
  // un point final n'est pas une faute
  return s.replace(/\s*[.!]$/, '');
}

/** Variantes acceptées : « 304020 | 304 020 » → deux réponses. */
export function acceptedAnswers(answer: string): string[] {
  return answer.split('|').map((a) => a.trim()).filter((a) => a.length > 0);
}

/** Réponse affichée à l'enfant (la première variante). */
export function displayAnswer(answer: string): string {
  return acceptedAnswers(answer)[0] ?? answer;
}

/** Réponse donnée à une question « ordre » : les étiquettes dans l'ordre choisi. */
export const ORDER_SEPARATOR = ' → ';

/** Correction selon le type de question. */
export function isCorrectFor(q: { kind: string; answer: string; steps: { label: string }[] }, given: string): boolean {
  if (q.kind === 'ordre') return given === q.steps.map((s) => s.label).join(ORDER_SEPARATOR);
  return isCorrect(given, q.answer);
}

/** Bonne réponse à afficher selon le type de question. */
export function expectedAnswer(q: { kind: string; answer: string; steps: { label: string }[] }): string {
  if (q.kind === 'ordre') return q.steps.map((s) => s.label).join(ORDER_SEPARATOR);
  return displayAnswer(q.answer);
}

export function isCorrect(given: string, answer: string): boolean {
  const g = normalize(given);
  if (g === '') return false;
  return acceptedAnswers(answer).some((a) => normalize(a) === g);
}
