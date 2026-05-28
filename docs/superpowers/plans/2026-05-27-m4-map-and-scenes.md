# M4 — Map + Scene Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A navigable Act I run from start to finish: the player starts at the title, clicks NEW RUN, sees a branching map, navigates node by node (combat → reward → map → rest → map → boss → won), and can lose at any node. Every node type routes to a working (if minimal) scene. After winning Act I, the Act II map generates and the player continues.

**Architecture:** Four layers added to M3. (1) **Content**: `events.ts` (4 incidents) and `rewards.ts` (card reward generation). (2) **Engine**: `map.ts` (seeded map generator), new actions (NAVIGATE, PICK_REWARD_CARD, CHOOSE_REST_OPTION, EVENT_CHOICE), extended reducer. (3) **UI**: five new scenes (`scene-map`, `scene-reward`, `scene-rest`, `scene-event`, `scene-shop`). (4) **Wiring**: `main.ts` routes all 10 Scene values to real implementations instead of stub-bouncing to title.

**Tech Stack:** TypeScript + Vite (unchanged). Vitest. No new dependencies.

**Reference spec:** `docs/superpowers/specs/2026-05-27-slothespire-design.md` §2 (player experience), §4.3 (map structure).

**M3 baseline:** 88 tests. `GameState.map` is typed and in `initialState` but has empty nodes/null currentNodeId. `Scene` enum has all 10 values. `main.ts` stubs unimplemented scenes as title bounces.

---

## File structure (changes from M3)

```
slothespire/src/
├── content/
│   ├── events.ts          NEW    — 4 incident events with outcomes
│   └── rewards.ts         NEW    — generateCardReward(), credit award
├── engine/
│   ├── map.ts             NEW    — buildActMap(), node layout, seeded RNG
│   ├── actions.ts         MODIFY — add NAVIGATE, PICK_REWARD_CARD,
│   │                               CHOOSE_REST_OPTION, EVENT_CHOICE
│   └── reducer.ts         MODIFY — START_RUN → map; NAVIGATE routing;
│                                   PICK_REWARD_CARD; CHOOSE_REST_OPTION;
│                                   EVENT_CHOICE; combat win → reward
└── ui/
    ├── scene-map.ts       NEW    — act map renderer, clickable nodes
    ├── scene-reward.ts    NEW    — card draft (3 choices + skip)
    ├── scene-rest.ts      NEW    — heal 30% or upgrade a card
    ├── scene-event.ts     NEW    — incident event with 2-3 choices
    ├── scene-shop.ts      NEW    — minimal shop (card removal only in M4)
    └── main.ts            MODIFY — route all scenes to real implementations

slothespire/tests/
├── map.test.ts            NEW    — map generation unit tests (6 tests)
├── navigation.test.ts     NEW    — NAVIGATE + all action tests (16 tests)
└── (others unchanged)
```

**File responsibilities:**
- `map.ts`: pure map generation. Takes a seed state, returns `{ nodes: MapNode[][], firstNodeId: string, state: GameState }`. No reducer logic.
- `rewards.ts`: generates reward options (random cards from pool). No reducer logic.
- `events.ts`: static event data. No game logic.
- Reducer: orchestrates map generation on START_RUN; dispatches to correct scene on NAVIGATE; applies outcomes for PICK_REWARD_CARD, CHOOSE_REST_OPTION, EVENT_CHOICE.
- Scene files: pure render functions. No game logic — read state, dispatch actions.

---

## Design decisions (locked in before coding)

### Map layout (Act I, 7 rows, 15 nodes)

```
Row 0: [combat]                — Entry, always 1 combat node
Row 1: [combat, event]         — 2 nodes
Row 2: [rest, combat]          — 2 nodes
Row 3: [elite, shop]           — 2 nodes
Row 4: [event, combat]         — 2 nodes
Row 5: [rest]                  — 1 pre-boss node
Row 6: [boss]                  — Always boss
```

The types within each row (except rows 0 and 6) are randomized using the seeded RNG. Row templates (how many nodes) are fixed; which specific types appear within each row vary by seed.

Row type pools (RNG selects from these for each row slot):
- Row 1 types: ["combat", "combat", "event", "rest"]
- Row 2 types: ["rest", "combat", "elite", "event"]
- Row 3 types: ["shop", "event", "combat", "rest"]
- Row 4 types: ["event", "combat", "rest", "elite"]
- Row 5 types: ["rest", "event", "combat"] (1 node only)

Connections: every node in row N connects to every node in row N+1. This gives the player full choice at each crossing. Visually filtered by current position.

### Combat → reward → map flow

- Non-boss combat win (scene "won" from PLAY_CARD/END_TURN/USE_HOTFIX):
  - M3 set `scene: "won"` directly. M4 changes this to `scene: "reward"` and generates 3 card choices.
  - After PICK_REWARD_CARD → `scene: "map"`.
- Boss combat win: `scene: "won"` (victory screen). M4: Act I boss win → check if act 2 exists; if so generate Act II map and transition to "map"; if act 2 just finished → "won".
- Loss stays as "lost" (unchanged).

### Credits

- Combat reward: gain 50 credits (flat, tunable later).
- Elite reward: gain 75 credits.
- Treasure node: give 1 free card + 25 credits (no relics until M5).
- Shop in M4: shows card removal (75 credits) — player can't buy new cards yet ("stock coming soon"). Simplest possible shop.
- Credits are already in `GameState.credits`; just needs incrementing on appropriate actions.

### Rest site (CHOOSE_REST_OPTION)

- `"refresh"`: restore `floor(maxBudget × 0.3)` budget (capped at maxBudget).
- `"upgrade"`: pick the first non-upgraded card in `state.deck` and set `upgraded: true`. For M4, upgraded cards don't yet have different effect values (that's M5 card-upgrade content pass). The `upgraded` flag is set, the card UI shows a `+` suffix, but effects are unchanged until M5 defines `upgradedEffects` on each CardDef.
- Both options → `scene: "map"`.

### Event outcomes (EventChoice)

Each event choice has an `outcome` that the reducer applies:

```ts
type EventOutcome =
  | { kind: "nothing" }
  | { kind: "gainCredits"; amount: number }
  | { kind: "loseCredits"; amount: number }
  | { kind: "loseMaxBudget"; amount: number }  // permanent SLO budget reduction
  | { kind: "gainCard"; rarity: "common" | "uncommon" | "rare" }  // random card by rarity
  | { kind: "addCurse" }  // Tech Debt curse added to deck
```

### Reward generation

Cards offered in combat rewards are drawn from the full card pool (`CARD_DEFS`), excluding the starter-only cards and curses. Rarity weights:
- Common: 60%
- Uncommon: 30%
- Rare: 10%

Three unique cards are offered (no duplicates by `id`).

---

## Task 1: Content — `events.ts` + `rewards.ts`

**Files:**
- Create: `src/content/events.ts`
- Create: `src/content/rewards.ts`

No tests for static data.

