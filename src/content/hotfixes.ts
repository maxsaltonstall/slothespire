import type { EffectSpec } from "./cards";

export interface HotfixDef {
  id: string;
  name: string;
  effects: EffectSpec[];
  flavor: string;
}

export const HOTFIX_DEFS: Record<string, HotfixDef> = {
  rollback_hotfix: {
    id: "rollback_hotfix",
    name: "Rollback Hotfix",
    effects: [{ kind: "burn", amount: 20 }],
    flavor: "Revert everything. Sort it out later.",
  },
  failover_hotfix: {
    id: "failover_hotfix",
    name: "Failover Hotfix",
    effects: [{ kind: "headroom", amount: 25 }],
    flavor: "Not fixed. Just not failing right now.",
  },
  caffeine_hotfix: {
    id: "caffeine_hotfix",
    name: "Caffeine Hotfix",
    effects: [{ kind: "gainEnergy", amount: 2 }, { kind: "draw", amount: 1 }],
    flavor: "Coffee fixes everything. For approximately 15 minutes.",
  },
  escalation_hotfix: {
    id: "escalation_hotfix",
    name: "Escalation Hotfix",
    effects: [{ kind: "applyStatus", status: "customer_facing", stacks: 2, target: "all" }],
    flavor: "It's a P0 now. Everyone is paying attention.",
  },
  runbook_hotfix: {
    id: "runbook_hotfix",
    name: "Runbook Hotfix",
    effects: [{ kind: "draw", amount: 3 }],
    flavor: "Step 1: Don't panic. Steps 2-47: In the doc.",
  },
  clear_slate_hotfix: {
    id: "clear_slate_hotfix",
    name: "Clear Slate Hotfix",
    effects: [
      { kind: "removeStatus", status: "toil", target: "self" },
      { kind: "removeStatus", status: "on_call_fatigue", target: "self" },
      { kind: "removeStatus", status: "burnout", target: "self" },
      { kind: "removeStatus", status: "throttled", target: "self" },
    ],
    flavor: "Fresh start. Clean slate. The incident never happened.",
  },
};
