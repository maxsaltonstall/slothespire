import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { loadRun } from "../engine/save";

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
    </style>
    <h1>SLOTHESPIRE</h1>
    <div class="subtitle">// SLO the Spire</div>
    <div class="menu">
      <button class="primary" data-action="new-run">NEW RUN</button>
      ${hasSave
        ? '<button data-action="continue">CONTINUE</button>'
        : '<button data-action="continue" disabled title="No saved run">CONTINUE</button>'}
      <button data-action="codex" disabled title="Coming in M6">CODEX</button>
      <button data-action="settings" disabled title="Coming in M9">SETTINGS</button>
    </div>
    <div class="stamp">v0.0.1 — M1 walking skeleton</div>
  `;

  root.querySelector<HTMLButtonElement>('[data-action="new-run"]')!
    .addEventListener("click", () => dispatch({ type: "START_RUN" }));

  const continueBtn = root.querySelector<HTMLButtonElement>('[data-action="continue"]');
  if (continueBtn && !continueBtn.disabled) {
    continueBtn.addEventListener("click", () => {
      const saved = loadRun();
      if (saved) dispatch({ type: "LOAD_RUN", state: saved });
    });
  }

  return root;
}
