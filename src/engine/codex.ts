export const CODEX_KEY = "slothespire:codex";

let _cache: Set<string> | null = null;

function load(): Set<string> {
  if (_cache !== null) return _cache;
  try {
    const raw = localStorage.getItem(CODEX_KEY);
    _cache = new Set(raw ? JSON.parse(raw) : []);
  } catch {
    _cache = new Set();
  }
  return _cache;
}

function save(ids: Set<string>): void {
  try {
    localStorage.setItem(CODEX_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage full — non-fatal
  }
}

export function isUnlocked(id: string): boolean {
  return load().has(id);
}

export function unlock(id: string): void {
  const ids = load();
  if (!ids.has(id)) {
    ids.add(id);
    save(ids);
  }
}

export function allUnlocked(): string[] {
  return [...load()];
}

export function clearCodex(): void {
  _cache = new Set();
  localStorage.removeItem(CODEX_KEY);
}
