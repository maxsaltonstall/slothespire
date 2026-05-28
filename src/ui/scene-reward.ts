import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { CARD_DEFS } from "../content/cards";

export function renderReward(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-reward";
  const offered = state.rewardCards ?? [];

  const cardsHtml = offered.map(card => {
    const def = CARD_DEFS[card.defId];
    const effectText = def?.effects.map(e => {
      if (e.kind === "burn") return `Burn ${e.amount}`;
      if (e.kind === "headroom") return `+${e.amount} Headroom`;
      if (e.kind === "draw") return `Draw ${e.amount}`;
      if (e.kind === "selfBurn") return `Self-Burn ${e.amount}`;
      if (e.kind === "applyStatus") return `Apply ${e.status.replace(/_/g, " ")} ×${e.stacks}`;
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
