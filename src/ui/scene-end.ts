import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { RELIC_DEFS } from "../content/relics";

export function renderEnd(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-end";
  const won = state.scene === "won";
  const headline = won ? "RUN COMPLETE" : "BUDGET BREACHED";
  const flavor = won
    ? "You held the SLO. The sloths sleep easier tonight."
    : "Service degraded. Customers noticed. Postmortem next sprint.";

  const cardsAcquired = Math.max(0, state.deck.length - 10);
  const relicNames = state.player.relics.map(id => RELIC_DEFS[id]?.name ?? id).join(", ") || "None";
  const actReached = state.map.act === 2 ? "Act II" : "Act I";

  root.innerHTML = `
    <style>
      .scene-end {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 20px; text-align: center; padding: 32px;
      }
      .scene-end h2 {
        font-size: 36px; letter-spacing: 4px;
        color: ${won ? "var(--color-accent)" : "var(--color-danger)"};
        text-shadow: ${won ? "var(--glow-accent)" : "var(--glow-danger)"};
        margin: 0;
      }
      .scene-end .flavor { max-width: 420px; opacity: 0.8; font-family: var(--font-display); font-size: 12px; line-height: 1.5; }
      .run-stats {
        display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px;
        background: var(--color-base-deep); border: 1px solid var(--color-border-low);
        border-radius: 6px; padding: 16px 24px; font-family: var(--font-display);
        font-size: 11px; max-width: 400px; width: 100%; text-align: left;
      }
      .stat-label { color: var(--color-text-dim); }
      .stat-value { color: var(--color-accent); text-align: right; }
      .relics-row { grid-column: 1 / -1; display: flex; gap: 8px; flex-wrap: wrap; }
      .relics-label { color: var(--color-text-dim); min-width: 80px; flex-shrink: 0; }
      .relics-list { color: var(--color-energy); flex: 1; }
    </style>
    <h2>${headline}</h2>
    <div class="flavor">${flavor}</div>
    <div class="run-stats">
      <span class="stat-label">ACT REACHED</span>
      <span class="stat-value">${actReached}</span>
      <span class="stat-label">CARDS ACQUIRED</span>
      <span class="stat-value">+${cardsAcquired} (${state.deck.length} total)</span>
      <span class="stat-label">RELICS HELD</span>
      <span class="stat-value">${state.player.relics.length}</span>
      <span class="stat-label">CREDITS LEFT</span>
      <span class="stat-value">${state.credits}¢</span>
      <span class="stat-label">SEED</span>
      <span class="stat-value" style="font-size:9px;opacity:0.6">${state.meta.seed.slice(0, 12)}</span>
      ${state.player.relics.length > 0 ? `
      <div class="relics-row">
        <span class="relics-label">RELICS</span>
        <span class="relics-list">${relicNames}</span>
      </div>` : ""}
    </div>
    <button class="primary" data-action="return-title">RETURN TO TITLE</button>
  `;

  root.querySelector<HTMLButtonElement>('[data-action="return-title"]')!
    .addEventListener("click", () => dispatch({ type: "RETURN_TO_TITLE" }));

  return root;
}
