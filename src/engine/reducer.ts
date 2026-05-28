import type { Action } from "./actions";
import { initialState, type GameState } from "./state";
import { buildStarterDeck, CARD_DEFS } from "../content/cards";
import { createEnemy, getIntent } from "../content/enemies";
import { shuffleDeck, drawCards, burnEnemy, addHeadroom, applyStatus, consumeStatus, tickStatuses, burnWithModifiers, headroomWithModifiers } from "./effects";
import type { Intent } from "./state";

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_RUN": {
      const deck = buildStarterDeck();
      let s: GameState = { ...initialState(state.meta.seed), deck };
      const [shuffled, afterShuffle] = shuffleDeck(deck, s);
      s = { ...afterShuffle, player: { ...afterShuffle.player, draw: shuffled } };
      s = drawCards(s, 5);

      const enemy = createEnemy("flapping_health_check");
      const firstIntent = getIntent(enemy.defId, 0);

      return {
        ...s,
        scene: "combat",
        combat: {
          enemies: [enemy],
          intentByEnemy: { [enemy.instanceId]: firstIntent },
          activePowers: [],
          turn: 1,
          phase: "player",
        },
      };
    }

    case "RETURN_TO_TITLE":
      return initialState(state.meta.seed);

    case "PLAY_CARD": {
      const { cardInstanceId, targetId } = action;
      const card = state.player.hand.find(c => c.instanceId === cardInstanceId);
      if (!card) return state;

      const def = CARD_DEFS[card.defId];
      if (!def) return state;

      // Curses are unplayable
      if (card.type === "curse") return state;

      // Check energy (cost -1 = unplayable; cost 0 = free; cost >0 requires energy)
      if (card.cost < 0) return state;
      if (card.cost > 0 && state.player.energy < card.cost) return state;

      const isPower = card.type === "power";
      const isExhaust = def.exhaust === true;

      // Remove from hand, deduct energy, route to correct pile
      let s: GameState = {
        ...state,
        player: {
          ...state.player,
          energy: state.player.energy - Math.max(0, card.cost),
          hand: state.player.hand.filter(c => c.instanceId !== cardInstanceId),
          discard: isPower || isExhaust ? state.player.discard : [...state.player.discard, card],
          exhaust: isExhaust ? [...state.player.exhaust, card] : state.player.exhaust,
        },
        combat: isPower && state.combat
          ? { ...state.combat, activePowers: [...state.combat.activePowers, card] }
          : state.combat,
      };

      // Apply each effect
      for (const effect of def.effects) {
        if (effect.kind === "burn") {
          const tid = targetId ?? s.combat?.enemies[0]?.instanceId;
          if (tid) {
            const enemy = s.combat?.enemies.find(e => e.instanceId === tid);
            const finalDamage = burnWithModifiers(
              effect.amount,
              s.player.statuses,
              enemy?.statuses ?? {}
            );
            if (s.player.statuses.confidence) {
              s = consumeStatus(s, "player", "confidence");
            }
            s = burnEnemy(s, tid, finalDamage);
          }
        } else if (effect.kind === "selfBurn") {
          s = { ...s, player: { ...s.player, budget: s.player.budget - effect.amount } };
        } else if (effect.kind === "headroom") {
          const finalHeadroom = headroomWithModifiers(effect.amount, s.player.statuses);
          s = addHeadroom(s, finalHeadroom);
        } else if (effect.kind === "draw") {
          s = drawCards(s, effect.amount);
        } else if (effect.kind === "applyStatus") {
          if (effect.target === "self") {
            s = applyStatus(s, "player", effect.status, effect.stacks);
          } else if (effect.target === "all") {
            for (const enemy of s.combat?.enemies ?? []) {
              s = applyStatus(s, enemy.instanceId, effect.status, effect.stacks);
            }
          } else {
            const tid = targetId ?? s.combat?.enemies[0]?.instanceId;
            if (tid) s = applyStatus(s, tid, effect.status, effect.stacks);
          }
        }
      }

      // Win check
      if (s.combat && s.combat.enemies.every(e => e.stability <= 0)) {
        return { ...s, scene: "won", combat: undefined };
      }
      // Loss check
      if (s.player.budget <= 0) {
        return { ...s, scene: "lost", combat: undefined };
      }

      return s;
    }

    case "END_TURN": {
      if (!state.combat) return state;
      const { enemies, intentByEnemy, turn, activePowers } = state.combat;

      // Phase 1: Curse penalties (before discarding hand)
      let s: GameState = state;
      for (const card of s.player.hand) {
        if (card.type !== "curse") continue;
        const def = CARD_DEFS[card.defId];
        for (const effect of def?.curseEffect ?? []) {
          if (effect.kind === "selfBurn") {
            s = { ...s, player: { ...s.player, budget: s.player.budget - effect.amount } };
          }
        }
      }

      // Phase 2: Discard remaining hand (including curses)
      s = {
        ...s,
        player: { ...s.player, discard: [...s.player.discard, ...s.player.hand], hand: [] },
      };

      // Snapshot which statuses exist before enemy actions (newly applied debuffs don't tick this round)
      const preEnemyPlayerStatusKeys = new Set(Object.keys(s.player.statuses) as StatusId[]);
      const preEnemyEnemyStatusKeys = new Map(
        enemies.map(e => [e.instanceId, new Set(Object.keys(e.statuses) as StatusId[])])
      );

      // Phase 3: Enemy actions
      for (const enemy of enemies) {
        const intent = intentByEnemy[enemy.instanceId];
        if (!intent) continue;
        if (intent.kind === "burn") {
          const finalBurn = burnWithModifiers(
            intent.amount,
            enemy.statuses,
            s.player.statuses
          );
          const absorbed = Math.min(s.player.headroom, finalBurn);
          const remainder = finalBurn - absorbed;
          s = { ...s, player: { ...s.player, headroom: 0, budget: s.player.budget - remainder } };
        } else if (intent.kind === "buff") {
          s = applyStatus(s, enemy.instanceId, intent.status, intent.stacks);
        } else if (intent.kind === "debuff") {
          s = applyStatus(s, "player", intent.status, intent.stacks);
        }
        // harden, multi, unknown: no-op in M3
      }

      // Phase 4: Headroom reset (unconditional — covers non-burn turns)
      s = { ...s, player: { ...s.player, headroom: 0 } };

      // Phase 5: Loss check after enemy turn
      if (s.player.budget <= 0) {
        return { ...s, scene: "lost", combat: undefined };
      }

      // Phase 6: On-Call Fatigue (-2 per stack)
      const fatigue = s.player.statuses.on_call_fatigue ?? 0;
      if (fatigue > 0) {
        s = { ...s, player: { ...s.player, budget: s.player.budget - fatigue * 2 } };
        if (s.player.budget <= 0) return { ...s, scene: "lost", combat: undefined };
      }

      // Read flow/toil BEFORE tick (they influence next turn's energy)
      const flowBonus = s.player.statuses.flow ?? 0;
      const toilCost = s.player.statuses.toil ?? 0;

      // Phase 7: Tick all decaying statuses (player + each enemy)
      // Only tick statuses that existed before Phase 3 — newly applied debuffs survive until next round
      s = {
        ...s,
        player: { ...s.player, statuses: tickStatuses(s.player.statuses, preEnemyPlayerStatusKeys) },
        combat: {
          ...s.combat!,
          enemies: s.combat!.enemies.map(e => ({
            ...e,
            statuses: tickStatuses(e.statuses, preEnemyEnemyStatusKeys.get(e.instanceId)),
          })),
        },
      };

      // Phase 8: Generate next enemy intents
      const nextTurn = turn + 1;
      const nextIntents: Record<string, Intent> = {};
      for (const enemy of enemies) {
        nextIntents[enemy.instanceId] = getIntent(enemy.defId, nextTurn - 1);
      }

      // Phase 9: Restore energy (using pre-tick flow/toil values)
      const newEnergy = Math.max(0, s.player.energyPerTurn + flowBonus - toilCost);

      s = {
        ...s,
        player: { ...s.player, energy: newEnergy },
        combat: { ...s.combat!, turn: nextTurn, phase: "player", intentByEnemy: nextIntents },
      };

      // Phase 10: Power triggers (after enemy attacked, so headroom is for next enemy turn)
      for (const powerCard of activePowers) {
        const def = CARD_DEFS[powerCard.defId];
        for (const effect of def?.powerTrigger ?? []) {
          if (effect.kind === "headroom") {
            s = addHeadroom(s, headroomWithModifiers(effect.amount, s.player.statuses));
          }
        }
      }

      // Phase 11: Draw new hand (burnout costs 1 draw; one-shot consumed)
      const hasBurnout = !!s.player.statuses.burnout;
      if (hasBurnout) s = consumeStatus(s, "player", "burnout");
      s = drawCards(s, Math.max(0, 5 - (hasBurnout ? 1 : 0)));

      return s;
    }

    default:
      return state;
  }
}
