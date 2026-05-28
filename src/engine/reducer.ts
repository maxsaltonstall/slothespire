import type { Action } from "./actions";
import { initialState, type GameState } from "./state";
import { buildStarterDeck, CARD_DEFS } from "../content/cards";
import { createEnemy, getIntent } from "../content/enemies";
import { shuffleDeck, drawCards, burnEnemy, addHeadroom } from "./effects";

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
      if (state.player.energy < card.cost) return state;

      const def = CARD_DEFS[card.defId];
      if (!def) return state;

      let s: GameState = {
        ...state,
        player: {
          ...state.player,
          energy: state.player.energy - card.cost,
          hand: state.player.hand.filter(c => c.instanceId !== cardInstanceId),
          discard: [...state.player.discard, card],
        },
      };

      for (const effect of def.effects) {
        if (effect.kind === "burn") {
          const tid = targetId ?? s.combat?.enemies[0]?.instanceId;
          if (tid) s = burnEnemy(s, tid, effect.amount);
        } else if (effect.kind === "headroom") {
          s = addHeadroom(s, effect.amount);
        } else if (effect.kind === "draw") {
          s = drawCards(s, effect.amount);
        }
      }

      if (s.combat && s.combat.enemies.every(e => e.stability <= 0)) {
        return { ...s, scene: "won", combat: undefined };
      }
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
