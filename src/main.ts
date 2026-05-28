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
import { renderEvent } from "./ui/scene-event";
import { renderShop } from "./ui/scene-shop";
import { renderCodex } from "./ui/scene-codex";
import * as codex from "./engine/codex";

const root = document.getElementById("app");
if (!root) throw new Error("missing #app root");

// Boot: prefer saved run if present, else fresh initial state.
let state: GameState = loadRun() ?? initialState(`seed-${Date.now().toString(36)}`);

function dispatch(action: Action): void {
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

  render();
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
    case "event":  return renderEvent(s, dispatch);
    case "shop":   return renderShop(s, dispatch);
    case "codex":     return renderCodex(s, dispatch);
    case "upgrading": return renderTitle(s, dispatch);  // placeholder until Task 6
    case "lost":
    case "won":    return renderEnd(s, dispatch);
  }
}

render();
