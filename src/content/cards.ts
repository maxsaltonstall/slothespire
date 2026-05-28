import type { Card, CardType, StatusId } from "../engine/state";

export type EffectSpec =
  | { kind: "burn"; amount: number }
  | { kind: "selfBurn"; amount: number }
  | { kind: "headroom"; amount: number }
  | { kind: "draw"; amount: number }
  | { kind: "applyStatus"; status: StatusId; stacks: number; target: "single" | "all" | "self" };

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  effects: EffectSpec[];
  flavor: string;
  exhaust?: boolean;
  powerTrigger?: EffectSpec[];
  curseEffect?: EffectSpec[];
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
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "applyStatus", status: "flow", stacks: 1, target: "self" },
    ],
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
  chaos_engineering: {
    id: "chaos_engineering", name: "Chaos Engineering", type: "skill", cost: 2,
    effects: [
      { kind: "applyStatus", status: "customer_facing", stacks: 3, target: "all" },
      { kind: "selfBurn", amount: 5 },
    ],
    flavor: "Break it on purpose so it doesn't break you on Friday.",
  },
  auto_scaling: {
    id: "auto_scaling", name: "Auto-Scaling", type: "power", cost: 1,
    effects: [],
    powerTrigger: [{ kind: "headroom", amount: 4 }],
    flavor: "Demand goes up. Capacity goes up.",
  },
  page_the_ceo: {
    id: "page_the_ceo", name: "Page the CEO", type: "skill", cost: 2,
    effects: [{ kind: "burn", amount: 30 }],
    exhaust: true,
    flavor: "Nuclear option. One per incident.",
  },
  tech_debt: {
    id: "tech_debt", name: "Tech Debt", type: "curse", cost: -1,
    effects: [],
    curseEffect: [{ kind: "selfBurn", amount: 2 }],
    flavor: "Unplayable. Costs 2 Budget every turn it sits in your hand.",
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
