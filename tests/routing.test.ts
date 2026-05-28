import { describe, it, expect } from "vitest";
import { rowFromNodeId, pickEnemyForNode } from "../src/content/enemies";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

describe("rowFromNodeId", () => {
  it("extracts row 3 from a1r3c0", () => {
    expect(rowFromNodeId("a1r3c0")).toBe(3);
  });
  it("extracts row 0 from a2r0c1", () => {
    expect(rowFromNodeId("a2r0c1")).toBe(0);
  });
  it("extracts row 6 from a1r6c0", () => {
    expect(rowFromNodeId("a1r6c0")).toBe(6);
  });
});

describe("pickEnemyForNode", () => {
  it("row 0 combat in act 1 always gives flapping_health_check", () => {
    expect(pickEnemyForNode("combat", "a1r0c0", 1, 0.5)).toBe("flapping_health_check");
  });
  it("elite in act 1 always gives cascading_failure", () => {
    expect(pickEnemyForNode("elite", "a1r3c0", 1, 0.5)).toBe("cascading_failure");
  });
  it("boss in act 2 gives total_outage", () => {
    expect(pickEnemyForNode("boss", "a2r6c0", 2, 0.5)).toBe("total_outage");
  });
});

describe("NAVIGATE enemy routing", () => {
  it("row 3+ combat encounters a harder enemy than row 0 (higher stability)", () => {
    const s0 = reduce(initialState("routing-test"), { type: "START_RUN" });
    // Find a combat node in row 3 or later
    const deepNode = s0.map.nodes.slice(3).flat().find(n => n.type === "combat");
    if (!deepNode) return; // skip if seed has no deep combat
    const s1 = reduce(s0, { type: "NAVIGATE", nodeId: deepNode.id });
    expect(s1.scene).toBe("combat");
    expect(s1.combat!.enemies[0].maxStability).toBeGreaterThan(16); // harder than row 0
  });
});

describe("relic hooks", () => {
  it("APM Tracing onCombatStart grants Observability 2 to player", () => {
    let s = reduce(initialState("relic-test"), { type: "START_RUN" });
    s = { ...s, player: { ...s.player, relics: ["apm_tracing"] } };
    const node = s.map.nodes[0][0];
    const s2 = reduce(s, { type: "NAVIGATE", nodeId: node.id });
    expect(s2.player.statuses.observability).toBe(2);
  });

  it("Synthetic Tests onTurnStart grants 1 Headroom each turn", () => {
    let s = reduce(initialState("relic-turn"), { type: "START_RUN" });
    s = { ...s, player: { ...s.player, relics: ["synthetic_tests"] } };
    const node = s.map.nodes[0][0];
    s = reduce(s, { type: "NAVIGATE", nodeId: node.id });
    // Zero-damage intent so we can measure headroom cleanly
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s2 = reduce(s, { type: "END_TURN" });
    // After end turn: headroom resets to 0 after enemy, relic fires onTurnStart → +1 headroom
    expect(s2.player.headroom).toBe(1);
  });

  it("Watchdog onCombatStart applies Customer-Facing 1 to highest stability enemy", () => {
    let s = reduce(initialState("watchdog-test"), { type: "START_RUN" });
    s = { ...s, player: { ...s.player, relics: ["watchdog"] } };
    const node = s.map.nodes[0][0];
    const s2 = reduce(s, { type: "NAVIGATE", nodeId: node.id });
    const enemy = s2.combat!.enemies[0];
    expect(enemy.statuses.customer_facing).toBe(1);
  });

  it("PICK_REWARD_RELIC adds relic to player.relics and returns to map", () => {
    let s = reduce(initialState("pick-relic"), { type: "START_RUN" });
    s = { ...s, scene: "reward" as const, rewardRelic: "live_tail" };
    const s2 = reduce(s, { type: "PICK_REWARD_RELIC" });
    expect(s2.player.relics).toContain("live_tail");
    expect(s2.scene).toBe("map");
    expect(s2.rewardRelic).toBeUndefined();
  });
});
