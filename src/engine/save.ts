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
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSave(parsed)) {
      clearRun();
      return null;
    }
    return parsed as GameState;
  } catch {
    clearRun();
    return null;
  }
}

function isValidSave(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj["scene"] === "string" &&
    typeof obj["meta"] === "object" &&
    obj["meta"] !== null &&
    typeof (obj["meta"] as Record<string, unknown>)["seed"] === "string"
  );
}

export function clearRun(): void {
  localStorage.removeItem(SAVE_KEY);
}
