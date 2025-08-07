export type ModeKey = 'cards' | 'teams' | 'tournament';

export interface SessionMeta { id: string; createdAt: string; updatedAt: string; }

const listKey = (mode: ModeKey) => `sk:${mode}:sessions`;
const stateKey = (mode: ModeKey, id: string) => `sk:${mode}:${id}`;
const latestKey = (mode: ModeKey) => `sk:${mode}:latest`;

export const StorageSvc = {
  newSession(mode: ModeKey): string {
    const id = cryptoRandom();
    const now = new Date().toISOString();
    const meta = getSessions(mode);
    meta.unshift({ id, createdAt: now, updatedAt: now });
    setItem(listKey(mode), meta);
    localStorage.setItem(latestKey(mode), id);
    return id;
  },
  save<T>(mode: ModeKey, id: string, state: T) {
    if (!id) return;
    localStorage.setItem(stateKey(mode, id), JSON.stringify(state));
    const meta = getSessions(mode);
    const idx = meta.findIndex(m => m.id === id);
    const now = new Date().toISOString();
    if (idx >= 0) meta[idx].updatedAt = now;
    else meta.unshift({ id, createdAt: now, updatedAt: now });
    setItem(listKey(mode), meta);
    localStorage.setItem(latestKey(mode), id);
  },
  loadLatest<T>(mode: ModeKey): { id: string, state: T | null } {
    const id = localStorage.getItem(latestKey(mode)) || '';
    if (!id) return { id: '', state: null };
    const raw = localStorage.getItem(stateKey(mode, id));
    return { id, state: raw ? JSON.parse(raw) as T : null };
  },
  sessions(mode: ModeKey): SessionMeta[] { return getSessions(mode); }
};

function getSessions(mode: ModeKey): SessionMeta[] {
  const raw = localStorage.getItem(listKey(mode));
  try { return raw ? JSON.parse(raw) as SessionMeta[] : []; }
  catch { return []; }
}

function setItem(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

function cryptoRandom() {
  return (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 20);
}
