import type { Card, CardType } from "../engine/state";

export interface EffectSpec {
  kind: "burn" | "headroom" | "draw";
  amount: number;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  effects: EffectSpec[];
  flavor: string;
}

export const CARD_DEFS: Record<string, CardDef> = {
  manual_fix: {
    id: "manual_fix", name: "Manual Fix", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 6 }],
    flavor: "When all else fails, restart the pod.",
  },
  failover: {
    id: "failover", name: "Failover", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 5 }],
    flavor: "Route around the damage.",
  },
  page_senior_engineer: {
    id: "page_senior_engineer", name: "Page Senior Engineer", type: "skill", cost: 2,
    // Note: spec says draw 2 + gain 1 Energy next turn. Energy-next-turn deferred to M3
    // (requires status system). M2 implements draw 2 only.
    effects: [{ kind: "draw", amount: 2 }],
    flavor: "They've seen this before.",
  },
  canary_deploy: {
    id: "canary_deploy", name: "Canary Deploy", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 5 }, { kind: "draw", amount: 1 }],
    flavor: "Ship a little, learn a lot.",
  },
  circuit_breaker: {
    id: "circuit_breaker", name: "Circuit Breaker", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 8 }],
    flavor: "Stop the bleeding before you debug it.",
  },
};

let _nextInstanceId = 0;
function makeInstanceId(defId: string): string {
  return `${defId}_${_nextInstanceId++}`;
}

export function makeCard(defId: string): Card {
  const def = CARD_DEFS[defId];
  if (!def) throw new Error(`Unknown card def: ${defId}`);
  return {
    instanceId: makeInstanceId(defId),
    defId,
    name: def.name,
    type: def.type,
    cost: def.cost,
    upgraded: false,
  };
}

export function buildStarterDeck(): Card[] {
  // Spec §2.2: 5× Manual Fix, 4× Failover, 1× Page Senior Engineer
  return [
    ...Array.from({ length: 5 }, () => makeCard("manual_fix")),
    ...Array.from({ length: 4 }, () => makeCard("failover")),
    makeCard("page_senior_engineer"),
  ];
}
