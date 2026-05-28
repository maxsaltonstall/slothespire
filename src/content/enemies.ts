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
