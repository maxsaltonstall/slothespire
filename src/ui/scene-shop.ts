import type { GameState, Card } from "../engine/state";
import type { Action } from "../engine/actions";
import { HOTFIX_DEFS } from "../content/hotfixes";

function cardRow(card: Card, btnClass: string, btnText: string, disabled: boolean): string {
  return `
    <div class="shop-row">
      <span class="sr-cost">${card.cost < 0 ? "☠" : card.cost}${card.upgraded ? "+" : ""}</span>
      <span class="sr-name">${card.name}</span>
      <span class="sr-type">${card.type}</span>
      <button class="${btnClass}" data-id="${card.instanceId}" ${disabled ? "disabled" : ""}>${btnText}</button>
    </div>
  `;
}

export function renderShop(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-shop";
  const shopCards = state.shopCards ?? [];
  const PRICE = 90;
  const REMOVE_COST = 75;

  const forSaleHtml = shopCards.length > 0
    ? shopCards.map(c => cardRow(c, "buy-btn", `BUY (${PRICE}¢)`, state.credits < PRICE)).join("")
    : `<span class="shop-empty">No cards in stock</span>`;

  const hotfixHtml = Object.values(HOTFIX_DEFS).map(hf => {
    const alreadyOwned = state.player.hotfixes.includes(hf.id);
    const slotsFull = state.player.hotfixes.length >= 3;
    const cantAfford = state.credits < 60;
    const disabled = alreadyOwned || slotsFull || cantAfford;
    const reason = alreadyOwned ? "owned" : slotsFull ? "slots full" : cantAfford ? "insufficient ¢" : "";
    return `
      <div class="shop-row">
        <span class="sr-cost">💊</span>
        <span class="sr-name">${hf.name}</span>
        <span class="sr-type">hotfix</span>
        <button class="buy-btn" data-hotfix="${hf.id}" ${disabled ? "disabled" : ""}>
          BUY (60¢)${reason ? ` — ${reason}` : ""}
        </button>
      </div>
    `;
  }).join("");

  const deckHtml = state.deck.map(c => cardRow(c, "remove-btn", `Remove (${REMOVE_COST}¢)`, state.credits < REMOVE_COST)).join("");

  root.innerHTML = `
    <style>
      .scene-shop { flex: 1; display: flex; flex-direction: column; padding: 24px; gap: 16px; overflow-y: auto; }
      .scene-shop h2 { font-family: var(--font-display); font-size: 22px; color: var(--color-accent); letter-spacing: 3px; margin: 0; }
      .shop-credits { font-family: var(--font-display); font-size: 14px; color: var(--color-energy); }
      .shop-section { font-family: var(--font-display); font-size: 10px; color: var(--color-text-dim); letter-spacing: 1px; border-bottom: 1px solid var(--color-border-low); padding-bottom: 4px; margin-top: 8px; }
      .shop-empty { font-size: 11px; opacity: 0.4; font-family: var(--font-display); }
      .shop-row { display: flex; align-items: center; gap: 8px; padding: 5px 8px; background: var(--color-base-deep); border: 1px solid var(--color-border-low); border-radius: 3px; font-family: var(--font-display); font-size: 11px; }
      .sr-cost { width: 20px; text-align: center; color: var(--color-pop); }
      .sr-name { flex: 1; color: var(--color-accent); }
      .sr-type { font-size: 9px; color: var(--color-text-dim); text-transform: uppercase; min-width: 50px; }
      .buy-btn, .remove-btn { padding: 3px 8px; border: 1px solid; background: transparent; font-family: var(--font-display); font-size: 9px; cursor: pointer; letter-spacing: 0.5px; }
      .buy-btn { border-color: var(--color-accent); color: var(--color-accent); }
      .buy-btn:hover:not([disabled]) { background: var(--color-accent); color: var(--color-base); }
      .remove-btn { border-color: var(--color-danger); color: var(--color-danger); }
      .remove-btn:hover:not([disabled]) { background: var(--color-danger); color: white; }
      button[disabled] { opacity: 0.35; cursor: default; pointer-events: none; }
      .shop-leave { font-family: var(--font-display); font-size: 11px; letter-spacing: 1px; margin-top: 8px; width: 130px; }
    </style>
    <h2>// BUILD SERVER</h2>
    <div class="shop-credits">CREDITS: ${state.credits}</div>
    <div class="shop-section">CARDS FOR SALE — ${PRICE}¢ each</div>
    ${forSaleHtml}
    <div class="shop-section">HOTFIXES — 60¢ each</div>
    ${hotfixHtml}
    <div class="shop-section">YOUR DECK — Remove a Card (${REMOVE_COST}¢)</div>
    ${deckHtml}
    <button class="shop-leave" id="leave-shop">LEAVE SHOP</button>
  `;

  root.querySelectorAll<HTMLButtonElement>(".buy-btn:not([disabled])[data-id]").forEach(btn => {
    btn.addEventListener("click", () => dispatch({ type: "BUY_CARD", cardInstanceId: btn.dataset.id! }));
  });
  root.querySelectorAll<HTMLButtonElement>("[data-hotfix]:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => dispatch({ type: "BUY_HOTFIX", hotfixId: btn.dataset.hotfix! }));
  });
  root.querySelectorAll<HTMLButtonElement>(".remove-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => dispatch({ type: "REMOVE_CARD", cardInstanceId: btn.dataset.id! }));
  });
  root.querySelector<HTMLButtonElement>("#leave-shop")!
    .addEventListener("click", () => dispatch({ type: "GO_TO_MAP" }));

  return root;
}
