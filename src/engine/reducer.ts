import type { Action } from "./actions";
import { initialState, type GameState } from "./state";
import { buildStarterDeck } from "../content/cards";
import { createEnemy, getIntent } from "../content/enemies";
import { shuffleDeck, drawCards } from "./effects";

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

    default:
      return state;
  }
}
