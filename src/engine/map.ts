import type { GameState, MapNode } from "./state";
import { nextRng } from "./rng";

type NodeType = MapNode["type"];

// Fixed row sizes for Act I: [1, 2, 3, 3, 3, 2, 1] = 15 nodes
const ROW_SIZES = [1, 2, 3, 3, 3, 2, 1] as const;

// Type pool for each row (rows 0 and 6 are fixed)
const ROW_TYPE_POOLS: NodeType[][] = [
  ["combat"],
  ["combat", "event", "rest", "elite"],
  ["rest", "combat", "elite", "event", "shop"],
  ["shop", "event", "combat", "rest", "elite"],
  ["event", "combat", "rest", "elite", "shop"],
  ["rest", "event", "combat", "shop"],
  ["boss"],
];

export interface ActMap {
  nodes: MapNode[][];
  firstNodeId: string;
  state: GameState;
}

export function buildActMap(actNum: 1 | 2, state: GameState): ActMap {
  let s = state;
  const nodes: MapNode[][] = [];

  for (let rowIdx = 0; rowIdx < ROW_SIZES.length; rowIdx++) {
    const size = ROW_SIZES[rowIdx];
    const pool = ROW_TYPE_POOLS[rowIdx];

    let types: NodeType[];
    if (pool.length === 1) {
      types = [pool[0]];
    } else {
      // Use RNG to pick `size` types from the pool without repeats
      const remaining = [...pool];
      types = [];
      for (let i = 0; i < size && remaining.length > 0; i++) {
        const [rand, newState] = nextRng(s);
        s = newState;
        const idx = Math.floor(rand * remaining.length);
        types.push(remaining.splice(idx, 1)[0]);
      }
    }

    const row: MapNode[] = types.map((type, colIdx) => ({
      id: `a${actNum}r${rowIdx}c${colIdx}`,
      type,
      next: [],
    }));
    nodes.push(row);
  }

  // Connect each node to all nodes in the next row
  for (let rowIdx = 0; rowIdx < nodes.length - 1; rowIdx++) {
    const nextRow = nodes[rowIdx + 1];
    for (const node of nodes[rowIdx]) {
      node.next = nextRow.map(n => n.id);
    }
  }

  return {
    nodes,
    firstNodeId: nodes[0][0].id,
    state: s,
  };
}
