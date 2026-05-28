import type { GameState, Card } from "../engine/state";
import type { CardDef } from "./cards";
import { CARD_DEFS, makeCard } from "./cards";
import { nextRng } from "../engine/rng";

// Cards eligible for reward offers (no starter-only, no curses)
const REWARD_POOL: CardDef[] = Object.values(CARD_DEFS).filter(
  def => def.type !== "curse" && def.cost >= 0 &&
    !["manual_fix", "failover", "page_senior_engineer"].includes(def.id)
);

// Simple rarity heuristic based on known card IDs
const CARD_RARITY: Record<string, "common" | "uncommon" | "rare"> = {
  // Common
  canary_deploy: "common", circuit_breaker: "common", rollback: "common",
  load_balancer: "common", monitoring_alert: "common", feature_flag: "common",
  health_check: "common", graceful_degradation: "common", rate_limiter: "common",
  on_fire: "common", blue_green_deploy: "common", on_call_swap: "common",
  // Uncommon
  chaos_engineering: "uncommon", auto_scaling: "uncommon", zero_downtime_deploy: "uncommon",
  sli_dashboard: "uncommon", runbook: "uncommon", chaos_monkey: "uncommon",
  error_budget_calc: "uncommon", load_shedding: "uncommon", toil_reduction: "uncommon",
  dependency_audit: "uncommon", capacity_planning: "uncommon", retry_with_backoff: "uncommon",
  postmortem_template: "uncommon", incident_playbook: "uncommon", service_mesh: "uncommon",
  // Rare
  slo_tightening: "rare", observability_pipeline: "rare",
  page_the_ceo: "rare", postmortem: "rare", war_room: "rare",
  // Additional commons
  status_check: "common", quick_fix: "common", alert_triage: "common",
  incident_commander: "common", service_restart: "common", deployment_freeze: "common",
  redundancy: "common", sla_penalty: "uncommon",
  // Additional uncommons
  post_incident_review: "uncommon", load_spike: "uncommon", chaos_injection: "uncommon",
  incident_declared: "uncommon", sre_handbook: "uncommon",
  // Additional rares
  total_recovery: "rare", five_nines: "rare", deploy_every_commit: "rare",
};

function cardRarity(defId: string): "common" | "uncommon" | "rare" {
  return CARD_RARITY[defId] ?? "common";
}

export function generateCardReward(
  state: GameState,
  count = 3,
  forceRarity?: "common" | "uncommon" | "rare"
): [Card[], GameState] {
  let s = state;
  const offered: Card[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    let targetRarity: "common" | "uncommon" | "rare";
    if (forceRarity) {
      targetRarity = forceRarity;
    } else {
      const [r1, ns1] = nextRng(s);
      s = ns1;
      if (r1 < 0.6) targetRarity = "common";
      else if (r1 < 0.9) targetRarity = "uncommon";
      else targetRarity = "rare";
    }

    let candidates = REWARD_POOL.filter(d => cardRarity(d.id) === targetRarity && !usedIds.has(d.id));
    if (candidates.length === 0) {
      candidates = REWARD_POOL.filter(d => !usedIds.has(d.id));
    }
    if (candidates.length === 0) break;

    const [r2, ns2] = nextRng(s);
    s = ns2;
    const def = candidates[Math.floor(r2 * candidates.length)];
    usedIds.add(def.id);
    offered.push(makeCard(def.id));
  }

  return [offered, s];
}

export const COMBAT_CREDITS = 50;
export const ELITE_CREDITS = 75;
export const TREASURE_CREDITS = 25;
