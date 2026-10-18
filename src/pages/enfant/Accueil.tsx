import { Link } from 'react-router-dom';
import { LoadError, Loading } from '../../components/Loading';
import { useChildData } from '../../lib/childData';
import type { Chapter } from '../../content/types';

export default function Accueil() {
  const state = useChildData();

  return (
    <main className="page child">
      <header className="child-hero">
        <p className="brand">Discere</p>
        <h1>{state.status === 'ready' && state.data.learner ? `Bonjour ${state.data.learner.name} !` : 'Bonjour !'}</h1>
        <p>Choisis ce que tu veux réviser.</p>
      </header>

      {state.status === 'loading' && <Loading />}
      {state.status === 'error' && <LoadError message={state.message} onRetry={state.reload} />}
      {state.status === 'ready' && (
        <>
          {!state.data.learner && (
            <p className="notice">
              Cet appareil n'est pas encore relié à un enfant : tu peux jouer, mais les scores ne sont pas enregistrés.
              Un parent peut le relier depuis l'espace parent.
            </p>
          )}

          {state.data.catalog.chapters.length === 0 ? (
            <p className="muted">Aucun chapitre à réviser pour le moment.</p>
          ) : (
            <>
              <Link className="big-card mix" to="/jouer/melange">
                <span className="big-card-title">Tout mélanger</span>
                <span>Un peu de tout ce que tu travailles en ce moment</span>
              </Link>

              {state.data.catalog.subjects.map((s) => {
                const chapters = state.data.catalog.chapters.filter((c) => c.subject_id === s.id);
                if (chapters.length === 0) return null;
                return (
                  <section key={s.id} className="subject" style={{ ['--subject' as string]: s.color }}>
                    <h2>{s.name}</h2>
                    <div className="chapter-grid">
                      {chapters.map((c) => (
                        <ChapterCard key={c.id} chapter={c} />
                      ))}
                    </div>
                  </section>
                );
              })}
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

function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <Link className="chapter-card" to={`/jouer/${chapter.id}`}>
      <span className="chapter-title">{chapter.title}</span>
      {chapter.status === 'en_cours' && <span className="tag">En ce moment</span>}
    </Link>
  );
}