- [ ] **Step 1: Create `src/content/events.ts`**

```ts
export interface EventChoice {
  text: string;
  outcome: EventOutcome;
}

export type EventOutcome =
  | { kind: "nothing" }
  | { kind: "gainCredits"; amount: number }
  | { kind: "loseCredits"; amount: number }
  | { kind: "loseMaxBudget"; amount: number }
  | { kind: "gainCard"; rarity: "common" | "uncommon" | "rare" }
  | { kind: "addCurse" };

export interface IncidentEvent {
  id: string;
  title: string;
  text: string;
  choices: EventChoice[];
}

export const EVENTS: IncidentEvent[] = [
  {
    id: "untested_migration",
    title: "The Untested Migration",
    text: "You find a schema migration in the deployment pipeline marked 'low risk.' It has never been run against production data. Three engineers promise it's fine.",
    choices: [
      { text: "Run it anyway", outcome: { kind: "gainCredits", amount: 50 } },
      { text: "Roll it back and schedule a review", outcome: { kind: "nothing" } },
      { text: "Let the intern run it 'for experience'", outcome: { kind: "addCurse" } },
    ],
  },
  {
    id: "heroic_engineer",
    title: "Heroic Engineer",
    text: "A senior engineer offers to stay up all night and manually patch the issue. 'Don't page anyone, I've got this,' they say. Truly inspiring.",
    choices: [
      { text: "Accept their sacrifice", outcome: { kind: "gainCard", rarity: "rare" } },
      { text: "Insist on proper on-call rotation", outcome: { kind: "gainCredits", amount: 30 } },
    ],
  },
  {
    id: "vendor_outage",
    title: "Vendor Outage",
    text: "Your cloud provider is experiencing 'elevated error rates' in the region your database lives in. Their status page says 'investigating.' That's all.",
    choices: [
      { text: "Wait it out (what choice do you have?)", outcome: { kind: "loseMaxBudget", amount: 5 } },
      { text: "Fail over to backup region", outcome: { kind: "loseCredits", amount: 50 } },
    ],
  },
  {
    id: "mystery_microservice",
    title: "Mystery Box Microservice",
    text: "You discover a service in the catalog with no owner, no documentation, and 40,000 requests per second. Disabling it would be catastrophic. Probably.",
    choices: [
      { text: "Leave it alone and pretend you didn't see it", outcome: { kind: "nothing" } },
      { text: "Add a README and assign an owner", outcome: { kind: "gainCredits", amount: 75 } },
      { text: "Refactor it on the spot", outcome: { kind: "addCurse" } },
    ],
  },
];
```

- [ ] **Step 2: Create `src/content/rewards.ts`**

```ts
import type { GameState } from "../engine/state";
import type { CardDef } from "./cards";
import { CARD_DEFS, makeCard } from "./cards";
import type { Card } from "../engine/state";
import { nextRng } from "../engine/rng";

// Cards eligible for reward offers (no starter-only, no curses)
const REWARD_POOL: CardDef[] = Object.values(CARD_DEFS).filter(
  def => def.type !== "curse" && def.cost >= 0 &&
    !["manual_fix", "failover", "page_senior_engineer"].includes(def.id)
);

const RARITY_WEIGHTS: Record<string, number> = {
  common: 60,
  uncommon: 30,
  rare: 10,
};

function weightedRarityPick(rng: () => number): "common" | "uncommon" | "rare" {
  const roll = rng() * 100;
  if (roll < 60) return "common";
  if (roll < 90) return "uncommon";
  return "rare";
}

export function generateCardReward(state: GameState, count = 3): [Card[], GameState] {
  let s = state;
  const offered: Card[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    let [roll, newState] = nextRng(s);
    s = newState;
    const targetRarity = weightedRarityPick(() => roll);

    const pool = REWARD_POOL.filter(d => {
      // Map rarity: common cards have cost 1, uncommon cost 1-2, rare cost 2-3
      // Use a simple heuristic: manual_fix/canary/failover/circuit_breaker = common
      // page_senior_engineer/auto_scaling/chaos_engineering = uncommon
      // page_the_ceo = rare
      const rarityMap: Record<string, string> = {
        canary_deploy: "common", circuit_breaker: "common",
        chaos_engineering: "uncommon", auto_scaling: "uncommon",
        page_the_ceo: "rare",
        runbook: "common",
      };
      const cardRarity = rarityMap[d.id] ?? "common";
      return cardRarity === targetRarity && !usedIds.has(d.id);
    });

    // Fall back to any available card if pool is empty
    const candidates = pool.length > 0 ? pool : REWARD_POOL.filter(d => !usedIds.has(d.id));
    if (candidates.length === 0) break;

    [roll, newState] = nextRng(s);
    s = newState;
    const def = candidates[Math.floor(roll * candidates.length)];
    usedIds.add(def.id);
    offered.push(makeCard(def.id));
  }

  return [offered, s];
}

export const COMBAT_CREDITS = 50;
export const ELITE_CREDITS = 75;
export const TREASURE_CREDITS = 25;
```

- [ ] **Step 3: Run `npm run build` — must pass**

- [ ] **Step 4: Commit**

```bash
git add slothespire/src/content/events.ts slothespire/src/content/rewards.ts
git commit -m "feat(content): 4 incident events + card reward generation"
```

---

## Task 2: Map generation (`src/engine/map.ts`) — TDD

**Files:**
- Create: `src/engine/map.ts`
- Test: `tests/map.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/map.test.ts`:

```ts
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
    // Very likely to differ across seeds (not guaranteed mathematically,
    // but with enough variation in the pool this holds for any reasonable seeds)
    expect(typesA).not.toBe(typesB);
  });
});
```

- [ ] **Step 2: Run `npm test` — FAIL (no map module)**

- [ ] **Step 3: Implement `src/engine/map.ts`**

