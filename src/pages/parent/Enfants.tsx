import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { createLearner, listLearners, renewLearnerToken, type LearnerRow } from '../../lib/parentApi';

const GRADES = ['CE2', 'CM1', 'CM2', '6e'];

export default function Enfants() {
  const [learners, setLearners] = useState<LearnerRow[] | null>(null);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('CM1');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLearners(await listLearners());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim() === '') return setError('Indique le prénom.');
    try {
      await createLearner(name, grade);
      setName('');
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function renew(l: LearnerRow) {
    if (!window.confirm(`Créer un nouveau lien pour ${l.name} ? Les appareils déjà reliés devront être reliés à nouveau.`)) return;
    try {
      await renewLearnerToken(l.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function copy(link: string, id: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt('Copie ce lien :', link);
    }
  }

  return (
    <div className="stack">
      <header>
        <h1 className="h-parent">Enfants et appareils</h1>
        <p className="muted">
          Pour relier une tablette ou un ordinateur à un enfant, ouvre son lien <strong>sur cet appareil</strong> (envoie-le
          par message ou tape-le). L’appareil s’en souvient ensuite : l’enfant arrive directement sur ses jeux et ses
          scores sont enregistrés. Garde ce lien pour toi : il permet d’enregistrer des scores au nom de l’enfant.
        </p>
      </header>

      {error && <p className="error" role="alert">{error}</p>}
      {learners === null && !error && <p className="muted">Chargement…</p>}

      {learners?.map((l) => {
        const link = `${window.location.origin}/appareil/${l.token}`;
        return (
          <section key={l.id} className="card stack-sm">
            <h2>{l.name} <span className="muted small">({l.grade})</span></h2>
            <p className="device-link">{link}</p>
            <div className="row">
              <button type="button" className="btn primary" onClick={() => copy(link, l.id)}>{copied === l.id ? 'Lien copié' : 'Copier le lien'}</button>
              <a className="btn" href={link}>Relier cet appareil-ci</a>
              <button type="button" className="link-button" onClick={() => renew(l)}>Créer un nouveau lien</button>
            </div>
          </section>
        );
      })}

      <form className="card stack-sm" onSubmit={add}>
        <h2>Ajouter un enfant</h2>
        <div className="form-grid">
          <label className="field wide">
            <span className="label">Prénom</span>
            <input className="input" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span className="label">Classe</span>
            <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>
        <div>
          <button type="submit" className="btn primary">Ajouter</button>
        </div>
      </form>
    </div>
  );
}
