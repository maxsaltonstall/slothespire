import type { GameState, Card } from "../engine/state";
import { CARD_DEFS } from "../content/cards";
import { cardEffectsText } from "./tooltip";

function cardRow(card: Card, dimmed = false): string {
  const def = CARD_DEFS[card.defId];
  const effectText = cardEffectsText(card, def);
  const typeIcon = card.type === "attack" ? "⚔" :
                   card.type === "power"  ? "✦" :
                   card.type === "curse"  ? "☠" : "🛡";
  const nameColor = card.type === "curse"
    ? "var(--color-danger)"
    : card.upgraded ? "var(--color-energy)" : "var(--color-accent)";

  return `
    <div class="dm-row${dimmed ? " dm-dim" : ""}">
      <span class="dm-cost">${card.cost < 0 ? "☠" : card.cost}${card.upgraded ? "+" : ""}</span>
      <span class="dm-icon">${typeIcon}</span>
      <span class="dm-name" style="color:${nameColor}">${card.name}</span>
      <span class="dm-effect">${effectText || (def?.flavor ?? "")}</span>
    </div>
  `;
}

function sectionHtml(title: string, cards: Card[], dimmed = false): string {
  if (cards.length === 0) return "";
  return `
    <div class="dm-section">
      <div class="dm-section-title">${title} <span class="dm-count">${cards.length}</span></div>
      ${cards.map(c => cardRow(c, dimmed)).join("")}
    </div>
  `;
}

export function showDeckModal(state: GameState): void {
  document.getElementById("deck-modal")?.remove();

  const inCombat = !!state.combat;

  let bodyHtml: string;
  if (inCombat) {
    const handIds  = new Set(state.player.hand.map(c => c.instanceId));
    const drawIds  = new Set(state.player.draw.map(c => c.instanceId));
    const discardIds = new Set(state.player.discard.map(c => c.instanceId));
    const exhaustIds = new Set(state.player.exhaust.map(c => c.instanceId));
    const powerIds = new Set(state.combat!.activePowers.map(c => c.instanceId));

    // Show each pile clearly so the player can plan
    bodyHtml =
      sectionHtml("IN HAND",      state.player.hand) +
      sectionHtml("DRAW PILE",    state.player.draw) +
      sectionHtml("DISCARD",      state.player.discard, true) +
      sectionHtml("ACTIVE POWERS",state.combat!.activePowers) +
      sectionHtml("EXHAUSTED",    state.player.exhaust, true);
    void handIds; void drawIds; void discardIds; void exhaustIds; void powerIds;
  } else {
    // On the map — just show the full deck sorted by type then cost
    const sorted = [...state.deck].sort((a, b) => {
      const typeOrder: Record<string, number> = { attack: 0, skill: 1, power: 2, curse: 3, status: 4 };
      const ta = typeOrder[a.type] ?? 5;
      const tb = typeOrder[b.type] ?? 5;
      return ta !== tb ? ta - tb : a.cost - b.cost;
    });
    bodyHtml = `<div class="dm-section">${sorted.map(c => cardRow(c)).join("")}</div>`;
  }

  const overlay = document.createElement("div");
  overlay.id = "deck-modal";
  overlay.innerHTML = `
    <style>
      #deck-modal {
        position: fixed; inset: 0; z-index: 5000;
        background: rgba(5, 8, 24, 0.88);
        display: flex; align-items: center; justify-content: center;
        animation: dm-fade-in 0.15s ease-out;
      }
      @keyframes dm-fade-in { from { opacity: 0; } to { opacity: 1; } }
      .dm-panel {
        background: var(--color-base-deep);
        border: 1px solid var(--color-accent);
        box-shadow: 0 0 32px rgba(0,255,209,0.3);
        border-radius: 8px;
        width: min(680px, 94vw);
        max-height: 82vh;
        display: flex; flex-direction: column;
      }
      .dm-header {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 18px; border-bottom: 1px solid var(--color-border-low);
        flex-shrink: 0;
      }
      .dm-title { font-family: var(--font-display); font-size: 15px;
        color: var(--color-accent); letter-spacing: 2px; flex: 1; }
      .dm-total { font-family: var(--font-display); font-size: 11px;
        color: var(--color-text-dim); }
      .dm-close { background: transparent; border: 0; box-shadow: none;
        color: var(--color-text-dim); font-size: 20px; cursor: pointer;
        padding: 0 4px; line-height: 1; }
      .dm-close:hover { color: var(--color-accent); transform: none; }
      .dm-body { overflow-y: auto; padding: 12px 18px; flex: 1; }
      .dm-section { margin-bottom: 12px; }
      .dm-section-title {
        font-family: var(--font-display); font-size: 9px; letter-spacing: 2px;
        color: var(--color-text-dim); border-bottom: 1px solid var(--color-border-low);
        padding-bottom: 4px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;
      }
      .dm-count { background: var(--color-border-low); border-radius: 8px;
        padding: 0 5px; font-size: 8px; color: var(--color-accent); }
      .dm-row {
        display: flex; align-items: baseline; gap: 8px;
        padding: 4px 0; border-bottom: 1px solid rgba(26,34,73,0.5); font-size: 11px;
      }
      .dm-row:last-child { border-bottom: 0; }
      .dm-dim { opacity: 0.45; }
      .dm-cost { font-family: var(--font-display); min-width: 20px; text-align: center;
        color: var(--color-pop); font-size: 11px; }
      .dm-icon { font-size: 11px; min-width: 16px; }
      .dm-name { font-family: var(--font-display); font-size: 11px;
        min-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dm-effect { font-size: 10px; color: var(--color-text-dim); flex: 1; }
      /* Scrollbar */
      .dm-body::-webkit-scrollbar { width: 4px; }
      .dm-body::-webkit-scrollbar-track { background: transparent; }
      .dm-body::-webkit-scrollbar-thumb { background: var(--color-border-low); border-radius: 2px; }
    </style>
    <div class="dm-panel">
      <div class="dm-header">
        <span class="dm-title">// YOUR DECK</span>
        <span class="dm-total">${state.deck.length} cards total</span>
        <button class="dm-close" id="dm-close-btn">×</button>
      </div>
      <div class="dm-body">${bodyHtml}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on button or click-outside
  overlay.querySelector("#dm-close-btn")!.addEventListener("click", hideDeckModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) hideDeckModal(); });
  document.addEventListener("keydown", onEsc);
}

function onEsc(e: KeyboardEvent): void {
  if (e.key === "Escape") hideDeckModal();
}

export function hideDeckModal(): void {
  document.getElementById("deck-modal")?.remove();
  document.removeEventListener("keydown", onEsc);
}
