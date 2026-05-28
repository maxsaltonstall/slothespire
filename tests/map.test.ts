import { describe, it, expect } from "vitest";
import { buildActMap } from "../src/engine/map";
import { initialState } from "../src/engine/state";

describe("buildActMap", () => {
  it("returns a 7-row map with the first node being combat", () => {
    const s0 = initialState("map-test");
    const { nodes } = buildActMap(1, s0);
    expect(nodes.length).toBe(7);
    expect(nodes[0].length).toBe(1);
    expect(nodes[0][0].type).toBe("combat");
  });

  it("last row is always a single boss node", () => {
    const s0 = initialState("map-test");
    const { nodes } = buildActMap(1, s0);
    const lastRow = nodes[nodes.length - 1];
    expect(lastRow.length).toBe(1);
    expect(lastRow[0].type).toBe("boss");
  });

  it("produces 15 total nodes for Act I", () => {
    const s0 = initialState("map-test");
    const { nodes } = buildActMap(1, s0);
    const total = nodes.reduce((sum, row) => sum + row.length, 0);
    expect(total).toBe(15);
  });

  it("every node has a unique id", () => {
    const s0 = initialState("map-test");
    const { nodes } = buildActMap(1, s0);
    const ids = nodes.flat().map(n => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every non-boss node has at least one next connection", () => {
    const s0 = initialState("map-test");
    const { nodes } = buildActMap(1, s0);
    const nonBoss = nodes.flat().filter(n => n.type !== "boss");
    for (const node of nonBoss) {
      expect(node.next.length).toBeGreaterThan(0);
    }
  });

  it("produces a different map layout for a different seed", () => {
    const { nodes: nodesA } = buildActMap(1, initialState("seed-a"));
    const { nodes: nodesB } = buildActMap(1, initialState("seed-b"));
    const typesA = nodesA.flat().map(n => n.type).join(",");
    const typesB = nodesB.flat().map(n => n.type).join(",");
    expect(typesA).not.toBe(typesB);
  });
});
