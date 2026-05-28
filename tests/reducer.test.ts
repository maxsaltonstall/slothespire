import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

describe("START_RUN", () => {
  it("transitions to combat scene", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.scene).toBe("combat");
    expect(s0.scene).toBe("title"); // immutability
  });

  it("builds and shuffles a 10-card deck into draw, deals 5 to hand", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.deck.length).toBe(10);
    expect(s1.player.draw.length).toBe(5);  // 10 - 5 dealt
    expect(s1.player.hand.length).toBe(5);
    expect(s1.player.discard.length).toBe(0);
  });

  it("sets up the Flapping Health Check enemy with correct stats", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.combat).toBeDefined();
    expect(s1.combat!.enemies.length).toBe(1);
    expect(s1.combat!.enemies[0].name).toBe("Flapping Health Check");
    expect(s1.combat!.enemies[0].stability).toBe(20);
    expect(s1.combat!.turn).toBe(1);
    expect(s1.combat!.phase).toBe("player");
  });

  it("sets the first intent for the enemy", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    const enemy = s1.combat!.enemies[0];
    const intent = s1.combat!.intentByEnemy[enemy.instanceId];
    expect(intent).toBeDefined();
    expect(intent.kind).toBe("burn");
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
