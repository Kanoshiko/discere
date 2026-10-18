export function Loading() {
  return <p className="muted loading">Chargement…</p>;
}

export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error" role="alert">
      <p>Impossible de charger les jeux : {message}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>Réessayer</button>
      )}
    </div>
  );
}