```ts
import type { GameState, MapNode } from "./state";
import { nextRng } from "./rng";

type NodeType = MapNode["type"];

// Fixed row sizes for Act I
const ROW_SIZES = [1, 2, 2, 2, 2, 1, 1] as const;

// Type pool for each row (row 0 = combat, row 6 = boss, others randomized from pool)
const ROW_TYPE_POOLS: NodeType[][] = [
  ["combat"],                                          // row 0 — fixed
  ["combat", "combat", "event", "rest"],               // row 1
  ["rest", "combat", "elite", "event"],                // row 2
  ["shop", "event", "combat", "rest"],                 // row 3
  ["event", "combat", "rest", "elite"],                // row 4
  ["rest", "event", "combat"],                         // row 5
  ["boss"],                                            // row 6 — fixed
];

function pickFromPool(pool: NodeType[], rng: () => number, count: number): NodeType[] {
  const remaining = [...pool];
  const result: NodeType[] = [];
  for (let i = 0; i < count && remaining.length > 0; i++) {
    const idx = Math.floor(rng() * remaining.length);
    result.push(remaining.splice(idx, 1)[0]);
  }
  return result;
}

export interface ActMap {
  nodes: MapNode[][];
  firstNodeId: string;
  state: GameState;
}

export function buildActMap(actNum: 1 | 2, state: GameState): ActMap {
  let s = state;
  const nodes: MapNode[][] = [];

  // Build each row
  for (let rowIdx = 0; rowIdx < ROW_SIZES.length; rowIdx++) {
    const size = ROW_SIZES[rowIdx];
    const pool = ROW_TYPE_POOLS[rowIdx];
    const types: NodeType[] = [];

    if (pool.length === 1) {
      // Fixed type (row 0 and row 6)
      types.push(...pool);
    } else {
      // Randomize which types appear in this row
      const [rand, newState] = nextRng(s);
      s = newState;
      const picked = pickFromPool(pool, () => rand, size);
      // Shuffle the picked types for variety
      const [rand2, newState2] = nextRng(s);
      s = newState2;
      if (rand2 > 0.5 && picked.length > 1) picked.reverse();
      types.push(...picked);
    }

    const row: MapNode[] = types.map((type, colIdx) => ({
      id: `a${actNum}r${rowIdx}c${colIdx}`,
      type,
      next: [],   // filled in next pass
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
```

- [ ] **Step 4: Run `npm test` — expect **88 + 6 = 94 pass****

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/map.ts slothespire/tests/map.test.ts
git commit -m "feat(engine): seeded act map generation — 7 rows, 15 nodes, branching paths"
```

---

## Task 3: New action types

**Files:**
- Modify: `src/engine/actions.ts`

- [ ] **Step 1: Replace `src/engine/actions.ts`**

```ts
import type { GameState } from "./state";

export type Action =
  | { type: "START_RUN" }
  | { type: "RETURN_TO_TITLE" }
  | { type: "PLAY_CARD"; cardInstanceId: string; targetId: string | null }
  | { type: "END_TURN" }
  | { type: "USE_HOTFIX"; hotfixId: string; targetId: string | null }
  | { type: "NAVIGATE"; nodeId: string }
  | { type: "PICK_REWARD_CARD"; cardInstanceId: string | null }  // null = skip reward
  | { type: "CHOOSE_REST_OPTION"; option: "refresh" | "upgrade" }
  | { type: "EVENT_CHOICE"; choiceIndex: number }
  | { type: "LOAD_RUN"; state: GameState };   // re-added: needed for boot path
```

Note: `LOAD_RUN` is re-added because `main.ts` needs it to load a save mid-session when the player clicks CONTINUE.

- [ ] **Step 2: Run `npm run build` — must pass**

- [ ] **Step 3: Commit**

```bash
git add slothespire/src/engine/actions.ts
git commit -m "feat(engine): action types — NAVIGATE, PICK_REWARD_CARD, CHOOSE_REST_OPTION, EVENT_CHOICE, LOAD_RUN"
```

---

## Task 4: START_RUN → map; NAVIGATE → scene routing — TDD

**Files:**
- Modify: `src/engine/reducer.ts`
- Test: `tests/navigation.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/navigation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

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

  it("builds starter deck", () => {
    const s1 = newRun();
    expect(s1.deck.length).toBe(10);
  });
});

describe("NAVIGATE", () => {
  it("navigating to a combat node starts combat and transitions to 'combat' scene", () => {
    const s1 = newRun();
    const firstCombatNode = s1.map.nodes[0][0]; // always combat
    expect(firstCombatNode.type).toBe("combat");
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: firstCombatNode.id });
    expect(s2.scene).toBe("combat");
    expect(s2.combat).toBeDefined();
    expect(s2.map.currentNodeId).toBe(firstCombatNode.id);
  });

  it("navigating to a rest node transitions to 'rest' scene", () => {
    const s1 = newRun();
    // Find any rest node in the map
    const restNode = s1.map.nodes.flat().find(n => n.type === "rest");
    if (!restNode) return; // seed might not have rest node
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

  it("navigating to an event node transitions to 'event' scene and picks an event", () => {
    const s1 = newRun();
    const eventNode = s1.map.nodes.flat().find(n => n.type === "event");
    if (!eventNode) return;
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: eventNode.id });
    expect(s2.scene).toBe("event");
    expect(s2.currentEventId).toBeDefined(); // reducer sets which event is active
  });

  it("navigating to a boss node starts combat with a boss enemy", () => {
    const s1 = newRun();
    const bossNode = s1.map.nodes.flat().find(n => n.type === "boss")!;
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: bossNode.id });
    expect(s2.scene).toBe("combat");
    expect(s2.combat).toBeDefined();
    expect(s2.combat!.enemies[0].name).toBe("The Pager Storm");
  });

  it("adds nodeId to visitedNodeIds", () => {
    const s1 = newRun();
    const node = s1.map.nodes[0][0];
    const s2 = reduce(s1, { type: "NAVIGATE", nodeId: node.id });
    expect(s2.map.visitedNodeIds).toContain(node.id);
  });
});
```

Note: the test for `s2.currentEventId` requires adding `currentEventId?: string` to `GameState`. Add it in this task.

- [ ] **Step 2: Run `npm test` — FAIL**

- [ ] **Step 3: Add `currentEventId` and `rewardCards` to `GameState` in `src/engine/state.ts`**

Add two optional fields at the end of the `GameState` interface (before the closing `}`):

```ts
  currentEventId?: string;           // id of the active incident event
  rewardCards?: Card[];              // cards offered in the current reward screen
```

- [ ] **Step 4: Update `START_RUN` and add `NAVIGATE` in `src/engine/reducer.ts`**

Add imports at the top:
```ts
import { buildActMap } from "./map";
import { EVENTS } from "../content/events";
import { generateCardReward, COMBAT_CREDITS, ELITE_CREDITS } from "../content/rewards";
import { createEnemy } from "../content/enemies";
```

Replace the `START_RUN` case:

```ts
    case "START_RUN": {
      const deck = buildStarterDeck();
      let s: GameState = { ...initialState(state.meta.seed), deck };
      const [shuffled, afterShuffle] = shuffleDeck(deck, s);
      s = { ...afterShuffle, player: { ...afterShuffle.player, draw: shuffled } };

      // Build act I map
      const { nodes, state: afterMap } = buildActMap(1, s);
      s = { ...afterMap, map: { act: 1, nodes, currentNodeId: null, visitedNodeIds: [] } };

      return { ...s, scene: "map" };
    }
