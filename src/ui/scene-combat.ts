import type { GameState, Card, Intent } from "../engine/state";
import type { Action } from "../engine/actions";
import { CARD_DEFS } from "../content/cards";

function intentLabel(intent: Intent | undefined): { icon: string; text: string; colorClass: string } {
  if (!intent) return { icon: "?", text: "Unknown", colorClass: "intent-unknown" };
  switch (intent.kind) {
    case "burn":   return { icon: "⚔", text: String(intent.amount), colorClass: "intent-burn" };
    case "harden": return { icon: "🛡", text: String(intent.amount), colorClass: "intent-harden" };
    case "buff":   return { icon: "⬆", text: intent.status, colorClass: "intent-buff" };
    case "debuff": return { icon: "⬇", text: intent.status, colorClass: "intent-debuff" };
    case "multi":  return { icon: "✦", text: intent.label, colorClass: "intent-multi" };
    case "unknown":return { icon: "?", text: "...", colorClass: "intent-unknown" };
  }
}

function cardIconFor(type: Card["type"]): { icon: string; colorClass: string } {
  switch (type) {
    case "attack": return { icon: "⚔", colorClass: "icon-burn" };
    case "skill":  return { icon: "🛡", colorClass: "icon-harden" };
    case "power":  return { icon: "✦", colorClass: "icon-multi" };
    case "curse":  return { icon: "☠", colorClass: "icon-danger" };
    case "status": return { icon: "⚡", colorClass: "icon-buff" };
  }
}

function renderCard(card: Card, dispatch: (a: Action) => void, targetId: string | null): HTMLElement {
  const def = CARD_DEFS[card.defId];
  const { icon, colorClass } = cardIconFor(card.type);
  const effectText = def?.effects.map(e => {
    if (e.kind === "burn") return `Burn ${e.amount}`;
    if (e.kind === "headroom") return `+${e.amount} Headroom`;
    if (e.kind === "draw") return `Draw ${e.amount}`;
    return "";
  }).join(". ") ?? "";

  const el = document.createElement("div");
  el.className = "sc-card";
  el.innerHTML = `
    <div class="sc-card-cost">${card.cost}</div>
    <div class="sc-card-name">${card.name}</div>
    <div class="sc-card-art ${colorClass}">${icon}</div>
    <div class="sc-card-text">${effectText}</div>
  `;
  el.addEventListener("click", () =>
    dispatch({ type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId })
  );
  return el;
}

