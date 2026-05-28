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
};
