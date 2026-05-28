import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { ACHIEVEMENT_DEFS, isUnlocked, allUnlocked } from "../engine/achievements";

export function renderAchievements(
  _state: GameState,
  dispatch: (a: Action) => void
): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-achievements";
  const earned = allUnlocked().length;
  const total = ACHIEVEMENT_DEFS.length;

  const rowsHtml = ACHIEVEMENT_DEFS.map(def => {
    const unlocked = isUnlocked(def.id);
    if (!unlocked && def.secret) {
      return `
        <div class="achv-row locked">
          <span class="achv-icon">?</span>
          <div class="achv-info">
            <div class="achv-name">???</div>
            <div class="achv-desc">Hidden achievement</div>
          </div>
        </div>`;
    }
    return `
      <div class="achv-row ${unlocked ? "unlocked" : "locked"}">
        <span class="achv-icon">${def.icon}</span>
        <div class="achv-info">
          <div class="achv-name">${def.name}</div>
          <div class="achv-desc">${def.description}</div>
        </div>
        ${unlocked ? '<span class="achv-check">✓</span>' : ''}
      </div>`;
  }).join("");

  root.innerHTML = `
    <style>
      .scene-achievements { flex: 1; display: flex; flex-direction: column; padding: 32px; gap: 16px; max-width: 600px; margin: 0 auto; }
      .achv-header { font-family: var(--font-display); font-size: 22px; color: var(--color-accent); letter-spacing: 3px; }
      .achv-progress { font-family: var(--font-display); font-size: 11px; color: var(--color-text-dim); }
      .achv-progress b { color: var(--color-energy); }
      .achv-list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; flex: 1; }
      .achv-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px;
        background: var(--color-base-deep); border: 1px solid var(--color-border-low); border-radius: 5px; }
      .achv-row.unlocked { border-color: var(--color-energy); }
      .achv-row.locked { opacity: 0.45; }
      .achv-icon { font-size: 22px; min-width: 30px; text-align: center; }
      .achv-info { flex: 1; }
      .achv-name { font-family: var(--font-display); font-size: 12px; color: var(--color-accent); }
      .achv-row.locked .achv-name { color: var(--color-text-dim); }
      .achv-desc { font-size: 10px; opacity: 0.75; margin-top: 2px; }
      .achv-check { color: var(--color-energy); font-family: var(--font-display); font-size: 14px; }
      .achv-back { font-family: var(--font-display); font-size: 12px; letter-spacing: 1px; width: 140px; }
    </style>
    <div class="achv-header">// ACHIEVEMENTS</div>
    <div class="achv-progress"><b>${earned}</b> / ${total} unlocked</div>
    <div class="achv-list">${rowsHtml}</div>
    <button class="achv-back" id="achv-back">← BACK</button>
  `;

  root.querySelector<HTMLButtonElement>("#achv-back")!
    .addEventListener("click", () => dispatch({ type: "RETURN_TO_TITLE" }));

  return root;
}
