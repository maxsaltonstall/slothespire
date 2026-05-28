import { initialState, type GameState } from "./engine/state";
import { reduce } from "./engine/reducer";
import type { Action } from "./engine/actions";
import { saveRun, loadRun, clearRun } from "./engine/save";
import { renderTitle } from "./ui/scene-title";
import { renderCombat } from "./ui/scene-combat";
import { renderEnd } from "./ui/scene-end";
import { renderMap } from "./ui/scene-map";
import { renderReward } from "./ui/scene-reward";
import { renderRest } from "./ui/scene-rest";
import { renderEvent, renderEventOutcome } from "./ui/scene-event";
import { renderShop } from "./ui/scene-shop";
import { renderCodex } from "./ui/scene-codex";
import { renderUpgrading } from "./ui/scene-upgrading";
import * as codex from "./engine/codex";
import { animateAttack, animateDefend } from "./ui/animations";
import { CARD_DEFS } from "./content/cards";

const root = document.getElementById("app");
if (!root) throw new Error("missing #app root");

// Boot: prefer saved run if present, else fresh initial state.
let state: GameState = loadRun() ?? initialState(`seed-${Date.now().toString(36)}`);

// Animation timer — cancel pending delayed render if player acts again quickly
let _renderTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRender(delayMs: number): void {
  if (_renderTimer !== null) { clearTimeout(_renderTimer); _renderTimer = null; }
  if (delayMs <= 0) { render(); return; }
  _renderTimer = setTimeout(() => { _renderTimer = null; render(); }, delayMs);
}

function dispatch(action: Action): void {
  const prevState = state;
  state = reduce(state, action);

  // Save policy: persist after every reducer call. On terminal scenes,
  // clear the save instead so the next launch is a fresh title.
  if (state.scene === "lost" || state.scene === "won" || state.scene === "title") {
    clearRun();
  } else {
    saveRun(state);
  }

  // Fire codex unlocks based on current state
  for (const c of state.player.hand) codex.unlock(c.defId);
  for (const c of state.rewardCards ?? []) codex.unlock(c.defId);
  if (state.rewardRelic) codex.unlock(state.rewardRelic);
  for (const r of state.player.relics) codex.unlock(r);
  if (state.combat) {
    for (const e of state.combat.enemies) codex.unlock(e.defId);
  }

  // Trigger combat animation on current DOM, then delay re-render so it plays out
  const animDelay = triggerCombatAnimation(action, prevState, state);
  scheduleRender(animDelay);
}

function triggerCombatAnimation(
  action: Action,
  prev: GameState,
  next: GameState
): number {
  if (action.type !== "PLAY_CARD") return 0;

  const card = prev.player.hand.find(c => c.instanceId === action.cardInstanceId);
  if (!card || !prev.combat) return 0;

  if (card.type === "attack") {
    const targetId = action.targetId ?? prev.combat.enemies[0]?.instanceId;
    if (!targetId) return 0;
    const before = prev.combat.enemies.find(e => e.instanceId === targetId)?.stability ?? 0;
    const after  = next.combat?.enemies.find(e => e.instanceId === targetId)?.stability ?? before;
    animateAttack(targetId, Math.max(0, before - after));
    return 400;
  }

  // Skill or power: show shield if headroom was gained
  const def = CARD_DEFS[card.defId];
  const hasHeadroomEffect = def?.effects.some(e => e.kind === "headroom") ||
                             def?.upgradedEffects?.some(e => e.kind === "headroom");
  if ((card.type === "skill" || card.type === "power") && hasHeadroomEffect) {
    const gained = next.player.headroom - prev.player.headroom;
    animateDefend(Math.max(0, gained));
    return 540;
  }

  return 0;
}

function render(): void {
  root!.replaceChildren(sceneFor(state));
}

function sceneFor(s: GameState): HTMLElement {
  switch (s.scene) {
    case "title":  return renderTitle(s, dispatch);
    case "map":    return renderMap(s, dispatch);
    case "combat": return renderCombat(s, dispatch);
    case "reward": return renderReward(s, dispatch);
    case "rest":   return renderRest(s, dispatch);
    case "event":         return renderEvent(s, dispatch);
    case "event_outcome": return renderEventOutcome(s, dispatch);
    case "shop":   return renderShop(s, dispatch);
    case "codex":     return renderCodex(s, dispatch);
    case "upgrading": return renderUpgrading(s, dispatch);
    case "lost":
    case "won":    return renderEnd(s, dispatch);
  }
}

render();
