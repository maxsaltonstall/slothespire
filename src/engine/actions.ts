import type { GameState } from "./state";

export type Action =
  | { type: "START_RUN" }
  | { type: "RETURN_TO_TITLE" }
  | { type: "PLAY_CARD"; cardInstanceId: string; targetId: string | null }
  | { type: "END_TURN" }
  | { type: "USE_HOTFIX"; hotfixId: string; targetId: string | null }
  | { type: "NAVIGATE"; nodeId: string }
  | { type: "PICK_REWARD_CARD"; cardInstanceId: string | null }
  | { type: "CHOOSE_REST_OPTION"; option: "refresh" | "upgrade" }
  | { type: "EVENT_CHOICE"; choiceIndex: number }
  | { type: "GO_TO_MAP" }
  | { type: "LOAD_RUN"; state: GameState }
  | { type: "REMOVE_CARD"; cardInstanceId: string }
  | { type: "BUY_CARD"; cardInstanceId: string }
  | { type: "PICK_REWARD_RELIC" }
  | { type: "GO_TO_CODEX"; returnScene: "map" | "title" }
  | { type: "CLOSE_CODEX" }
  | { type: "SHOW_UPGRADE_PICKER" }
  | { type: "CHOOSE_CARD_TO_UPGRADE"; cardInstanceId: string };
