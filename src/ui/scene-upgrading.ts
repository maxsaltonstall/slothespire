import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { CARD_DEFS } from "../content/cards";

export function renderUpgrading(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-upgrading";
  const upgradeable = state.deck.filter(c => !c.upgraded && c.type !== "curse");

  const cardsHtml = upgradeable.map(card => {
    const def = CARD_DEFS[card.defId];
    const upgEffects = def?.upgradedEffects ?? def?.upgradedPowerTrigger;
    const preview = upgEffects?.map(e => {
      if (e.kind === "burn") return `Burn ${e.amount}`;
      if (e.kind === "headroom") return `+${e.amount} Headroom`;
      if (e.kind === "draw") return `Draw ${e.amount}`;
      if (e.kind === "restoreBudget") return `Restore ${e.amount}`;
      if (e.kind === "applyStatus") return `${e.status.replace(/_/g," ")} ${e.stacks}`;
      if (e.kind === "removeStatus") return `Remove ${e.status.replace(/_/g," ")}`;
      return "";
    }).filter(Boolean).join(", ") ?? "improved";
    return `
      <div class="upg-card" data-id="${card.instanceId}">
        <div class="uc-cost">${card.cost < 0 ? "☠" : card.cost}</div>
        <div class="uc-name">${card.name} → <span style="color:var(--color-energy)">${card.name}+</span></div>
        <div class="uc-type">${card.type}</div>
        <div class="uc-preview">Upgraded: ${preview}</div>
      </div>
    `;
  }).join("");

  root.innerHTML = `
    <style>
      .scene-upgrading { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 32px; }
      .scene-upgrading h2 { font-family: var(--font-display); font-size: 22px; color: var(--color-accent); letter-spacing: 3px; margin: 0; }
      .upg-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 700px; }
      .upg-card { padding: 12px 16px; background: var(--color-base-deep); border: 1px solid var(--color-border-low); border-radius: 6px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; min-width: 160px; max-width: 220px; transition: border-color 0.1s; }
      .upg-card:hover { border-color: var(--color-energy); }
      .uc-cost { font-family: var(--font-display); font-size: 10px; color: var(--color-pop); }
      .uc-name { font-family: var(--font-display); font-size: 12px; color: var(--color-accent); }
      .uc-type { font-size: 9px; color: var(--color-text-dim); text-transform: uppercase; }
      .uc-preview { font-size: 10px; color: var(--color-energy); margin-top: 2px; }
      .upg-cancel { font-family: var(--font-display); font-size: 11px; letter-spacing: 1px; }
    </style>
    <h2>UPGRADE A CARD</h2>
    <div class="upg-grid">${cardsHtml}</div>
    <button class="upg-cancel" id="upg-cancel">CANCEL</button>
  `;

  root.querySelectorAll<HTMLDivElement>(".upg-card").forEach(card => {
    card.addEventListener("click", () =>
      dispatch({ type: "CHOOSE_CARD_TO_UPGRADE", cardInstanceId: card.dataset.id! })
    );
  });

  root.querySelector<HTMLButtonElement>("#upg-cancel")!
    .addEventListener("click", () => dispatch({ type: "GO_TO_MAP" }));

  return root;
}
