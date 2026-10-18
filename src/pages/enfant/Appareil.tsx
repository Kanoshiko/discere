import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { isToken, setDeviceToken } from '../../lib/deviceStore';

/** Lien ouvert une fois par le parent : mémorise l'enfant sur cet appareil. */
export default function Appareil() {
  const { token } = useParams();
  const valid = isToken(token);
  useEffect(() => {
    if (valid) setDeviceToken(token!);
  }, [valid, token]);
  if (!valid) {
    return (
      <main className="page">
        <p className="error" role="alert">Ce lien n'est pas valide. Demande à un parent de le recopier.</p>
      </main>
    );
  }
  // setDeviceToken est aussi appelé ici pour que l'accueil le trouve dès son premier rendu
  setDeviceToken(token!);
  return <Navigate to="/" replace />;
}
