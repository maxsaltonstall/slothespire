import { describe, it, expect } from "vitest";
import { burnEnemy, addHeadroom, drawCards, shuffleDeck } from "../src/engine/effects";
import { initialState } from "../src/engine/state";
import { makeCard, buildStarterDeck } from "../src/content/cards";
import { createEnemy } from "../src/content/enemies";

// Helper: build a combat state with one enemy and an empty hand
function makeCombatState(budgetOverride?: number) {
  const enemy = createEnemy("flapping_health_check");
  let s = initialState("effect-test");
  s = {
    ...s,
    player: { ...s.player, budget: budgetOverride ?? 80 },
    combat: {
      enemies: [enemy],
      intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 6 } },
      turn: 1,
      phase: "player",
    },
  };
  return { s, enemyId: enemy.instanceId };
}

describe("burnEnemy", () => {
  it("reduces enemy stability by the given amount", () => {
    const { s, enemyId } = makeCombatState();
    const s2 = burnEnemy(s, enemyId, 8);
    const enemy = s2.combat!.enemies.find(e => e.instanceId === enemyId)!;
    expect(enemy.stability).toBe(12); // 20 - 8
  });

  it("clamps enemy stability to 0 — never negative", () => {
    const { s, enemyId } = makeCombatState();
    const s2 = burnEnemy(s, enemyId, 999);
    const enemy = s2.combat!.enemies.find(e => e.instanceId === enemyId)!;
    expect(enemy.stability).toBe(0);
  });

  it("does not change other enemies (no bleed-over)", () => {
    const { s, enemyId } = makeCombatState();
    const s2 = burnEnemy(s, enemyId, 5);
    expect(s2.combat!.enemies.length).toBe(1);
    expect(s.combat!.enemies[0].stability).toBe(20); // original untouched
  });
});

describe("addHeadroom", () => {
  it("adds to player headroom", () => {
    const { s } = makeCombatState();
    const s2 = addHeadroom(s, 8);
    expect(s2.player.headroom).toBe(8);
  });

  it("stacks with existing headroom", () => {
    const { s } = makeCombatState();
    const s2 = addHeadroom(addHeadroom(s, 5), 3);
    expect(s2.player.headroom).toBe(8);
  });
});

describe("drawCards", () => {
  it("moves N cards from draw pile to hand", () => {
    const deck = buildStarterDeck();
    let s = initialState("draw-test");
    s = { ...s, player: { ...s.player, draw: deck, hand: [] } };
    const s2 = drawCards(s, 3);
    expect(s2.player.hand.length).toBe(3);
    expect(s2.player.draw.length).toBe(7); // 10 - 3
  });

  it("draws all remaining if fewer than N available", () => {
    let s = initialState("draw-test");
    s = { ...s, player: { ...s.player, draw: [makeCard("manual_fix")], hand: [] } };
    const s2 = drawCards(s, 5);
    expect(s2.player.hand.length).toBe(1);
    expect(s2.player.draw.length).toBe(0);
  });

  it("reshuffles discard into draw when draw is empty", () => {
    const discardCards = [makeCard("failover"), makeCard("failover")];
    let s = initialState("reshuffle-test");
    s = { ...s, player: { ...s.player, draw: [], discard: discardCards, hand: [] } };
    const s2 = drawCards(s, 1);
    expect(s2.player.hand.length).toBe(1);
    // discard was reshuffled into draw, then 1 drawn, so remaining draw = 1
    expect(s2.player.draw.length).toBe(1);
    expect(s2.player.discard.length).toBe(0);
  });
});

describe("shuffleDeck", () => {
  it("returns the same cards in a (potentially) different order", () => {
    const deck = buildStarterDeck();
    let s = initialState("shuffle-test");
    const [shuffled] = shuffleDeck(deck, s);
    const originalIds = deck.map(c => c.instanceId).sort();
    const shuffledIds = shuffled.map(c => c.instanceId).sort();
    expect(shuffledIds).toEqual(originalIds);
  });

  it("advances rngCursor by deck.length - 1 iterations", () => {
    const deck = buildStarterDeck(); // 10 cards
    let s = initialState("cursor-test");
    const [, s2] = shuffleDeck(deck, s);
    // Fisher-Yates: n-1 swaps, each advancing cursor once
    expect(s2.meta.rngCursor).toBe(deck.length - 1);
  });
});
