export type Scene =
  | "title"
  | "map"
  | "combat"
  | "reward"
  | "shop"
  | "rest"
  | "event"
  | "event_outcome"
  | "codex"
  | "upgrading"
  | "achievements"
  | "won"
  | "lost";

export type CardType = "attack" | "skill" | "power" | "status" | "curse";

export interface Card {
  instanceId: string;
  defId: string;
  name: string;
  type: CardType;
  cost: number;
  upgraded: boolean;
}

export type StatusId =
  | "customer_facing" | "throttled" | "pressure" | "stability"
  | "toil" | "flow" | "burnout" | "confidence" | "on_call_fatigue" | "observability";

export type StatusMap = Partial<Record<StatusId, number>>;

export interface Enemy {
  instanceId: string;
  defId: string;
  name: string;
  stability: number;
  maxStability: number;
  statuses: StatusMap;
}

export type Intent =
  | { kind: "burn"; amount: number }
  | { kind: "harden"; amount: number }
  | { kind: "buff"; status: StatusId; stacks: number }
  | { kind: "debuff"; status: StatusId; stacks: number }
  | { kind: "multi"; label: string }
  | { kind: "unknown" };

export interface MapNode {
  id: string;
  type: "combat" | "elite" | "rest" | "shop" | "event" | "treasure" | "boss";
  next: string[];
}

export interface GameEvent {
  turn: number;
  text: string;
}

export interface GameState {
  meta: { runId: string; seed: string; rngCursor: number; startedAt: number };
  player: {
    budget: number; maxBudget: number;
    energy: number; energyPerTurn: number;
    headroom: number;
    hand: Card[]; draw: Card[]; discard: Card[]; exhaust: Card[];
    statuses: StatusMap;
    relics: string[];
    hotfixes: string[];
  };
  combat?: {
    enemies: Enemy[];
    intentByEnemy: Record<string, Intent>;
    activePowers: Card[];            // Power cards played this combat
    selectedTargetId?: string;
    turn: number;
    phase: "player" | "enemy" | "transitioning";
  };
  map: {
    act: 1 | 2;
    nodes: MapNode[][];
    currentNodeId: string | null;
    visitedNodeIds: string[];
  };
  deck: Card[];
  credits: number;
  scene: Scene;
  version: number;
  history: GameEvent[];
  currentEventId?: string;
  rewardCards?: Card[];
  shopCards?: Card[];
  rewardRelic?: string;
  codexReturnScene?: "map" | "title" | "combat";
  eventOutcomeText?: string;    // shown on event_outcome screen before returning to map
}

function makeRunId(): string {
  const rand = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
  return `${Date.now().toString(36)}-${rand}`;
}

export function initialState(seed: string): GameState {
  return {
    meta: {
      runId: makeRunId(),
      seed,
      rngCursor: 0,
      startedAt: Date.now(),
    },
    player: {
      budget: 80,
      maxBudget: 80,
      energy: 3,
      energyPerTurn: 3,
      headroom: 0,
      hand: [],
      draw: [],
      discard: [],
      exhaust: [],
      statuses: {},
      relics: ["pager"],
      hotfixes: [],
    },
    combat: undefined,
    map: {
      act: 1,
      nodes: [],
      currentNodeId: null,
      visitedNodeIds: [],
    },
    deck: [],
    credits: 0,
    scene: "title",
    version: 1,
    history: [],
  };
}
