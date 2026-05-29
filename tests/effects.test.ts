import { describe, it, expect } from "vitest";
import { burnEnemy, addHeadroom, drawCards, shuffleDeck, applyStatus, consumeStatus, tickStatuses, burnWithModifiers, headroomWithModifiers } from "../src/engine/effects";
import { initialState } from "../src/engine/state";
import type { StatusMap } from "../src/engine/state";
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
      activePowers: [],
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

  it("draws across the draw/discard boundary when draw runs out mid-count", () => {
    const drawCards2 = [makeCard("manual_fix"), makeCard("manual_fix")];
    const discardCards = [makeCard("failover"), makeCard("failover"), makeCard("failover")];
    let s = initialState("boundary-test");
    s = { ...s, player: { ...s.player, draw: drawCards2, discard: discardCards, hand: [] } };
    const s2 = drawCards(s, 5);
    // Should draw 2 from draw + reshuffle 3 from discard, draw 3 more = 5 total
    expect(s2.player.hand.length).toBe(5);
    expect(s2.player.draw.length).toBe(0);
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

describe("applyStatus", () => {
  it("adds stacks to a new status on player", () => {
    const { s } = makeCombatState();
    const s2 = applyStatus(s, "player", "customer_facing", 2);
    expect(s2.player.statuses.customer_facing).toBe(2);
  });

  it("accumulates stacks on an existing status", () => {
    const { s } = makeCombatState();
    const s2 = applyStatus(s, "player", "toil", 1);
    const s3 = applyStatus(s2, "player", "toil", 2);
    expect(s3.player.statuses.toil).toBe(3);
  });

  it("applies a status to an enemy by instanceId", () => {
    const { s, enemyId } = makeCombatState();
    const s2 = applyStatus(s, enemyId, "customer_facing", 1);
    const enemy = s2.combat!.enemies.find(e => e.instanceId === enemyId)!;
    expect(enemy.statuses.customer_facing).toBe(1);
  });
});

describe("consumeStatus", () => {
  it("removes all stacks of a status from player", () => {
    const { s } = makeCombatState();
    const s2 = applyStatus(s, "player", "confidence", 1);
    const s3 = consumeStatus(s2, "player", "confidence");
    expect(s3.player.statuses.confidence).toBeUndefined();
  });
});

describe("tickStatuses", () => {
  it("decrements decaying status stacks by 1 and removes when reaching 0", () => {
    const statuses: StatusMap = { customer_facing: 2 };
    const ticked = tickStatuses(statuses);
    expect(ticked.customer_facing).toBe(1);
  });

  it("flow is NOT ticked — it is consumed entirely by END_TURN after firing", () => {
    const statuses: StatusMap = { flow: 2 };
    const ticked = tickStatuses(statuses);
    expect(ticked.flow).toBe(2); // unchanged by tick
  });

  it("does not change permanent statuses (pressure, stability, observability)", () => {
    const statuses: StatusMap = { pressure: 3, stability: 2 };
    const ticked = tickStatuses(statuses);
    expect(ticked.pressure).toBe(3);
    expect(ticked.stability).toBe(2);
  });

  it("does not change one-shot statuses (consumed at trigger, not ticked)", () => {
    const statuses: StatusMap = { confidence: 1, burnout: 1 };
    const ticked = tickStatuses(statuses);
    expect(ticked.confidence).toBe(1);
    expect(ticked.burnout).toBe(1);
  });
});

describe("burnWithModifiers", () => {
  it("applies pressure: adds stacks flat to burn", () => {
    expect(burnWithModifiers(6, { pressure: 2 }, {})).toBe(8);
  });

  it("applies confidence: doubles burn (caller consumes separately)", () => {
    expect(burnWithModifiers(6, { confidence: 1 }, {})).toBe(12);
  });

  it("applies throttled on source: floor(×0.75)", () => {
    expect(burnWithModifiers(6, { throttled: 1 }, {})).toBe(4); // floor(6 × 0.75) = 4
  });

  it("applies customer_facing on target: ceil(×1.5)", () => {
    expect(burnWithModifiers(6, {}, { customer_facing: 1 })).toBe(9); // ceil(6 × 1.5) = 9
  });

  it("stacks multiple modifiers in correct order: +pressure, ×throttled, ×customer_facing", () => {
    // (6+2)=8, throttled: floor(8×0.75)=6, customer_facing: ceil(6×1.5)=9
    expect(burnWithModifiers(6, { pressure: 2, throttled: 1 }, { customer_facing: 1 })).toBe(9);
  });
});

describe("headroomWithModifiers", () => {
  it("adds stability stacks flat to headroom", () => {
    expect(headroomWithModifiers(5, { stability: 3 })).toBe(8);
  });

  it("returns base amount when no stability", () => {
    expect(headroomWithModifiers(5, {})).toBe(5);
  });
});