```

Add the `NAVIGATE` case:

```ts
    case "NAVIGATE": {
      const { nodeId } = action;
      const node = state.map.nodes.flat().find(n => n.id === nodeId);
      if (!node) return state;

      let s: GameState = {
        ...state,
        map: {
          ...state.map,
          currentNodeId: nodeId,
          visitedNodeIds: [...state.map.visitedNodeIds, nodeId],
        },
      };

      switch (node.type) {
        case "combat":
        case "elite": {
          // Use flapping_health_check for all non-boss combats in M4 (full pool in M5)
          const enemy = createEnemy("flapping_health_check");
          const firstIntent = getIntent(enemy.defId, 0);
          // Shuffle full deck into draw for new combat, clear statuses, reset energy
          const [shuffledDeck, afterShuffle] = shuffleDeck(s.deck, s);
          s = afterShuffle;
          let fresh: GameState = {
            ...s,
            player: {
              ...s.player,
              energy: s.player.energyPerTurn,
              headroom: 0,
              hand: [],
              draw: shuffledDeck,
              discard: [],
              statuses: {},
            },
          };
          fresh = drawCards(fresh, 5);
          return {
            ...fresh,
            scene: "combat",
            combat: {
              enemies: [enemy],
              intentByEnemy: { [enemy.instanceId]: firstIntent },
              activePowers: [],
              turn: 1,
              phase: "player",
            },
          };
        }

        case "boss": {
          const boss = createEnemy("the_pager_storm");
          const firstIntent = getIntent(boss.defId, 0);
          const [shuffledDeck, afterShuffle] = shuffleDeck(s.deck, s);
          s = afterShuffle;
          let fresh: GameState = {
            ...s,
            player: {
              ...s.player,
              energy: s.player.energyPerTurn,
              headroom: 0,
              hand: [],
              draw: shuffledDeck,
              discard: [],
              statuses: {},
            },
          };
          fresh = drawCards(fresh, 5);
          return {
            ...fresh,
            scene: "combat",
            combat: {
              enemies: [boss],
              intentByEnemy: { [boss.instanceId]: firstIntent },
              activePowers: [],
              turn: 1,
              phase: "player",
            },
          };
        }

        case "rest":
          return { ...s, scene: "rest" };

        case "shop":
          return { ...s, scene: "shop" };

        case "event": {
          const [rand, newState] = nextRng(s);
          s = newState;
          const event = EVENTS[Math.floor(rand * EVENTS.length)];
          return { ...s, scene: "event", currentEventId: event.id };
        }

        case "treasure": {
          const [cards, newState] = generateCardReward(s, 1);
          s = newState;
          return { ...s, scene: "reward", rewardCards: cards, credits: s.credits + 25 };
        }

        default:
          return { ...s, scene: "map" };
      }
    }

    case "LOAD_RUN":
      return action.state;
```

Add imports at top of reducer.ts:
```ts
import { nextRng } from "./rng";
import { shuffleDeck, drawCards, burnEnemy, addHeadroom, applyStatus, consumeStatus,
         tickStatuses, burnWithModifiers, headroomWithModifiers } from "./effects";
```
(shuffleDeck and drawCards are already imported; just verify nextRng is included).
```

Also add boss enemy to `enemies.ts`:

```ts
  the_pager_storm: {
    id: "the_pager_storm",
    name: "The Pager Storm",
    stability: 60,
    intentPattern: [
      { kind: "burn" as const, amount: 10 },
      { kind: "debuff" as const, status: "on_call_fatigue" as const, stacks: 1 },
      { kind: "burn" as const, amount: 14 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 2 },
    ],
  },
```

- [ ] **Step 5: Run `npm test` — expect **94 + 10 = 104 pass** (4 START_RUN + 6 NAVIGATE = 10 new)**

