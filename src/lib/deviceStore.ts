// Jeton de l'enfant mémorisé sur son appareil (tablette, ordinateur de la maison).
// Le parent ouvre une fois le lien /appareil/:token ; ensuite l'enfant arrive
// directement sur ses jeux.
const KEY = 'discere.learnerToken';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isToken(value: string | undefined): value is string {
  return Boolean(value && UUID.test(value));
}

export function getDeviceToken(): string | null {
  try {
    const t = localStorage.getItem(KEY);
    return isToken(t ?? undefined) ? t : null;
  } catch {
    return null;
  }
}

export function setDeviceToken(token: string) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // stockage indisponible (navigation privée) : le lien reste utilisable à chaque fois
  }
}

export function clearDeviceToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // rien à faire
  }
}
