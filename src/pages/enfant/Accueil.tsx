import { Link } from 'react-router-dom';
import { LoadError, Loading } from '../../components/Loading';
import { ElementIcon, ScrollIcon } from '../../components/Element';
import ElementPath from '../../components/ElementPath';
import { learnerXp, useChildData } from '../../lib/childData';
import type { Chapter } from '../../content/types';

export default function Accueil() {
  const state = useChildData();
  const ready = state.status === 'ready' ? state.data : null;
  const scrolls = new Set(ready?.learner?.scrolls ?? []);

  return (
    <main className="page child">
      <header className="child-hero" data-element="avatar">
        <p className="brand">Discere</p>
        <h1>{ready?.learner ? `Bonjour ${ready.learner.name} !` : 'Bonjour !'}</h1>
        <p>{ready?.learner ? 'Ton chemin vers l’Avatar continue.' : 'Choisis ce que tu veux réviser.'}</p>
      </header>

      {state.status === 'loading' && <Loading />}
      {state.status === 'error' && <LoadError message={state.message} onRetry={state.reload} />}
      {ready && (
        <>
          {ready.learner ? (
            <ElementPath xp={learnerXp(ready.catalog, ready.learner)} />
          ) : (
            <p className="notice">
              Cet appareil n'est pas encore relié à un enfant : tu peux jouer, mais les scores ne sont pas enregistrés.
              Un parent peut le relier depuis l'espace parent.
            </p>
          )}

          {ready.catalog.chapters.length === 0 ? (
            <p className="muted">Aucun chapitre à réviser pour le moment.</p>
          ) : (
            <>
              <Link className="big-card mix" data-element="avatar" to="/jouer/melange">
                <ElementIcon element="avatar" size={52} />
                <span className="big-card-body">
                  <span className="big-card-title">L’épreuve de l’Avatar</span>
                  <span>Les quatre éléments mélangés : tout ce que tu travailles en ce moment</span>
                </span>
              </Link>

              {ready.catalog.subjects.map((s) => {
                const chapters = ready.catalog.chapters.filter((c) => c.subject_id === s.id);
                if (chapters.length === 0) return null;
                return (
                  <section key={s.id} className="subject" data-element={s.element}>
                    <h2 className="subject-title">
                      <ElementIcon element={s.element} size={34} />
                      {s.name}
                    </h2>
                    <div className="chapter-grid">
                      {chapters.map((c) => (
                        <ChapterCard key={c.id} chapter={c} earned={scrolls.has(c.id)} showScroll={Boolean(ready.learner)} />
                      ))}
                    </div>
                  </section>
                );
              })}

              {ready.learner && (
                <p className="scroll-count">
                  <ScrollIcon earned size={30} />
                  {scrolls.size} parchemin{scrolls.size > 1 ? 's' : ''} sur {ready.catalog.chapters.length} :
                  un chapitre réussi à 80 % sur ses 20 dernières questions te donne son parchemin.
                </p>
              )}
            </>
          )}
        </>
      )}

      <footer className="child-footer">
        <Link to="/parent">Espace parent</Link>
      </footer>
    </main>
  );
}

function ChapterCard({ chapter, earned, showScroll }: { chapter: Chapter; earned: boolean; showScroll: boolean }) {
  return (
    <Link className="chapter-card" to={`/jouer/${chapter.id}`}>
      <span className="chapter-title">{chapter.title}</span>
      <span className="chapter-foot">
        {chapter.status === 'en_cours' ? <span className="tag">En ce moment</span> : <span />}
        {showScroll && (
          <span className="chapter-scroll" title={earned ? 'Parchemin gagné' : 'Parchemin à gagner'}>
            <ScrollIcon earned={earned} />
            <span className="sr-only">{earned ? 'Parchemin gagné' : 'Parchemin à gagner'}</span>
          </span>
        )}
      </span>
    </Link>
  );
}
