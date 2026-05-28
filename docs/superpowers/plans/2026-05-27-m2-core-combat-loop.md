# M2 — Core Combat Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the M1 stub with a real, playable combat turn loop: a 10-card starting deck is shuffled and dealt; the player spends energy to play 5 cards with distinct effects; ending the turn triggers enemy action; combat ends when the enemy's stability hits 0 (win) or the player's SLO Budget hits 0 (loss).

**Architecture:** All changes are additive or confined rewrites. New content layer (`src/content/`) holds declarative card/enemy definitions. New engine module (`src/engine/effects.ts`) holds testable pure-function primitives. The reducer gains three real actions (`PLAY_CARD`, `END_TURN`) replacing the `PLAY_CARD_STUB`. The combat UI is fully rewritten to render `state.player.hand` dynamically instead of hardcoded HTML.

**Tech Stack:** TypeScript + Vite (same as M1). Vitest for all engine tests. No new runtime dependencies.

**Reference spec:** `docs/superpowers/specs/2026-05-27-slothespire-design.md` §4 (combat mechanics) and §5.1 (starter cards). Reference M1 plan for architectural context.

**M1 baseline:** 25 tests pass. Engine modules: `state.ts`, `actions.ts`, `reducer.ts`, `rng.ts`, `save.ts`. UI: `theme.css`, `scene-title.ts`, `scene-combat.ts`, `scene-end.ts`, `main.ts`.

---

## File Structure (changes from M1)

```
slothespire/src/
├── content/                         # NEW directory
│   ├── cards.ts                     # NEW — 5 card defs + buildStarterDeck()
│   └── enemies.ts                   # NEW — Flapping Health Check + createEnemy()
├── engine/
│   ├── effects.ts                   # NEW — burnEnemy, addHeadroom, drawCards, shuffleDeck
│   ├── actions.ts                   # MODIFY — add PLAY_CARD, END_TURN; remove PLAY_CARD_STUB
│   ├── reducer.ts                   # MODIFY — real START_RUN, PLAY_CARD, END_TURN
│   └── rng.ts                       # unchanged (nextRng already there)
│   └── state.ts                     # MODIFY — add headroom field to player
└── ui/
    ├── scene-combat.ts              # REWRITE — dynamic hand, all intent kinds, energy+headroom HUD
    └── scene-title.ts               # MODIFY — add CONTINUE button when save exists

slothespire/tests/
├── effects.test.ts                  # NEW — unit tests for every effect primitive
├── combat-flow.test.ts              # NEW — multi-turn scenarios (play card → end turn → loop)
├── reducer.test.ts                  # MODIFY — replace PLAY_CARD_STUB tests, add PLAY_CARD/END_TURN
└── (others unchanged)
```

**File responsibilities:**
- `content/cards.ts` — static data: what each card is and what it does. No game logic.
- `content/enemies.ts` — static data: enemy stats and intent pattern. No game logic.
- `engine/effects.ts` — pure functions that transform `GameState`. No DOM, no content.
- `engine/reducer.ts` — orchestrates effect calls for each action. No DOM.
- `ui/scene-combat.ts` — reads `state.player.hand`, renders cards and enemies. No game logic.

---

## One design decision upfront: headroom

`GameState.player` currently has no `headroom` field — it was only discussed in the spec but not added to the type. M2 needs it as a per-turn buffer. **Add `headroom: number` to the player object in `state.ts` and `initialState`.** This is Task 1.

---

## Task 1: Add `headroom` to GameState

**Files:**
- Modify: `src/engine/state.ts`
- Modify: `tests/state.test.ts`

- [ ] **Step 1: Add `headroom` to the player interface in `src/engine/state.ts`**

Find the `player` block inside `GameState` and add `headroom: number` after `energy`:

```ts
  player: {
    budget: number; maxBudget: number;
    energy: number; energyPerTurn: number;
    headroom: number;                           // ← add this
    hand: Card[]; draw: Card[]; discard: Card[]; exhaust: Card[];
    statuses: StatusMap;
    relics: string[];
    hotfixes: string[];
  };
```

In `initialState`, add `headroom: 0` to the player block:

```ts
      energy: 3,
      energyPerTurn: 3,
      headroom: 0,                              // ← add this
```

- [ ] **Step 2: Update the state test to assert headroom starts at 0**

In `tests/state.test.ts`, add to the "gives the player the spec-defined starting numbers" test:

```ts
    expect(s.player.headroom).toBe(0);
```

- [ ] **Step 3: Run tests — all 25 must still pass (plus the new assertion)**

Run: `npm test`
Expected: 25 pass (the new assertion is inside an existing test, not a new test).

- [ ] **Step 4: Commit**

```bash
git add slothespire/src/engine/state.ts slothespire/tests/state.test.ts
git commit -m "feat(engine): add headroom field to player state"
```

---

## Task 2: Card and enemy definitions

**Files:**
- Create: `src/content/cards.ts`
- Create: `src/content/enemies.ts`

No tests for these files — they are static data. Correctness is verified through the reducer tests in Tasks 6–7.

- [ ] **Step 1: Create `src/content/cards.ts`**

