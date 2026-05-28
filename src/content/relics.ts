import type { Card, GameState } from "../engine/state";
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
