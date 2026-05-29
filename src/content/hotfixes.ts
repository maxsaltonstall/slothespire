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

  // ── Wacky & strong additions ─────────────────────────────────

  force_push_hotfix: {
    id: "force_push_hotfix",
    name: "Force Push Hotfix",
    effects: [{ kind: "burn", amount: 10, target: "all" }],
    flavor: "git push --force. No regrets. Immediately several regrets.",
  },

  nuclear_option_hotfix: {
    id: "nuclear_option_hotfix",
    name: "Nuclear Option",
    effects: [{ kind: "burn", amount: 55 }],
    flavor: "You had one job. You did it. The blast radius was somebody else's problem.",
  },

  god_mode_hotfix: {
    id: "god_mode_hotfix",
    name: "God Mode",
    effects: [
      { kind: "restoreBudget", amount: 22 },
      { kind: "applyStatus", status: "confidence", stacks: 1, target: "self" },
      { kind: "applyStatus", status: "flow", stacks: 2, target: "self" },
    ],
    flavor: "sudo ./enable_god_mode.sh — access granted.",
  },

  defcon1_hotfix: {
    id: "defcon1_hotfix",
    name: "DEFCON 1",
    effects: [
      { kind: "applyStatus", status: "customer_facing", stacks: 3, target: "all" },
      { kind: "applyStatus", status: "confidence", stacks: 1, target: "self" },
      { kind: "gainEnergy", amount: 1 },
    ],
    flavor: "The CISO is in the Zoom. The CEO is on the bridge. Time to look heroic.",
  },

  reboot_hotfix: {
    id: "reboot_hotfix",
    name: "Reboot Everything",
    effects: [
      { kind: "gainEnergy", amount: 3 },
      { kind: "removeStatus", status: "toil", target: "self" },
      { kind: "removeStatus", status: "on_call_fatigue", target: "self" },
      { kind: "draw", amount: 2 },
    ],
    flavor: "Have you tried turning it off and on again? Yes. Did it work? Surprisingly, yes.",
  },

  stack_overflow_hotfix: {
    id: "stack_overflow_hotfix",
    name: "Stack Overflow Answer",
    effects: [
      { kind: "draw", amount: 4 },
      { kind: "restoreBudget", amount: 12 },
    ],
    flavor: "47 upvotes. Posted 2009. Accepts Python 2.6. Somehow still works.",
  },

  rubber_duck_hotfix: {
    id: "rubber_duck_hotfix",
    name: "Rubber Duck Debug",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "applyStatus", status: "pressure", stacks: 2, target: "self" },
      { kind: "applyStatus", status: "observability", stacks: 2, target: "self" },
    ],
    flavor: "Explaining the bug to your rubber duck revealed three race conditions and the heat death of the universe.",
  },

  heroic_rollback_hotfix: {
    id: "heroic_rollback_hotfix",
    name: "Heroic Rollback",
    effects: [
      { kind: "burn", amount: 14 },
      { kind: "headroom", amount: 14 },
      { kind: "restoreBudget", amount: 8 },
    ],
    flavor: "Simultaneously reverting, fortifying, and apologizing. Peak SRE energy.",
  },
};