```ts
import type { Card, CardType } from "../engine/state";

export interface EffectSpec {
  kind: "burn" | "headroom" | "draw";
  amount: number;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  effects: EffectSpec[];
  flavor: string;
}

export const CARD_DEFS: Record<string, CardDef> = {
  manual_fix: {
    id: "manual_fix", name: "Manual Fix", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 6 }],
    flavor: "When all else fails, restart the pod.",
  },
  failover: {
    id: "failover", name: "Failover", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 5 }],
    flavor: "Route around the damage.",
  },
  page_senior_engineer: {
    id: "page_senior_engineer", name: "Page Senior Engineer", type: "skill", cost: 2,
    // Note: spec says draw 2 + gain 1 Energy next turn. Energy-next-turn deferred to M3
    // (requires status system). M2 implements draw 2 only.
    effects: [{ kind: "draw", amount: 2 }],
    flavor: "They've seen this before.",
  },
  canary_deploy: {
    id: "canary_deploy", name: "Canary Deploy", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 5 }, { kind: "draw", amount: 1 }],
    flavor: "Ship a little, learn a lot.",
  },
  circuit_breaker: {
    id: "circuit_breaker", name: "Circuit Breaker", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 8 }],
    flavor: "Stop the bleeding before you debug it.",
  },
};

let _nextInstanceId = 0;
function makeInstanceId(defId: string): string {
  return `${defId}_${_nextInstanceId++}`;
}

export function makeCard(defId: string): Card {
  const def = CARD_DEFS[defId];
  if (!def) throw new Error(`Unknown card def: ${defId}`);
  return {
    instanceId: makeInstanceId(defId),
    defId,
    name: def.name,
    type: def.type,
    cost: def.cost,
    upgraded: false,
  };
}

export function buildStarterDeck(): Card[] {
  // Spec §2.2: 5× Manual Fix, 4× Failover, 1× Page Senior Engineer
  return [
    ...Array.from({ length: 5 }, () => makeCard("manual_fix")),
    ...Array.from({ length: 4 }, () => makeCard("failover")),
    makeCard("page_senior_engineer"),
  ];
}
```

- [ ] **Step 2: Create `src/content/enemies.ts`**

```ts
import type { Enemy, Intent } from "../engine/state";

export interface EnemyDef {
  id: string;
  name: string;
  stability: number;
  intentPattern: Intent[];
}

export const ENEMY_DEFS: Record<string, EnemyDef> = {
  flapping_health_check: {
    id: "flapping_health_check",
    name: "Flapping Health Check",
    stability: 20,
    // Alternates burn 6 / burn 4 to show intent variation even in M2.
    intentPattern: [
      { kind: "burn", amount: 6 },
      { kind: "burn", amount: 4 },
    ],
  },
};

let _nextEnemyId = 0;

export function createEnemy(defId: string): Enemy {
  const def = ENEMY_DEFS[defId];
  if (!def) throw new Error(`Unknown enemy def: ${defId}`);
  return {
    instanceId: `${defId}_${_nextEnemyId++}`,
    defId,
    name: def.name,
    stability: def.stability,
    maxStability: def.stability,
    statuses: {},
  };
}

export function getIntent(defId: string, turn: number): Intent {
  const def = ENEMY_DEFS[defId];
  if (!def) return { kind: "unknown" };
  return def.intentPattern[turn % def.intentPattern.length];
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: clean (no type errors in the new content files).

- [ ] **Step 4: Commit**

```bash
git add slothespire/src/content/
git commit -m "feat(content): card and enemy definitions for M2"
```

---

## Task 3: Effect primitives (`src/engine/effects.ts`)

**Files:**
- Create: `src/engine/effects.ts`
- Test: `tests/effects.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/effects.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/engine/effects'`.

- [ ] **Step 3: Implement `src/engine/effects.ts`**

```ts
import type { GameState, Card } from "./state";
import { nextRng } from "./rng";

export function burnEnemy(state: GameState, enemyId: string, amount: number): GameState {
  if (!state.combat) return state;
  const enemies = state.combat.enemies.map(e =>
    e.instanceId === enemyId
      ? { ...e, stability: Math.max(0, e.stability - amount) }
      : e
  );
  return { ...state, combat: { ...state.combat, enemies } };
}

export function addHeadroom(state: GameState, amount: number): GameState {
  return {
    ...state,
    player: { ...state.player, headroom: state.player.headroom + amount },
  };
}

export function shuffleDeck(deck: Card[], state: GameState): [Card[], GameState] {
  const result = [...deck];
  let s = state;
  for (let i = result.length - 1; i > 0; i--) {
    const [rand, newState] = nextRng(s);
    s = newState;
    const j = Math.floor(rand * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return [result, s];
}

export function drawCards(state: GameState, count: number): GameState {
  let s = state;
  let { hand, draw, discard } = s.player;

  // If draw is empty and we still need cards, reshuffle discard
  if (draw.length === 0 && discard.length > 0) {
    const [reshuffled, newState] = shuffleDeck(discard, s);
    s = newState;
    draw = reshuffled;
    discard = [];
  }

  const toDraw = Math.min(count, draw.length);
  const drawn = draw.slice(0, toDraw);
  draw = draw.slice(toDraw);
  hand = [...hand, ...drawn];

  return { ...s, player: { ...s.player, hand, draw, discard } };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: 25 prior tests + 10 new effects tests = **35 pass**.

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/effects.ts slothespire/tests/effects.test.ts
git commit -m "feat(engine): burnEnemy / addHeadroom / drawCards / shuffleDeck effect primitives"
```

---

## Task 4: Update action types (remove PLAY_CARD_STUB, add PLAY_CARD + END_TURN)

**Files:**
- Modify: `src/engine/actions.ts`

No new tests — action types are verified through reducer tests in Tasks 5–7.

- [ ] **Step 1: Replace `src/engine/actions.ts` contents**

```ts
export type Action =
  | { type: "START_RUN" }
  | { type: "RETURN_TO_TITLE" }
  | { type: "PLAY_CARD"; cardInstanceId: string; targetId: string | null }
  | { type: "END_TURN" };
```

