import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";
import { makeCard } from "../src/content/cards";

function newRun() {
  return reduce(initialState("nav-test"), { type: "START_RUN" });
}

describe("START_RUN with map", () => {
  it("transitions to 'map' scene (not 'combat')", () => {
    const s1 = newRun();
    expect(s1.scene).toBe("map");
    expect(s1.combat).toBeUndefined();
  });

  it("generates a 7-row act I map with 15 nodes", () => {
    const s1 = newRun();
    expect(s1.map.nodes.length).toBe(7);
    const total = s1.map.nodes.reduce((n, row) => n + row.length, 0);
    expect(total).toBe(15);
  });

  it("sets currentNodeId to null (player has not chosen a node yet)", () => {
    const s1 = newRun();
    expect(s1.map.currentNodeId).toBeNull();
  });

  it("builds 10-card starter deck", () => {
    const s1 = newRun();
    expect(s1.deck.length).toBe(10);
  });
});

describe("NAVIGATE", () => {
  it("navigating to a combat node starts combat and sets scene to 'combat'", () => {
    const s1 = newRun();
    const combatNode = s1.map.nodes[0][0];
    expect(combatNode.type).toBe("combat");
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: combatNode.id });
    expect(s2.scene).toBe("combat");
    expect(s2.combat).toBeDefined();
    expect(s2.map.currentNodeId).toBe(combatNode.id);
  });

  it("combat start reshuffles full deck into draw and deals 5 to hand", () => {
    const s1 = newRun();
    const combatNode = s1.map.nodes[0][0];
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: combatNode.id });
    expect(s2.player.hand.length).toBe(5);
    expect(s2.player.draw.length).toBe(5); // 10 - 5 dealt
    expect(s2.player.discard.length).toBe(0);
  });

  it("navigating to a rest node transitions to 'rest' scene", () => {
    const s1 = newRun();
    const restNode = s1.map.nodes.flat().find(n => n.type === "rest");
    if (!restNode) return;
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: restNode.id });
    expect(s2.scene).toBe("rest");
    expect(s2.map.currentNodeId).toBe(restNode.id);
  });

  it("navigating to a shop node transitions to 'shop' scene", () => {
    const s1 = newRun();
    const shopNode = s1.map.nodes.flat().find(n => n.type === "shop");
    if (!shopNode) return;
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: shopNode.id });
    expect(s2.scene).toBe("shop");
  });

  it("navigating to an event node transitions to 'event' scene and sets currentEventId", () => {
    const s1 = newRun();
    const eventNode = s1.map.nodes.flat().find(n => n.type === "event");
    if (!eventNode) return;
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: eventNode.id });
    expect(s2.scene).toBe("event");
    expect(s2.currentEventId).toBeDefined();
  });

  it("navigating to a boss node starts combat with The Pager Storm", () => {
    const s1 = newRun();
    const bossNode = s1.map.nodes.flat().find(n => n.type === "boss")!;
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: bossNode.id });
    expect(s2.scene).toBe("combat");
    expect(s2.combat!.enemies[0].name).toBe("The Pager Storm");
  });

  it("adds nodeId to visitedNodeIds", () => {
    const s1 = newRun();
    const node = s1.map.nodes[0][0];
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: node.id });
    expect(s2.map.visitedNodeIds).toContain(node.id);
  });
});

describe("PICK_REWARD_CARD", () => {
  it("adds chosen card to deck and returns to 'map'", () => {
    let s = newRun();
    const offered = [makeCard("canary_deploy")];
    s = { ...s, scene: "reward", rewardCards: offered };
    const deckBefore = s.deck.length;
    const s2 = reduce(s, { type: "PICK_REWARD_CARD", cardInstanceId: offered[0].instanceId });
    expect(s2.scene).toBe("map");
    expect(s2.deck.length).toBe(deckBefore + 1);
    expect(s2.rewardCards).toBeUndefined();
  });

  it("null (skip) returns to 'map' without adding a card", () => {
    let s = newRun();
    s = { ...s, scene: "reward", rewardCards: [makeCard("circuit_breaker")] };
    const deckBefore = s.deck.length;
    const s2 = reduce(s, { type: "PICK_REWARD_CARD", cardInstanceId: null });
    expect(s2.scene).toBe("map");
    expect(s2.deck.length).toBe(deckBefore);
  });
});

describe("CHOOSE_REST_OPTION", () => {
  it("refresh restores 20% of max budget (capped at max)", () => {
    let s = newRun();
    s = { ...s, player: { ...s.player, budget: 40, maxBudget: 80 }, scene: "rest" };
    const s2 = reduce(s, { type: "CHOOSE_REST_OPTION", option: "refresh" });
    expect(s2.player.budget).toBe(56); // 40 + floor(80 × 0.2) = 40 + 16 = 56
    expect(s2.scene).toBe("map");
  });

  it("upgrade marks first non-upgraded deck card as upgraded and returns to 'map'", () => {
    let s = newRun();
    s = { ...s, scene: "rest" };
    const s2 = reduce(s, { type: "CHOOSE_REST_OPTION", option: "upgrade" });
    const upgraded = s2.deck.find(c => c.upgraded);
    expect(upgraded).toBeDefined();
    expect(s2.scene).toBe("map");
  });
});

describe("EVENT_CHOICE", () => {
  it("gainCredits outcome adds credits and returns to 'map'", () => {
    let s = newRun();
    // untested_migration choice 0 = gainCredits 50
    s = { ...s, scene: "event", currentEventId: "untested_migration", credits: 0 };
    const s2 = reduce(s, { type: "EVENT_CHOICE", choiceIndex: 0 });
    expect(s2.credits).toBe(50);
    expect(s2.scene).toBe("map");
    expect(s2.currentEventId).toBeUndefined();
  });

  it("addCurse outcome adds Tech Debt to deck", () => {
    let s = newRun();
    s = { ...s, scene: "event", currentEventId: "untested_migration" };
    const deckBefore = s.deck.length;
    // choice 2 = "Let the intern run it" = addCurse
    const s2 = reduce(s, { type: "EVENT_CHOICE", choiceIndex: 2 });
    expect(s2.deck.length).toBe(deckBefore + 1);
    expect(s2.deck[s2.deck.length - 1].type).toBe("curse");
  });
});
