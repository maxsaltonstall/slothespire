import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { loadRun } from "../engine/save";
import { isMuted, toggleMute, sfx } from "./sfx";
import { allUnlocked, ACHIEVEMENT_DEFS } from "../engine/achievements";

export function renderTitle(
  _state: GameState,
  dispatch: (a: Action) => void
): HTMLElement {
  const hasSave = loadRun() !== null;

  const root = document.createElement("div");
  root.className = "scene-title";
  root.innerHTML = `
    <style>
      .scene-title {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        text-align: center; gap: 24px;
      }
      .scene-title h1 {
        font-size: 64px; color: var(--color-accent);
        text-shadow: var(--glow-accent);
        margin: 0; letter-spacing: 4px;
      }
      .scene-title .subtitle {
        color: var(--color-text-dim);
        font-family: var(--font-display);
        letter-spacing: 2px; font-size: 14px;
      }
      .scene-title .menu {
        display: flex; flex-direction: column; gap: 12px;
        margin-top: 24px; min-width: 220px;
      }
      .scene-title .stamp {
        position: fixed; bottom: 8px; right: 12px;
        font-family: var(--font-display); font-size: 10px;
        color: var(--color-text-dim);
      }
      .title-controls {
        position: fixed; bottom: 8px; left: 12px;
      }
      .mute-btn {
        background: transparent; border: 0; box-shadow: none;
        font-size: 18px; cursor: pointer; padding: 4px; opacity: 0.6;
        transition: opacity 0.1s;
      }
      .mute-btn:hover { opacity: 1; transform: none; }
    </style>
    <h1>SLOTHESPIRE</h1>
    <div class="subtitle">// SLO the Spire</div>
    <div class="menu">
      <button class="primary" data-action="new-run">NEW RUN</button>
      ${hasSave
        ? '<button data-action="continue">CONTINUE</button>'
        : '<button data-action="continue" disabled title="No saved run">CONTINUE</button>'}
      <button data-action="codex">CODEX</button>
      <button data-action="achievements">ACHIEVEMENTS (${allUnlocked().length}/${ACHIEVEMENT_DEFS.length})</button>
      <button data-action="settings" disabled title="Coming in M9">SETTINGS</button>
    </div>
    <div class="title-controls">
      <button data-action="mute" class="mute-btn" title="Toggle sound">${isMuted() ? "🔇" : "🔊"}</button>
    </div>
    <div class="stamp">v1.0.0</div>
  `;

  root.querySelector<HTMLButtonElement>('[data-action="new-run"]')!
    .addEventListener("click", () => { sfx.uiClick(); dispatch({ type: "START_RUN" }); });

  root.querySelector<HTMLButtonElement>('[data-action="codex"]')!
    .addEventListener("click", () => { sfx.uiClick(); dispatch({ type: "GO_TO_CODEX", returnScene: "title" }); });

  root.querySelector<HTMLButtonElement>('[data-action="achievements"]')!
    .addEventListener("click", () => { sfx.uiClick(); dispatch({ type: "GO_TO_ACHIEVEMENTS" }); });

  const continueBtn = root.querySelector<HTMLButtonElement>('[data-action="continue"]');
  if (continueBtn && !continueBtn.disabled) {
    continueBtn.addEventListener("click", () => {
      sfx.uiClick();
      const saved = loadRun();
      if (saved) dispatch({ type: "LOAD_RUN", state: saved });
    });
  }

  root.querySelector<HTMLButtonElement>('[data-action="mute"]')!
    .addEventListener("click", (e) => {
      const muted = toggleMute();
      (e.currentTarget as HTMLButtonElement).textContent = muted ? "🔇" : "🔊";
      if (!muted) sfx.uiClick();
    });

  return root;
}