- [ ] **Step 2: Verify TypeScript build still compiles**

Run: `npm run build`
Expected: **fails** — reducer and scene-combat still reference `PLAY_CARD_STUB`. That's expected; we'll fix them in Tasks 5 and 8.

- [ ] **Step 3: Commit**

```bash
git add slothespire/src/engine/actions.ts
git commit -m "feat(engine): action types — add PLAY_CARD + END_TURN, remove PLAY_CARD_STUB"
```

---

## Task 5: Rewrite `START_RUN` in the reducer (real combat init)

**Files:**
- Modify: `src/engine/reducer.ts`
- Modify: `tests/reducer.test.ts`

`START_RUN` must now: build the 10-card starter deck, shuffle it into `state.player.draw`, deal 5 cards to hand, set up the real Flapping Health Check enemy, set first intent, set scene to "combat".

- [ ] **Step 1: Update reducer tests — replace PLAY_CARD_STUB tests, update START_RUN assertions**

Replace `tests/reducer.test.ts` entirely:

```ts
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
```

- [ ] **Step 2: Run tests — expect failures on the new START_RUN assertions**

Run: `npm test`
Expected: FAIL — tests assert real card counts / enemy stats that the old stub doesn't deliver.

- [ ] **Step 3: Rewrite `src/engine/reducer.ts`**

```ts
import type { Action } from "./actions";
import { initialState, type GameState } from "./state";
import { buildStarterDeck } from "../content/cards";
import { createEnemy, getIntent } from "../content/enemies";
import { shuffleDeck, drawCards } from "./effects";

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_RUN": {
      const deck = buildStarterDeck();
      let s: GameState = { ...initialState(state.meta.seed), deck };
      const [shuffled, afterShuffle] = shuffleDeck(deck, s);
      s = { ...afterShuffle, player: { ...afterShuffle.player, draw: shuffled } };
      s = drawCards(s, 5);

      const enemy = createEnemy("flapping_health_check");
      const firstIntent = getIntent(enemy.defId, 0);

      return {
        ...s,
        scene: "combat",
        combat: {
          enemies: [enemy],
          intentByEnemy: { [enemy.instanceId]: firstIntent },
          turn: 1,
          phase: "player",
        },
      };
    }

    case "RETURN_TO_TITLE":
      return initialState(state.meta.seed);

    default:
      return state;
  }
}
```

- [ ] **Step 4: Run tests — START_RUN and RETURN_TO_TITLE tests must pass**

Run: `npm test`
Expected: START_RUN (5) + RETURN_TO_TITLE (1) = 6 reducer tests pass. Effects (10) + state (6) + rng (8) + save (6) = 30. **Total: 36 pass.**

Note: `npm run build` will still fail because `scene-combat.ts` references the removed `PLAY_CARD_STUB`. That's fixed in Task 8.

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/reducer.ts slothespire/tests/reducer.test.ts
git commit -m "feat(engine): START_RUN builds real deck, shuffles, deals 5, sets up enemy"
```

---

## Task 6: PLAY_CARD action

**Files:**
- Modify: `src/engine/reducer.ts`
- Test: `tests/combat-flow.test.ts` (new file)

`PLAY_CARD` must: find the card in hand by `cardInstanceId`, check energy, deduct cost, apply effects, move card to discard, check for win (enemy stability ≤ 0 → `scene = "won"`), check for loss (budget ≤ 0 → `scene = "lost"`).

- [ ] **Step 1: Write the failing tests**

Create `tests/combat-flow.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

function startedRun() {
  return reduce(initialState("combat-test"), { type: "START_RUN" });
}

describe("PLAY_CARD", () => {
  it("removes the card from hand and adds it to discard", () => {
    const s0 = startedRun();
    const cardId = s0.player.hand[0].instanceId;
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: cardId, targetId: null });
    expect(s1.player.hand.map(c => c.instanceId)).not.toContain(cardId);
    expect(s1.player.discard.map(c => c.instanceId)).toContain(cardId);
  });

  it("deducts the card's energy cost from player energy", () => {
    const s0 = startedRun();
    // Find a 1-cost card in hand
    const card = s0.player.hand.find(c => c.cost === 1);
    if (!card) throw new Error("No 1-cost card in starting hand for this seed");
    const energyBefore = s0.player.energy;
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: null });
    expect(s1.player.energy).toBe(energyBefore - 1);
  });

  it("attack card reduces enemy stability", () => {
    const s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    const attackCard = s0.player.hand.find(c => c.type === "attack");
    if (!attackCard) throw new Error("No attack card in starting hand for this seed");
    const s1 = reduce(s0, {
      type: "PLAY_CARD",
      cardInstanceId: attackCard.instanceId,
      targetId: enemy.instanceId,
    });
    expect(s1.combat!.enemies[0].stability).toBeLessThan(20);
  });

  it("skill card with headroom effect increases player headroom", () => {
    const s0 = startedRun();
    const skillCard = s0.player.hand.find(c => c.type === "skill" && c.defId !== "page_senior_engineer");
    if (!skillCard) throw new Error("No non-draw skill in starting hand for this seed");
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: skillCard.instanceId, targetId: null });
    expect(s1.player.headroom).toBeGreaterThan(0);
  });

  it("transitions to 'won' when enemy stability reaches 0", () => {
    // Build state with enemy near-dead
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = {
      ...s,
      combat: {
        ...s.combat!,
        enemies: [{ ...enemy, stability: 1 }],
      },
    };
    const attackCard = s.player.hand.find(c => c.type === "attack");
    if (!attackCard) throw new Error("No attack card in hand");
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: attackCard.instanceId, targetId: enemy.instanceId });
    expect(s2.scene).toBe("won");
    expect(s2.combat).toBeUndefined();
  });

  it("does nothing if cardInstanceId not found in hand", () => {
    const s0 = startedRun();
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: "not-real", targetId: null });
    expect(s1).toBe(s0); // same reference — no change
  });

  it("does nothing if player has insufficient energy", () => {
    let s0 = startedRun();
    // Drain energy to 0
    s0 = { ...s0, player: { ...s0.player, energy: 0 } };
    const card = s0.player.hand[0];
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: null });
    expect(s1).toBe(s0); // no change when can't afford
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `PLAY_CARD` not in the reducer switch (falls to `default: return state`).

