import { randInt, type Rng } from './random';

/** Question produite par un générateur (calcul mental). */
export interface Generated {
  prompt: string;
  answer: string;
  explanation: string | null;
}

export interface Generator {
  label: string;
  make: (rng: Rng) => Generated;
  /** Reconstruit un calcul déjà posé à partir de son énoncé (pour le faire revenir), ou null. */
  rebuild: (prompt: string) => Generated | null;
}

/** 4500 → « 4 500 » (espace ordinaire, plus simple à retaper). */
export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR').replace(/[  ]/g, ' ');
}

/** « 4 500 » → 4500 */
function num(text: string): number {
  return Number(text.replace(/\s/g, ''));
}

function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

function table(a: number, b: number): Generated {
  return { prompt: `${a} × ${b} = ?`, answer: formatNumber(a * b), explanation: null };
}

function multiply(n: number, factor: number): Generated {
  const zeros = String(factor).length - 1;
  return {
    prompt: `${formatNumber(n)} × ${formatNumber(factor)} = ?`,
    answer: formatNumber(n * factor),
    explanation: `Multiplier par ${formatNumber(factor)}, c'est ajouter ${zeros} zéro${zeros > 1 ? 's' : ''} : chaque chiffre avance de ${zeros} rang${zeros > 1 ? 's' : ''}.`,
  };
}

function complement(n: number): Generated {
  return { prompt: `${n} + ? = 100`, answer: String(100 - n), explanation: `${n} + ${100 - n} = 100` };
}

function double(n: number): Generated {
  return { prompt: `Le double de ${formatNumber(n)} ?`, answer: formatNumber(n * 2), explanation: `${formatNumber(n)} + ${formatNumber(n)} = ${formatNumber(n * 2)}` };
}

function half(n: number): Generated {
  return { prompt: `La moitié de ${formatNumber(n * 2)} ?`, answer: formatNumber(n), explanation: `${formatNumber(n)} + ${formatNumber(n)} = ${formatNumber(n * 2)}` };
}

const NUMBER = '(\\d{1,3}(?: \\d{3})*)';

export const GENERATORS: Record<string, Generator> = {
  tables_multiplication: {
    label: 'Tables de multiplication (2 à 10)',
    make: (rng) => table(randInt(rng, 2, 10), randInt(rng, 2, 10)),
    rebuild(prompt) {
      const m = /^(\d+) × (\d+) = \?$/.exec(prompt);
      return m ? table(Number(m[1]), Number(m[2])) : null;
    },
  },
  multiplier_10_100_1000: {
    label: 'Multiplier par 10, 100, 1 000',
    make(rng) {
      const factor = pick(rng, [10, 100, 1000]);
      return multiply(factor === 1000 ? randInt(rng, 2, 99) : randInt(rng, 2, 999), factor);
    },
    rebuild(prompt) {
      const m = new RegExp(`^${NUMBER} × (10|100|1 000) = \\?$`).exec(prompt);
      return m ? multiply(num(m[1]), num(m[2])) : null;
    },
  },
  complements_100: {
    label: 'Compléments à 100',
    // une fois sur deux, un multiple de 5 (plus facile)
    make: (rng) => complement(rng() < 0.5 ? randInt(rng, 1, 19) * 5 : randInt(rng, 1, 99)),
    rebuild(prompt) {
      const m = /^(\d+) \+ \? = 100$/.exec(prompt);
      return m && Number(m[1]) < 100 ? complement(Number(m[1])) : null;
    },
  },
  doubles_moities: {
    label: 'Doubles et moitiés',
    make(rng) {
      if (rng() < 0.5) return double(rng() < 0.3 ? randInt(rng, 1, 9) * 50 : randInt(rng, 11, 99));
      return half(rng() < 0.3 ? randInt(rng, 1, 9) * 50 : randInt(rng, 6, 99));
    },
    rebuild(prompt) {
      const d = new RegExp(`^Le double de ${NUMBER} \\?$`).exec(prompt);
      if (d) return double(num(d[1]));
      const h = new RegExp(`^La moitié de ${NUMBER} \\?$`).exec(prompt);
      return h && num(h[1]) % 2 === 0 ? half(num(h[1]) / 2) : null;
    },
  },
};

export function generatorLabel(key: string | null): string | null {
  if (!key) return null;
  return GENERATORS[key]?.label ?? `Générateur inconnu (${key})`;
}
