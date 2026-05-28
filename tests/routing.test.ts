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
