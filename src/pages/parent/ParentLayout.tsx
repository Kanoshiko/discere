import { Link, NavLink, Outlet } from 'react-router-dom';
import { signOut, useAdmin } from '../../lib/auth';
import Login from './Login';

export default function ParentLayout() {
  const admin = useAdmin();

  if (admin.status === 'loading') return <main className="parent-login"><p className="muted">Chargement…</p></main>;
  if (admin.status === 'signedOut') return <Login />;
  if (admin.status === 'notAdmin') {
    return (
      <main className="parent-login">
        <div className="card stack-sm">
          <h1 className="h-parent">Accès réservé</h1>
          <p>L’adresse <strong>{admin.email}</strong> n’est pas déclarée comme parent.</p>
          <button type="button" className="btn" onClick={signOut}>Se déconnecter</button>
        </div>
      </main>
    );
  }

  return (
    <div className="parent">
      <nav className="parent-nav" aria-label="Espace parent">
        <div className="parent-brand">
          <strong>Discere</strong>
          <span>Espace parent</span>
        </div>
        <NavLink to="/parent" end>Programme</NavLink>
        <NavLink to="/parent/suivi">Suivi</NavLink>
        <NavLink to="/parent/enfants">Enfants et appareils</NavLink>
        <Link to="/">Voir les jeux</Link>
        <div className="parent-nav-foot">
          <span className="small">{admin.email}</span>
          <button type="button" className="link-on-dark small" onClick={signOut}>Se déconnecter</button>
        </div>
      </nav>
      <main className="parent-main">
        <Outlet />
      </main>
    </div>
  );
}
