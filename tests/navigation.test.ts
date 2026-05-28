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
