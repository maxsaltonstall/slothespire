import type { Card, CardType, StatusId } from "../engine/state";

export type EffectSpec =
  | { kind: "burn"; amount: number; target?: "single" | "all" }
  | { kind: "selfBurn"; amount: number }
  | { kind: "headroom"; amount: number }
  | { kind: "draw"; amount: number }
  | { kind: "restoreBudget"; amount: number }
  | { kind: "applyStatus"; status: StatusId; stacks: number; target: "single" | "all" | "self" }
  | { kind: "removeStatus"; status: StatusId; target: "self" | "single" }
  | { kind: "gainEnergy"; amount: number };

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
  on_call_swap: {
    id: "on_call_swap", name: "On-Call Swap", type: "skill", cost: 0,
    effects: [{ kind: "draw", amount: 2 }],
    upgradedEffects: [{ kind: "draw", amount: 3 }],
    exhaust: true,
    flavor: "Hand it to someone else. Fast.",
  },
  incident_playbook: {
    id: "incident_playbook", name: "Incident Playbook", type: "power", cost: 2,
    effects: [],
    powerTrigger: [{ kind: "draw", amount: 1 }, { kind: "headroom", amount: 2 }],
    upgradedPowerTrigger: [{ kind: "draw", amount: 1 }, { kind: "headroom", amount: 4 }],
    flavor: "Every scenario, pre-planned.",
  },
  error_budget_calc: {
    id: "error_budget_calc", name: "Error Budget Calc", type: "skill", cost: 1,
    effects: [{ kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }, { kind: "headroom", amount: 4 }],
    flavor: "You have 0.1% left. Spend it wisely.",
  },
  dependency_audit: {
    id: "dependency_audit", name: "Dependency Audit", type: "attack", cost: 2,
    effects: [{ kind: "burn", amount: 12 }, { kind: "applyStatus", status: "throttled", stacks: 2, target: "single" }],
    upgradedEffects: [{ kind: "burn", amount: 16 }, { kind: "applyStatus", status: "throttled", stacks: 2, target: "single" }],
    flavor: "Forty-seven transitive dependencies. Three are vulnerable.",
  },
  blue_green_deploy: {
    id: "blue_green_deploy", name: "Blue-Green Deploy", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 7 }, { kind: "draw", amount: 1 }],
    upgradedEffects: [{ kind: "burn", amount: 10 }, { kind: "draw", amount: 1 }],
    flavor: "Route traffic. Switch. Celebrate.",
  },
  chaos_monkey: {
    id: "chaos_monkey", name: "Chaos Monkey", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 6 }, { kind: "applyStatus", status: "customer_facing", stacks: 1, target: "single" }],
    upgradedEffects: [{ kind: "burn", amount: 8 }, { kind: "applyStatus", status: "customer_facing", stacks: 1, target: "single" }],
    flavor: "Randomly terminates instances in production. That's the feature.",
  },
  toil_reduction: {
    id: "toil_reduction", name: "Toil Reduction", type: "skill", cost: 2,
    effects: [{ kind: "removeStatus", status: "toil", target: "self" }, { kind: "headroom", amount: 8 }],
    upgradedEffects: [{ kind: "removeStatus", status: "toil", target: "self" }, { kind: "headroom", amount: 12 }],
    flavor: "Automate the thing that pages you at 3am.",
  },
  load_shedding: {
    id: "load_shedding", name: "Load Shedding", type: "skill", cost: 1,
    effects: [{ kind: "applyStatus", status: "throttled", stacks: 3, target: "all" }],
    upgradedEffects: [{ kind: "applyStatus", status: "throttled", stacks: 4, target: "all" }],
    flavor: "Shed load before the load sheds you.",
  },
  slo_tightening: {
    id: "slo_tightening", name: "SLO Tightening", type: "power", cost: 3,
    effects: [],
    powerTrigger: [{ kind: "applyStatus", status: "pressure", stacks: 1, target: "self" }],
    upgradedPowerTrigger: [{ kind: "applyStatus", status: "pressure", stacks: 2, target: "self" }],
    flavor: "Make the target harder. Make yourself stronger.",
  },
  capacity_planning: {
    id: "capacity_planning", name: "Capacity Planning", type: "skill", cost: 2,
    effects: [{ kind: "restoreBudget", amount: 8 }, { kind: "draw", amount: 2 }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 12 }, { kind: "draw", amount: 2 }],
    flavor: "Provision for peak. Not for Tuesday at 2am.",
  },
  on_fire: {
    id: "on_fire", name: "On Fire", type: "attack", cost: 0,
    effects: [{ kind: "burn", amount: 5 }],
    upgradedEffects: [{ kind: "burn", amount: 8 }],
    flavor: "Everything is on fire. Might as well use it.",
  },
  war_room: {
    id: "war_room", name: "War Room", type: "skill", cost: 3,
    effects: [{ kind: "restoreBudget", amount: 20 }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 28 }],
    exhaust: true,
    flavor: "All hands on deck. Only pull once.",
  },
  retry_with_backoff: {
    id: "retry_with_backoff", name: "Retry with Backoff", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 6 }, { kind: "burn", amount: 6 }],
    upgradedEffects: [{ kind: "burn", amount: 8 }, { kind: "burn", amount: 8 }],
    flavor: "Try again. Then try again, but slower.",
  },
  postmortem_template: {
    id: "postmortem_template", name: "Postmortem Template", type: "skill", cost: 1,
    effects: [{ kind: "restoreBudget", amount: 6 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 9 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    flavor: "Timeline: unclear. Impact: large. Action items: many.",
  },
  observability_pipeline: {
    id: "observability_pipeline", name: "Observability Pipeline", type: "power", cost: 2,
    effects: [],
    powerTrigger: [{ kind: "applyStatus", status: "observability", stacks: 1, target: "self" }],
    upgradedPowerTrigger: [{ kind: "applyStatus", status: "observability", stacks: 2, target: "self" }],
    flavor: "See everything. All the time.",
  },
  // === New commons ===
  status_check: {
    id: "status_check", name: "Status Check", type: "skill", cost: 0,
    effects: [{ kind: "draw", amount: 1 }],
    upgradedEffects: [{ kind: "draw", amount: 2 }],
    flavor: "Is it up? Is it really up?",
  },
  quick_fix: {
    id: "quick_fix", name: "Quick Fix", type: "attack", cost: 0,
    effects: [{ kind: "burn", amount: 5 }],
    upgradedEffects: [{ kind: "burn", amount: 8 }],
    exhaust: true,
    flavor: "Don't ask why it works. Just deploy it.",
  },
  alert_triage: {
    id: "alert_triage", name: "Alert Triage", type: "skill", cost: 1,
    effects: [{ kind: "removeStatus", status: "toil", target: "self" }, { kind: "headroom", amount: 4 }],
    upgradedEffects: [{ kind: "removeStatus", status: "toil", target: "self" }, { kind: "headroom", amount: 7 }],
    flavor: "P1 or P3? You have three seconds to decide.",
  },
  incident_commander: {
    id: "incident_commander", name: "Incident Commander", type: "skill", cost: 1,
    effects: [{ kind: "applyStatus", status: "flow", stacks: 1, target: "self" }, { kind: "draw", amount: 1 }],
    upgradedEffects: [{ kind: "applyStatus", status: "flow", stacks: 2, target: "self" }, { kind: "draw", amount: 1 }],
    flavor: "One person coordinates. Everyone else executes.",
  },
  service_restart: {
    id: "service_restart", name: "Service Restart", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 7 }, { kind: "applyStatus", status: "throttled", stacks: 1, target: "single" }],
    upgradedEffects: [{ kind: "burn", amount: 10 }, { kind: "applyStatus", status: "throttled", stacks: 1, target: "single" }],
    flavor: "Have you tried turning it off and on again?",
  },
  deployment_freeze: {
    id: "deployment_freeze", name: "Deployment Freeze", type: "skill", cost: 1,
    effects: [{ kind: "applyStatus", status: "throttled", stacks: 3, target: "single" }],
    upgradedEffects: [{ kind: "applyStatus", status: "throttled", stacks: 4, target: "single" }],
    flavor: "Nobody deploys until we figure out what just happened.",
  },
  redundancy: {
    id: "redundancy", name: "Redundancy", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 7 }],
    upgradedEffects: [{ kind: "headroom", amount: 11 }],
    flavor: "Two is one. One is none.",
  },
  sla_penalty: {
    id: "sla_penalty", name: "SLA Penalty", type: "attack", cost: 2,
    effects: [{ kind: "burn", amount: 14 }],
    upgradedEffects: [{ kind: "burn", amount: 18 }],
    flavor: "The contract has teeth. So do you.",
  },
  // === New uncommons ===
  post_incident_review: {
    id: "post_incident_review", name: "Post-Incident Review", type: "skill", cost: 2,
    effects: [{ kind: "restoreBudget", amount: 10 }, { kind: "applyStatus", status: "pressure", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 14 }, { kind: "applyStatus", status: "pressure", stacks: 1, target: "self" }],
    flavor: "We improved the system. And now we're angry about it.",
  },
  load_spike: {
    id: "load_spike", name: "Load Spike", type: "attack", cost: 2,
    effects: [{ kind: "burn", amount: 9 }, { kind: "applyStatus", status: "customer_facing", stacks: 1, target: "all" }],
    upgradedEffects: [{ kind: "burn", amount: 12 }, { kind: "applyStatus", status: "customer_facing", stacks: 1, target: "all" }],
    flavor: "Traffic comes in waves. The wave just arrived.",
  },
  chaos_injection: {
    id: "chaos_injection", name: "Chaos Injection", type: "attack", cost: 2,
    effects: [{ kind: "applyStatus", status: "customer_facing", stacks: 2, target: "all" }, { kind: "burn", amount: 6 }],
    upgradedEffects: [{ kind: "applyStatus", status: "customer_facing", stacks: 3, target: "all" }, { kind: "burn", amount: 8 }],
    flavor: "Controlled chaos. Mostly controlled.",
  },
  incident_declared: {
    id: "incident_declared", name: "Incident Declared", type: "skill", cost: 2,
    effects: [{ kind: "draw", amount: 3 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "draw", amount: 4 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    flavor: "Declaring an incident is not admitting defeat. It's starting the clock.",
  },
  sre_handbook: {
    id: "sre_handbook", name: "SRE Handbook", type: "power", cost: 1,
    effects: [],
    powerTrigger: [{ kind: "applyStatus", status: "stability", stacks: 1, target: "self" }],
    upgradedPowerTrigger: [{ kind: "applyStatus", status: "stability", stacks: 2, target: "self" }],
    flavor: "Chapter 1: Accept that things will break.",
  },
  // === New rares ===
  total_recovery: {
    id: "total_recovery", name: "Total Recovery", type: "skill", cost: 3,
    effects: [{ kind: "restoreBudget", amount: 25 }, { kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 32 }, { kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }],
    exhaust: true,
    flavor: "Full service restoration. Bill the outage to the incident.",
  },
  five_nines: {
    id: "five_nines", name: "Five Nines", type: "power", cost: 3,
    effects: [],
    powerTrigger: [{ kind: "headroom", amount: 3 }, { kind: "restoreBudget", amount: 3 }],
    upgradedPowerTrigger: [{ kind: "headroom", amount: 5 }, { kind: "restoreBudget", amount: 5 }],
    flavor: "99.999% uptime. The other 0.001% is where you live.",
  },
  deploy_every_commit: {
    id: "deploy_every_commit", name: "Deploy Every Commit", type: "power", cost: 2,
    effects: [],
    powerTrigger: [{ kind: "burn", amount: 4 }],
    upgradedPowerTrigger: [{ kind: "burn", amount: 6 }],
    flavor: "Continuous delivery. Continuous pressure.",
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
