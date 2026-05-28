import type { Action } from "./actions";
import { initialState, type GameState, type Enemy } from "./state";

function makeStubEnemy(): Enemy {
  return {
    instanceId: "e0",
    defId: "flapping_health_check",
    name: "Flapping Health Check",
    stability: 12,
    maxStability: 12,
    statuses: {},
  };
}

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_RUN":
      return {
        ...state,
        scene: "combat",
        combat: {
          enemies: [makeStubEnemy()],
          intentByEnemy: { e0: { kind: "burn", amount: 6 } },
          turn: 1,
          phase: "player",
        },
      };
    case "PLAY_CARD_STUB":
      return { ...state, scene: "lost", combat: undefined };
    case "RETURN_TO_TITLE":
      return initialState(state.meta.seed);
    default:
      return state;
  }
}
