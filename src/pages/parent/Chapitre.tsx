import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createItem,
  deleteChapter,
  deleteItem,
  getChapter,
  listItems,
  listSubjects,
  updateChapter,
  updateItem,
} from '../../lib/parentApi';
import { GENERATORS, generatorLabel } from '../../content/generators';
import { validateItem, type ItemDraft } from '../../content/validate';
import { KIND_LABEL, STATUS_LABEL, type Chapter, type ChapterStatus, type Item, type ItemKind, type Subject } from '../../content/types';

const EMPTY: ItemDraft = { kind: 'choix', prompt: '', answer: '', distractors: [], steps: [], explanation: '' };

function toDraft(item: Item): ItemDraft {
  return { kind: item.kind, prompt: item.prompt, answer: item.answer, distractors: item.distractors, steps: item.steps ?? [], explanation: item.explanation ?? '' };
}

export default function Chapitre() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [c, s, i] = await Promise.all([getChapter(id), listSubjects(), listItems(id)]);
      setChapter(c);
      setSubjects(s);
      setItems(i);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveChapter(patch: Partial<Chapter>) {
    if (!chapter) return;
    setError(null);
    try {
      await updateChapter(chapter.id, patch);
      setChapter({ ...chapter, ...patch });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function removeChapter() {
    if (!chapter) return;
    if (!window.confirm(`Supprimer « ${chapter.title} » et ses ${items.length} question(s) ? Les résultats déjà enregistrés pour ce chapitre seront aussi effacés.`)) return;
    try {
      await deleteChapter(chapter.id);
      navigate('/parent');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function removeItem(item: Item) {
    if (!window.confirm('Supprimer cette question ?')) return;
    try {
      await deleteItem(item.id);
      setItems((list) => list.filter((i) => i.id !== item.id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!chapter) {
    return error ? <p className="error" role="alert">{error}</p> : <p className="muted">Chargement…</p>;
  }

  return (
    <div className="stack">
      <Link to="/parent" className="small">← Programme</Link>
      <header className="stack-sm">
        <label className="field">
          <span className="label">Titre du chapitre</span>
          <input
            className="input title-input"
            defaultValue={chapter.title}
            maxLength={80}
            onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== chapter.title && saveChapter({ title: e.target.value.trim() })}
          />
        </label>
        <div className="form-grid">
          <label className="field">
            <span className="label">Matière</span>
            <select className="input" value={chapter.subject_id} onChange={(e) => saveChapter({ subject_id: e.target.value })}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Période</span>
            <select className="input" value={chapter.period ?? ''} onChange={(e) => saveChapter({ period: e.target.value ? Number(e.target.value) : null })}>
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>Période {p}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Statut</span>
            <select className="input" value={chapter.status} onChange={(e) => saveChapter({ status: e.target.value as ChapterStatus })}>
              {(Object.keys(STATUS_LABEL) as ChapterStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Questions générées</span>
            <select className="input" value={chapter.generator ?? ''} onChange={(e) => saveChapter({ generator: e.target.value || null })}>
              <option value="">Aucune</option>
              {Object.entries(GENERATORS).map(([k, g]) => <option key={k} value={k}>{g.label}</option>)}
            </select>
          </label>
        </div>
        {chapter.status !== 'a_venir' && (
          <p className="small"><Link to={`/jouer/${chapter.id}`}>Essayer les jeux de ce chapitre</Link></p>
        )}
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      {chapter.generator ? (
        <p className="card">
          Les questions de ce chapitre sont fabriquées automatiquement ({generatorLabel(chapter.generator)}) : il y en a
          une infinité. Les questions écrites à la main ci-dessous ne sont pas utilisées tant qu’un générateur est choisi.
        </p>
      ) : null}

      <section className="stack-sm">
        <div className="row-between">
          <h2>Questions ({items.length})</h2>
          {editing !== 'new' && <button type="button" className="btn primary" onClick={() => setEditing('new')}>Ajouter une question</button>}
        </div>

        {editing === 'new' && (
          <ItemForm
            initial={EMPTY}
            onCancel={() => setEditing(null)}
            onSave={async (d) => {
              await createItem(chapter.id, d);
              setEditing(null);
              setItems(await listItems(chapter.id));
            }}
          />
        )}

        <ul className="item-list">
          {items.map((item) =>
            editing === item.id ? (
              <li key={item.id}>
                <ItemForm
                  initial={toDraft(item)}
                  onCancel={() => setEditing(null)}
                  onSave={async (d) => {
                    await updateItem(item.id, d);
                    setEditing(null);
                    setItems(await listItems(chapter.id));
                  }}
                />
              </li>
            ) : (
              <li key={item.id} className="card item-row">
                <div>
                  <p className="item-prompt">{item.prompt}</p>
                  <p className="small">
                    <span className="muted">{KIND_LABEL[item.kind]} · </span>
                    <strong>{item.kind === 'ordre' ? (item.steps ?? []).map((s) => s.replace('|', ' : ')).join(' → ') : item.answer}</strong>
                    {item.distractors.length > 0 && <span className="muted"> (et non : {item.distractors.join(', ')})</span>}
                  </p>
                  {item.explanation && <p className="muted small">{item.explanation}</p>}
                </div>
                <div className="item-actions">
                  <button type="button" className="link-button" onClick={() => setEditing(item.id)}>Modifier</button>
                  <button type="button" className="link-button danger" onClick={() => removeItem(item)}>Supprimer</button>
                </div>
              </li>
            ),
          )}
        </ul>
      </section>

      <section className="danger-zone">
        <button type="button" className="btn danger" onClick={removeChapter}>Supprimer ce chapitre</button>
      </section>
    </div>
  );
}

function ItemForm({ initial, onSave, onCancel }: { initial: ItemDraft; onSave: (d: ItemDraft) => Promise<void>; onCancel: () => void }) {
  const [draft, setDraft] = useState<ItemDraft>(initial);
  const [distractorsText, setDistractorsText] = useState(initial.distractors.join('\n'));
  const [stepsText, setStepsText] = useState(initial.steps.join('\n'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const d = { ...draft, distractors: distractorsText.split('\n'), steps: stepsText.split('\n') };
    const problem = validateItem(d);
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      await onSave(d);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="card stack-sm item-form" onSubmit={submit}>
      <label className="field">
        <span className="label">Type</span>
        <select
          className="input"
          value={draft.kind}
          onChange={(e) => {
            const kind = e.target.value as ItemKind;
            setDraft({ ...draft, kind, answer: kind === 'vrai_faux' ? 'vrai' : draft.answer === 'vrai' || draft.answer === 'faux' ? '' : draft.answer });
          }}
        >
          {(Object.keys(KIND_LABEL) as ItemKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
        </select>
      </label>
      <label className="field">
        <span className="label">Question</span>
        <textarea className="input" rows={2} maxLength={300} value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} />
        <span className="muted small">Astuce : « ___ » marque le trou à compléter.</span>
      </label>
      {draft.kind === 'ordre' ? (
        <label className="field">
          <span className="label">Étapes dans le bon ordre (une par ligne, 3 à 8)</span>
          <textarea className="input" rows={6} value={stepsText} onChange={(e) => setStepsText(e.target.value)} placeholder={'Préhistoire|jusqu’à -3 300\nAntiquité|de -3 300 à 476\nMoyen Âge|de 476 à 1492'} />
          <span className="muted small">Détail facultatif après « | » : il s’affiche après la correction. L’enfant voit les étapes mélangées.</span>
        </label>
      ) : draft.kind === 'vrai_faux' ? (
        <fieldset className="field">
          <legend className="label">Bonne réponse</legend>
          <div className="segmented">
            {['vrai', 'faux'].map((v) => (
              <button key={v} type="button" className={draft.answer === v ? 'seg on' : 'seg'} aria-pressed={draft.answer === v} onClick={() => setDraft({ ...draft, answer: v })}>
                {v === 'vrai' ? 'Vrai' : 'Faux'}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <label className="field">
          <span className="label">Bonne réponse</span>
          <input className="input" maxLength={100} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} />
          {draft.kind === 'saisie' && (
            <span className="muted small">Plusieurs réponses acceptées ? Sépare-les par « | ». Majuscules et espaces ne comptent pas ; les accents, si.</span>
          )}
        </label>
      )}
      {draft.kind === 'choix' && (
        <label className="field">
          <span className="label">Mauvaises réponses proposées (une par ligne, 5 au plus)</span>
          <textarea className="input" rows={3} value={distractorsText} onChange={(e) => setDistractorsText(e.target.value)} />
        </label>
      )}
      <label className="field">
        <span className="label">Explication montrée après la réponse (facultatif)</span>
        <textarea className="input" rows={2} maxLength={300} value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        <button type="button" className="btn" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  );
}
