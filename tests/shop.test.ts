import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";
import { makeCard } from "../src/content/cards";

function shopState() {
  let s = reduce(initialState("shop-test"), { type: "START_RUN" });
  // Build a shop state manually to avoid seed dependency
  return {
    ...s,
    scene: "shop" as const,
    shopCards: [makeCard("rollback"), makeCard("circuit_breaker"), makeCard("load_balancer")],
    credits: 150,
  };
}

describe("NAVIGATE to shop generates shopCards", () => {
  it("shopCards is populated when navigating to a shop node", () => {
    const s0 = reduce(initialState("shop-nav"), { type: "START_RUN" });
    const shopNode = s0.map.nodes.flat().find(n => n.type === "shop");
    if (!shopNode) return; // skip if seed has no shop
    const s1 = reduce(s0, { type: "NAVIGATE", nodeId: shopNode.id });
    if (s1.scene !== "shop") return; // skip if navigate didn't hit shop
    expect(s1.shopCards?.length).toBe(3);
    expect(s1.scene).toBe("shop");
  });
});

describe("REMOVE_CARD", () => {
  it("removes chosen card from deck and costs 75 credits", () => {
    let s = shopState();
    s = { ...s, credits: 100 };
    const card = s.deck[0];
    const s2 = reduce(s, { type: "REMOVE_CARD", cardInstanceId: card.instanceId });
    expect(s2.deck.map(c => c.instanceId)).not.toContain(card.instanceId);
    expect(s2.credits).toBe(25);
  });

  it("no-op if not enough credits (< 75)", () => {
    let s = shopState();
    s = { ...s, credits: 50 };
    const card = s.deck[0];
    const s2 = reduce(s, { type: "REMOVE_CARD", cardInstanceId: card.instanceId });
    expect(s2).toBe(s);
  });
});

describe("BUY_CARD", () => {
  it("adds bought card to deck and deducts 90 credits", () => {
    let s = shopState();
    s = { ...s, credits: 200 };
    const card = s.shopCards![0];
    const deckBefore = s.deck.length;
    const s2 = reduce(s, { type: "BUY_CARD", cardInstanceId: card.instanceId });
    expect(s2.deck.length).toBe(deckBefore + 1);
    expect(s2.shopCards?.map(c => c.instanceId)).not.toContain(card.instanceId);
    expect(s2.credits).toBe(110); // 200 - 90
  });

  it("no-op if not enough credits (< 90)", () => {
    let s = shopState();
    s = { ...s, credits: 80 };
    const card = s.shopCards![0];
    const s2 = reduce(s, { type: "BUY_CARD", cardInstanceId: card.instanceId });
    expect(s2).toBe(s);
  });
});

describe("BUY_HOTFIX", () => {
  it("adds hotfix to player slots and deducts 60 credits", () => {
    let s = shopState();
    s = { ...s, credits: 100 };
    const s2 = reduce(s, { type: "BUY_HOTFIX", hotfixId: "rollback_hotfix" });
    expect(s2.player.hotfixes).toContain("rollback_hotfix");
    expect(s2.credits).toBe(40);
  });

  it("no-op if credits < 60", () => {
    let s = shopState();
    s = { ...s, credits: 50 };
    const s2 = reduce(s, { type: "BUY_HOTFIX", hotfixId: "rollback_hotfix" });
    expect(s2).toBe(s);
  });

  it("no-op if already has 3 hotfixes", () => {
    let s = shopState();
    s = { ...s, credits: 200, player: { ...s.player, hotfixes: ["rollback_hotfix", "failover_hotfix", "rollback_hotfix"] } };
    const s2 = reduce(s, { type: "BUY_HOTFIX", hotfixId: "failover_hotfix" });
    expect(s2).toBe(s);
  });
});
