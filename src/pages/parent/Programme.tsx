import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  createChapter,
  itemCounts,
  listChapters,
  listSubjects,
  updateChapter,
  updateSubjectElement,
  type ChapterDraft,
} from '../../lib/parentApi';
import { ElementIcon } from '../../components/Element';
import { ELEMENTS, ELEMENT_NAME } from '../../games/ranks';
import { GENERATORS, generatorLabel } from '../../content/generators';
import { STATUS_LABEL, type Chapter, type ChapterStatus, type Element, type Subject } from '../../content/types';

const STATUSES: ChapterStatus[] = ['a_venir', 'en_cours', 'revision'];

export default function Programme() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, c, n] = await Promise.all([listSubjects(), listChapters(), itemCounts()]);
      setSubjects(s);
      setChapters(c);
      setCounts(n);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(chapter: Chapter, status: ChapterStatus) {
    setError(null);
    setChapters((list) => list?.map((c) => (c.id === chapter.id ? { ...c, status } : c)) ?? null);
    try {
      await updateChapter(chapter.id, { status });
    } catch (e) {
      setError((e as Error).message);
      load();
    }
  }

  async function setElement(subject: Subject, element: Element) {
    setError(null);
    setSubjects((list) => list.map((s) => (s.id === subject.id ? { ...s, element } : s)));
    try {
      await updateSubjectElement(subject.id, element);
    } catch (e) {
      setError((e as Error).message);
      load();
    }
  }

  return (
    <div className="stack">
      <header>
        <h1 className="h-parent">Programme</h1>
        <p className="muted">
          Au fil de l’année, passe les chapitres de « À venir » à « En cours » quand ils sont vus en classe,
          puis à « Révision ». Les chapitres en cours reviennent trois fois plus souvent dans « L’épreuve de l’Avatar ». Chaque matière est rattachée à un élément (feu, air, eau, terre) qui donne ses couleurs aux jeux et compte pour la progression de l’enfant.
        </p>
      </header>

      {error && <p className="error" role="alert">{error}</p>}
      {chapters === null && !error && <p className="muted">Chargement…</p>}

      {chapters &&
        subjects.map((s) => {
          const list = chapters.filter((c) => c.subject_id === s.id);
          return (
            <section key={s.id} className="card stack-sm" data-element={s.element}>
              <div className="row-between">
                <h2 className="subject-heading">
                  <ElementIcon element={s.element} size={30} />
                  {s.name}
                </h2>
                <label className="row small">
                  Élément
                  <select className="input auto" value={s.element} onChange={(e) => setElement(s, e.target.value as Element)}>
                    {ELEMENTS.map((el) => <option key={el} value={el}>{ELEMENT_NAME[el]}</option>)}
                  </select>
                </label>
              </div>
              {list.length === 0 ? (
                <p className="muted small">Aucun chapitre.</p>
              ) : (
                <ul className="chapter-rows">
                  {list.map((c) => (
                    <li key={c.id}>
                      <div>
                        <Link to={`/parent/chapitre/${c.id}`} className="chapter-link">{c.title}</Link>
                        <span className="muted small">
                          {c.period ? `Période ${c.period} · ` : ''}
                          {c.generator ? generatorLabel(c.generator) : `${counts[c.id] ?? 0} question${(counts[c.id] ?? 0) > 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <div className="segmented" role="group" aria-label={`Statut de ${c.title}`}>
                        {STATUSES.map((st) => (
                          <button
                            key={st}
                            type="button"
                            className={c.status === st ? `seg on ${st}` : 'seg'}
                            aria-pressed={c.status === st}
                            onClick={() => setStatus(c, st)}
                          >
                            {STATUS_LABEL[st]}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

      {chapters && <NewChapter subjects={subjects} position={chapters.length + 1} onCreated={load} />}
    </div>
  );
}

function NewChapter({ subjects, position, onCreated }: { subjects: Subject[]; position: number; onCreated: () => void }) {
  const empty: ChapterDraft = { subject_id: subjects[0]?.id ?? '', title: '', grade: 'CM1', period: null, status: 'a_venir', generator: null };
  const [draft, setDraft] = useState<ChapterDraft>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!draft.subject_id) return setError('Choisis une matière.');
    if (draft.title.trim() === '') return setError('Donne un titre au chapitre.');
    setBusy(true);
    try {
      await createChapter(draft, position);
      setDraft({ ...empty, subject_id: draft.subject_id });
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card stack-sm" onSubmit={submit}>
      <h2>Ajouter un chapitre</h2>
      <div className="form-grid">
        <label className="field">
          <span className="label">Matière</span>
          <select className="input" value={draft.subject_id} onChange={(e) => setDraft({ ...draft, subject_id: e.target.value })}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="field wide">
          <span className="label">Titre</span>
          <input className="input" value={draft.title} maxLength={80} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </label>
        <label className="field">
          <span className="label">Période</span>
          <select className="input" value={draft.period ?? ''} onChange={(e) => setDraft({ ...draft, period: e.target.value ? Number(e.target.value) : null })}>
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>Période {p}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="label">Statut</span>
          <select className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ChapterStatus })}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </label>
        <label className="field wide">
          <span className="label">Questions</span>
          <select className="input" value={draft.generator ?? ''} onChange={(e) => setDraft({ ...draft, generator: e.target.value || null })}>
            <option value="">Écrites à la main</option>
            {Object.entries(GENERATORS).map(([k, g]) => <option key={k} value={k}>Générées : {g.label}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div>
        <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Ajout…' : 'Ajouter'}</button>
      </div>
    </form>
  );
}