(Note: the "navigating to rest/shop/event" tests use `if (!node) return` guards, so they're skippable when that node type isn't in the seed's map, but the key combat + boss + visitedNodeIds tests always run.)

- [ ] **Step 6: Commit**

```bash
git add slothespire/src/engine/reducer.ts slothespire/src/engine/state.ts slothespire/src/content/enemies.ts slothespire/tests/navigation.test.ts
git commit -m "feat(engine): START_RUN → map; NAVIGATE routes all node types; boss enemy added"
```

---

## Task 5: PICK_REWARD_CARD + combat-win → reward + CHOOSE_REST_OPTION + EVENT_CHOICE — TDD

**Files:**
- Modify: `src/engine/reducer.ts`
- Modify: `tests/navigation.test.ts`

- [ ] **Step 1: Change combat-win transition from "won" → "reward" (for non-boss fights)**

In PLAY_CARD, END_TURN, and USE_HOTFIX, the current win check is:
```ts
if (s.combat && s.combat.enemies.every(e => e.stability <= 0)) {
  return { ...s, scene: "won", combat: undefined };
}
```

Change it to check whether the current node is a boss:

```ts
if (s.combat && s.combat.enemies.every(e => e.stability <= 0)) {
  const currentNode = s.map.nodes.flat().find(n => n.id === s.map.currentNodeId);
  const isBoss = currentNode?.type === "boss";
  if (isBoss) {
    // Boss win: check if this is act 2 (game over) or act 1 (generate act 2 map)
    if (s.map.act === 2) {
      return { ...s, scene: "won", combat: undefined };
    }
    // Act 1 boss: generate act 2 map
    const { nodes: act2Nodes, state: afterMap } = buildActMap(2, s);
    return {
      ...afterMap,
      scene: "map",
      combat: undefined,
      map: { act: 2, nodes: act2Nodes, currentNodeId: null, visitedNodeIds: [] },
    };
  }
  // Non-boss win: generate reward cards
  const creditBonus = currentNode?.type === "elite" ? ELITE_CREDITS : COMBAT_CREDITS;
  const [rewardCards, afterReward] = generateCardReward(s);
  return {
    ...afterReward,
    scene: "reward",
    combat: undefined,
    rewardCards,
    credits: s.credits + creditBonus,
  };
}
```

This change must be applied in **all three places** where the win check appears: PLAY_CARD, END_TURN (via checking stability after an enemy kill — actually END_TURN doesn't kill enemies, but PLAY_CARD and USE_HOTFIX do), and USE_HOTFIX.

Actually: END_TURN doesn't reduce enemy stability (enemies attack the player, not the other way). Only PLAY_CARD and USE_HOTFIX can reduce enemy stability to 0. So the change only needs to happen in those two cases.

- [ ] **Step 2: Add PICK_REWARD_CARD, CHOOSE_REST_OPTION, EVENT_CHOICE to reducer**

```ts
    case "PICK_REWARD_CARD": {
      const { cardInstanceId } = action;
      // Skip reward
      if (!cardInstanceId) {
        return { ...state, scene: "map", rewardCards: undefined };
      }
      // Find the picked card in rewardCards
      const picked = (state.rewardCards ?? []).find(c => c.instanceId === cardInstanceId);
      if (!picked) return state;
      return {
        ...state,
        scene: "map",
        deck: [...state.deck, picked],
        rewardCards: undefined,
      };
    }

    case "CHOOSE_REST_OPTION": {
      if (action.option === "refresh") {
        const healed = Math.min(
          state.player.maxBudget,
          state.player.budget + Math.floor(state.player.maxBudget * 0.3)
        );
        return {
          ...state,
          scene: "map",
          player: { ...state.player, budget: healed },
        };
      }
      // upgrade: find the first non-upgraded card in deck and upgrade it
      const upgradeIdx = state.deck.findIndex(c => !c.upgraded);
      if (upgradeIdx === -1) {
        // Nothing to upgrade — just go back to map
        return { ...state, scene: "map" };
      }
      const upgradedDeck = state.deck.map((c, i) =>
        i === upgradeIdx ? { ...c, upgraded: true, name: c.name + "+" } : c
      );
      return { ...state, scene: "map", deck: upgradedDeck };
    }

    case "EVENT_CHOICE": {
      const event = EVENTS.find(e => e.id === state.currentEventId);
      if (!event) return { ...state, scene: "map", currentEventId: undefined };
      const choice = event.choices[action.choiceIndex];
      if (!choice) return state;

      let s: GameState = { ...state, currentEventId: undefined };
      const outcome = choice.outcome;

      if (outcome.kind === "gainCredits") {
        s = { ...s, credits: s.credits + outcome.amount };
      } else if (outcome.kind === "loseCredits") {
        s = { ...s, credits: Math.max(0, s.credits - outcome.amount) };
      } else if (outcome.kind === "loseMaxBudget") {
        s = {
          ...s,
          player: {
            ...s.player,
            maxBudget: s.player.maxBudget - outcome.amount,
            budget: Math.min(s.player.budget, s.player.maxBudget - outcome.amount),
          },
        };
      } else if (outcome.kind === "addCurse") {
        const { makeCard } = await import("../content/cards"); // dynamic import to avoid circular
        s = { ...s, deck: [...s.deck, makeCard("tech_debt")] };
      } else if (outcome.kind === "gainCard") {
        const [cards, newState] = generateCardReward(s, 1);
        s = { ...newState, deck: [...newState.deck, ...cards] };
      }
      // "nothing" — no changes

      return { ...s, scene: "map" };
    }

    case "LOAD_RUN":
      return action.state;
```

Note: the `await import(...)` in `EVENT_CHOICE` is async but the reducer must be synchronous. Fix: pre-import `makeCard` at the top of the file rather than using dynamic import. Since `cards.ts` and `reducer.ts` already have a dependency (reducer imports CARD_DEFS), just add `makeCard` to the existing import:

```ts
import { buildStarterDeck, CARD_DEFS, makeCard } from "../content/cards";
```

Replace the `addCurse` branch with:
```ts
      } else if (outcome.kind === "addCurse") {
        s = { ...s, deck: [...s.deck, makeCard("tech_debt")] };
```

- [ ] **Step 3: Write failing tests — append to `tests/navigation.test.ts`**

```ts
describe("PICK_REWARD_CARD", () => {
  it("adds the chosen card to deck and returns to map", () => {
    let s = newRun();
    // Navigate to first combat node and simulate win
    const combatNode = s.map.nodes[0][0];
    s = reduce(s, { type: "NAVIGATE", nodeId: combatNode.id });
    // Simulate winning: produce a reward state manually
    const { makeCard } = await import("../src/content/cards");
    const offered = [makeCard("canary_deploy")];
    s = { ...s, scene: "reward", rewardCards: offered, combat: undefined };
    const deckBefore = s.deck.length;
    const s2 = reduce(s, { type: "PICK_REWARD_CARD", cardInstanceId: offered[0].instanceId });
    expect(s2.scene).toBe("map");
    expect(s2.deck.length).toBe(deckBefore + 1);
    expect(s2.rewardCards).toBeUndefined();
  });

  it("skip (null) returns to map without adding a card", () => {
    const { makeCard } = await import("../src/content/cards");
    let s = newRun();
    s = { ...s, scene: "reward", rewardCards: [makeCard("circuit_breaker")] };
    const deckBefore = s.deck.length;
    const s2 = reduce(s, { type: "PICK_REWARD_CARD", cardInstanceId: null });
    expect(s2.scene).toBe("map");
    expect(s2.deck.length).toBe(deckBefore);
  });
});

describe("CHOOSE_REST_OPTION", () => {
  it("refresh restores 30% of max budget", () => {
    let s = newRun();
    s = { ...s, player: { ...s.player, budget: 40, maxBudget: 80 }, scene: "rest" };
    const s2 = reduce(s, { type: "CHOOSE_REST_OPTION", option: "refresh" });
    expect(s2.player.budget).toBe(40 + Math.floor(80 * 0.3)); // 40 + 24 = 64
    expect(s2.scene).toBe("map");
  });

  it("upgrade marks first non-upgraded deck card as upgraded", () => {
    let s = newRun();
    s = { ...s, scene: "rest" };
    const s2 = reduce(s, { type: "CHOOSE_REST_OPTION", option: "upgrade" });
    const upgradedCard = s2.deck.find(c => c.upgraded);
    expect(upgradedCard).toBeDefined();
    expect(s2.scene).toBe("map");
  });
});

describe("EVENT_CHOICE", () => {
  it("gainCredits outcome adds credits and returns to map", () => {
    let s = newRun();
    // Set up an event that has a gainCredits outcome
    s = { ...s, scene: "event", currentEventId: "untested_migration", credits: 0 };
    // Choice 0 of "untested_migration" = "Run it anyway" = gainCredits 50
    const s2 = reduce(s, { type: "EVENT_CHOICE", choiceIndex: 0 });
    expect(s2.credits).toBe(50);
    expect(s2.scene).toBe("map");
    expect(s2.currentEventId).toBeUndefined();
  });

  it("addCurse outcome adds Tech Debt to deck", () => {
    let s = newRun();
    s = { ...s, scene: "event", currentEventId: "untested_migration" };
    // Choice 2 = "Let the intern run it" = addCurse
    const deckBefore = s.deck.length;
    const s2 = reduce(s, { type: "EVENT_CHOICE", choiceIndex: 2 });
    expect(s2.deck.length).toBe(deckBefore + 1);
    expect(s2.deck[s2.deck.length - 1].type).toBe("curse");
  });
});
```

Note: these tests use `await import(...)` — Vitest supports top-level await in test files. Alternatively, import `makeCard` statically at the top of `navigation.test.ts`.

Add `import { makeCard } from "../src/content/cards";` to the top of `navigation.test.ts`.

- [ ] **Step 4: Run `npm test` — expect **104 + 6 = 110 pass****

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/reducer.ts slothespire/tests/navigation.test.ts
git commit -m "feat(engine): PICK_REWARD_CARD, CHOOSE_REST_OPTION, EVENT_CHOICE; combat win → reward"
```

---

## Task 6: `scene-map.ts` + `scene-reward.ts`

**Files:**
- Create: `src/ui/scene-map.ts`
- Create: `src/ui/scene-reward.ts`

No Vitest tests — verified in smoke test.

- [ ] **Step 1: Create `src/ui/scene-map.ts`**

```ts
import type { GameState, MapNode } from "../engine/state";
import type { Action } from "../engine/actions";

const NODE_ICONS: Record<MapNode["type"], string> = {
  combat: "⚔",
  elite: "☠",
  rest: "✝",
  shop: "⚙",
  event: "?",
  treasure: "🎁",
  boss: "👑",
};

const NODE_LABELS: Record<MapNode["type"], string> = {
  combat: "Combat",
  elite: "Elite",
  rest: "Postmortem",
  shop: "Build Server",
  event: "Incident",
  treasure: "Treasure",
  boss: "BOSS",
};

export function renderMap(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-map";

  const { nodes, currentNodeId, visitedNodeIds, act } = state.map;

  // Determine reachable node IDs
  const reachable = new Set<string>();
  if (!currentNodeId) {
    // Start of act: first row is reachable
    nodes[0]?.forEach(n => reachable.add(n.id));
  } else {
    const current = nodes.flat().find(n => n.id === currentNodeId);
    current?.next.forEach(id => reachable.add(id));
  }

  const rowsHtml = [...nodes].reverse().map((row, revIdx) => {
    const rowIdx = nodes.length - 1 - revIdx;
    const nodesHtml = row.map(node => {
      const isVisited = visitedNodeIds.includes(node.id);
      const isReachable = reachable.has(node.id);
      const isCurrent = node.id === currentNodeId;
      const classes = [
        "map-node",
        node.type,
        isVisited ? "visited" : "",
        isReachable ? "reachable" : "",
        isCurrent ? "current" : "",
      ].filter(Boolean).join(" ");
      return `
        <div class="${classes}" data-node-id="${node.id}"
             title="${NODE_LABELS[node.type]}">
          <div class="node-icon">${NODE_ICONS[node.type]}</div>
          <div class="node-label">${NODE_LABELS[node.type]}</div>
        </div>
      `;
    }).join("");
    return `<div class="map-row" data-row="${rowIdx}">${nodesHtml}</div>`;
  }).join("");

  root.innerHTML = `
    <style>
      .scene-map {
        flex: 1; display: flex; flex-direction: column;
        padding: 24px; gap: 8px;
      }
      .map-header {
        font-family: var(--font-display); font-size: 12px;
        color: var(--color-accent); opacity: 0.7;
        margin-bottom: 8px;
      }
      .map-rows { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; }
      .map-row { display: flex; gap: 16px; justify-content: center; align-items: center; }
      .map-node {
        width: 80px; padding: 8px 4px; text-align: center;
        border: 1px solid var(--color-border-low); border-radius: 6px;
        background: var(--color-base-deep); opacity: 0.4;
        transition: opacity 0.15s, transform 0.1s;
      }
      .map-node.visited { opacity: 0.6; border-color: var(--color-text-dim); }
      .map-node.current { opacity: 0.8; border-color: var(--color-accent);
        box-shadow: var(--glow-accent); }
      .map-node.reachable {
        opacity: 1; cursor: pointer; border-color: var(--color-accent);
      }
      .map-node.reachable:hover { transform: scale(1.08); }
      .map-node.boss.reachable { border-color: var(--color-pop); box-shadow: var(--glow-pop); }
      .map-node.elite.reachable { border-color: var(--color-danger); box-shadow: var(--glow-danger); }
      .node-icon { font-size: 22px; }
      .node-label { font-family: var(--font-display); font-size: 8px;
        color: var(--color-text-dim); letter-spacing: 0.5px; margin-top: 2px; }
      .map-footer {
        display: flex; align-items: center; gap: 16px;
        font-family: var(--font-display); font-size: 11px;
        color: var(--color-text-dim); margin-top: 8px;
      }
      .map-footer .credits { color: var(--color-energy); }
    </style>
    <div class="map-header">// ACT ${act} · ${act === 1 ? "Single-Service SLO" : "User-Journey SLO"}</div>
    <div class="map-rows">${rowsHtml}</div>
    <div class="map-footer">
      <span>SLO BUDGET <b>${state.player.budget}/${state.player.maxBudget}</b></span>
      <span>DECK <b>${state.deck.length}</b></span>
      <span class="credits">CREDITS <b>${state.credits}</b></span>
    </div>
  `;

  // Wire click handlers on reachable nodes
  root.querySelectorAll<HTMLDivElement>(".map-node.reachable").forEach(el => {
    el.addEventListener("click", () => {
      const nodeId = el.dataset.nodeId!;
      dispatch({ type: "NAVIGATE", nodeId });
    });
  });

  return root;
}
```

- [ ] **Step 2: Create `src/ui/scene-reward.ts`**

```ts
import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { CARD_DEFS } from "../content/cards";

export function renderReward(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-reward";
  const offered = state.rewardCards ?? [];

  const cardsHtml = offered.map(card => {
    const def = CARD_DEFS[card.defId];
    const effectText = def?.effects.map(e => {
      if (e.kind === "burn") return `Burn ${e.amount}`;
      if (e.kind === "headroom") return `+${e.amount} Headroom`;
      if (e.kind === "draw") return `Draw ${e.amount}`;
      if (e.kind === "selfBurn") return `Self-Burn ${e.amount}`;
      if (e.kind === "applyStatus") return `Apply ${e.status} ${e.stacks}`;
      return "";
    }).join(". ") ?? "";
    const typeIcon = card.type === "attack" ? "⚔" : card.type === "power" ? "✦" : "🛡";
    return `
      <div class="reward-card" data-card-id="${card.instanceId}">
        <div class="rc-cost">${card.cost}</div>
        <div class="rc-name">${card.name}</div>
        <div class="rc-art">${typeIcon}</div>
        <div class="rc-text">${effectText}</div>
        <div class="rc-flavor">${def?.flavor ?? ""}</div>
      </div>
    `;
  }).join("");

  root.innerHTML = `
    <style>
      .scene-reward {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 32px;
      }
      .scene-reward h2 {
        font-size: 28px; color: var(--color-accent); font-family: var(--font-display);
        letter-spacing: 3px; margin: 0; text-shadow: var(--glow-accent);
      }
      .reward-cards { display: flex; gap: 20px; }
      .reward-card {
        width: 130px; min-height: 180px; background: var(--color-base);
        border: 1px solid var(--color-accent); border-radius: 8px;
        box-shadow: var(--glow-accent); padding: 10px;
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        cursor: pointer; position: relative; transition: transform 0.1s;
      }
      .reward-card:hover { transform: translateY(-8px); }
      .rc-cost {
        position: absolute; top: -8px; left: -8px;
        width: 24px; height: 24px; border-radius: 50%;
        background: var(--color-pop); color: white;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); box-shadow: var(--glow-pop); font-size: 12px;
      }
      .rc-name { font-family: var(--font-display); font-size: 10px; color: var(--color-accent); text-align: center; }
      .rc-art { font-size: 32px; color: var(--color-danger); margin: 6px 0; }
      .rc-text { font-size: 9px; text-align: center; opacity: 0.9; line-height: 1.3; }
      .rc-flavor { font-size: 8px; text-align: center; opacity: 0.5; font-style: italic; margin-top: auto; }
      .reward-skip {
        font-family: var(--font-display); font-size: 12px; letter-spacing: 1px;
      }
    </style>
    <h2>CHOOSE A CARD</h2>
    <div class="reward-cards">${cardsHtml}</div>
    <button class="reward-skip" id="skip-btn">SKIP</button>
  `;

  root.querySelectorAll<HTMLDivElement>(".reward-card").forEach(el => {
    el.addEventListener("click", () =>
      dispatch({ type: "PICK_REWARD_CARD", cardInstanceId: el.dataset.cardId! })
    );
  });

  root.querySelector<HTMLButtonElement>("#skip-btn")!
    .addEventListener("click", () =>
      dispatch({ type: "PICK_REWARD_CARD", cardInstanceId: null })
    );

  return root;
}
```

- [ ] **Step 3: Run `npm run build` — must pass**
- [ ] **Step 4: Run `npm test` — 107 still pass**

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/ui/scene-map.ts slothespire/src/ui/scene-reward.ts
git commit -m "feat(ui): act map renderer + card reward draft screen"
```

---

## Task 7: Remaining scenes + wire `main.ts`

**Files:**
- Create: `src/ui/scene-rest.ts`
- Create: `src/ui/scene-event.ts`
- Create: `src/ui/scene-shop.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create `src/ui/scene-rest.ts`**

```ts
import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";

export function renderRest(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-rest";
  const healAmount = Math.floor(state.player.maxBudget * 0.3);
  const wouldHeal = Math.min(state.player.maxBudget, state.player.budget + healAmount) - state.player.budget;
  const firstUpgradable = state.deck.find(c => !c.upgraded);

  root.innerHTML = `
    <style>
      .scene-rest {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 32px;
      }
      .scene-rest h2 { font-size: 28px; color: var(--color-accent);
        font-family: var(--font-display); margin: 0; letter-spacing: 3px; }
      .rest-subtext { color: var(--color-text-dim); font-family: var(--font-display); font-size: 12px; }
      .rest-choices { display: flex; gap: 20px; }
      .rest-choice {
        width: 200px; padding: 20px; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low); border-radius: 8px;
        text-align: center; cursor: pointer; transition: border-color 0.1s;
      }
      .rest-choice:hover { border-color: var(--color-accent); }
      .rest-choice h3 { font-family: var(--font-display); color: var(--color-accent);
        font-size: 14px; margin: 0 0 8px; }
      .rest-choice p { font-size: 11px; opacity: 0.8; margin: 0; }
    </style>
    <h2>POSTMORTEM</h2>
    <div class="rest-subtext">// What do we learn?</div>
    <div class="rest-choices">
      <div class="rest-choice" data-option="refresh">
        <h3>Window Refresh</h3>
        <p>Restore ${wouldHeal} SLO Budget<br>(+30% of max)</p>
      </div>
      <div class="rest-choice ${firstUpgradable ? "" : "disabled"}" data-option="upgrade">
        <h3>Upgrade</h3>
        <p>${firstUpgradable ? `Upgrade: ${firstUpgradable.name}` : "Nothing upgradeable"}</p>
      </div>
    </div>
  `;

  root.querySelectorAll<HTMLDivElement>(".rest-choice:not(.disabled)").forEach(el => {
    el.addEventListener("click", () =>
      dispatch({ type: "CHOOSE_REST_OPTION", option: el.dataset.option as "refresh" | "upgrade" })
    );
  });

  return root;
}
```

- [ ] **Step 2: Create `src/ui/scene-event.ts`**

```ts
import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { EVENTS } from "../content/events";

export function renderEvent(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-event";
  const event = EVENTS.find(e => e.id === state.currentEventId) ?? EVENTS[0];

  const choicesHtml = event.choices.map((choice, idx) => `
    <button class="event-choice" data-idx="${idx}">${choice.text}</button>
  `).join("");

  root.innerHTML = `
    <style>
      .scene-event {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 24px;
        padding: 48px;
      }
      .event-card {
        max-width: 500px; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low); border-radius: 8px; padding: 32px;
        text-align: left;
      }
      .event-title { font-family: var(--font-display); font-size: 18px;
        color: var(--color-pop); margin: 0 0 16px; letter-spacing: 1px; }
      .event-text { font-size: 13px; line-height: 1.7; opacity: 0.9; }
      .event-choices { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 500px; }
      .event-choice {
        text-align: left; padding: 12px 16px; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low); border-radius: 4px;
        font-family: var(--font-display); font-size: 12px; cursor: pointer;
        color: var(--color-text); transition: border-color 0.1s;
      }
      .event-choice:hover { border-color: var(--color-accent); color: var(--color-accent); }
    </style>
    <div class="event-card">
      <div class="event-title">// ${event.title.toUpperCase()}</div>
      <div class="event-text">${event.text}</div>
    </div>
    <div class="event-choices">${choicesHtml}</div>
  `;

  root.querySelectorAll<HTMLButtonElement>(".event-choice").forEach(btn => {
    btn.addEventListener("click", () =>
      dispatch({ type: "EVENT_CHOICE", choiceIndex: parseInt(btn.dataset.idx!) })
    );
  });

  return root;
}
```

- [ ] **Step 3: Create `src/ui/scene-shop.ts`**

```ts
import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";

export function renderShop(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-shop";

  root.innerHTML = `
    <style>
      .scene-shop {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 32px; padding: 48px;
      }
      .scene-shop h2 { font-size: 28px; color: var(--color-accent);
        font-family: var(--font-display); margin: 0; letter-spacing: 3px; }
      .shop-credits { font-family: var(--font-display); font-size: 14px; color: var(--color-energy); }
      .shop-service {
        padding: 20px 32px; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low); border-radius: 8px; text-align: center;
      }
      .shop-service h3 { font-family: var(--font-display); color: var(--color-accent);
        font-size: 14px; margin: 0 0 8px; }
      .shop-service p { font-size: 11px; opacity: 0.7; margin: 0 0 12px; }
      .shop-note { font-size: 10px; color: var(--color-text-dim); font-family: var(--font-display); }
      .shop-leave { font-family: var(--font-display); font-size: 12px; letter-spacing: 1px; }
    </style>
    <h2>// BUILD SERVER</h2>
    <div class="shop-credits">CREDITS: ${state.credits}</div>
    <div class="shop-service">
      <h3>Card Removal</h3>
      <p>Remove a card from your deck permanently.</p>
      <p style="color:var(--color-energy)">75 credits</p>
      <p style="color:var(--color-text-dim);font-size:10px">${state.credits >= 75 ? "Available" : "Insufficient credits"}</p>
    </div>
    <div class="shop-note">// Full inventory coming in M5</div>
    <button class="shop-leave" id="leave-shop">LEAVE SHOP</button>
  `;

  // Card removal not yet implemented in M4 (requires deck picker UI — M5)
  // Leave dispatches GO_TO_MAP (added in Task 7 Step 4)
  root.querySelector<HTMLButtonElement>("#leave-shop")!
    .addEventListener("click", () => dispatch({ type: "GO_TO_MAP" }));

  return root;
}
```

Wait — the shop leave button has a conflict. Let me use a cleaner approach: add `{ type: "GO_TO_MAP" }` to the action union and reducer. This is simpler than hacking rest options.

Actually for the plan, add `GO_TO_MAP` action:

In `actions.ts`, add: `| { type: "GO_TO_MAP" }` to the Action union.

In `reducer.ts`, add:
```ts
    case "GO_TO_MAP":
      return { ...state, scene: "map" };
```

Then the shop leave button dispatches `{ type: "GO_TO_MAP" }`.

Similarly, the treasure scene (which auto-gives a reward card) can use `GO_TO_MAP` to return after collecting.

Update `scene-shop.ts` to use `GO_TO_MAP`.

- [ ] **Step 4: Add `GO_TO_MAP` to actions.ts and reducer.ts**

In `actions.ts` add: `| { type: "GO_TO_MAP" }`

In `reducer.ts` add:
```ts
    case "GO_TO_MAP":
      return { ...state, scene: "map" };
```

- [ ] **Step 5: Update `src/main.ts` to route all 10 scenes**

Replace the `sceneFor` function:

```ts
import { renderTitle } from "./ui/scene-title";
import { renderCombat } from "./ui/scene-combat";
import { renderEnd } from "./ui/scene-end";
import { renderMap } from "./ui/scene-map";
import { renderReward } from "./ui/scene-reward";
import { renderRest } from "./ui/scene-rest";
import { renderEvent } from "./ui/scene-event";
import { renderShop } from "./ui/scene-shop";

function sceneFor(s: GameState): HTMLElement {
  switch (s.scene) {
    case "title":  return renderTitle(s, dispatch);
    case "map":    return renderMap(s, dispatch);
    case "combat": return renderCombat(s, dispatch);
    case "reward": return renderReward(s, dispatch);
    case "rest":   return renderRest(s, dispatch);
    case "event":  return renderEvent(s, dispatch);
    case "shop":   return renderShop(s, dispatch);
    case "codex":  return renderTitle(s, dispatch);   // stub until M6
    case "lost":
    case "won":    return renderEnd(s, dispatch);
  }
}
```

Also update the save/clear logic in `dispatch` — the "won" scene now only fires on Act II boss victory (act 1 boss transitions to act 2 map). Clear save on "won" and "lost" as before.

Also wire up `LOAD_RUN` in `main.ts` (re-added to actions in Task 3):

In the boot code:
```ts
let state: GameState = loadRun() ?? initialState(`seed-${Date.now().toString(36)}`);
```

And in `renderTitle`, the CONTINUE button should dispatch `LOAD_RUN`:
```ts
  if (continueBtn && !continueBtn.disabled) {
    continueBtn.addEventListener("click", () => {
      const saved = loadRun();
      if (saved) dispatch({ type: "LOAD_RUN", state: saved });
      else window.location.reload();
    });
  }
```

This makes CONTINUE properly restore state mid-session without a page reload (better UX).

- [ ] **Step 6: Run `npm run build` — must pass**
- [ ] **Step 7: Run `npm test` — 107 still pass**

- [ ] **Step 8: Commit**

```bash
git add slothespire/src/ui/scene-rest.ts slothespire/src/ui/scene-event.ts \
        slothespire/src/ui/scene-shop.ts slothespire/src/engine/actions.ts \
        slothespire/src/engine/reducer.ts slothespire/src/main.ts \
        slothespire/src/ui/scene-title.ts
git commit -m "feat: all scenes wired — map, reward, rest, event, shop; full run playable end-to-end"
```

---

## Task 8: Smoke test + README

- [ ] **Step 1: Boot dev server**

Run: `npm run dev` (background). Open http://localhost:5173.

- [ ] **Step 2: Full Act I run walkthrough**

- Click NEW RUN → verify ACT I map appears (7 rows, nodes visible bottom-to-top, first row reachable)
- Click the first combat node → combat scene loads (Flapping Health Check)
- Play cards, defeat enemy → "CHOOSE A CARD" reward screen with 3 cards and Skip
- Pick a card → verify card added to deck (deck count in map footer increases)
- Return to map → more nodes now reachable (second row lights up)
- Navigate to a rest node → "POSTMORTEM" scene with Refresh and Upgrade choices
- Click Refresh → verify budget increased, return to map
- Navigate through remaining nodes until reaching the boss row
- Navigate to BOSS → combat with "The Pager Storm" (harder enemy)
- Win the boss fight → verify transition to Act II map (ACT 2 appears in header)
- Navigate Act II first combat node → combat starts

- [ ] **Step 3: Loss condition**

- Start a run, click END TURN repeatedly without playing → BUDGET BREACHED → RETURN TO TITLE → title screen

- [ ] **Step 4: Event node**

- Navigate to an "?" event node → incident text + 2-3 choice buttons appear
- Make a choice → return to map

- [ ] **Step 5: CONTINUE button**

- Start a run, navigate to a combat node, play a card (saves state)
- Close and reopen browser → CONTINUE button is enabled
- Click CONTINUE → mid-combat state restored correctly

- [ ] **Step 6: Final test count**

Run: `npm test` — expect **110 tests pass**.

- [ ] **Step 7: Update README.md**

```markdown
## Status

M4 map + scenes — navigable Act I (7 rows, 15 nodes), combat → reward → map flow,
rest site (heal/upgrade), incident events (4), shop stub, Act II map on boss win.
All 10 Scene values route to real implementations. 110 tests.
```

- [ ] **Step 8: Commit**

```bash
git add slothespire/README.md
git commit -m "docs: update README for M4 completion"
```

---

## Done

At the end of M4:
- `npm test` passes **≥110 tests** (88 baseline + 6 map + 10 navigation + 6 action outcomes = 110).
- `npm run build` is clean.
- A full Act I run is playable: title → map → combat → reward → rest → event → boss → Act II map.
- All 10 `Scene` values in `main.ts` route to real scene renderers.
- CONTINUE button properly restores mid-run state via `LOAD_RUN`.

**Explicitly out of scope for M4** (deferred):
- Card upgrades with different effect values (M5 — upgrade flips flag but effects unchanged)
- Shop card buying/selling (M5 — placeholder shown, can't purchase)
- Relics from treasure/elite rewards (M5 — card given instead)
- Full enemy pool for different floors (M5 — all combats use Flapping Health Check + boss)
- Codex screen (M6)
- Shop card removal UI (M5 — credits tracked, removal UI deferred)
- RNG O(cursor) performance fix (M5)

**M5 will implement** the full content pass: ~50 unique cards, ~20 relics, all 15 enemies routed by floor, shop card buying, card upgrade effects, relic effects firing via hooks. That's the content milestone that takes M4's engine and fills it with real game content.
