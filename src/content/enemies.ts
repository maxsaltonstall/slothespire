import type { Enemy, Intent } from "../engine/state";

export interface EnemyDef {
  id: string;
  name: string;
  stability: number;
  intentPattern: Intent[];
}

export const ENEMY_DEFS: Record<string, EnemyDef> = {
  flapping_health_check: {
    id: "flapping_health_check",
    name: "Flapping Health Check",
    stability: 20,
    intentPattern: [
      { kind: "burn", amount: 6 },
      { kind: "burn", amount: 4 },
    ],
  },
  memory_leak: {
    id: "memory_leak",
    name: "Memory Leak",
    stability: 28,
    intentPattern: [
      { kind: "buff" as const, status: "pressure" as const, stacks: 1 },
      { kind: "burn" as const, amount: 8 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 1 },
      { kind: "burn" as const, amount: 10 },
    ],
  },
  zombie_process: {
    id: "zombie_process",
    name: "Zombie Process",
    stability: 18,
    intentPattern: [
      { kind: "debuff" as const, status: "toil" as const, stacks: 1 },
      { kind: "burn" as const, amount: 5 },
    ],
  },
  the_pager_storm: {
    id: "the_pager_storm",
    name: "The Pager Storm",
    stability: 60,
    intentPattern: [
      { kind: "burn" as const, amount: 10 },
      { kind: "debuff" as const, status: "on_call_fatigue" as const, stacks: 1 },
      { kind: "burn" as const, amount: 14 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 2 },
    ],
  },
  phantom_read: {
    id: "phantom_read", name: "Phantom Read", stability: 16,
    intentPattern: [
      { kind: "burn" as const, amount: 5 },
      { kind: "debuff" as const, status: "throttled" as const, stacks: 1 },
    ],
  },
  cron_storm: {
    id: "cron_storm", name: "Cron Storm", stability: 24,
    intentPattern: [
      { kind: "burn" as const, amount: 6 },
      { kind: "burn" as const, amount: 3 },
      { kind: "burn" as const, amount: 3 },
    ],
  },
  stale_cache: {
    id: "stale_cache", name: "Stale Cache", stability: 22,
    intentPattern: [
      { kind: "harden" as const, amount: 6 },
      { kind: "burn" as const, amount: 7 },
    ],
  },
  misconfigured_tls: {
    id: "misconfigured_tls", name: "Misconfigured TLS", stability: 20,
    intentPattern: [
      { kind: "debuff" as const, status: "toil" as const, stacks: 1 },
      { kind: "burn" as const, amount: 8 },
    ],
  },
  cascading_failure: {
    id: "cascading_failure", name: "Cascading Failure", stability: 40,
    intentPattern: [
      { kind: "burn" as const, amount: 8 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 1 },
      { kind: "burn" as const, amount: 10 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 1 },
    ],
  },
  total_outage: {
    id: "total_outage", name: "Total Outage", stability: 80,
    intentPattern: [
      { kind: "burn" as const, amount: 12 },
      { kind: "debuff" as const, status: "customer_facing" as const, stacks: 2 },
      { kind: "burn" as const, amount: 18 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 3 },
    ],
  },
};

const ENEMY_POOL: Record<string, string[]> = {
  "1-0": ["flapping_health_check"],
  "1-1": ["flapping_health_check", "phantom_read"],
  "1-2": ["phantom_read", "cron_storm", "stale_cache"],
  "1-3": ["memory_leak", "cron_storm", "misconfigured_tls"],
  "1-4": ["memory_leak", "zombie_process", "misconfigured_tls"],
  "1-elite": ["cascading_failure"],
  "1-boss": ["the_pager_storm"],
  "2-0": ["zombie_process", "stale_cache"],
  "2-1": ["memory_leak", "misconfigured_tls"],
  "2-2": ["cron_storm", "memory_leak"],
  "2-3": ["zombie_process", "misconfigured_tls"],
  "2-4": ["memory_leak", "cron_storm"],
  "2-elite": ["cascading_failure"],
  "2-boss": ["total_outage"],
};

export function rowFromNodeId(nodeId: string): number {
  const match = /r(\d+)c/.exec(nodeId);
  return match ? parseInt(match[1]) : 0;
}

export function pickEnemyForNode(
  nodeType: "combat" | "elite" | "boss",
  nodeId: string,
  act: 1 | 2,
  rand: number
): string {
  const row = rowFromNodeId(nodeId);
  const key = nodeType === "boss" ? `${act}-boss`
            : nodeType === "elite" ? `${act}-elite`
            : `${act}-${Math.min(row, 4)}`; // cap at row 4 for safety
  const pool = ENEMY_POOL[key] ?? ["flapping_health_check"];
  return pool[Math.floor(rand * pool.length)];
}

let _nextEnemyId = 0;

export function createEnemy(defId: string): Enemy {
  const def = ENEMY_DEFS[defId];
  if (!def) throw new Error(`Unknown enemy def: ${defId}`);
  return {
    instanceId: `${defId}_${_nextEnemyId++}`,
    defId,
    name: def.name,
    stability: def.stability,
    maxStability: def.stability,
    statuses: {},
  };
}

export function getIntent(defId: string, turn: number): Intent {
  const def = ENEMY_DEFS[defId];
  if (!def) return { kind: "unknown" };
  return def.intentPattern[turn % def.intentPattern.length];
}
