import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";

export function renderShop(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-shop";

  root.innerHTML = `
    <style>
      .scene-shop { flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 32px; padding: 48px; }
      .scene-shop h2 { font-size: 28px; color: var(--color-accent);
        font-family: var(--font-display); margin: 0; letter-spacing: 3px; }
      .shop-credits { font-family: var(--font-display); font-size: 14px; color: var(--color-energy); }
      .shop-service {
        padding: 20px 32px; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low); border-radius: 8px; text-align: center;
      }
      .shop-service h3 { font-family: var(--font-display); color: var(--color-accent);
        font-size: 14px; margin: 0 0 8px; }
      .shop-service p { font-size: 11px; opacity: 0.7; margin: 4px 0; }
      .shop-note { font-size: 10px; color: var(--color-text-dim); font-family: var(--font-display); }
      .shop-leave { font-family: var(--font-display); font-size: 12px; letter-spacing: 1px; }
    </style>
    <h2>// BUILD SERVER</h2>
    <div class="shop-credits">CREDITS: ${state.credits}</div>
    <div class="shop-service">
      <h3>Card Removal</h3>
      <p>Remove a card from your deck permanently.</p>
      <p style="color:var(--color-energy)">75 credits</p>
      <p style="color:var(--color-text-dim);font-size:10px">${state.credits >= 75 ? "Available" : "Insufficient credits"}</p>
    </div>
    <div class="shop-note">// Full inventory available in next update</div>
    <button class="shop-leave" id="leave-shop">LEAVE SHOP</button>
  `;

  root.querySelector<HTMLButtonElement>("#leave-shop")!
    .addEventListener("click", () => dispatch({ type: "GO_TO_MAP" }));

  return root;
}
