import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";

export function renderRest(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-rest";
  const healAmount = Math.floor(state.player.maxBudget * 0.3);
  const wouldHeal = Math.min(state.player.maxBudget, state.player.budget + healAmount) - state.player.budget;
  const firstUpgradable = state.deck.find(c => !c.upgraded);

  root.innerHTML = `
    <style>
      .scene-rest { flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 32px; }
      .scene-rest h2 { font-size: 28px; color: var(--color-accent);
        font-family: var(--font-display); margin: 0; letter-spacing: 3px; }
      .rest-subtext { color: var(--color-text-dim); font-family: var(--font-display); font-size: 12px; }
      .rest-choices { display: flex; gap: 20px; }
      .rest-choice {
        width: 200px; padding: 20px; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low); border-radius: 8px;
        text-align: center; cursor: pointer; transition: border-color 0.1s;
      }
      .rest-choice:not(.disabled):hover { border-color: var(--color-accent); }
      .rest-choice.disabled { opacity: 0.5; cursor: default; }
      .rest-choice h3 { font-family: var(--font-display); color: var(--color-accent);
        font-size: 14px; margin: 0 0 8px; }
      .rest-choice p { font-size: 11px; opacity: 0.8; margin: 0; }
    </style>
    <h2>POSTMORTEM</h2>
    <div class="rest-subtext">// What did we learn?</div>
    <div class="rest-choices">
      <div class="rest-choice" data-option="refresh">
        <h3>Window Refresh</h3>
        <p>Restore +${wouldHeal} SLO Budget<br>(30% of max)</p>
      </div>
      <div class="rest-choice ${firstUpgradable ? "" : "disabled"}" data-option="upgrade">
        <h3>Upgrade</h3>
        <p>${firstUpgradable ? `Upgrade: ${firstUpgradable.name}` : "Nothing upgradeable"}</p>
      </div>
    </div>
  `;

  root.querySelectorAll<HTMLDivElement>(".rest-choice:not(.disabled)").forEach(el => {
    el.addEventListener("click", () =>
      dispatch({ type: "CHOOSE_REST_OPTION", option: el.dataset.option as "refresh" | "upgrade" })
    );
  });

  return root;
}
