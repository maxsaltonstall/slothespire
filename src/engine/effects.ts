import type { GameState, Card } from "./state";
import { nextRng } from "./rng";

export function burnEnemy(state: GameState, enemyId: string, amount: number): GameState {
  if (!state.combat) return state;
  const enemies = state.combat.enemies.map(e =>
    e.instanceId === enemyId
      ? { ...e, stability: Math.max(0, e.stability - amount) }
      : e
  );
  return { ...state, combat: { ...state.combat, enemies } };
}

export function addHeadroom(state: GameState, amount: number): GameState {
  return {
    ...state,
    player: { ...state.player, headroom: state.player.headroom + amount },
  };
}

export function shuffleDeck(deck: Card[], state: GameState): [Card[], GameState] {
  const result = [...deck];
  let s = state;
  for (let i = result.length - 1; i > 0; i--) {
    const [rand, newState] = nextRng(s);
    s = newState;
    const j = Math.floor(rand * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return [result, s];
}

export function drawCards(state: GameState, count: number): GameState {
  let s = state;
  let { hand, draw, discard } = s.player;
  let remaining = count;

  while (remaining > 0) {
    if (draw.length === 0) {
      if (discard.length === 0) break; // nothing left to draw
      const [reshuffled, newState] = shuffleDeck(discard, s);
      s = newState;
      draw = reshuffled;
      discard = [];
    }
    const toDraw = Math.min(remaining, draw.length);
    hand = [...hand, ...draw.slice(0, toDraw)];
    draw = draw.slice(toDraw);
    remaining -= toDraw;
  }

  return { ...s, player: { ...s.player, hand, draw, discard } };
}
