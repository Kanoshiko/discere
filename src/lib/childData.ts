import { useCallback, useEffect, useState } from 'react';
import { fetchCatalog, fetchLearner, type Catalog, type Learner } from './api';
import { getDeviceToken } from './deviceStore';
import type { ChapterContent } from '../games/deck';

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
