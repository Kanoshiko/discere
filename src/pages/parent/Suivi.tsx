import { useEffect, useState } from 'react';
import { listAnswers, listChapters, listLearners, listRounds, type AnswerRow, type LearnerRow, type RoundRow } from '../../lib/parentApi';
import { accuracyByChapter, stillToReview } from '../../games/progress';
import { GAME_LABEL, type Chapter } from '../../content/types';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Suivi() {
  const [learners, setLearners] = useState<LearnerRow[] | null>(null);
  const [learnerId, setLearnerId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [rounds, setRounds] = useState<RoundRow[] | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listLearners(), listChapters()])
      .then(([l, c]) => {
        setLearners(l);
        setChapters(c);
        setLearnerId(l[0]?.id ?? null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!learnerId) return;
    setRounds(null);
    Promise.all([listRounds(learnerId), listAnswers(learnerId)])
      .then(([r, a]) => {
        setRounds(r);
        setAnswers(a);
      })
      .catch((e: Error) => setError(e.message));
  }, [learnerId]);

  const chapterTitle = (id: string | null) => (id ? chapters.find((c) => c.id === id)?.title ?? 'Chapitre supprimé' : 'Tout mélangé');
  const accuracy = accuracyByChapter(answers).sort((a, b) => a.correct / a.answered - b.correct / b.answered);
  const review = stillToReview(answers);

  return (
    <div className="stack">
      <header className="row-between">
        <h1 className="h-parent">Suivi</h1>
        {learners && learners.length > 1 && (
          <select className="input auto" value={learnerId ?? ''} onChange={(e) => setLearnerId(e.target.value)} aria-label="Enfant">
            {learners.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        )}
      </header>

      {error && <p className="error" role="alert">{error}</p>}
      {learners?.length === 0 && <p className="card">Ajoute d’abord un enfant dans « Enfants et appareils ».</p>}
      {learnerId && rounds === null && !error && <p className="muted">Chargement…</p>}

      {rounds && (
        <>
          <section className="card stack-sm">
            <h2>Réussite par chapitre <span className="muted small">(30 derniers jours)</span></h2>
            {accuracy.length === 0 ? (
              <p className="muted small">Pas encore de réponses.</p>
            ) : (
              <ul className="bars">
                {accuracy.map((a) => {
                  const pct = Math.round((a.correct / a.answered) * 100);
                  return (
                    <li key={a.chapterId}>
                      <span className="bar-label">{chapterTitle(a.chapterId)}</span>
                      <span className="bar" aria-hidden="true"><span style={{ width: `${pct}%` }} className={pct < 60 ? 'low' : pct < 80 ? 'mid' : 'high'} /></span>
                      <span className="bar-value">{pct} % <span className="muted small">({a.answered})</span></span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card stack-sm">
            <h2>À retravailler</h2>
            <p className="muted small">Questions ratées la dernière fois qu’elles sont tombées. Elles reviennent plus souvent dans les jeux.</p>
            {review.length === 0 ? (
              <p className="muted small">Rien pour le moment.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Question</th><th>Dernière réponse</th><th>Ratée</th></tr></thead>
                <tbody>
                  {review.map((r, i) => (
                    <tr key={i}>
                      <td>{r.prompt}<br /><span className="muted small">{chapterTitle(r.chapterId)}</span></td>
                      <td>{r.lastGiven}</td>
                      <td>{r.misses} fois</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card stack-sm">
            <h2>Dernières parties</h2>
            {rounds.length === 0 ? (
              <p className="muted small">Aucune partie enregistrée.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Quand</th><th>Jeu</th><th>Chapitre</th><th>Score</th></tr></thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr key={r.id}>
                      <td>{dateFormat.format(new Date(r.played_at))}</td>
                      <td>{GAME_LABEL[r.game]}</td>
                      <td>{chapterTitle(r.chapter_id)}</td>
                      <td>{r.score} / {r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
