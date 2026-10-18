import { ElementIcon } from './Element';
import { ELEMENTS, ELEMENT_NAME, ELEMENT_OF, isAvatar, rankFor } from '../games/ranks';
import type { Element } from '../content/types';

/** Les quatre éléments de l'enfant : rang et progression vers le rang suivant. */
export default function ElementPath({ xp }: { xp: Record<Element, number> }) {
  const avatar = isAvatar(xp);
  return (
    <section className="path" aria-label="Ton chemin vers l'Avatar">
      {avatar && (
        <p className="avatar-banner" data-element="avatar">
          <ElementIcon element="avatar" size={36} /> Tu maîtrises les quatre éléments : tu es l’Avatar !
        </p>
      )}
      <div className="path-grid">
        {ELEMENTS.map((e) => {
          const r = rankFor(xp[e]);
          return (
            <div key={e} className="path-card" data-element={e}>
              <ElementIcon element={e} size={38} />
              <div className="path-text">
                <span className="path-rank">{r.name} {ELEMENT_OF[e]}</span>
                <span className="path-bar" role="progressbar" aria-label={`Progression ${ELEMENT_OF[e]}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(r.progress * 100)}>
                  <span style={{ width: `${r.progress * 100}%` }} />
                </span>
                <span className="path-next">
                  {r.toNext === null ? `${ELEMENT_NAME[e]} maîtrisé` : `encore ${r.toNext} points`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
