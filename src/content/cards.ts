import type { Card, CardType, StatusId } from "../engine/state";

export type EffectSpec =
  | { kind: "burn"; amount: number }
  | { kind: "selfBurn"; amount: number }
  | { kind: "headroom"; amount: number }
  | { kind: "draw"; amount: number }
  | { kind: "restoreBudget"; amount: number }
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
  upgradedEffects?: EffectSpec[];
  upgradedPowerTrigger?: EffectSpec[];
  curseEffect?: EffectSpec[];
}

export const CARD_DEFS: Record<string, CardDef> = {
  manual_fix: {
    id: "manual_fix", name: "Manual Fix", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 6 }],
    upgradedEffects: [{ kind: "burn", amount: 9 }],
    flavor: "When all else fails, restart the pod.",
  },
  failover: {
    id: "failover", name: "Failover", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 5 }],
    upgradedEffects: [{ kind: "headroom", amount: 8 }],
    flavor: "Route around the damage.",
  },
  page_senior_engineer: {
    id: "page_senior_engineer", name: "Page Senior Engineer", type: "skill", cost: 2,
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "applyStatus", status: "flow", stacks: 1, target: "self" },
    ],
    upgradedEffects: [{ kind: "draw", amount: 3 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    flavor: "They've seen this before.",
  },
  canary_deploy: {
    id: "canary_deploy", name: "Canary Deploy", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 5 }, { kind: "draw", amount: 1 }],
    upgradedEffects: [{ kind: "burn", amount: 8 }, { kind: "draw", amount: 1 }],
    flavor: "Ship a little, learn a lot.",
  },
  circuit_breaker: {
    id: "circuit_breaker", name: "Circuit Breaker", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 8 }],
    upgradedEffects: [{ kind: "headroom", amount: 12 }],
    flavor: "Stop the bleeding before you debug it.",
  },
  chaos_engineering: {
    id: "chaos_engineering", name: "Chaos Engineering", type: "skill", cost: 2,
    effects: [
      { kind: "applyStatus", status: "customer_facing", stacks: 3, target: "all" },
      { kind: "selfBurn", amount: 5 },
    ],
    upgradedEffects: [{ kind: "applyStatus", status: "customer_facing", stacks: 5, target: "all" }, { kind: "selfBurn", amount: 5 }],
    flavor: "Break it on purpose so it doesn't break you on Friday.",
  },
  auto_scaling: {
    id: "auto_scaling", name: "Auto-Scaling", type: "power", cost: 1,
    effects: [],
    powerTrigger: [{ kind: "headroom", amount: 4 }],
    upgradedPowerTrigger: [{ kind: "headroom", amount: 6 }],
    flavor: "Demand goes up. Capacity goes up.",
  },
  page_the_ceo: {
    id: "page_the_ceo", name: "Page the CEO", type: "skill", cost: 2,
    effects: [{ kind: "burn", amount: 30 }],
    upgradedEffects: [{ kind: "burn", amount: 40 }],
    exhaust: true,
    flavor: "Nuclear option. One per incident.",
  },
  tech_debt: {
    id: "tech_debt", name: "Tech Debt", type: "curse", cost: -1,
    effects: [],
    curseEffect: [{ kind: "selfBurn", amount: 2 }],
    flavor: "Unplayable. Costs 2 Budget every turn it sits in your hand.",
  },
  rollback: {
    id: "rollback", name: "Rollback", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 8 }],
    upgradedEffects: [{ kind: "burn", amount: 11 }],
    flavor: "Revert to last known good. (That was three deployments ago.)",
  },
  load_balancer: {
    id: "load_balancer", name: "Load Balancer", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 7 }],
    upgradedEffects: [{ kind: "headroom", amount: 10 }],
    flavor: "Distribute the pain.",
  },
  monitoring_alert: {
    id: "monitoring_alert", name: "Monitoring Alert", type: "attack", cost: 0,
    effects: [{ kind: "burn", amount: 4 }],
    upgradedEffects: [{ kind: "burn", amount: 6 }],
    flavor: "Better late than never.",
  },
  feature_flag: {
    id: "feature_flag", name: "Feature Flag", type: "skill", cost: 1,
    effects: [{ kind: "draw", amount: 2 }],
    upgradedEffects: [{ kind: "draw", amount: 3 }],
    flavor: "Ship it. Just turn it off first.",
  },
  health_check: {
    id: "health_check", name: "Health Check", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 4 }, { kind: "draw", amount: 1 }],
    upgradedEffects: [{ kind: "headroom", amount: 5 }, { kind: "draw", amount: 1 }],
    flavor: "Are you up? Are you actually up?",
  },
  graceful_degradation: {
    id: "graceful_degradation", name: "Graceful Degradation", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 9 }],
    upgradedEffects: [{ kind: "headroom", amount: 12 }],
    flavor: "Do less. Survive.",
  },
  rate_limiter: {
    id: "rate_limiter", name: "Rate Limiter", type: "skill", cost: 1,
    effects: [{ kind: "applyStatus", status: "throttled", stacks: 2, target: "single" }],
    upgradedEffects: [{ kind: "applyStatus", status: "throttled", stacks: 3, target: "single" }],
    flavor: "You get 100 requests. You don't get 101.",
  },
  zero_downtime_deploy: {
    id: "zero_downtime_deploy", name: "Zero Downtime Deploy", type: "attack", cost: 2,
    effects: [{ kind: "burn", amount: 10 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "burn", amount: 14 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    flavor: "Phased rollout. No one even noticed.",
  },
  sli_dashboard: {
    id: "sli_dashboard", name: "SLI Dashboard", type: "skill", cost: 2,
    effects: [{ kind: "draw", amount: 3 }, { kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "draw", amount: 3 }, { kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }, { kind: "headroom", amount: 2 }],
    flavor: "The graph goes up. For now.",
  },
  postmortem: {
    id: "postmortem", name: "Blameless Postmortem", type: "skill", cost: 2,
    effects: [{ kind: "restoreBudget", amount: 12 }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 18 }],
    exhaust: true,
    flavor: "The system failed, not the person.",
  },
  runbook: {
    id: "runbook", name: "Runbook", type: "skill", cost: 1,
    effects: [{ kind: "draw", amount: 2 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "draw", amount: 3 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    flavor: "Step 1: Don't panic. Step 2: Follow this document.",
  },
  service_mesh: {
    id: "service_mesh", name: "Service Mesh", type: "power", cost: 1,
    effects: [],
    powerTrigger: [{ kind: "headroom", amount: 3 }, { kind: "draw", amount: 1 }],
    upgradedPowerTrigger: [{ kind: "headroom", amount: 5 }, { kind: "draw", amount: 1 }],
    flavor: "Distributed reliability, automatically.",
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