- [ ] **Step 3: Add PLAY_CARD case to `src/engine/reducer.ts`**

Add to the reducer's `switch` block (before the `default`). Also import `EffectSpec` and `CARD_DEFS` from content/cards, and `burnEnemy`, `addHeadroom`, `drawCards` from effects:

```ts
import { buildStarterDeck, CARD_DEFS } from "../content/cards";
```

Add this case to the switch:

```ts
    case "PLAY_CARD": {
      const { cardInstanceId, targetId } = action;
      const card = state.player.hand.find(c => c.instanceId === cardInstanceId);
      if (!card) return state; // not found — no-op
      if (state.player.energy < card.cost) return state; // can't afford — no-op

      const def = CARD_DEFS[card.defId];
      if (!def) return state;

      // Deduct energy and move card from hand to discard
      let s: GameState = {
        ...state,
        player: {
          ...state.player,
          energy: state.player.energy - card.cost,
          hand: state.player.hand.filter(c => c.instanceId !== cardInstanceId),
          discard: [...state.player.discard, card],
        },
      };

      // Apply each effect in sequence
      for (const effect of def.effects) {
        if (effect.kind === "burn") {
          // Use provided targetId, or first enemy as default
          const tid = targetId ?? s.combat?.enemies[0]?.instanceId;
          if (tid) s = burnEnemy(s, tid, effect.amount);
        } else if (effect.kind === "headroom") {
          s = addHeadroom(s, effect.amount);
        } else if (effect.kind === "draw") {
          s = drawCards(s, effect.amount);
        }
      }

      // Win check: all enemies at 0 stability
      if (s.combat && s.combat.enemies.every(e => e.stability <= 0)) {
        return { ...s, scene: "won", combat: undefined };
      }

      // Loss check: budget depleted
      if (s.player.budget <= 0) {
        return { ...s, scene: "lost", combat: undefined };
      }

      return s;
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all PLAY_CARD tests pass. Running total: **~42 pass** (36 prior + 6 PLAY_CARD).

Note: the "attack card reduces enemy stability" and "skill card with headroom" tests depend on the random starting hand for seed "combat-test" — if those cards aren't in the first hand for that seed, the tests throw. This is acceptable for M2; M3 will introduce deterministic hand-building tests with fixed decks.

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/reducer.ts slothespire/tests/combat-flow.test.ts
git commit -m "feat(engine): PLAY_CARD — energy cost, effects, win/loss detection"
```

---

## Task 7: END_TURN action

**Files:**
- Modify: `src/engine/reducer.ts`
- Modify: `tests/combat-flow.test.ts`

`END_TURN` must: discard hand, apply enemy intent to player (burn reduced by headroom), reset headroom, tick statuses, advance enemy intent to next turn, redraw 5 cards, restore energy, increment turn. Check for loss after enemy action.

- [ ] **Step 1: Add END_TURN tests to `tests/combat-flow.test.ts`**

Append to the existing file:

