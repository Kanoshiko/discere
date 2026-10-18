// Emblèmes des éléments : dessins originaux, simples, lisibles en petit.
import type { Element } from '../content/types';

export type Theme = Element | 'avatar';

interface Props {
  element: Theme;
  size?: number;
  className?: string;
}

export function ElementIcon({ element, size = 40, className }: Props) {
  const common = { width: size, height: size, viewBox: '0 0 48 48', className, 'aria-hidden': true } as const;
  switch (element) {
    case 'feu':
      return (
        <svg {...common}>
          <path d="M24 3c3 8 15 13 15 27a15 15 0 0 1-30 0c0-7 4-12 8-15 0 5 2 8 5 9-2-8-1-15 2-21z" fill="var(--feu)" />
          <path d="M24 24c2 4 7 6 7 12a7 7 0 0 1-14 0c0-3 2-5 3-6 1 2 2 3 3 3-1-3 0-6 1-9z" fill="var(--feu-light)" />
        </svg>
      );
    case 'air':
      return (
        <svg {...common} fill="none" stroke="var(--air)" strokeWidth="4.5" strokeLinecap="round">
          <path d="M5 17h24a6 6 0 1 0-6-6" />
          <path d="M5 27h33a6 6 0 1 1-6 6" />
          <path d="M5 37h14" />
        </svg>
      );
    case 'eau':
      return (
        <svg {...common} fill="none" stroke="var(--eau)" strokeWidth="4.5" strokeLinecap="round">
          <path d="M4 16c4-5 8-5 12 0s8 5 12 0 8-5 12 0" />
          <path d="M4 27c4-5 8-5 12 0s8 5 12 0 8-5 12 0" />
          <path d="M4 38c4-5 8-5 12 0s8 5 12 0 8-5 12 0" />
        </svg>
      );
    case 'terre':
      return (
        <svg {...common}>
          <path d="M3 42 17 14l8 13 6-9 14 24z" fill="var(--terre)" />
          <path d="m17 14 4 8-4-2-3 4z" fill="var(--terre-light)" />
          <rect x="9" y="38" width="30" height="5" rx="2" fill="var(--terre-dark)" />
        </svg>
      );
    case 'avatar':
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="9" fill="none" stroke="var(--avatar)" strokeWidth="3.5" />
          <circle cx="24" cy="6" r="5" fill="var(--air)" />
          <circle cx="42" cy="24" r="5" fill="var(--feu)" />
          <circle cx="24" cy="42" r="5" fill="var(--terre)" />
          <circle cx="6" cy="24" r="5" fill="var(--eau)" />
        </svg>
      );
  }
}

/** Parchemin roulé ; grisé tant qu'il n'est pas gagné. */
export function ScrollIcon({ earned, size = 28 }: { earned: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={earned ? 'scroll earned' : 'scroll'}>
      <rect x="10" y="10" width="28" height="28" rx="3" className="scroll-paper" />
      <rect x="6" y="6" width="36" height="8" rx="4" className="scroll-roll" />
      <rect x="6" y="34" width="36" height="8" rx="4" className="scroll-roll" />
      <path d="M16 21h16M16 27h12" className="scroll-lines" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
