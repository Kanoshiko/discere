import { useCallback, useEffect, useState } from 'react';
import { fetchCatalog, fetchLearner, type Catalog, type Learner } from './api';
import { getDeviceToken } from './deviceStore';
import type { ChapterContent } from '../games/deck';
import type { Element } from '../content/types';
import type { Theme } from '../components/Element';
import { xpByElement } from '../games/ranks';

export interface ChildData {
  catalog: Catalog;
  /** null : appareil sans jeton (mode essai, rien n'est enregistré). */
  learner: Learner | null;
  token: string | null;
}

// Le catalogue change rarement : on le garde en mémoire le temps de la visite.
let catalogPromise: Promise<Catalog> | null = null;

function loadCatalog(): Promise<Catalog> {
  if (!catalogPromise) {
    catalogPromise = fetchCatalog().catch((e) => {
      catalogPromise = null;
      throw e;
    });
  }
  return catalogPromise;
}

export type ChildState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ChildData };

export function useChildData(): ChildState & { reload: () => void } {
  const [state, setState] = useState<ChildState>({ status: 'loading' });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    const token = getDeviceToken();
    Promise.all([loadCatalog(), token ? fetchLearner(token) : Promise.resolve(null)])
      .then(([catalog, learner]) => {
        if (alive) setState({ status: 'ready', data: { catalog, learner, token: learner ? token : null } });
      })
      .catch((e: Error) => {
        if (alive) setState({ status: 'error', message: e.message });
      });
    return () => {
      alive = false;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}

/** Contenu d'un chapitre, ou de tous les chapitres visibles pour « melange ». */
export function contentsFor(catalog: Catalog, scope: string): ChapterContent[] {
  const chapters = scope === 'melange' ? catalog.chapters : catalog.chapters.filter((c) => c.id === scope);
  return chapters.map((chapter) => ({
    chapter,
    items: catalog.items.filter((i) => i.chapter_id === chapter.id),
  }));
}

/** Élément de la matière d'un chapitre. */
export function chapterElementFn(catalog: Catalog): (chapterId: string) => Element | undefined {
  const bySubject = new Map(catalog.subjects.map((s) => [s.id, s.element]));
  const byChapter = new Map(catalog.chapters.map((c) => [c.id, bySubject.get(c.subject_id)]));
  return (chapterId) => byChapter.get(chapterId);
}

/** Points de l'enfant par élément. */
export function learnerXp(catalog: Catalog, learner: Learner): Record<Element, number> {
  const bySubject = new Map(catalog.subjects.map((s) => [s.id, s.element]));
  return xpByElement(learner.subjects, (id) => bySubject.get(id));
}

/** Thème d'une page de jeu : l'élément du chapitre, ou l'Avatar pour le mélange. */
export function themeFor(catalog: Catalog, scope: string): Theme {
  if (scope === 'melange') return 'avatar';
  return chapterElementFn(catalog)(scope) ?? 'avatar';
}