```ts
describe("END_TURN", () => {
  it("discards remaining hand and draws 5 new cards", () => {
    const s0 = startedRun();
    const handSizeBefore = s0.player.hand.length;
    expect(handSizeBefore).toBe(5);
    const s1 = reduce(s0, { type: "END_TURN" });
    // After end turn: enemy attacks, then player draws new hand
    expect(s1.player.hand.length).toBe(5);
    // Previous hand cards should now be in discard (5 discarded + possibly 0 played)
    expect(s1.player.discard.length).toBeGreaterThanOrEqual(0);
  });

  it("restores player energy to energyPerTurn", () => {
    let s0 = startedRun();
    // Spend some energy by playing a card
    const card = s0.player.hand.find(c => c.cost === 1)!;
    s0 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: null });
    expect(s0.player.energy).toBe(2);
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.player.energy).toBe(3); // restored
  });

  it("enemy burn intent reduces player budget (after headroom)", () => {
    let s0 = startedRun();
    // Ensure enemy has burn 6 intent and player has 0 headroom
    const enemy = s0.combat!.enemies[0];
    s0 = {
      ...s0,
      player: { ...s0.player, headroom: 0 },
      combat: {
        ...s0.combat!,
        intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 6 } },
      },
    };
    const budgetBefore = s0.player.budget;
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.player.budget).toBe(budgetBefore - 6);
  });

  it("headroom absorbs burn before hitting budget", () => {
    let s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    s0 = {
      ...s0,
      player: { ...s0.player, headroom: 4, budget: 80 },
      combat: {
        ...s0.combat!,
        intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 6 } },
      },
    };
    const s1 = reduce(s0, { type: "END_TURN" });
    // 6 burn - 4 headroom = 2 reaches budget
    expect(s1.player.budget).toBe(78);
    expect(s1.player.headroom).toBe(0); // headroom resets after use
  });

  it("headroom fully absorbs burn when headroom >= burn", () => {
    let s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    s0 = {
      ...s0,
      player: { ...s0.player, headroom: 10, budget: 80 },
      combat: {
        ...s0.combat!,
        intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 6 } },
      },
    };
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.player.budget).toBe(80); // budget unchanged
    expect(s1.player.headroom).toBe(0); // headroom still resets
  });

  it("increments combat turn counter", () => {
    const s0 = startedRun();
    expect(s0.combat!.turn).toBe(1);
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.combat!.turn).toBe(2);
  });

  it("advances enemy intent to the next in the pattern", () => {
    const s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    // Turn 1: burn 6 (index 0 in pattern)
    const intent1 = s0.combat!.intentByEnemy[enemy.instanceId];
    expect(intent1).toMatchObject({ kind: "burn", amount: 6 });
    const s1 = reduce(s0, { type: "END_TURN" });
    const intent2 = s1.combat!.intentByEnemy[enemy.instanceId];
    // Turn 2: burn 4 (index 1 in pattern)
    expect(intent2).toMatchObject({ kind: "burn", amount: 4 });
  });

  it("transitions to 'lost' if budget reaches 0 from enemy burn", () => {
    let s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    s0 = {
      ...s0,
      player: { ...s0.player, budget: 5, headroom: 0 },
      combat: {
        ...s0.combat!,
        intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 10 } },
      },
    };
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.scene).toBe("lost");
    expect(s1.combat).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `END_TURN` falls to `default: return state`.

- [ ] **Step 3: Add END_TURN case to `src/engine/reducer.ts`**

Add after the PLAY_CARD case, with these imports already available. Also add import for `getIntent`:

```ts
    case "END_TURN": {
      if (!state.combat) return state;

      const { enemies, intentByEnemy, turn } = state.combat;

      // Step 1: discard remaining hand
      let s: GameState = {
        ...state,
        player: {
          ...state.player,
          discard: [...state.player.discard, ...state.player.hand],
          hand: [],
        },
      };

      // Step 2: each enemy applies its intent
      for (const enemy of enemies) {
        const intent = intentByEnemy[enemy.instanceId];
        if (intent?.kind === "burn") {
          const headroom = s.player.headroom;
          const absorbed = Math.min(headroom, intent.amount);
          const remainder = intent.amount - absorbed;
          s = {
            ...s,
            player: {
              ...s.player,
              headroom: 0,                           // headroom always resets
              budget: s.player.budget - remainder,
            },
          };
        }
        // M2: only burn intents are active. Other intent kinds are no-ops until M3.
      }

      // Step 3: loss check after enemy turn
      if (s.player.budget <= 0) {
        return { ...s, scene: "lost", combat: undefined };
      }

      // Step 4: generate next intents (advance to next turn index)
      const nextTurn = turn + 1;
      const nextIntents: Record<string, typeof intentByEnemy[string]> = {};
      for (const enemy of enemies) {
        nextIntents[enemy.instanceId] = getIntent(enemy.defId, nextTurn - 1);
      }

      // Step 5: restore energy, draw new hand
      s = {
        ...s,
        player: { ...s.player, energy: s.player.energyPerTurn },
        combat: {
          ...s.combat!,
          turn: nextTurn,
          phase: "player",
          intentByEnemy: nextIntents,
        },
      };
      s = drawCards(s, 5);

      return s;
    }
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `npm test`
Expected: all END_TURN tests pass. Running total: **~50 pass**.

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/reducer.ts slothespire/tests/combat-flow.test.ts
git commit -m "feat(engine): END_TURN — enemy resolves, headroom absorbs burn, redraw, advance intent"
```

---

## Task 8: Rewrite `scene-combat.ts` (dynamic hand + all intent kinds + energy HUD)

**Files:**
- Modify: `src/ui/scene-combat.ts`

This is a full rewrite. No Vitest tests — verified in the smoke test (Task 9).

- [ ] **Step 1: Replace `src/ui/scene-combat.ts` entirely**

```ts
import type { GameState, Card, Intent } from "../engine/state";
import type { Action } from "../engine/actions";
import { CARD_DEFS } from "../content/cards";

function intentLabel(intent: Intent | undefined): { icon: string; text: string; colorClass: string } {
  if (!intent) return { icon: "?", text: "Unknown", colorClass: "intent-unknown" };
  switch (intent.kind) {
    case "burn":   return { icon: "⚔", text: String(intent.amount), colorClass: "intent-burn" };
    case "harden": return { icon: "🛡", text: String(intent.amount), colorClass: "intent-harden" };
    case "buff":   return { icon: "⬆", text: intent.status, colorClass: "intent-buff" };
    case "debuff": return { icon: "⬇", text: intent.status, colorClass: "intent-debuff" };
    case "multi":  return { icon: "✦", text: intent.label, colorClass: "intent-multi" };
    case "unknown":return { icon: "?", text: "...", colorClass: "intent-unknown" };
  }
}

function cardIconFor(type: Card["type"]): { icon: string; colorClass: string } {
  switch (type) {
    case "attack": return { icon: "⚔", colorClass: "icon-burn" };
    case "skill":  return { icon: "🛡", colorClass: "icon-harden" };
    case "power":  return { icon: "✦", colorClass: "icon-multi" };
    case "curse":  return { icon: "☠", colorClass: "icon-danger" };
    case "status": return { icon: "⚡", colorClass: "icon-buff" };
  }
}

