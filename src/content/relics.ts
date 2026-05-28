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
  error_tracking: {
    id: "error_tracking", name: "Error Tracking", product: "Datadog Error Tracking",
    description: "At start of combat, apply Customer-Facing 1 to all enemies.",
    flavor: "Group. Deduplicate. Prioritize.",
    onCombatStart: (s) => {
      if (!s.combat) return s;
      let fresh = s;
      for (const enemy of fresh.combat!.enemies) {
        fresh = applyStatus(fresh, enemy.instanceId, "customer_facing", 1);
      }
      return fresh;
    },
  },
  dashboards: {
    id: "dashboards", name: "Dashboards", product: "Datadog Dashboards",
    description: "At start of each turn, gain 1 Headroom.",
    flavor: "The graph goes up. You also go up.",
    onTurnStart: (s) => addHeadroom(s, 1),
  },
  service_catalog: {
    id: "service_catalog", name: "Service Catalog", product: "Datadog Service Catalog",
    description: "At start of combat, gain Observability 1.",
    flavor: "Know your dependencies. Own your services.",
    onCombatStart: (s) => applyStatus(s, "player", "observability", 1),
  },
  incident_management: {
    id: "incident_management", name: "Incident Management", product: "Datadog Incident Management",
    description: "At start of combat, gain Confidence 1.",
    flavor: "Declared. Triaged. Resolved.",
    onCombatStart: (s) => applyStatus(s, "player", "confidence", 1),
  },
  workflow_automation: {
    id: "workflow_automation", name: "Workflow Automation", product: "Datadog Workflow Automation",
    description: "At start of combat, gain 6 Headroom.",
    flavor: "Automate the response before the alert fires.",
    onCombatStart: (s) => addHeadroom(s, 6),
  },
  notebooks: {
    id: "notebooks", name: "Notebooks", product: "Datadog Notebooks",
    description: "At start of combat, draw 1 extra card.",
    flavor: "Collaborative investigation, documented.",
    onCombatStart: (s) => drawCards(s, 1),
  },
  cloud_cost_mgmt: {
    id: "cloud_cost_mgmt", name: "Cloud Cost Mgmt", product: "Datadog Cloud Cost Management",
    description: "At start of each turn, gain 5 Credits.",
    flavor: "Tag your resources. Save your money.",
    onTurnStart: (s) => ({ ...s, credits: s.credits + 5 }),
  },
  rum: {
    id: "rum", name: "RUM", product: "Datadog Real User Monitoring",
    description: "At start of each turn, if hand size < 3, draw 1 card.",
    flavor: "See what real users actually experience.",
    onTurnStart: (s) => s.player.hand.length < 3 ? drawCards(s, 1) : s,
  },
  sensitive_data_scanner: {
    id: "sensitive_data_scanner", name: "Sensitive Data Scanner", product: "Datadog SDS",
    description: "At start of combat, remove the first curse from your deck (if any).",
    flavor: "Find the secrets. Remove the secrets.",
    onCombatStart: (s) => {
      const curseIdx = s.deck.findIndex(c => c.type === "curse");
      if (curseIdx === -1) return s;
      return { ...s, deck: [...s.deck.slice(0, curseIdx), ...s.deck.slice(curseIdx + 1)] };
    },
  },
  continuous_profiler: {
    id: "continuous_profiler", name: "Continuous Profiler", product: "Datadog Continuous Profiler",
    description: "At start of combat, gain Pressure 1.",
    flavor: "Always-on performance visibility.",
    onCombatStart: (s) => applyStatus(s, "player", "pressure", 1),
  },
};

export const RELIC_POOL = Object.keys(RELIC_DEFS).filter(id => id !== "pager");

export function generateRelicReward(state: GameState): [string, GameState] {
  const available = RELIC_POOL.filter(id => !state.player.relics.includes(id));
  if (available.length === 0) {
    // All relics owned — fall back to random from full pool (duplicate allowed)
    const [rand, newState] = nextRng(state);
    return [RELIC_POOL[Math.floor(rand * RELIC_POOL.length)], newState];
  }
  const [rand, newState] = nextRng(state);
  return [available[Math.floor(rand * available.length)], newState];
}
