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
import { unlock as unlockAchievement, showToast, ACHIEVEMENT_DEFS } from "./engine/achievements";
import { renderAchievements } from "./ui/scene-achievements";
import { animateAttack, animateDefend, animateEnemyTurn, animateCardFail } from "./ui/animations";
import { CARD_DEFS } from "./content/cards";
import { sfx } from "./ui/sfx";
import { initTooltips } from "./ui/tooltip";

const root = document.getElementById("app");
if (!root) throw new Error("missing #app root");

// Boot: prefer saved run if present, else fresh initial state.
let state: GameState = loadRun() ?? initialState(`seed-${Date.now().toString(36)}`);

// Animation timer — cancel pending delayed render if player acts again quickly
let _renderTimer: ReturnType<typeof setTimeout> | null = null;

// Per-run / per-combat tracking for achievement checks
let _turnsThisCombat = 0;
let _energySpentThisTurn = 0;
let _attackPlayedThisCombat = false;
let _pageSEPlayedThisCombat = false;
let _cardsAddedThisRun = 0;

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

  // Detect failed card play (card still in hand after action = reducer rejected it)
  if (action.type === "PLAY_CARD") {
    const stillInHand = state.player.hand.some(c => c.instanceId === action.cardInstanceId);
    if (stillInHand) {
      // Card wasn't played — show fail feedback and skip all other effects
      animateCardFail(action.cardInstanceId);
      sfx.cardFail();
      scheduleRender(0);
      return;
    }
  }

  // Sound effects
  triggerSfx(action, prevState, state);

  // Check achievements
  const newlyUnlocked = checkAchievements(action, prevState, state);
  for (const def of newlyUnlocked) showToast(def);

  // Trigger combat animation on current DOM, then delay re-render so it plays out
  const animDelay = triggerCombatAnimation(action, prevState, state);
  scheduleRender(animDelay);
}

function triggerSfx(action: Action, prev: GameState, next: GameState): void {
  switch (action.type) {
    case "PLAY_CARD": {
      const card = prev.player.hand.find(c => c.instanceId === action.cardInstanceId);
      if (!card) break;
      sfx.cardPlay();
      if (card.type === "attack") {
        // attackHit fires slightly after the card whoosh (visual impact timing)
        setTimeout(() => sfx.attackHit(), 80);
      } else if (card.type === "skill" || card.type === "power") {
        const def = CARD_DEFS[card.defId];
        const hasHeadroom = def?.effects.some(e => e.kind === "headroom") ||
                             def?.upgradedEffects?.some(e => e.kind === "headroom");
        if (hasHeadroom) setTimeout(() => sfx.defend(), 60);
      }
      break;
    }
    case "END_TURN": {
      sfx.endTurn();
      // If budget dropped this turn, play drain sound
      if (next.player.budget < prev.player.budget) {
        setTimeout(() => sfx.budgetDrain(), 180);
      }
      break;
    }
    case "USE_HOTFIX":
      sfx.cardPlay();
      break;
    case "NAVIGATE":
      sfx.navigate();
      break;
    case "PICK_REWARD_CARD":
      if (action.cardInstanceId) sfx.cardPick();
      break;
    case "PICK_REWARD_RELIC":
      sfx.relicChime();
      break;
    case "CHOOSE_REST_OPTION":
      if (action.option === "refresh") sfx.heal();
      break;
    case "BUY_CARD":
    case "BUY_HOTFIX":
      sfx.cardPick();
      break;
  }
  // Scene transition sounds (fires regardless of action type)
  if (prev.scene !== "won" && next.scene === "won") sfx.victory();
  if (prev.scene !== "lost" && next.scene === "lost") sfx.defeat();
  if (prev.scene !== "reward" && next.scene === "reward") {
    // Small chime on reaching reward screen
    setTimeout(() => sfx.cardPick(), 50);
  }
}

