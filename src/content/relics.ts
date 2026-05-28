import type { GameState } from "../engine/state";
import { applyStatus, addHeadroom, drawCards } from "../engine/effects";
import { nextRng } from "../engine/rng";

export interface RelicDef {
  id: string;
  name: string;
  product: string;
  description: string;
  flavor: string;
  onCombatStart?: (state: GameState) => GameState;
  onTurnStart?: (state: GameState) => GameState;
}

export const RELIC_DEFS: Record<string, RelicDef> = {
  pager: {
    id: "pager", name: "Pager", product: "On-Call",
    description: "At start of your turn, if SLO Budget ≤ 30%, draw 1 extra card.",
    flavor: "It never rings at a convenient time.",
    onTurnStart: (s) =>
      s.player.budget <= Math.floor(s.player.maxBudget * 0.3)
        ? drawCards(s, 1)
        : s,
  },
  apm_tracing: {
    id: "apm_tracing", name: "APM Tracing", product: "Datadog APM",
    description: "At start of combat, gain Observability 2.",
    flavor: "Every span tells a story.",
    onCombatStart: (s) => applyStatus(s, "player", "observability", 2),
  },
  live_tail: {
    id: "live_tail", name: "Live Tail", product: "Datadog Live Tail",
    description: "At start of combat, draw 1 extra card.",
    flavor: "Real-time insight. No waiting.",
    onCombatStart: (s) => drawCards(s, 1),
  },
  watchdog: {
    id: "watchdog", name: "Watchdog", product: "Datadog Watchdog",
    description: "At start of combat, apply Customer-Facing 1 to the highest-stability enemy.",
    flavor: "It finds the anomaly before you do.",
    onCombatStart: (s) => {
      if (!s.combat || s.combat.enemies.length === 0) return s;
      const hardest = s.combat.enemies.reduce((a, b) => a.stability >= b.stability ? a : b);
      return applyStatus(s, hardest.instanceId, "customer_facing", 1);
    },
  },
  synthetic_tests: {
    id: "synthetic_tests", name: "Synthetic Tests", product: "Datadog Synthetic Monitoring",
    description: "At start of your turn, gain 1 Headroom.",
    flavor: "Continuous verification. Always on.",
    onTurnStart: (s) => addHeadroom(s, 1),
  },
};

export const RELIC_POOL = Object.keys(RELIC_DEFS).filter(id => id !== "pager");

export function generateRelicReward(state: GameState): [string, GameState] {
  const available = RELIC_POOL.filter(id => !state.player.relics.includes(id));
  if (available.length === 0) return [RELIC_POOL[0], state];
  const [rand, newState] = nextRng(state);
  return [available[Math.floor(rand * available.length)], newState];
}
