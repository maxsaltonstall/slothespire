import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";

export function renderCombat(
  state: GameState,
  dispatch: (a: Action) => void
): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-combat";
  const enemy = state.combat?.enemies[0];
  const intent = enemy ? state.combat?.intentByEnemy[enemy.instanceId] : undefined;
  const intentLabel =
    intent?.kind === "burn" ? `⚔ ${intent.amount}` :
    intent?.kind === "harden" ? `🛡 ${intent.amount}` : "?";

  root.innerHTML = `
    <style>
      .scene-combat {
        flex: 1; display: flex; flex-direction: column;
        padding: 24px; gap: 24px;
      }
      .sc-topbar {
        font-family: var(--font-display); font-size: 12px;
        color: var(--color-accent); opacity: 0.7;
      }
      .sc-enemies {
        flex: 1; display: flex; gap: 16px; justify-content: center; align-items: flex-end;
      }
      .sc-enemy { text-align: center; }
      .sc-enemy .intent {
        display: inline-block; padding: 6px 10px;
        color: var(--color-danger); font-family: var(--font-display);
        font-size: 14px; text-shadow: var(--glow-danger);
      }
      .sc-enemy .sprite {
        width: 96px; height: 96px; margin: 4px auto;
        background: var(--color-border-low);
        border: 1px solid var(--color-pop);
        box-shadow: var(--glow-pop);
        display: flex; align-items: center; justify-content: center;
        font-size: 40px; color: var(--color-pop);
      }
      .sc-enemy .name {
        font-family: var(--font-display); font-size: 11px;
        color: var(--color-pop); letter-spacing: 1px;
      }
      .sc-hand {
        display: flex; gap: 12px; justify-content: center;
      }
      .sc-card {
        width: 100px; height: 140px;
        background: var(--color-base); color: var(--color-text);
        border: 1px solid var(--color-accent);
        box-shadow: var(--glow-accent);
        padding: 8px; display: flex; flex-direction: column;
        align-items: center; gap: 6px; cursor: pointer; position: relative;
      }
      .sc-card .cost {
        position: absolute; top: -8px; left: -8px;
        width: 24px; height: 24px; border-radius: 50%;
        background: var(--color-pop); color: white;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); box-shadow: var(--glow-pop);
      }
      .sc-card .cname {
        font-family: var(--font-display); font-size: 10px;
        color: var(--color-accent); text-align: center; letter-spacing: 0.5px;
      }
      .sc-card .cart {
        flex: 1; width: 100%;
        background: var(--color-base-deep);
        border: 1px solid var(--color-border-low);
        display: flex; align-items: center; justify-content: center;
        font-size: 28px; color: var(--color-danger);
      }
      .sc-card .ctext {
        font-size: 8px; text-align: center; opacity: 0.85;
      }
      .sc-status {
        position: fixed; top: 12px; right: 16px;
        font-family: var(--font-display); font-size: 11px;
      }
    </style>
    <div class="sc-topbar">// ACT I · Single-Service SLO · Floor 1 (stub)</div>
    <div class="sc-enemies">
      <div class="sc-enemy">
        <div class="intent">${intentLabel}</div>
        <div class="sprite">▲</div>
        <div class="name">${enemy?.name ?? "—"}</div>
      </div>
    </div>
    <div class="sc-hand">
      <div class="sc-card" data-action="play-card">
        <div class="cost">1</div>
        <div class="cname">MANUAL<br>FIX</div>
        <div class="cart">⚔</div>
        <div class="ctext">Burn 6.<br><em>M1 stub: click to end run.</em></div>
      </div>
    </div>
    <div class="sc-status">
      SLO BUDGET ${state.player.budget}/${state.player.maxBudget}
    </div>
  `;

  root.querySelector<HTMLDivElement>('[data-action="play-card"]')!
    .addEventListener("click", () => dispatch({ type: "PLAY_CARD_STUB" }));

  return root;
}
