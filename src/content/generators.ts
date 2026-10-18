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
}

/** 4500 → « 4 500 » (espace ordinaire, plus simple à retaper). */
export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR').replace(/[  ]/g, ' ');
}

function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

export const GENERATORS: Record<string, Generator> = {
  tables_multiplication: {
    label: 'Tables de multiplication (2 à 10)',
    make(rng) {
      const a = randInt(rng, 2, 10);
      const b = randInt(rng, 2, 10);
      return { prompt: `${a} × ${b} = ?`, answer: formatNumber(a * b), explanation: null };
    },
  },
  multiplier_10_100_1000: {
    label: 'Multiplier par 10, 100, 1 000',
    make(rng) {
      const factor = pick(rng, [10, 100, 1000]);
      const n = factor === 1000 ? randInt(rng, 2, 99) : randInt(rng, 2, 999);
      const zeros = String(factor).length - 1;
      return {
        prompt: `${formatNumber(n)} × ${formatNumber(factor)} = ?`,
        answer: formatNumber(n * factor),
        explanation: `Multiplier par ${formatNumber(factor)}, c'est ajouter ${zeros} zéro${zeros > 1 ? 's' : ''} : chaque chiffre avance de ${zeros} rang${zeros > 1 ? 's' : ''}.`,
      };
    },
  },
  complements_100: {
    label: 'Compléments à 100',
    make(rng) {
      // une fois sur deux, un multiple de 5 (plus facile)
      const n = rng() < 0.5 ? randInt(rng, 1, 19) * 5 : randInt(rng, 1, 99);
      return {
        prompt: `${n} + ? = 100`,
        answer: String(100 - n),
        explanation: `${n} + ${100 - n} = 100`,
      };
    },
  },
  doubles_moities: {
    label: 'Doubles et moitiés',
    make(rng) {
      if (rng() < 0.5) {
        const n = rng() < 0.3 ? randInt(rng, 1, 9) * 50 : randInt(rng, 11, 99);
        return { prompt: `Le double de ${formatNumber(n)} ?`, answer: formatNumber(n * 2), explanation: `${formatNumber(n)} + ${formatNumber(n)} = ${formatNumber(n * 2)}` };
      }
      const half = rng() < 0.3 ? randInt(rng, 1, 9) * 50 : randInt(rng, 6, 99);
      return { prompt: `La moitié de ${formatNumber(half * 2)} ?`, answer: formatNumber(half), explanation: `${formatNumber(half)} + ${formatNumber(half)} = ${formatNumber(half * 2)}` };
    },
  },
};

export function generatorLabel(key: string | null): string | null {
  if (!key) return null;
  return GENERATORS[key]?.label ?? `Générateur inconnu (${key})`;
}
