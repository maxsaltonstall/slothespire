import type { Card, MapNode } from "../engine/state";
import type { CardDef, EffectSpec } from "../content/cards";

/** Tooltip content for status keywords. Uses HTML. */
export const STATUS_TOOLTIPS: Record<string, string> = {
  customer_facing: "<b>Customer-Facing</b><br>Takes +50% Burn. Decays 1/round.",
  throttled:       "<b>Throttled</b><br>Deals −25% Burn. Decays 1/round.",
  pressure:        "<b>Pressure</b><br>Each attack deals +N flat Burn. Permanent.",
  stability:       "<b>Stability</b><br>Headroom cards grant +N extra. Permanent.",
  toil:            "<b>Toil</b><br>Lose 1 Energy at turn start. Decays 1/round.",
  flow:            "<b>Flow</b><br>Gain 1 Energy at turn start. Decays 1/round.",
  burnout:         "<b>Burnout</b><br>Draw 1 fewer card next turn. One-shot.",
  confidence:      "<b>Confidence</b><br>Next attack deals double Burn. One-shot.",
  on_call_fatigue: "<b>On-Call Fatigue</b><br>Lose 2 Budget at end of turn. Decays 1/round.",
  observability:   "<b>Observability</b><br>See extra enemy intents ahead. Permanent.",
};

/** Convert a single EffectSpec to a short human-readable string. */
function effectSpecText(e: EffectSpec, perTurn = false): string {
  const suffix = perTurn ? "/turn" : "";
  switch (e.kind) {
    case "burn":          return `Burn ${e.amount}${suffix}`;
    case "selfBurn":      return `Self-Burn ${e.amount}${suffix}`;
    case "headroom":      return `+${e.amount} Headroom${suffix}`;
    case "draw":          return `Draw ${e.amount}${suffix}`;
    case "restoreBudget": return `Restore ${e.amount} Budget${suffix}`;
    case "applyStatus": {
      const s = e.status.replace(/_/g, " ");
      const tgt = e.target === "all" ? " (all)" : e.target === "self" ? "" : "";
      return `Apply ${s} ${e.stacks}${tgt}${suffix}`;
    }
    case "removeStatus":  return `Remove ${e.status.replace(/_/g, " ")}${suffix}`;
    case "gainEnergy":   return `+${e.amount} Energy${suffix}`;
  }
}

/**
 * Generate the full effect text for a card.
 * Handles all EffectSpec kinds, Power cards (powerTrigger), upgraded cards,
 * and the Exhaust keyword.
 */
export function cardEffectsText(card: Card, def: CardDef | undefined): string {
  if (!def) return "";
  const isPower = card.type === "power";
  const isUpgraded = card.upgraded;

  // Choose the right effect array
  let effects: EffectSpec[];
  if (isPower) {
    effects = (isUpgraded && def.upgradedPowerTrigger) ? def.upgradedPowerTrigger : (def.powerTrigger ?? []);
  } else {
    effects = (isUpgraded && def.upgradedEffects) ? def.upgradedEffects : def.effects;
  }

  const parts = effects
    .map(e => effectSpecText(e, isPower))
    .filter(Boolean);

  if (def.exhaust && !isPower) parts.push("Exhaust");
  return parts.join(". ");
}

export const MAP_NODE_TOOLTIPS: Record<MapNode["type"], string> = {
  combat:   "<b>Combat</b><br>Fight enemies. Win for credits + a card reward.",
  elite:    "<b>Elite</b><br>Harder fight. Win for a <em>relic</em> reward.",
  rest:     "<b>Postmortem</b><br>Restore 20% Budget <em>or</em> upgrade a card.",
  shop:     "<b>Build Server</b><br>Buy cards / hotfixes. Remove a card for 75¢.",
  event:    "<b>Incident</b><br>A scenario with choices and consequences.",
  treasure: "<b>Treasure</b><br>A free relic — no fight.",
  boss:     "<b>BOSS</b><br>The act's final battle. Defeat it to advance.",
};

let _tip: HTMLElement | null = null;

function getTip(): HTMLElement {
  if (!_tip) {
    _tip = document.createElement("div");
    _tip.id = "game-tooltip";
    _tip.style.display = "none";
    document.body.appendChild(_tip);
  }
  return _tip;
}

function positionTip(tip: HTMLElement, anchor: HTMLElement): void {
  const r = anchor.getBoundingClientRect();
  const margin = 8;
  tip.style.display = "block";

  let top = r.top - tip.offsetHeight - margin;
  if (top < margin) top = r.bottom + margin;

  let left = r.left + r.width / 2 - tip.offsetWidth / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - tip.offsetWidth - margin));

  tip.style.top = `${top + window.scrollY}px`;
  tip.style.left = `${left}px`;
}

/** Call once on app boot. */
export function initTooltips(): void {
  document.addEventListener("mouseover", (e) => {
    const anchor = (e.target as HTMLElement).closest<HTMLElement>("[data-tooltip]");
    if (!anchor?.dataset.tooltip) { hideTip(); return; }
    const tip = getTip();
    tip.innerHTML = anchor.dataset.tooltip;
    tip.style.display = "block";
    requestAnimationFrame(() => positionTip(tip, anchor));
  });

  document.addEventListener("mouseout", (e) => {
    if (!(e.relatedTarget as HTMLElement | null)?.closest("[data-tooltip]")) hideTip();
  });

  document.addEventListener("scroll", hideTip, { passive: true });
  window.addEventListener("resize", hideTip, { passive: true });
}

function hideTip(): void { if (_tip) _tip.style.display = "none"; }
