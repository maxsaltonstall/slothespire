import type { GameState, Card, StatusMap, StatusId } from "./state";
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

const DECAYING_STATUSES: StatusId[] = [
  "customer_facing", "throttled", "toil", "on_call_fatigue", "observability",
  // "flow" is NOT in this list — it is consumed entirely when triggered (see END_TURN)
];

export function applyStatus(
  state: GameState,
  target: "player" | string,
  statusId: StatusId,
  stacks: number
): GameState {
  if (target === "player") {
    return {
      ...state,
      player: {
        ...state.player,
        statuses: {
          ...state.player.statuses,
          [statusId]: (state.player.statuses[statusId] ?? 0) + stacks,
        },
      },
    };
  }
  if (!state.combat) return state;
  const enemies = state.combat.enemies.map(e =>
    e.instanceId === target
      ? { ...e, statuses: { ...e.statuses, [statusId]: (e.statuses[statusId] ?? 0) + stacks } }
      : e
  );
  return { ...state, combat: { ...state.combat, enemies } };
}

export function consumeStatus(
  state: GameState,
  target: "player" | string,
  statusId: StatusId
): GameState {
  if (target === "player") {
    const newStatuses = { ...state.player.statuses };
    delete newStatuses[statusId];
    return { ...state, player: { ...state.player, statuses: newStatuses } };
  }
  if (!state.combat) return state;
  const enemies = state.combat.enemies.map(e => {
    if (e.instanceId !== target) return e;
    const newStatuses = { ...e.statuses };
    delete newStatuses[statusId];
    return { ...e, statuses: newStatuses };
  });
  return { ...state, combat: { ...state.combat, enemies } };
}

export function tickStatuses(statuses: StatusMap, eligibleKeys?: Set<StatusId>): StatusMap {
  const result: StatusMap = { ...statuses };
  for (const id of DECAYING_STATUSES) {
    if (result[id] !== undefined && (eligibleKeys === undefined || eligibleKeys.has(id))) {
      const next = (result[id] as number) - 1;
      if (next <= 0) delete result[id];
      else result[id] = next;
    }
  }
  return result;
}

export function burnWithModifiers(
  base: number,
  sourceStatuses: StatusMap,
  targetStatuses: StatusMap
): number {
  let amount = base;
  if (sourceStatuses.pressure) amount += sourceStatuses.pressure;
  if (sourceStatuses.confidence) amount *= 2;
  if (sourceStatuses.throttled) amount = Math.floor(amount * 0.75);
  if (targetStatuses.customer_facing) amount = Math.ceil(amount * 1.5);
  return amount;
}

export function headroomWithModifiers(base: number, playerStatuses: StatusMap): number {
  return base + (playerStatuses.stability ?? 0);
}
