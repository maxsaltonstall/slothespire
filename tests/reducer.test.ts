import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

describe("reduce", () => {
  it("START_RUN moves from title to combat scene", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.scene).toBe("combat");
    expect(s0.scene).toBe("title"); // immutability check
  });

  it("START_RUN initializes a single stub enemy in combat", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.combat).toBeDefined();
    expect(s1.combat!.enemies.length).toBe(1);
    expect(s1.combat!.enemies[0].name).toBe("Flapping Health Check");
    expect(s1.combat!.turn).toBe(1);
  });

  it("PLAY_CARD_STUB ends the run (M1 placeholder behavior)", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    const s2 = reduce(s1, { type: "PLAY_CARD_STUB" });
    expect(s2.scene).toBe("lost");
    expect(s2.combat).toBeUndefined();
  });

  it("RETURN_TO_TITLE resets to a fresh initialState while preserving seed", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    const s2 = reduce(s1, { type: "RETURN_TO_TITLE" });
    expect(s2.scene).toBe("title");
    expect(s2.meta.seed).toBe("seed");
    expect(s2.combat).toBeUndefined();
  });

  it("LOAD_RUN replaces state wholesale", () => {
    const s0 = initialState("seed-a");
    const saved = initialState("seed-b");
    const s1 = reduce(s0, { type: "LOAD_RUN", state: saved });
    expect(s1.meta.seed).toBe("seed-b");
  });

  it("reducer is total: unknown actions return same state reference", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "NOT_A_REAL_ACTION" } as never);
    expect(s1).toBe(s0);
  });
});
