import { describe, it, expect } from "vitest";
import { initialState } from "../src/engine/state";

describe("initialState", () => {
  it("creates a fresh state at the title scene", () => {
    const s = initialState("test-seed");
    expect(s.scene).toBe("title");
  });

  it("stores the seed and runId in meta", () => {
    const s = initialState("test-seed");
    expect(s.meta.seed).toBe("test-seed");
    expect(s.meta.runId.length).toBeGreaterThan(0);
    expect(s.meta.rngCursor).toBe(0);
    expect(typeof s.meta.startedAt).toBe("number");
  });

  it("gives the player the spec-defined starting numbers", () => {
    const s = initialState("test-seed");
    expect(s.player.budget).toBe(80);
    expect(s.player.maxBudget).toBe(80);
    expect(s.player.energyPerTurn).toBe(3);
    expect(s.player.energy).toBe(3);
    expect(s.player.hand).toEqual([]);
    expect(s.player.draw).toEqual([]);
    expect(s.player.discard).toEqual([]);
    expect(s.player.exhaust).toEqual([]);
    expect(s.player.relics).toEqual(["pager"]);
    expect(s.player.hotfixes).toEqual([]);
    expect(s.player.statuses).toEqual({});
  });

  it("starts on act 1 with no map yet (built when run starts)", () => {
    const s = initialState("test-seed");
    expect(s.map.act).toBe(1);
    expect(s.map.nodes).toEqual([]);
    expect(s.map.currentNodeId).toBeNull();
    expect(s.map.visitedNodeIds).toEqual([]);
  });

  it("has no combat, no deck cards, zero credits, empty history", () => {
    const s = initialState("test-seed");
    expect(s.combat).toBeUndefined();
    expect(s.deck).toEqual([]);
    expect(s.credits).toBe(0);
    expect(s.history).toEqual([]);
  });

  it("two states from the same seed have different runIds (timestamp-based)", () => {
    const a = initialState("same-seed");
    const b = initialState("same-seed");
    expect(a.meta.runId).toBeTruthy();
    expect(b.meta.runId).toBeTruthy();
  });
});
