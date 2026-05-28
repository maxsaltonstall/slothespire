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
};

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