function triggerCombatAnimation(
  action: Action,
  prev: GameState,
  next: GameState
): number {
  // ── Player plays a card ──────────────────────────────────────────
  if (action.type === "PLAY_CARD") {
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

  // ── Enemy turn ───────────────────────────────────────────────────
  if (action.type === "END_TURN" && prev.combat) {
    const totalDamage = Math.max(0, prev.player.budget - next.player.budget);

    // Build per-enemy animation descriptors from the intents that were active
    const enemyAnims = prev.combat.enemies.map(enemy => ({
      instanceId: enemy.instanceId,
      intentKind: prev.combat!.intentByEnemy[enemy.instanceId]?.kind ?? "unknown",
      damage: totalDamage, // approximate — good enough for animation
    })).filter(e => e.intentKind !== "unknown" && e.intentKind !== "multi");

    if (enemyAnims.length === 0) return 0;
    return animateEnemyTurn(enemyAnims, totalDamage);
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
    case "codex":        return renderCodex(s, dispatch);
    case "upgrading":    return renderUpgrading(s, dispatch);
    case "achievements": return renderAchievements(s, dispatch);
    case "lost":
    case "won":    return renderEnd(s, dispatch);
  }
}

function checkAchievements(
  action: Action,
  prev: GameState,
  next: GameState
): typeof ACHIEVEMENT_DEFS {
  const earned: typeof ACHIEVEMENT_DEFS = [];
  function try_(id: string, condition: boolean): void {
    if (condition) {
      const def = unlockAchievement(id);
      if (def) earned.push(def);
    }
  }

  // Track run-scoped counters
  if (action.type === "START_RUN") {
    _turnsThisCombat = 0; _energySpentThisTurn = 0;
    _attackPlayedThisCombat = false; _pageSEPlayedThisCombat = false;
    _cardsAddedThisRun = 0;
  }

  if (action.type === "NAVIGATE" && next.scene === "combat") {
    // Reset per-combat trackers on entering a new combat
    _turnsThisCombat = 0; _energySpentThisTurn = 0;
    _attackPlayedThisCombat = false; _pageSEPlayedThisCombat = false;
    // "It's Always DNS"
    const enemy = next.combat?.enemies[0];
    if (enemy?.defId === "misconfigured_tls") try_("its_always_dns", true);
  }

  if (action.type === "PLAY_CARD") {
    const card = prev.player.hand.find(c => c.instanceId === action.cardInstanceId);
    if (card) {
      if (card.type === "attack") _attackPlayedThisCombat = true;
      if (card.defId === "page_senior_engineer") _pageSEPlayedThisCombat = true;
      _energySpentThisTurn += Math.max(0, card.cost);
      // "Maximum Pressure" — 20+ burn in one play
      if (card.type === "attack") {
        const targetId = action.targetId ?? prev.combat?.enemies[0]?.instanceId;
        if (targetId) {
          const before = prev.combat?.enemies.find(e => e.instanceId === targetId)?.stability ?? 0;
          const after  = next.combat?.enemies.find(e => e.instanceId === targetId)?.stability ?? before;
          try_("maximum_pressure", (before - after) >= 20);
        }
      }
    }
    // "Power Trip" — 3 powers active
    try_("power_trip", (next.combat?.activePowers.length ?? 0) >= 3);
    // "Full Observability"
    try_("full_observability", (next.player.statuses.observability ?? 0) >= 3);
  }

  if (action.type === "END_TURN") {
    _turnsThisCombat++;
    // "Defense in Depth" — 30+ headroom before end of turn
    try_("defense_in_depth", prev.player.headroom >= 30);
    // "Flow State" — 5+ energy spent this turn
    try_("flow_state", _energySpentThisTurn >= 5);
    // "On-Call Veteran" — 20 turns
    try_("on_call_veteran", _turnsThisCombat >= 20);
    _energySpentThisTurn = 0;
  }

  if (action.type === "PICK_REWARD_CARD" && action.cardInstanceId) {
    _cardsAddedThisRun++;
  }

  // Combat won (scene transitions from combat to reward, map, or won)
  if (prev.scene === "combat" && (next.scene === "reward" || next.scene === "map" || next.scene === "won")) {
    const bossDead = prev.combat?.enemies[0]?.defId;
    try_("first_response", true);
    try_("blameless_culture", !_attackPlayedThisCombat);
    try_("minimalist", prev.deck.length === 10 && _cardsAddedThisRun === 0);
    try_("page_the_right_person", _pageSEPlayedThisCombat);
    // Boss kills
    if (bossDead === "the_pager_storm") try_("pager_silenced", true);
    if (bossDead === "total_outage")    try_("total_outage_averted", true);
    // "Deploy on Friday"
    try_("deploy_on_friday",
      next.scene === "won" &&
      prev.combat?.activePowers.some(p => p.defId === "deploy_every_commit") === true);
    // "Five Nines"
    try_("five_nines",
      prev.combat?.activePowers.some(p => p.defId === "five_nines") === true &&
      prev.player.budget === prev.player.maxBudget);
  }

  // Win/lose
  try_("slo_met",   prev.scene !== "won"  && next.scene === "won");
  try_("blameless", prev.scene !== "lost" && next.scene === "lost");

  // Relic earned
  try_("best_in_show",
    !prev.player.relics.includes("bits_the_dog") &&
     next.player.relics.includes("bits_the_dog"));

  // Curse removed
  const prevCurses = prev.deck.filter(c => c.type === "curse").length;
  const nextCurses = next.deck.filter(c => c.type === "curse").length;
  try_("debt_free", nextCurses < prevCurses);

  // Quit (abandon run)
  try_("healthy_boundaries",
    action.type === "RETURN_TO_TITLE" &&
    prev.scene !== "won" && prev.scene !== "lost" && prev.scene !== "title");

  return earned;
}

render();
initTooltips();