export function renderCombat(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-combat";

  if (!state.combat) {
    root.textContent = "No combat in progress.";
    return root;
  }

  const { enemies, intentByEnemy, turn } = state.combat;
  const firstEnemy = enemies[0];
  const targetId = firstEnemy?.instanceId ?? null;
  const { hand, draw, discard, exhaust, budget, maxBudget, energy, energyPerTurn, headroom } = state.player;

  const enemiesHtml = enemies.map(enemy => {
    const intent = intentByEnemy[enemy.instanceId];
    const { icon, text, colorClass } = intentLabel(intent);
    const stabPct = Math.round((enemy.stability / enemy.maxStability) * 100);
    return `
      <div class="sc-enemy">
        <div class="sc-intent ${colorClass}">${icon} ${text}</div>
        <div class="sc-sprite">▲</div>
        <div class="sc-enemy-name">${enemy.name}</div>
        <div class="sc-stab-bar"><div class="sc-stab-fill" style="width:${stabPct}%"></div></div>
        <div class="sc-enemy-hp">${enemy.stability} / ${enemy.maxStability}</div>
      </div>
    `;
  }).join("");

  root.innerHTML = `
    <style>
      .scene-combat {
        flex: 1; display: grid;
        grid-template-columns: 80px 1fr 130px;
        grid-template-rows: 28px 1fr auto auto 36px;
        grid-template-areas:
          "topbar topbar topbar"
          "piles enemies stats"
          "piles play stats"
          "piles hand action"
          "foot foot foot";
        gap: 4px; height: 100vh;
      }
      .sc-topbar {
        grid-area: topbar; background: var(--color-base-deep);
        border-bottom: 1px solid var(--color-accent);
        font-family: var(--font-display); font-size: 11px;
        color: var(--color-accent); opacity: 0.7;
        display: flex; align-items: center; padding: 0 12px; gap: 16px;
      }
      .sc-topbar .turn { margin-left: auto; }
      .sc-piles {
        grid-area: piles; background: var(--color-base-deep);
        border-right: 1px solid var(--color-border-low);
        display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px;
      }
      .sc-pile {
        width: 60px; padding: 4px 2px; text-align: center;
        border: 1px solid var(--color-border-low); border-radius: 3px;
        font-size: 9px; font-family: var(--font-display);
      }
      .sc-pile .sc-pile-n { color: var(--color-accent); font-size: 13px; }
      .sc-enemies {
        grid-area: enemies; display: flex; gap: 16px;
        justify-content: center; align-items: flex-end; padding-bottom: 12px;
      }
      .sc-enemy { text-align: center; width: 130px; }
      .sc-intent {
        display: inline-block; font-family: var(--font-display);
        font-size: 14px; padding: 4px 8px; margin-bottom: 4px;
      }
      .intent-burn   { color: var(--color-danger); text-shadow: var(--glow-danger); }
      .intent-harden { color: var(--color-accent); text-shadow: var(--glow-accent); }
      .intent-buff   { color: var(--color-energy); }
      .intent-debuff { color: var(--color-pop); text-shadow: var(--glow-pop); }
      .intent-multi  { color: #c1f4e8; }
      .intent-unknown{ color: var(--color-text-dim); }
      .sc-sprite {
        width: 80px; height: 80px; margin: 0 auto;
        background: var(--color-border-low); border: 1px solid var(--color-pop);
        box-shadow: var(--glow-pop); border-radius: 4px;
        display: flex; align-items: center; justify-content: center;
        font-size: 36px; color: var(--color-pop);
      }
      .sc-enemy-name { font-family: var(--font-display); font-size: 10px; color: var(--color-pop); margin-top: 4px; }
      .sc-stab-bar { height: 5px; background: var(--color-border-low); border-radius: 3px; margin: 3px 8px; overflow: hidden; }
      .sc-stab-fill { height: 100%; background: linear-gradient(90deg, var(--color-danger), var(--color-pop)); }
      .sc-enemy-hp { font-size: 9px; color: var(--color-text-dim); font-family: var(--font-display); }
      .sc-play {
        grid-area: play; border-top: 1px dashed var(--color-border-low);
        border-bottom: 1px dashed var(--color-border-low);
        display: flex; align-items: center; justify-content: center;
        color: var(--color-border-low); font-size: 10px;
      }
      .sc-hand {
        grid-area: hand; display: flex; gap: 8px; justify-content: center;
        align-items: flex-end; padding: 8px 8px 8px 0;
      }
      .sc-card {
        width: 86px; height: 120px; background: var(--color-base);
        border: 1px solid var(--color-accent); border-radius: 6px;
        box-shadow: var(--glow-accent); padding: 6px;
        display: flex; flex-direction: column; align-items: center;
        cursor: pointer; position: relative; transition: transform 0.08s;
      }
      .sc-card:hover { transform: translateY(-6px); }
      .sc-card-cost {
        position: absolute; top: -8px; left: -8px;
        width: 22px; height: 22px; border-radius: 50%;
        background: var(--color-pop); color: white;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-size: 11px; box-shadow: var(--glow-pop);
      }
      .sc-card-name { font-family: var(--font-display); font-size: 8px; color: var(--color-accent); text-align: center; letter-spacing: 0.5px; margin-top: 4px; }
      .sc-card-art {
        flex: 1; width: 100%; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low);
        display: flex; align-items: center; justify-content: center;
        font-size: 26px; margin: 4px 0;
        filter: drop-shadow(0 0 4px currentColor);
      }
      .icon-burn    { color: var(--color-danger); }
      .icon-harden  { color: var(--color-accent); }
      .icon-multi   { color: #c1f4e8; }
      .icon-danger  { color: var(--color-danger); }
      .icon-buff    { color: var(--color-energy); }
      .sc-card-text { font-size: 7px; text-align: center; opacity: 0.85; line-height: 1.2; }
      .sc-stats {
        grid-area: stats; background: var(--color-base-deep);
        border-left: 1px solid var(--color-border-low);
        display: flex; flex-direction: column; gap: 8px; padding: 10px 8px;
      }
      .sc-budget-label { font-size: 9px; color: var(--color-danger); font-family: var(--font-display); letter-spacing: 1px; }
      .sc-budget-bar { height: 10px; background: var(--color-border-low); border-radius: 5px; overflow: hidden; }
      .sc-budget-fill { height: 100%; background: linear-gradient(90deg, var(--color-danger), var(--color-energy)); transition: width 0.2s; }
      .sc-budget-num { font-size: 12px; text-align: center; }
      .sc-headroom {
        background: var(--color-border-low); border: 1px solid var(--color-accent);
        padding: 5px; border-radius: 3px; text-align: center;
        font-size: 9px; font-family: var(--font-display); color: var(--color-accent);
      }
      .sc-action {
        grid-area: action; background: var(--color-base-deep);
        border-left: 1px solid var(--color-border-low);
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 10px; padding: 10px 8px;
      }
      .sc-energy-label { font-size: 9px; color: var(--color-energy); font-family: var(--font-display); }
      .sc-energy-orb {
        width: 52px; height: 52px; border-radius: 50%;
        background: radial-gradient(circle, var(--color-energy) 0%, var(--color-energy-deep) 100%);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; color: var(--color-base-deep);
        box-shadow: 0 0 14px rgba(255,211,77,0.6);
        font-size: 20px; font-family: var(--font-display);
      }
      .sc-end-turn {
        width: 100%; background: var(--color-pop); color: white; border: 0;
        padding: 10px 4px; border-radius: 3px; font-weight: 700;
        cursor: pointer; box-shadow: var(--glow-pop);
        font-family: var(--font-display); font-size: 10px; letter-spacing: 1px;
      }
      .sc-foot {
        grid-area: foot; background: var(--color-base-deep);
        border-top: 1px solid var(--color-border-low);
        display: flex; align-items: center; gap: 12px; padding: 0 10px;
        font-size: 10px; font-family: var(--font-display); color: var(--color-accent);
      }
      .sc-foot .right { margin-left: auto; opacity: 0.5; }
    </style>

    <div class="sc-topbar">
      <span>// ACT I · Single-Service SLO · Floor 1</span>
      <span class="turn">TURN ${turn}</span>
    </div>

    <div class="sc-piles">
      <div class="sc-pile">DRAW<div class="sc-pile-n">${draw.length}</div></div>
      <div class="sc-pile">DISC<div class="sc-pile-n">${discard.length}</div></div>
      <div class="sc-pile">EXHL<div class="sc-pile-n">${exhaust.length}</div></div>
    </div>

    <div class="sc-enemies">${enemiesHtml}</div>

    <div class="sc-play">[ play area ]</div>

    <div class="sc-hand" id="sc-hand-slot"></div>

    <div class="sc-stats">
      <div>
        <div class="sc-budget-label">SLO BUDGET</div>
        <div class="sc-budget-bar">
          <div class="sc-budget-fill" style="width:${Math.round((budget / maxBudget) * 100)}%"></div>
        </div>
        <div class="sc-budget-num">${budget} / ${maxBudget}</div>
      </div>
      <div class="sc-headroom">HEADROOM<br><b>${headroom}</b></div>
    </div>

    <div class="sc-action">
      <div class="sc-energy-label">ENERGY</div>
      <div class="sc-energy-orb">${energy}<span style="font-size:9px;opacity:0.7">/${energyPerTurn}</span></div>
      <button class="sc-end-turn" id="sc-end-turn">END TURN ▶</button>
    </div>

    <div class="sc-foot">
      <span>📖 Codex</span>
      <span>⏸ Pause</span>
      <span class="right">seed: ${state.meta.seed}</span>
    </div>
  `;

  const handSlot = root.querySelector<HTMLDivElement>("#sc-hand-slot")!;
  for (const card of hand) {
    handSlot.appendChild(renderCard(card, dispatch, targetId));
  }

  root.querySelector<HTMLButtonElement>("#sc-end-turn")!
    .addEventListener("click", () => dispatch({ type: "END_TURN" }));

  return root;
}
