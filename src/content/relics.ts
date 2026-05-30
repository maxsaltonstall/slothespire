import type { Card, Enemy, GameState } from "../engine/state";
import { applyStatus, addHeadroom, drawCards, burnEnemy } from "../engine/effects";
import { nextRng } from "../engine/rng";
import { CARD_DEFS } from "./cards";

export interface RelicDef {
  id: string;
  name: string;
  product: string;
  description: string;
  flavor: string;
  onCombatStart?: (state: GameState) => GameState;
  onTurnStart?: (state: GameState) => GameState;
  onCardPlayed?: (state: GameState, card: Card) => GameState;
  onBudgetDamaged?: (state: GameState, amount: number) => GameState;
  onEnemyDeath?: (state: GameState, enemy: Enemy) => GameState;
}

const _usedThisCombat = new Set<string>();
export function resetCombatRelicState(): void { _usedThisCombat.clear(); }

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
    description: "When you take 8+ Burn in one hit, apply Customer-Facing 1 to all enemies.",
    flavor: "Group. Deduplicate. Prioritize. Then attack.",
    onBudgetDamaged: (s, amount) => {
      if (amount < 8 || !s.combat) return s;
      let fresh = s;
      for (const e of fresh.combat!.enemies) fresh = applyStatus(fresh, e.instanceId, "customer_facing", 1);
      return fresh;
    },
  },
  dashboards: {
    id: "dashboards", name: "Dashboards", product: "Datadog Dashboards",
    description: "At start of each turn, gain +1 Energy if you have no active debuffs.",
    flavor: "When everything is green, move faster.",
    onTurnStart: (s) => {
      const { toil, on_call_fatigue, burnout } = s.player.statuses;
      const hasDebuff = (toil ?? 0) > 0 || (on_call_fatigue ?? 0) > 0 || (burnout ?? 0) > 0;
      return hasDebuff ? s : { ...s, player: { ...s.player, energy: s.player.energy + 1 } };
    },
  },
  service_catalog: {
    id: "service_catalog", name: "Service Catalog", product: "Datadog Service Catalog",
    description: "At start of combat, apply Throttled 2 to all enemies.",
    flavor: "Know the dependencies. Control the blast radius.",
    onCombatStart: (s) => {
      if (!s.combat) return s;
      let fresh = s;
      for (const e of fresh.combat!.enemies) fresh = applyStatus(fresh, e.instanceId, "throttled", 2);
      return fresh;
    },
  },
  incident_management: {
    id: "incident_management", name: "Incident Management", product: "Datadog Incident Management",
    description: "First time budget drops below 50% in a combat, gain Confidence 1.",
    flavor: "Declared. Triaged. Now fight back.",
    onBudgetDamaged: (s, _amount) => {
      const key = "incident_management";
      if (_usedThisCombat.has(key)) return s;
      if (s.player.budget <= Math.floor(s.player.maxBudget * 0.5)) {
        _usedThisCombat.add(key);
        return applyStatus(s, "player", "confidence", 1);
      }
      return s;
    },
  },
  workflow_automation: {
    id: "workflow_automation", name: "Workflow Automation", product: "Datadog Workflow Automation",
    description: "At start of combat, gain 6 Headroom.",
    flavor: "Automate the response before the alert fires.",
    onCombatStart: (s) => addHeadroom(s, 6),
  },
  notebooks: {
    id: "notebooks", name: "Notebooks", product: "Datadog Notebooks",
    description: "Draw 1 card whenever you play an Exhaust card.",
    flavor: "Commit to the investigation. Learn something new.",
    onCardPlayed: (s, card) => CARD_DEFS[card.defId]?.exhaust ? drawCards(s, 1) : s,
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
    description: "When you play an attack card, deal 2 extra Burn to the weakest enemy.",
    flavor: "Always-on analysis finds the slow path every time.",
    onCardPlayed: (s, card) => {
      if (card.type !== "attack" || !s.combat || s.combat.enemies.length === 0) return s;
      const weakest = s.combat.enemies.reduce((a, b) => a.stability <= b.stability ? a : b);
      return burnEnemy(s, weakest.instanceId, 2);
    },
  },
  network_performance_monitoring: {
    id: "network_performance_monitoring", name: "Network Performance Monitoring", product: "Datadog NPM",
    description: "At start of combat, gain 3 Headroom per relic you own.",
    flavor: "See every byte. Block every threat.",
    onCombatStart: (s) => addHeadroom(s, Math.min(s.player.relics.length * 3, 18)),
  },
  bits_the_dog: {
    id: "bits_the_dog", name: "Bits the Dog", product: "Datadog Mascot",
    description: "At start of combat, restore 8 Budget.",
    flavor: "A good boy. Definitely not a monitoring agent in disguise.",
    onCombatStart: (s) => ({
      ...s,
      player: { ...s.player, budget: Math.min(s.player.maxBudget, s.player.budget + 8) },
    }),
  },
  session_replay: {
    id: "session_replay", name: "Session Replay", product: "Datadog Session Replay",
    description: "At start of every 3rd turn, draw 1 extra card.",
    flavor: "Watch exactly how the user reproduced the bug.",
    onTurnStart: (s) =>
      s.combat && s.combat.turn % 3 === 0 ? drawCards(s, 1) : s,
  },
  llm_observability: {
    id: "llm_observability", name: "LLM Observability", product: "Datadog LLM Observability",
    description: "At start of combat, gain Observability 3.",
    flavor: "Trace every token. Measure every inference.",
    onCombatStart: (s) => applyStatus(s, "player", "observability", 3),
  },
  audit_trail: {
    id: "audit_trail", name: "Audit Trail", product: "Datadog Audit Trail",
    description: "At start of combat, gain Confidence 1 and Observability 1. For each relic beyond 4, also gain Stability 1.",
    flavor: "Every action logged. Every advantage compounded.",
    onCombatStart: (s) => {
      let fresh = applyStatus(applyStatus(s, "player", "confidence", 1), "player", "observability", 1);
      const extraRelics = Math.max(0, s.player.relics.length - 4);
      if (extraRelics > 0) fresh = applyStatus(fresh, "player", "stability", extraRelics);
      return fresh;
    },
  },

  // ── New variety relics ─────────────────────────────────────────

  infrastructure_monitoring: {
    id: "infrastructure_monitoring", name: "Infrastructure Monitoring",
    product: "Datadog Infrastructure",
    description: "At turn start, if your Headroom is 20 or more, gain +1 Energy.",
    flavor: "When your margins are healthy, engineers move fast.",
    onTurnStart: (s) =>
      (s.player.headroom >= 20)
        ? { ...s, player: { ...s.player, energy: s.player.energy + 1 } }
        : s,
  },

  log_archive: {
    id: "log_archive", name: "Log Archive",
    product: "Datadog Log Management",
    description: "At start of combat, gain Pressure 1 per curse in your deck (max 4).",
    flavor: "Every failure documented becomes ammunition.",
    onCombatStart: (s) => {
      const curses = s.deck.filter(c => c.type === "curse").length;
      const stacks = Math.min(curses, 4);
      return stacks > 0 ? applyStatus(s, "player", "pressure", stacks) : s;
    },
  },

  error_budget_policy: {
    id: "error_budget_policy", name: "Error Budget Policy",
    product: "SRE Policy",
    description: "At start of combat, if your deck has no curses, gain Stability 2.",
    flavor: "A clean slate earns structural advantage.",
    onCombatStart: (s) =>
      s.deck.every(c => c.type !== "curse")
        ? applyStatus(s, "player", "stability", 2)
        : s,
  },

  mobile_performance: {
    id: "mobile_performance", name: "Mobile Performance",
    product: "Datadog Mobile",
    description: "At turn start, if your hand is empty, draw 3 cards.",
    flavor: "Zero visibility is maximum emergency.",
    onTurnStart: (s) => s.player.hand.length === 0 ? drawCards(s, 3) : s,
  },

  watchdog_insights: {
    id: "watchdog_insights", name: "Watchdog Insights",
    product: "Datadog Watchdog Insights",
    description: "When you take 15+ Burn in one hit, gain Confidence 1.",
    flavor: "The biggest incidents sharpen the sharpest engineers.",
    onBudgetDamaged: (s, amount) =>
      amount >= 15 ? applyStatus(s, "player", "confidence", 1) : s,
  },

  ci_visibility: {
    id: "ci_visibility", name: "CI Visibility",
    product: "Datadog CI Visibility",
    description: "When an enemy dies, restore 6 Budget.",
    flavor: "Every failing test caught is a production incident averted.",
    onEnemyDeath: (s, _enemy) => ({
      ...s,
      player: { ...s.player, budget: Math.min(s.player.maxBudget, s.player.budget + 6) },
    }),
  },

  incident_timeline: {
    id: "incident_timeline", name: "Incident Timeline",
    product: "Datadog Incident Management",
    description: "When an enemy dies, apply Throttled 2 to all remaining enemies.",
    flavor: "Resolving one incident slows everything around it.",
    onEnemyDeath: (s, deadEnemy) => {
      if (!s.combat) return s;
      let fresh = s;
      for (const e of fresh.combat!.enemies) {
        if (e.instanceId !== deadEnemy.instanceId && e.stability > 0) {
          fresh = applyStatus(fresh, e.instanceId, "throttled", 2);
        }
      }
      return fresh;
    },
  },

  service_map: {
    id: "service_map", name: "Service Map",
    product: "Datadog Service Map",
    description: "At start of combat, gain Observability 1 and apply Throttled 1 to all enemies.",
    flavor: "You see the whole system. They don't see you coming.",
    onCombatStart: (s) => {
      if (!s.combat) return s;
      let fresh = applyStatus(s, "player", "observability", 1);
      for (const e of fresh.combat!.enemies) {
        fresh = applyStatus(fresh, e.instanceId, "throttled", 1);
      }
      return fresh;
    },
  },

  database_monitoring: {
    id: "database_monitoring", name: "Database Monitoring",
    product: "Datadog Database Monitoring",
    description: "When you play an attack card against a Customer-Facing enemy, deal 4 extra Burn.",
    flavor: "Optimized queries hit harder.",
    onCardPlayed: (s, card) => {
      if (card.type !== "attack" || !s.combat) return s;
      const target = s.combat.enemies.find(e => e.stability > 0);
      if (!target || !(target.statuses.customer_facing ?? 0)) return s;
      return burnEnemy(s, target.instanceId, 4);
    },
  },

  real_time_notifications: {
    id: "real_time_notifications", name: "Real-Time Notifications",
    product: "Datadog Alerts",
    description: "At turn start, remove 1 stack of On-Call Fatigue from yourself.",
    flavor: "The right notification at the right time. Not all 47 at once.",
    onTurnStart: (s) => {
      const current = s.player.statuses.on_call_fatigue ?? 0;
      if (current <= 0) return s;
      const newStatuses = { ...s.player.statuses };
      if (current === 1) delete newStatuses.on_call_fatigue;
      else newStatuses.on_call_fatigue = current - 1;
      return { ...s, player: { ...s.player, statuses: newStatuses } };
    },
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
