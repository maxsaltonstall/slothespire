import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

describe("START_RUN", () => {
  it("transitions to 'map' scene and generates act I map", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.scene).toBe("map");
    expect(s0.scene).toBe("title"); // immutability
    expect(s1.map.nodes.length).toBe(7);
  });

  it("builds 10-card starter deck", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.deck.length).toBe(10);
  });

  it("sets currentNodeId to null", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.map.currentNodeId).toBeNull();
  });

  it("sets player energy and headroom to starting values", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.player.energy).toBe(3);
    expect(s1.player.headroom).toBe(0);
  });
});

describe("RETURN_TO_TITLE", () => {
  it("resets to title and preserves seed", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    const s2 = reduce(s1, { type: "RETURN_TO_TITLE" });
    expect(s2.scene).toBe("title");
    expect(s2.meta.seed).toBe("seed");
    expect(s2.combat).toBeUndefined();
  });
});
