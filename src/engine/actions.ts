import type { GameState } from "./state";

export type Action =
  | { type: "START_RUN" }
  | { type: "RETURN_TO_TITLE" }
  | { type: "PLAY_CARD_STUB" }
  | { type: "LOAD_RUN"; state: GameState };