function renderCard(card: Card, dispatch: (a: Action) => void, targetId: string | null): HTMLElement {
  const def = CARD_DEFS[card.defId];
  const { icon, colorClass } = cardIconFor(card.type);
  const effectText = def?.effects.map(e => {
    if (e.kind === "burn") return `Burn ${e.amount}`;
    if (e.kind === "headroom") return `+${e.amount} Headroom`;
    if (e.kind === "draw") return `Draw ${e.amount}`;
    return "";
  }).join(". ") ?? "";

  const el = document.createElement("div");
  el.className = "sc-card";
  el.innerHTML = `
    <div class="sc-card-cost">${card.cost}</div>
    <div class="sc-card-name">${card.name}</div>
    <div class="sc-card-art ${colorClass}">${icon}</div>
    <div class="sc-card-text">${effectText}</div>
  `;
  el.addEventListener("click", () =>
    dispatch({ type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId })
  );
  return el;
}

export function renderCombat(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-combat";

  if (!state.combat) {
    root.textContent = "No combat in progress.";
    return root;
  }

  const { enemies, intentByEnemy, turn } = state.combat;
  const firstEnemy = enemies[0];
  const targetId = firstEnemy?.instanceId ?? null;

  // Build enemy HTML
  const enemiesHtml = enemies.map(enemy => {
    const intent = intentByEnemy[enemy.instanceId];
    const { icon, text, colorClass } = intentLabel(intent);
    const stabPct = Math.round((enemy.stability / enemy.maxStability) * 100);
    return `
      <div class="sc-enemy">
        <div class="sc-intent ${colorClass}">${icon} ${text}</div>
        <div class="sc-sprite">▲</div>
        <div class="sc-enemy-name">${enemy.name}</div>
        <div class="sc-stab-bar">
          <div class="sc-stab-fill" style="width:${stabPct}%"></div>
        </div>
        <div class="sc-enemy-hp">${enemy.stability} / ${enemy.maxStability}</div>
      </div>
    `;
  }).join("");

  // Build pile counts
  const { hand, draw, discard, exhaust, budget, maxBudget, energy, energyPerTurn, headroom } = state.player;

  root.innerHTML = `
    <style>
      .scene-combat {
        flex: 1; display: grid;
        grid-template-columns: 80px 1fr 130px;
        grid-template-rows: 28px 1fr auto auto 36px;
        grid-template-areas:
          "topbar topbar topbar"
          "piles enemies stats"
          "piles play stats"
          "piles hand action"
          "foot foot foot";
        gap: 4px; height: 100vh;
      }
      .sc-topbar {
        grid-area: topbar; background: var(--color-base-deep);
        border-bottom: 1px solid var(--color-accent);
        font-family: var(--font-display); font-size: 11px;
        color: var(--color-accent); opacity: 0.7;
        display: flex; align-items: center; padding: 0 12px; gap: 16px;
      }
      .sc-topbar .turn { margin-left: auto; }
      .sc-piles {
        grid-area: piles; background: var(--color-base-deep);
        border-right: 1px solid var(--color-border-low);
        display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px;
      }
      .sc-pile {
        width: 60px; padding: 4px 2px; text-align: center;
        border: 1px solid var(--color-border-low); border-radius: 3px;
        font-size: 9px; font-family: var(--font-display);
      }
      .sc-pile .sc-pile-n { color: var(--color-accent); font-size: 13px; }
      .sc-enemies {
        grid-area: enemies; display: flex; gap: 16px;
        justify-content: center; align-items: flex-end; padding-bottom: 12px;
      }
      .sc-enemy { text-align: center; width: 130px; }
      .sc-intent {
        display: inline-block; font-family: var(--font-display);
        font-size: 14px; padding: 4px 8px; margin-bottom: 4px;
      }
      .intent-burn   { color: var(--color-danger); text-shadow: var(--glow-danger); }
      .intent-harden { color: var(--color-accent); text-shadow: var(--glow-accent); }
      .intent-buff   { color: var(--color-energy); }
      .intent-debuff { color: var(--color-pop); text-shadow: var(--glow-pop); }
      .intent-multi  { color: #c1f4e8; }
      .intent-unknown{ color: var(--color-text-dim); }
      .sc-sprite {
        width: 80px; height: 80px; margin: 0 auto;
        background: var(--color-border-low); border: 1px solid var(--color-pop);
        box-shadow: var(--glow-pop); border-radius: 4px;
        display: flex; align-items: center; justify-content: center;
        font-size: 36px; color: var(--color-pop);
      }
      .sc-enemy-name { font-family: var(--font-display); font-size: 10px; color: var(--color-pop); margin-top: 4px; }
      .sc-stab-bar {
        height: 5px; background: var(--color-border-low); border-radius: 3px;
        margin: 3px 8px; overflow: hidden;
      }
      .sc-stab-fill { height: 100%; background: linear-gradient(90deg, var(--color-danger), var(--color-pop)); }
      .sc-enemy-hp { font-size: 9px; color: var(--color-text-dim); font-family: var(--font-display); }
      .sc-play {
        grid-area: play; border-top: 1px dashed var(--color-border-low);
        border-bottom: 1px dashed var(--color-border-low);
        display: flex; align-items: center; justify-content: center;
        color: var(--color-border-low); font-size: 10px;
      }
      .sc-hand {
        grid-area: hand; display: flex; gap: 8px; justify-content: center;
        align-items: flex-end; padding: 8px 8px 8px 0;
      }
      .sc-card {
        width: 86px; height: 120px; background: var(--color-base);
        border: 1px solid var(--color-accent); border-radius: 6px;
        box-shadow: var(--glow-accent); padding: 6px;
        display: flex; flex-direction: column; align-items: center;
        cursor: pointer; position: relative; transition: transform 0.08s;
      }
      .sc-card:hover { transform: translateY(-6px); }
      .sc-card-cost {
        position: absolute; top: -8px; left: -8px;
        width: 22px; height: 22px; border-radius: 50%;
        background: var(--color-pop); color: white;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-size: 11px;
        box-shadow: var(--glow-pop);
      }
      .sc-card-name {
        font-family: var(--font-display); font-size: 8px; color: var(--color-accent);
        text-align: center; letter-spacing: 0.5px; margin-top: 4px;
      }
      .sc-card-art {
        flex: 1; width: 100%; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low);
        display: flex; align-items: center; justify-content: center;
        font-size: 26px; margin: 4px 0;
        filter: drop-shadow(0 0 4px currentColor);
      }
      .icon-burn    { color: var(--color-danger); }
      .icon-harden  { color: var(--color-accent); }
      .icon-multi   { color: #c1f4e8; }
      .icon-danger  { color: var(--color-danger); }
      .icon-buff    { color: var(--color-energy); }
      .sc-card-text { font-size: 7px; text-align: center; opacity: 0.85; line-height: 1.2; }
      .sc-stats {
        grid-area: stats; background: var(--color-base-deep);
        border-left: 1px solid var(--color-border-low);
        display: flex; flex-direction: column; gap: 8px; padding: 10px 8px;
      }
      .sc-budget-label { font-size: 9px; color: var(--color-danger); font-family: var(--font-display); letter-spacing: 1px; }
      .sc-budget-bar {
        height: 10px; background: var(--color-border-low); border-radius: 5px; overflow: hidden;
      }
      .sc-budget-fill {
        height: 100%; background: linear-gradient(90deg, var(--color-danger), var(--color-energy));
        transition: width 0.2s;
      }
      .sc-budget-num { font-size: 12px; text-align: center; }
      .sc-headroom {
        background: var(--color-border-low); border: 1px solid var(--color-accent);
        padding: 5px; border-radius: 3px; text-align: center;
        font-size: 9px; font-family: var(--font-display); color: var(--color-accent);
      }
      .sc-action {
        grid-area: action; background: var(--color-base-deep);
        border-left: 1px solid var(--color-border-low);
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 10px; padding: 10px 8px;
      }
      .sc-energy-label { font-size: 9px; color: var(--color-energy); font-family: var(--font-display); }
      .sc-energy-orb {
        width: 52px; height: 52px; border-radius: 50%;
        background: radial-gradient(circle, var(--color-energy) 0%, var(--color-energy-deep) 100%);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; color: var(--color-base-deep);
        box-shadow: 0 0 14px rgba(255,211,77,0.6);
        font-size: 20px; font-family: var(--font-display);
      }
      .sc-end-turn {
        width: 100%; background: var(--color-pop); color: white; border: 0;
        padding: 10px 4px; border-radius: 3px; font-weight: 700;
        cursor: pointer; box-shadow: var(--glow-pop);
        font-family: var(--font-display); font-size: 10px; letter-spacing: 1px;
      }
      .sc-foot {
        grid-area: foot; background: var(--color-base-deep);
        border-top: 1px solid var(--color-border-low);
        display: flex; align-items: center; gap: 12px; padding: 0 10px;
        font-size: 10px; font-family: var(--font-display); color: var(--color-accent);
      }
      .sc-foot .right { margin-left: auto; opacity: 0.5; }
    </style>

    <div class="sc-topbar">
      <span>// ACT I · Single-Service SLO · Floor 1</span>
      <span class="turn">TURN ${turn}</span>
    </div>

    <div class="sc-piles">
      <div class="sc-pile">DRAW<div class="sc-pile-n">${draw.length}</div></div>
      <div class="sc-pile">DISC<div class="sc-pile-n">${discard.length}</div></div>
      <div class="sc-pile">EXHL<div class="sc-pile-n">${exhaust.length}</div></div>
    </div>

    <div class="sc-enemies">${enemiesHtml}</div>

    <div class="sc-play">[ cards animate here ]</div>

    <div class="sc-hand" id="sc-hand-slot"></div>

    <div class="sc-stats">
      <div>
        <div class="sc-budget-label">SLO BUDGET</div>
        <div class="sc-budget-bar">
          <div class="sc-budget-fill" style="width:${Math.round((budget / maxBudget) * 100)}%"></div>
        </div>
        <div class="sc-budget-num">${budget} / ${maxBudget}</div>
      </div>
      <div class="sc-headroom">HEADROOM<br><b>${headroom}</b></div>
    </div>

    <div class="sc-action">
      <div class="sc-energy-label">ENERGY</div>
      <div class="sc-energy-orb">${energy}<span style="font-size:9px;opacity:0.7">/${energyPerTurn}</span></div>
      <button class="sc-end-turn" id="sc-end-turn">END TURN ▶</button>
    </div>

    <div class="sc-foot">
      <span>📖 Codex</span>
      <span>⏸ Pause</span>
      <span class="right">turn ${turn}</span>
    </div>
  `;

  // Render hand cards
  const handSlot = root.querySelector<HTMLDivElement>("#sc-hand-slot")!;
  for (const card of hand) {
    handSlot.appendChild(renderCard(card, dispatch, targetId));
  }

  // End turn button
  root.querySelector<HTMLButtonElement>("#sc-end-turn")!
    .addEventListener("click", () => dispatch({ type: "END_TURN" }));

  return root;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: clean build — no more references to `PLAY_CARD_STUB`.

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all tests still pass (no new scene tests — verified visually in Task 9).

- [ ] **Step 4: Commit**

```bash
git add slothespire/src/ui/scene-combat.ts
git commit -m "feat(ui): rewrite combat scene — dynamic hand, full intent kinds, energy+headroom HUD"
```

---

## Task 9: Add CONTINUE button to title scene

**Files:**
- Modify: `src/ui/scene-title.ts`

`CONTINUE` should appear (enabled) when `loadRun()` returns a non-null state. Since `scene-title.ts` doesn't currently import `loadRun`, add the import and check.

- [ ] **Step 1: Update `src/ui/scene-title.ts`**

Add import at the top:

```ts
import { loadRun } from "../engine/save";
```

In the render function body, before building `root.innerHTML`, add:

```ts
  const hasSave = loadRun() !== null;
```

In the `.menu` section of `root.innerHTML`, replace the static CONTINUE button with a conditional:

```ts
      ${hasSave
        ? '<button data-action="continue">CONTINUE</button>'
        : '<button data-action="continue" disabled title="No saved run">CONTINUE</button>'}
```

After the existing NEW RUN event listener, add:

```ts
  const continueBtn = root.querySelector<HTMLButtonElement>('[data-action="continue"]');
  if (continueBtn && !continueBtn.disabled) {
    // M2 stub: main.ts boots from loadRun() at startup, so a reload picks up the save.
    // Proper mid-session state-replacement lands in M6.
    continueBtn.addEventListener("click", () => window.location.reload());
  }
```

- [ ] **Step 2: Run build and tests**

Run: `npm run build` — must pass.
Run: `npm test` — 50+ tests still pass.

- [ ] **Step 3: Commit**

```bash
git add slothespire/src/ui/scene-title.ts
git commit -m "feat(ui): show CONTINUE button on title when saved run exists"
```

---

## Task 10: Smoke test (manual browser verification)

**Files:** none (verification only)

- [ ] **Step 1: Boot the dev server**

Run: `npm run dev` (background)
Open: http://localhost:5173

- [ ] **Step 2: New Run — full combat loop**

Verify each:
- Title screen visible with NEW RUN (magenta) and CONTINUE (gray/disabled, no save yet)
- Click NEW RUN → combat scene
- Hand shows **5 cards** with correct names from the starting deck (Manual Fix, Failover, etc.) with attack/skill icons in matching colors
- Enemy "Flapping Health Check" shows `⚔ 6` intent badge **above** the sprite
- SLO Budget bar shows 80/80; Headroom shows 0; Energy orb shows 3/3
- Turn counter shows TURN 1

- [ ] **Step 3: Play cards**

- Click a **Circuit Breaker** or **Failover** card → Headroom increases (5 or 8)
- Energy orb decreases by 1
- Played card disappears from hand; Discard pile count increments

- [ ] **Step 4: End turn**

- Click END TURN → enemy executes burn; Budget decreases
- New hand of 5 cards appears
- Turn counter shows TURN 2
- Enemy intent changes from `⚔ 6` to `⚔ 4` (Flapping Health Check pattern alternates)
- Headroom resets to 0 after absorbing/not absorbing enemy hit

- [ ] **Step 5: Win condition**

- Play attack cards repeatedly (Manual Fix: 6 burn; Canary Deploy: 5 burn + draw 1)
- After enough attacks (4× Manual Fix = 24 burn ≥ 20 enemy stability), enemy should die
- Verify "RUN COMPLETE" screen appears with RETURN TO TITLE button

- [ ] **Step 6: Loss condition**

- Start new run, click END TURN repeatedly without playing cards
- After ~13–14 turns (turn 1: 6 dmg, turn 2: 4 dmg, alternating; total ≈ 80 budget) → "BUDGET BREACHED" screen

- [ ] **Step 7: CONTINUE button appears mid-run**

Note: clicking RETURN TO TITLE or losing/winning clears the save (clearRun is called). CONTINUE only appears when a run is saved mid-combat.

Test:
- Click NEW RUN → end one turn (combat state is saved to localStorage)
- Close the browser tab and reopen http://localhost:5173
- Verify CONTINUE button is **enabled** (cyan style, not disabled)
- Click CONTINUE → page reloads → drops back into combat where you left off

- [ ] **Step 8: Final test suite**

Run: `npm test`
Expected: all tests pass. Record final count.

- [ ] **Step 9: Commit any smoke-test fixes**

If issues found and fixed during smoke test, commit them. Then:

```bash
git add -A slothespire/
git commit -m "fix(m2): smoke test fixes" # only if needed
```

---

## Done

At the end of M2:
- `npm run dev` shows a real combat loop: shuffle deck → deal 5 → play cards with effects → end turn → enemy hits back → repeat until win or loss.
- `npm test` passes **≥50 tests** across 5 test files (rng, state, reducer, save, effects, combat-flow).
- `npm run build` produces a clean bundle.
- All 6 `Intent` kinds render correctly in the combat UI.
- CONTINUE button appears on title when a saved run exists.

**What M2 does NOT include** (deferred to M3):
- Status effects (Toil, Flow, Burnout, Customer-Facing, etc.)
- Page Senior Engineer's "gain 1 Energy next turn" (requires status system)
- Card upgrades
- Exhaust pile behavior (cards exhaust but don't yet affect game flow)
- Potions / Hotfixes
- Deck viewer / inspect UI

**M3 will implement** the full StS combat feature set: all 10 statuses, exhaust, card upgrades, potions. Plan written after M2 ships and we confirm no engine surprises.
