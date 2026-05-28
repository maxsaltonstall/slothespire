import type { Action } from "./actions";
import { initialState, type GameState } from "./state";
import { buildStarterDeck, CARD_DEFS } from "../content/cards";
import { createEnemy, getIntent } from "../content/enemies";
import { shuffleDeck, drawCards, burnEnemy, addHeadroom, applyStatus, consumeStatus, burnWithModifiers, headroomWithModifiers } from "./effects";
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

      const { enemies, intentByEnemy, turn } = state.combat;

      let s: GameState = {
        ...state,
        player: {
          ...state.player,
          discard: [...state.player.discard, ...state.player.hand],
          hand: [],
        },
      };

      for (const enemy of enemies) {
        const intent = intentByEnemy[enemy.instanceId];
        if (intent?.kind === "burn") {
          const headroom = s.player.headroom;
          const absorbed = Math.min(headroom, intent.amount);
          const remainder = intent.amount - absorbed;
          s = {
            ...s,
            player: {
              ...s.player,
              headroom: 0,
              budget: s.player.budget - remainder,
            },
          };
        }
      }

      // Headroom always resets at end of enemy turn regardless of intent type
      s = { ...s, player: { ...s.player, headroom: 0 } };

      // Step 3: loss check after enemy turn
      if (s.player.budget <= 0) {
        return { ...s, scene: "lost", combat: undefined };
      }

      const nextTurn = turn + 1;
      const nextIntents: Record<string, typeof intentByEnemy[string]> = {};
      for (const enemy of enemies) {
        nextIntents[enemy.instanceId] = getIntent(enemy.defId, nextTurn - 1);
      }

      s = {
        ...s,
        player: { ...s.player, energy: s.player.energyPerTurn },
        combat: {
          ...s.combat!,
          turn: nextTurn,
          phase: "player",
          intentByEnemy: nextIntents,
        },
      };
      s = drawCards(s, 5);

      return s;
    }

    default:
      return state;
  }
}
