import type { GameState } from "./state";

export const SAVE_KEY = "slothespire:run";

export function saveRun(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    console.warn("[slothespire] could not save run");
  }
}

export function loadRun(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearRun(): void {
  localStorage.removeItem(SAVE_KEY);
}
