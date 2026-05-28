import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { CARD_DEFS } from "../content/cards";
import { RELIC_DEFS } from "../content/relics";

export function renderReward(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-reward";

  if (state.rewardRelic) {
    const relic = RELIC_DEFS[state.rewardRelic];
    root.innerHTML = `
      <style>
        .scene-reward { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
        .relic-box { padding: 28px 40px; background: var(--color-base-deep); border: 1px solid var(--color-energy); border-radius: 8px; text-align: center; box-shadow: 0 0 20px rgba(255,211,77,0.3); max-width: 400px; }
        .relic-name { font-family: var(--font-display); font-size: 18px; color: var(--color-energy); margin-bottom: 4px; }
        .relic-product { font-size: 11px; color: var(--color-text-dim); font-family: var(--font-display); margin-bottom: 12px; }
        .relic-desc { font-size: 12px; line-height: 1.6; }
        .relic-flavor { font-size: 10px; font-style: italic; opacity: 0.5; margin-top: 10px; }
      </style>
      <h2 style="font-family:var(--font-display);color:var(--color-energy);letter-spacing:3px;font-size:24px;">RELIC FOUND</h2>
      <div class="relic-box">
        <div class="relic-name">${relic?.name ?? state.rewardRelic}</div>
        <div class="relic-product">${relic?.product ?? ""}</div>
        <div class="relic-desc">${relic?.description ?? ""}</div>
        <div class="relic-flavor">"${relic?.flavor ?? ""}"</div>
      </div>
      <button id="accept-relic" class="primary" style="font-family:var(--font-display);font-size:13px;letter-spacing:1px;">ACCEPT RELIC</button>
    `;
    root.querySelector<HTMLButtonElement>("#accept-relic")!
      .addEventListener("click", () => dispatch({ type: "PICK_REWARD_RELIC" }));
    return root;
  }

  const offered = state.rewardCards ?? [];

  const cardsHtml = offered.map(card => {
    const def = CARD_DEFS[card.defId];
    const effectText = def?.effects.map(e => {
      if (e.kind === "burn") return `Burn ${e.amount}`;
      if (e.kind === "headroom") return `+${e.amount} Headroom`;
      if (e.kind === "draw") return `Draw ${e.amount}`;
      if (e.kind === "selfBurn") return `Self-Burn ${e.amount}`;
      if (e.kind === "applyStatus") return `Apply ${e.status.replace(/_/g, " ")} ×${e.stacks}`;
      if (e.kind === "restoreBudget") return `Restore ${e.amount} Budget`;
      return "";
    }).filter(Boolean).join(". ") ?? "";
    const typeIcon = card.type === "attack" ? "⚔" : card.type === "power" ? "✦" : "🛡";
    return `
      <div class="reward-card" data-card-id="${card.instanceId}">
        <div class="rc-cost">${card.cost < 0 ? "!" : card.cost}</div>
        <div class="rc-name">${card.name}</div>
        <div class="rc-art">${typeIcon}</div>
        <div class="rc-text">${effectText || def?.flavor || ""}</div>
      </div>
    `;
  }).join("");

  root.innerHTML = `
    <style>
      .scene-reward { flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 32px; }
      .scene-reward h2 { font-size: 28px; color: var(--color-accent); font-family: var(--font-display);
        letter-spacing: 3px; margin: 0; text-shadow: var(--glow-accent); }
      .reward-cards { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
      .reward-card {
        width: 130px; min-height: 180px; background: var(--color-base);
        border: 1px solid var(--color-accent); border-radius: 8px;
        box-shadow: var(--glow-accent); padding: 10px;
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        cursor: pointer; position: relative; transition: transform 0.1s;
      }
      .reward-card:hover { transform: translateY(-8px); }
      .rc-cost {
        position: absolute; top: -8px; left: -8px; width: 24px; height: 24px; border-radius: 50%;
        background: var(--color-pop); color: white;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); box-shadow: var(--glow-pop); font-size: 12px;
      }
      .rc-name { font-family: var(--font-display); font-size: 10px; color: var(--color-accent); text-align: center; }
      .rc-art { font-size: 32px; color: var(--color-danger); margin: 6px 0; }
      .rc-text { font-size: 9px; text-align: center; opacity: 0.85; line-height: 1.3; }
      .reward-skip { font-family: var(--font-display); font-size: 12px; letter-spacing: 1px; }
    </style>
    <h2>CHOOSE A CARD</h2>
    <div class="reward-cards">${cardsHtml}</div>
    <button class="reward-skip" id="skip-reward">SKIP</button>
  `;

  root.querySelectorAll<HTMLDivElement>(".reward-card").forEach(el => {
    el.addEventListener("click", () =>
      dispatch({ type: "PICK_REWARD_CARD", cardInstanceId: el.dataset.cardId! })
    );
  });

  root.querySelector<HTMLButtonElement>("#skip-reward")!
    .addEventListener("click", () =>
      dispatch({ type: "PICK_REWARD_CARD", cardInstanceId: null })
    );

  return root;
}
