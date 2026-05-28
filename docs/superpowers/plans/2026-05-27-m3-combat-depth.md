# M3 — Combat Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the StS-faithful feature set: all 10 status effects apply, tick, and resolve; Power cards persist in play and trigger each turn; Exhaust cards leave permanently; Curses punish you if held; Hotfixes (potions) are usable any time during your turn. Page Senior Engineer gets its missing "gain 1 Energy next turn" effect.

**Architecture:** Three additive layers on top of M2. (1) Status layer: new primitives in `effects.ts` + modifier functions used in PLAY_CARD and END_TURN. (2) Card mechanics layer: `CardDef` gains `exhaust`, `powerTrigger`, `curseEffect` fields; reducer routes played cards to the right pile/zone. (3) Hotfix layer: new content file + `USE_HOTFIX` action. UI gains status pills, a power zone, and hotfix buttons. No changes to existing pile mechanics; no changes to the save schema beyond adding `activePowers` to the combat block.

**Tech Stack:** TypeScript + Vite (unchanged). Vitest. No new dependencies.

**Reference spec:** `docs/superpowers/specs/2026-05-27-slothespire-design.md` §4 (combat mechanics — statuses, hotfixes, exhaust, powers).

**M2 baseline:** 53 tests. `src/engine/effects.ts` (burnEnemy, addHeadroom, drawCards, shuffleDeck), `src/content/cards.ts` (5 card defs), `src/content/enemies.ts`. Reducer handles START_RUN, PLAY_CARD, END_TURN, RETURN_TO_TITLE.

---

## File structure (changes from M2)

```
slothespire/src/
├── content/
│   ├── cards.ts           MODIFY — add 4 new defs; extend EffectSpec + CardDef types
│   ├── enemies.ts         MODIFY — add 2 enemies with non-burn intents for status testing
│   └── hotfixes.ts        NEW    — HotfixDef, HOTFIX_DEFS, 2 hotfixes
├── engine/
│   ├── effects.ts         MODIFY — applyStatus, consumeStatus, tickStatuses, burn/headroom modifiers
│   ├── actions.ts         MODIFY — add USE_HOTFIX
│   ├── reducer.ts         MODIFY — status modifiers in PLAY_CARD; full status resolution in END_TURN;
│   │                               power/exhaust/curse routing; USE_HOTFIX case
│   └── state.ts           MODIFY — add activePowers to combat; no other schema changes
└── ui/
    └── scene-combat.ts    MODIFY — status pills, power zone, hotfix slots

slothespire/tests/
├── effects.test.ts        MODIFY — add status primitive tests (8 new)
├── combat-flow.test.ts    MODIFY — add PLAY_CARD status tests (8), END_TURN status tests (8),
│                                    power/exhaust/curse tests (6), hotfix tests (4)
└── (others unchanged)
```

**File responsibilities (new/changed):**
- `effects.ts`: owns all pure-function game-logic primitives. Now includes status management.
- `content/hotfixes.ts`: static hotfix data, same shape as cards.ts.
- `state.ts`: `combat.activePowers` is the only new field — Power cards played this fight.
- `reducer.ts`: orchestrates effect calls. PLAY_CARD now routes to three piles (discard / activePowers / exhaust), and two early-returns (curse, insufficient energy). END_TURN grows a "start of turn" phase (status triggers) and "curse penalty" pass.

---

## Design decisions (locked in before coding)

### Status storage and tick rules

All statuses live in `StatusMap = Partial<Record<StatusId, number>>`. A status with value 0 is treated as absent.

| Status | Category | When it fires | Tick rule |
|---|---|---|---|
| `customer_facing` | Debuff on target | Incoming burn ×1.5 | Decays −1/round |
| `throttled` | Debuff on source | Outgoing burn ×0.75 | Decays −1/round |
| `pressure` | Buff on source | Outgoing attack +N flat | Permanent |
| `stability` | Buff on player | Headroom cards +N | Permanent |
| `toil` | Debuff on player | Start of turn: −1 energy | Decays −1/round |
| `flow` | Buff on player | Start of turn: +1 energy | Decays −1/round |
| `burnout` | Debuff on player | Next draw: −1 card | One-shot (consumed on use) |
| `confidence` | Buff on player | Next attack: ×2 | One-shot (consumed on use) |
| `on_call_fatigue` | Debuff on player | End of round: −2 budget | Decays −1/round |
| `observability` | Buff on player | See N more turns intent ahead | Permanent |

`tickStatuses` decrements the five decaying statuses. One-shots are consumed at trigger time (not ticked). Permanent statuses are never ticked.

### Burn calculation order (PLAY_CARD)

```
base = effect.amount
+ source.pressure stacks (flat)
× 2 if source.confidence (consume confidence after)
× 0.75 floor if source.throttled (player playing a throttled attack)
× 1.5 ceil  if target.customer_facing
= final burn
```

### Headroom calculation order (PLAY_CARD)

```
base = effect.amount
+ player.stability stacks (flat)
= final headroom
```

### END_TURN phase order

1. Curse penalty pass — for each curse in `player.hand`: apply its `curseEffect`
2. Discard remaining hand (non-curse cards already discarded in M2; now also clears curses)
3. Enemy actions — for each enemy, apply intent with modified amounts:
   - enemy `throttled` → enemy burn ×0.75
   - player `customer_facing` → incoming burn ×1.5
4. Reset headroom to 0 (unconditional — already fixed in M2)
5. Loss check (budget ≤ 0 → lost)
6. Start-of-turn phase — apply status triggers in order: `toil` (−1 energy), `flow` (+1 energy), `burnout` (−1 draw next turn via a drawAdjustment)
7. On-Call Fatigue — −2 budget per stack
8. Tick all decaying statuses (player + each enemy)
9. Generate next enemy intents
10. Restore energy to energyPerTurn (after toil/flow adjustments — flow/toil are additive from the base)
11. Power triggers — execute `powerTrigger` for each card in `combat.activePowers`
12. Draw cards (5 − burnout adjustment)
13. Increment turn

### New CardDef fields

```ts
export interface CardDef {
  // ... existing fields ...
  exhaust?: boolean;                        // card → exhaust pile (never reshuffles)
  powerTrigger?: EffectSpec[];              // Power cards: effects fired each END_TURN
  curseEffect?: EffectSpec[];               // Curse cards: effects fired each END_TURN while in hand
}
```

### activePowers in combat

Add to the `GameState.combat` object:

```ts
  combat?: {
    enemies: Enemy[];
    intentByEnemy: Record<string, Intent>;
    activePowers: Card[];                   // ← NEW
    turn: number;
    phase: "player" | "enemy" | "transitioning";
  };
```

`activePowers` is empty on combat start, grows as Power cards are played.

---

## Task 1: Status primitives (`effects.ts` extensions)

**Files:**
- Modify: `src/engine/effects.ts`
- Modify: `tests/effects.test.ts`

- [ ] **Step 1: Write failing tests — append to `tests/effects.test.ts`**

```ts
import { applyStatus, consumeStatus, tickStatuses, burnWithModifiers, headroomWithModifiers } from "../src/engine/effects";
import type { StatusMap } from "../src/engine/state";

describe("applyStatus", () => {
  it("adds stacks to a new status", () => {
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
  it("removes all stacks of a status", () => {
    const { s } = makeCombatState();
    const s2 = applyStatus(s, "player", "confidence", 1);
    const s3 = consumeStatus(s2, "player", "confidence");
    expect(s3.player.statuses.confidence).toBeUndefined();
  });
});

describe("tickStatuses", () => {
  it("decrements decaying status stacks by 1", () => {
    const statuses: StatusMap = { customer_facing: 2, flow: 1 };
    const ticked = tickStatuses(statuses);
    expect(ticked.customer_facing).toBe(1);
    expect(ticked.flow).toBeUndefined(); // reached 0 → removed
  });

  it("does not change permanent statuses", () => {
    const statuses: StatusMap = { pressure: 3, stability: 2 };
    const ticked = tickStatuses(statuses);
    expect(ticked.pressure).toBe(3);
    expect(ticked.stability).toBe(2);
  });

  it("does not change one-shot statuses (consumed separately)", () => {
    const statuses: StatusMap = { confidence: 1, burnout: 1 };
    const ticked = tickStatuses(statuses);
    expect(ticked.confidence).toBe(1);
    expect(ticked.burnout).toBe(1);
  });
});

describe("burnWithModifiers", () => {
  it("applies pressure (flat add from source)", () => {
    expect(burnWithModifiers(6, { pressure: 2 }, {})).toBe(8);
  });

  it("applies confidence (double, one-shot — caller consumes)", () => {
    expect(burnWithModifiers(6, { confidence: 1 }, {})).toBe(12);
  });

  it("applies throttled on source (floor ×0.75)", () => {
    expect(burnWithModifiers(6, { throttled: 1 }, {})).toBe(4); // floor(6 × 0.75)
  });

  it("applies customer_facing on target (ceil ×1.5)", () => {
    expect(burnWithModifiers(6, {}, { customer_facing: 1 })).toBe(9); // ceil(6 × 1.5)
  });

  it("stacks multiple modifiers in correct order", () => {
    // pressure +2, throttled: (6+2)×0.75=6, customer_facing: ceil(6×1.5)=9
    expect(burnWithModifiers(6, { pressure: 2, throttled: 1 }, { customer_facing: 1 })).toBe(9);
  });
});

describe("headroomWithModifiers", () => {
  it("adds stability (flat add)", () => {
    expect(headroomWithModifiers(5, { stability: 3 })).toBe(8);
  });

  it("returns base amount if no stability", () => {
    expect(headroomWithModifiers(5, {})).toBe(5);
  });
});
```

- [ ] **Step 2: Run `npm test` — FAIL (functions not exported yet)**

- [ ] **Step 3: Add the new functions to `src/engine/effects.ts`**

Append to the end of the file (keep existing functions untouched):

```ts
import type { StatusId } from "./state";

const DECAYING_STATUSES: StatusId[] = [
  "customer_facing", "throttled", "toil", "flow", "on_call_fatigue",
];

export function applyStatus(
  state: GameState,
  target: "player" | string,
  statusId: StatusId,
  stacks: number
): GameState {
  if (target === "player") {
    return {
      ...state,
      player: {
        ...state.player,
        statuses: {
          ...state.player.statuses,
          [statusId]: (state.player.statuses[statusId] ?? 0) + stacks,
        },
      },
    };
  }
  if (!state.combat) return state;
  const enemies = state.combat.enemies.map(e =>
    e.instanceId === target
      ? { ...e, statuses: { ...e.statuses, [statusId]: (e.statuses[statusId] ?? 0) + stacks } }
      : e
  );
  return { ...state, combat: { ...state.combat, enemies } };
}

export function consumeStatus(
  state: GameState,
  target: "player" | string,
  statusId: StatusId
): GameState {
  if (target === "player") {
    const { [statusId]: _, ...rest } = state.player.statuses;
    return { ...state, player: { ...state.player, statuses: rest } };
  }
  if (!state.combat) return state;
  const enemies = state.combat.enemies.map(e => {
    if (e.instanceId !== target) return e;
    const { [statusId]: _, ...rest } = e.statuses;
    return { ...e, statuses: rest };
  });
  return { ...state, combat: { ...state.combat, enemies } };
}

export function tickStatuses(statuses: StatusMap): StatusMap {
  const result: StatusMap = { ...statuses };
  for (const id of DECAYING_STATUSES) {
    if (result[id] !== undefined) {
      const next = (result[id] as number) - 1;
      if (next <= 0) delete result[id];
      else result[id] = next;
    }
  }
  return result;
}

export function burnWithModifiers(
  base: number,
  sourceStatuses: StatusMap,
  targetStatuses: StatusMap
): number {
  let amount = base;
  // Flat add from Pressure
  if (sourceStatuses.pressure) amount += sourceStatuses.pressure;
  // Double from Confidence (caller is responsible for consuming it)
  if (sourceStatuses.confidence) amount *= 2;
  // 75% from source Throttled
  if (sourceStatuses.throttled) amount = Math.floor(amount * 0.75);
  // 150% from target Customer-Facing
  if (targetStatuses.customer_facing) amount = Math.ceil(amount * 1.5);
  return amount;
}

export function headroomWithModifiers(base: number, playerStatuses: StatusMap): number {
  return base + (playerStatuses.stability ?? 0);
}
```

Note: `StatusMap` is imported at the top of `effects.ts` via the existing `import type { GameState, Card } from "./state";` — extend that import to include `StatusMap` and `StatusId`.

- [ ] **Step 4: Run `npm test` — expect **53 + 14 = 67 pass** (3 applyStatus + 1 consumeStatus + 3 tickStatuses + 5 burnWithModifiers + 2 headroomWithModifiers = 14 new)**

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/effects.ts slothespire/tests/effects.test.ts
git commit -m "feat(engine): status primitives — applyStatus, consumeStatus, tickStatuses, burn/headroom modifiers"
```

---

## Task 2: Extend content — new EffectSpec types + 4 new cards + 2 new enemies

**Files:**
- Modify: `src/content/cards.ts`
- Modify: `src/content/enemies.ts`

No TDD for pure data; correctness verified in Task 3's reducer tests.

- [ ] **Step 1: Extend `EffectSpec` in `src/content/cards.ts` and add new fields to `CardDef`**

Replace the `EffectSpec` type:

```ts
export type EffectSpec =
  | { kind: "burn"; amount: number }
  | { kind: "headroom"; amount: number }
  | { kind: "draw"; amount: number }
  | { kind: "applyStatus"; status: StatusId; stacks: number; target: "single" | "all" | "self" };
```

Add `import type { StatusId } from "../engine/state";` at the top.

Extend `CardDef`:

```ts
export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  effects: EffectSpec[];
  flavor: string;
  exhaust?: boolean;
  powerTrigger?: EffectSpec[];    // Power cards fire these at end of turn
  curseEffect?: EffectSpec[];     // Curse cards apply these at end of turn while in hand
}
```

- [ ] **Step 2: Update `page_senior_engineer` to add Flow effect**

In `CARD_DEFS`, update `page_senior_engineer`:

```ts
  page_senior_engineer: {
    id: "page_senior_engineer", name: "Page Senior Engineer", type: "skill", cost: 2,
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "applyStatus", status: "flow", stacks: 1, target: "self" },
    ],
    flavor: "They've seen this before.",
  },
```

- [ ] **Step 3: Add 4 new card definitions**

```ts
  chaos_engineering: {
    id: "chaos_engineering", name: "Chaos Engineering", type: "skill", cost: 2,
    effects: [
      { kind: "applyStatus", status: "customer_facing", stacks: 3, target: "all" },
      { kind: "selfBurn", amount: 5 },   // burns player's own budget
    ],
    flavor: "Break it on purpose so it doesn't break you on Friday.",
  },
  auto_scaling: {
    id: "auto_scaling", name: "Auto-Scaling", type: "power", cost: 1,
    effects: [],
    powerTrigger: [{ kind: "headroom", amount: 4 }],
    flavor: "Demand goes up. Capacity goes up.",
  },
  page_the_ceo: {
    id: "page_the_ceo", name: "Page the CEO", type: "skill", cost: 2,
    effects: [{ kind: "burn", amount: 30 }],
    exhaust: true,
    flavor: "Nuclear option. One per incident.",
  },
  tech_debt: {
    id: "tech_debt", name: "Tech Debt", type: "curse", cost: -1,
    effects: [],
    curseEffect: [{ kind: "burn", amount: 2 }],   // self-burn per curse in hand
    flavor: "Unplayable. Costs 2 Budget every turn it sits in your hand.",
  },
```

Note on `selfBurn`: this is a new `EffectSpec` variant `| { kind: "selfBurn"; amount: number }` — add it to the `EffectSpec` type at the same time as adding `applyStatus`. The reducer handles it by reducing `player.budget` directly (no enemy target needed).

- [ ] **Step 4: Add 2 new enemies to `src/content/enemies.ts`**

```ts
  memory_leak: {
    id: "memory_leak",
    name: "Memory Leak",
    stability: 28,
    intentPattern: [
      { kind: "buff", status: "pressure" as const, stacks: 1 },
      { kind: "burn", amount: 8 },
      { kind: "buff", status: "pressure" as const, stacks: 1 },
      { kind: "burn", amount: 10 },
    ],
  },
  zombie_process: {
    id: "zombie_process",
    name: "Zombie Process",
    stability: 18,
    intentPattern: [
      { kind: "debuff", status: "toil" as const, stacks: 1 },
      { kind: "burn", amount: 5 },
    ],
  },
```

- [ ] **Step 5: Run `npm run build` — must pass**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add slothespire/src/content/cards.ts slothespire/src/content/enemies.ts
git commit -m "feat(content): new EffectSpec types, 4 new cards, 2 new enemies with status intents"
```

---

## Task 3: Add `activePowers` to GameState

**Files:**
- Modify: `src/engine/state.ts`

- [ ] **Step 1: Add `activePowers: Card[]` to the combat block**

In `GameState`, update the `combat?` object:

```ts
  combat?: {
    enemies: Enemy[];
    intentByEnemy: Record<string, Intent>;
    activePowers: Card[];            // ← add this line
    turn: number;
    phase: "player" | "enemy" | "transitioning";
  };
```

- [ ] **Step 2: Update the reducer's `START_RUN` case to include `activePowers: []`**

In `src/engine/reducer.ts`, in the START_RUN case, add `activePowers: [],` to the combat object:

```ts
      return {
        ...s,
        scene: "combat",
        combat: {
          enemies: [enemy],
          intentByEnemy: { [enemy.instanceId]: firstIntent },
          activePowers: [],          // ← add this line
          turn: 1,
          phase: "player",
        },
      };
```

- [ ] **Step 3: Run `npm test` — all 69 pass**

- [ ] **Step 4: Commit**

```bash
git add slothespire/src/engine/state.ts slothespire/src/engine/reducer.ts
git commit -m "feat(engine): add activePowers to combat state"
```

---

## Task 4: PLAY_CARD with status modifiers + new routing

**Files:**
- Modify: `src/engine/reducer.ts`
- Modify: `tests/combat-flow.test.ts`

Update PLAY_CARD to: apply burn/headroom modifiers from statuses; consume Confidence after use; apply `applyStatus` effects; route Power cards to `activePowers`; route Exhaust cards to `player.exhaust`; block Curse cards.

- [ ] **Step 1: Write failing tests — append to `tests/combat-flow.test.ts`**

```ts
describe("PLAY_CARD with statuses", () => {
  it("pressure adds flat burn on top of base damage", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    // Apply pressure 2 to player
    s = applyStatus(s, "player", "pressure", 2);
    const attackCard = s.player.hand.find(c => c.type === "attack" && c.defId === "manual_fix")!;
    const stabilityBefore = s.combat!.enemies[0].stability;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: attackCard.instanceId, targetId: enemy.instanceId });
    // Manual Fix base 6 + pressure 2 = 8
    expect(s2.combat!.enemies[0].stability).toBe(stabilityBefore - 8);
  });

  it("customer_facing on enemy amplifies burn ×1.5 (ceil)", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, enemy.instanceId, "customer_facing", 1);
    const attackCard = s.player.hand.find(c => c.defId === "manual_fix")!;
    const stabilityBefore = s.combat!.enemies[0].stability;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: attackCard.instanceId, targetId: enemy.instanceId });
    // Manual Fix 6 × 1.5 = 9 (ceil)
    expect(s2.combat!.enemies[0].stability).toBe(stabilityBefore - 9);
  });

  it("confidence doubles next attack and is consumed", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, "player", "confidence", 1);
    const attackCard = s.player.hand.find(c => c.defId === "manual_fix")!;
    const stabilityBefore = s.combat!.enemies[0].stability;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: attackCard.instanceId, targetId: enemy.instanceId });
    expect(s2.combat!.enemies[0].stability).toBe(stabilityBefore - 12); // 6 × 2
    expect(s2.player.statuses.confidence).toBeUndefined(); // consumed
  });

  it("stability adds flat headroom", () => {
    let s = startedRun();
    s = applyStatus(s, "player", "stability", 3);
    const skillCard = s.player.hand.find(c => c.defId === "failover")!;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: skillCard.instanceId, targetId: null });
    expect(s2.player.headroom).toBe(5 + 3); // failover base 5 + stability 3
  });

  it("applyStatus effect applies the status to enemy", () => {
    // Manually add chaos_engineering to hand for testing
    const { makeCard } = await import("../src/content/cards");
    let s = startedRun();
    const ceCard = makeCard("chaos_engineering");
    const enemy = s.combat!.enemies[0];
    s = { ...s, player: { ...s.player, hand: [...s.player.hand, ceCard], energy: 3 } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: ceCard.instanceId, targetId: enemy.instanceId });
    const updatedEnemy = s2.combat!.enemies.find(e => e.instanceId === enemy.instanceId)!;
    expect(updatedEnemy.statuses.customer_facing).toBe(3);
    // Also verify self-burn (chaos_engineering selfBurn 5 hits player budget)
    expect(s2.player.budget).toBe(80 - 5);
  });

  it("Power card goes to activePowers, not discard", () => {
    const { makeCard } = await import("../src/content/cards");
    let s = startedRun();
    const powerCard = makeCard("auto_scaling");
    s = { ...s, player: { ...s.player, hand: [...s.player.hand, powerCard] } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: powerCard.instanceId, targetId: null });
    expect(s2.combat!.activePowers.map(c => c.instanceId)).toContain(powerCard.instanceId);
    expect(s2.player.discard.map(c => c.instanceId)).not.toContain(powerCard.instanceId);
  });

  it("Exhaust card goes to exhaust pile", () => {
    const { makeCard } = await import("../src/content/cards");
    let s = startedRun();
    const exhaCard = makeCard("page_the_ceo");
    s = { ...s, player: { ...s.player, hand: [...s.player.hand, exhaCard], energy: 3 } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: exhaCard.instanceId, targetId: null });
    expect(s2.player.exhaust.map(c => c.instanceId)).toContain(exhaCard.instanceId);
    expect(s2.player.discard.map(c => c.instanceId)).not.toContain(exhaCard.instanceId);
  });

  it("Curse card cannot be played (returns unchanged state)", () => {
    const { makeCard } = await import("../src/content/cards");
    let s = startedRun();
    const curse = makeCard("tech_debt");
    s = { ...s, player: { ...s.player, hand: [...s.player.hand, curse] } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: curse.instanceId, targetId: null });
    expect(s2).toBe(s); // same reference — no change
  });
});
```

Note: The tests use dynamic import (`await import(...)`) for `makeCard` — Vitest supports top-level await in test files. Alternatively, import it statically at the top.

Adjust the test file to import `applyStatus` and `makeCard` at the top:

```ts
import { applyStatus } from "../src/engine/effects";
import { makeCard } from "../src/content/cards";
```

- [ ] **Step 2: Run `npm test` — new tests FAIL**

- [ ] **Step 3: Update `PLAY_CARD` in `src/engine/reducer.ts`**

Update imports at the top to include:
```ts
import { buildStarterDeck, CARD_DEFS, type EffectSpec } from "../content/cards";
import { burnEnemy, addHeadroom, drawCards, applyStatus, consumeStatus, burnWithModifiers, headroomWithModifiers } from "./effects";
```

Replace the PLAY_CARD case with the full implementation:

```ts
    case "PLAY_CARD": {
      const { cardInstanceId, targetId } = action;
      const card = state.player.hand.find(c => c.instanceId === cardInstanceId);
      if (!card) return state;

      const def = CARD_DEFS[card.defId];
      if (!def) return state;

      // Curses are unplayable
      if (card.type === "curse") return state;

      // Check energy (cost -1 = unplayable curse guard above; 0 = free)
      if (card.cost > 0 && state.player.energy < card.cost) return state;
      if (card.cost === -1) return state; // extra guard

      // Determine destination pile
      const isPower = card.type === "power";
      const isExhaust = def.exhaust === true;

      // Remove from hand, deduct energy, route to pile
      let s: GameState = {
        ...state,
        player: {
          ...state.player,
          energy: state.player.energy - Math.max(0, card.cost),
          hand: state.player.hand.filter(c => c.instanceId !== cardInstanceId),
          discard: isPower || isExhaust ? state.player.discard : [...state.player.discard, card],
          exhaust: isExhaust ? [...state.player.exhaust, card] : state.player.exhaust,
        },
        combat: isPower && state.combat
          ? { ...state.combat, activePowers: [...state.combat.activePowers, card] }
          : state.combat,
      };

      // Apply each effect
      for (const effect of def.effects) {
        if (effect.kind === "burn") {
          const tid = targetId ?? s.combat?.enemies[0]?.instanceId;
          if (tid) {
            const enemy = s.combat?.enemies.find(e => e.instanceId === tid);
            const finalDamage = burnWithModifiers(
              effect.amount,
              s.player.statuses,
              enemy?.statuses ?? {}
            );
            // Consume Confidence after calculating (one-shot)
            if (s.player.statuses.confidence) {
              s = consumeStatus(s, "player", "confidence");
            }
            s = burnEnemy(s, tid, finalDamage);
          }
        } else if (effect.kind === "selfBurn") {
          s = { ...s, player: { ...s.player, budget: s.player.budget - effect.amount } };
        } else if (effect.kind === "headroom") {
          const finalHeadroom = headroomWithModifiers(effect.amount, s.player.statuses);
          s = addHeadroom(s, finalHeadroom);
        } else if (effect.kind === "draw") {
          s = drawCards(s, effect.amount);
        } else if (effect.kind === "applyStatus") {
          if (effect.target === "self") {
            s = applyStatus(s, "player", effect.status, effect.stacks);
          } else if (effect.target === "all") {
            for (const enemy of s.combat?.enemies ?? []) {
              s = applyStatus(s, enemy.instanceId, effect.status, effect.stacks);
            }
          } else if (effect.target === "single") {
            const tid = targetId ?? s.combat?.enemies[0]?.instanceId;
            if (tid) s = applyStatus(s, tid, effect.status, effect.stacks);
          }
        }
      }

      // Win check
      if (s.combat && s.combat.enemies.every(e => e.stability <= 0)) {
        return { ...s, scene: "won", combat: undefined };
      }
      // Loss check
      if (s.player.budget <= 0) {
        return { ...s, scene: "lost", combat: undefined };
      }

      return s;
    }
```

Also update `EffectSpec` import to include `selfBurn` — add `| { kind: "selfBurn"; amount: number }` to `EffectSpec` in `cards.ts`.

- [ ] **Step 4: Run `npm test` — expect **67 + 8 = 75 pass****

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/reducer.ts slothespire/src/content/cards.ts slothespire/tests/combat-flow.test.ts
git commit -m "feat(engine): PLAY_CARD — status modifiers, Power/Exhaust/Curse routing, applyStatus effects"
```

---

## Task 5: END_TURN with full status resolution + power triggers

**Files:**
- Modify: `src/engine/reducer.ts`
- Modify: `tests/combat-flow.test.ts`

- [ ] **Step 1: Write failing tests — append to `tests/combat-flow.test.ts`**

```ts
import { makeCard } from "../src/content/cards";

describe("END_TURN with statuses", () => {
  it("flow grants +1 energy at start of next turn and decays", () => {
    let s = startedRun();
    s = applyStatus(s, "player", "flow", 1);
    const s1 = reduce(s, { type: "END_TURN" });
    // energy = energyPerTurn(3) + flow(1) = 4; flow decays to 0 and is removed
    expect(s1.player.energy).toBe(4);
    expect(s1.player.statuses.flow).toBeUndefined();
  });

  it("toil costs -1 energy at start of next turn and decays", () => {
    let s = startedRun();
    s = applyStatus(s, "player", "toil", 1);
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.energy).toBe(2); // 3 - 1
    expect(s1.player.statuses.toil).toBeUndefined();
  });

  it("on_call_fatigue drains budget at end of turn and decays", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, "player", "on_call_fatigue", 2);
    // Give 0 enemy burn so budget change comes only from fatigue
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.budget).toBe(80 - 4); // 2 stacks × 2 budget each
    expect(s1.player.statuses.on_call_fatigue).toBe(1); // decayed from 2 → 1
  });

  it("customer_facing on player amplifies enemy burn", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, "player", "customer_facing", 1);
    s = { ...s, player: { ...s.player, headroom: 0 }, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 6 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.budget).toBe(80 - 9); // ceil(6 × 1.5) = 9
    expect(s1.player.statuses.customer_facing).toBeUndefined(); // decayed (1→0 removed)
  });

  it("power trigger fires at end of turn", () => {
    const { makeCard } = await import("../src/content/cards");
    let s = startedRun();
    const powerCard = makeCard("auto_scaling");
    // Add Auto-Scaling to activePowers directly (simulating having played it)
    s = { ...s, combat: { ...s.combat!, activePowers: [powerCard] } };
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.headroom).toBe(4); // Auto-Scaling gives +4 headroom but waits... 
    // Actually headroom resets at END of enemy actions. Powers fire AFTER that reset.
    // So we expect headroom to be 4 after power trigger, then NOT reset again.
    // Verify headroom = 4 (set by power) not 0 (reset happened earlier in turn)
    expect(s1.player.headroom).toBe(4);
  });

  it("curse in hand causes self-burn at end of turn", () => {
    const { makeCard } = await import("../src/content/cards");
    let s = startedRun();
    const curse = makeCard("tech_debt");
    s = { ...s, player: { ...s.player, hand: [curse] } };  // only the curse in hand
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.budget).toBe(80 - 2); // 1 curse × 2 = 2 Burn
  });

  it("all decaying statuses tick down each round", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, "player", "toil", 2);
    s = applyStatus(s, "player", "customer_facing", 3);
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.statuses.toil).toBe(1);       // 2 → 1
    expect(s1.player.statuses.customer_facing).toBe(2); // 3 → 2
  });

  it("enemy intent with debuff applies status to player", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    // Set zombie_process-style intent: debuff toil 1
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "debuff", status: "toil", stacks: 1 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.statuses.toil).toBe(1);
  });
});
```

- [ ] **Step 2: Run `npm test` — new tests FAIL**

- [ ] **Step 3: Rewrite `END_TURN` case in `src/engine/reducer.ts`**

Replace the entire `END_TURN` case with the full status-aware implementation:

```ts
    case "END_TURN": {
      if (!state.combat) return state;
      const { enemies, intentByEnemy, turn, activePowers } = state.combat;

      // Phase 1: Curse penalties (before discarding hand)
      let s: GameState = state;
      const cursesInHand = s.player.hand.filter(c => {
        const def = CARD_DEFS[c.defId];
        return c.type === "curse" && def?.curseEffect;
      });
      for (const curse of cursesInHand) {
        const def = CARD_DEFS[curse.defId]!;
        for (const effect of def.curseEffect ?? []) {
          if (effect.kind === "burn" || effect.kind === "selfBurn") {
            s = { ...s, player: { ...s.player, budget: s.player.budget - effect.amount } };
          }
        }
      }

      // Phase 2: Discard remaining hand
      s = {
        ...s,
        player: {
          ...s.player,
          discard: [...s.player.discard, ...s.player.hand],
          hand: [],
        },
      };

      // Phase 3: Enemy actions
      for (const enemy of enemies) {
        const intent = intentByEnemy[enemy.instanceId];
        if (!intent) continue;

        if (intent.kind === "burn") {
          const finalBurn = burnWithModifiers(
            intent.amount,
            enemy.statuses,                 // enemy Throttled reduces their own burn
            s.player.statuses               // player Customer-Facing amplifies incoming
          );
          const headroom = s.player.headroom;
          const absorbed = Math.min(headroom, finalBurn);
          const remainder = finalBurn - absorbed;
          s = { ...s, player: { ...s.player, headroom: 0, budget: s.player.budget - remainder } };
        } else if (intent.kind === "buff") {
          s = applyStatus(s, enemy.instanceId, intent.status, intent.stacks);
        } else if (intent.kind === "debuff") {
          s = applyStatus(s, "player", intent.status, intent.stacks);
        }
        // harden, multi, unknown: no-op in M3
      }

      // Phase 4: Headroom reset (unconditional — already set in burn branch but also
      // needed for non-burn turns)
      s = { ...s, player: { ...s.player, headroom: 0 } };

      // Phase 5: Loss check
      if (s.player.budget <= 0) {
        return { ...s, scene: "lost", combat: undefined };
      }

      // Phase 6: On-Call Fatigue
      const fatigue = s.player.statuses.on_call_fatigue ?? 0;
      if (fatigue > 0) {
        s = { ...s, player: { ...s.player, budget: s.player.budget - fatigue * 2 } };
        if (s.player.budget <= 0) {
          return { ...s, scene: "lost", combat: undefined };
        }
      }

      // Phase 7: Tick all decaying statuses (player + enemies)
      s = {
        ...s,
        player: { ...s.player, statuses: tickStatuses(s.player.statuses) },
        combat: {
          ...s.combat!,
          enemies: s.combat!.enemies.map(e => ({
            ...e,
            statuses: tickStatuses(e.statuses),
          })),
        },
      };

      // Phase 8: Generate next enemy intents
      const nextTurn = turn + 1;
      const nextIntents: Record<string, Intent> = {};
      for (const enemy of enemies) {
        nextIntents[enemy.instanceId] = getIntent(enemy.defId, nextTurn - 1);
      }

      // Phase 9: Restore energy (base + flow - toil)
      const flowBonus = s.player.statuses.flow ?? 0;
      const toilCost = s.player.statuses.toil ?? 0;
      const newEnergy = Math.max(0, s.player.energyPerTurn + flowBonus - toilCost);

      s = {
        ...s,
        player: { ...s.player, energy: newEnergy },
        combat: { ...s.combat!, turn: nextTurn, phase: "player", intentByEnemy: nextIntents },
      };

      // Phase 10: Power triggers
      for (const powerCard of activePowers) {
        const def = CARD_DEFS[powerCard.defId];
        for (const effect of def?.powerTrigger ?? []) {
          if (effect.kind === "headroom") {
            const finalHeadroom = headroomWithModifiers(effect.amount, s.player.statuses);
            s = addHeadroom(s, finalHeadroom);
          }
          // Other power trigger effects added in later milestones
        }
      }

      // Phase 11: Draw new hand
      const burnoutPenalty = s.player.statuses.burnout ? 1 : 0;
      if (burnoutPenalty) {
        s = consumeStatus(s, "player", "burnout"); // one-shot consumed
      }
      s = drawCards(s, Math.max(0, 5 - burnoutPenalty));

      return s;
    }
```

Add to imports:
```ts
import { burnEnemy, addHeadroom, drawCards, applyStatus, consumeStatus, tickStatuses, burnWithModifiers, headroomWithModifiers } from "./effects";
import type { Intent } from "./state";
```

- [ ] **Step 4: Run `npm test` — expect **75 + 8 = 83 pass****

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/reducer.ts slothespire/tests/combat-flow.test.ts
git commit -m "feat(engine): END_TURN — full status resolution, curse penalties, power triggers, buff/debuff intents"
```

---

## Task 6: Hotfix system

**Files:**
- Create: `src/content/hotfixes.ts`
- Modify: `src/engine/actions.ts`
- Modify: `src/engine/reducer.ts`
- Modify: `tests/combat-flow.test.ts`

- [ ] **Step 1: Create `src/content/hotfixes.ts`**

```ts
import type { EffectSpec } from "./cards";

export interface HotfixDef {
  id: string;
  name: string;
  effects: EffectSpec[];
  flavor: string;
}

export const HOTFIX_DEFS: Record<string, HotfixDef> = {
  rollback_hotfix: {
    id: "rollback_hotfix",
    name: "Rollback Hotfix",
    effects: [{ kind: "burn", amount: 20 }],
    flavor: "Revert everything. Sort it out later.",
  },
  failover_hotfix: {
    id: "failover_hotfix",
    name: "Failover Hotfix",
    effects: [{ kind: "headroom", amount: 25 }],
    flavor: "Not fixed. Just not failing right now.",
  },
};
```

- [ ] **Step 2: Add `USE_HOTFIX` to `src/engine/actions.ts`**

```ts
export type Action =
  | { type: "START_RUN" }
  | { type: "RETURN_TO_TITLE" }
  | { type: "PLAY_CARD"; cardInstanceId: string; targetId: string | null }
  | { type: "END_TURN" }
  | { type: "USE_HOTFIX"; hotfixId: string; targetId: string | null };
```

- [ ] **Step 3: Write failing tests — append to `tests/combat-flow.test.ts`**

```ts
describe("USE_HOTFIX", () => {
  it("removes the hotfix from player slots and applies its effect", () => {
    let s = startedRun();
    s = { ...s, player: { ...s.player, hotfixes: ["rollback_hotfix"] } };
    const enemy = s.combat!.enemies[0];
    const stabilityBefore = enemy.stability;
    const s2 = reduce(s, { type: "USE_HOTFIX", hotfixId: "rollback_hotfix", targetId: enemy.instanceId });
    expect(s2.player.hotfixes).not.toContain("rollback_hotfix");
    expect(s2.combat!.enemies[0].stability).toBe(stabilityBefore - 20);
  });

  it("failover hotfix adds headroom", () => {
    let s = startedRun();
    s = { ...s, player: { ...s.player, hotfixes: ["failover_hotfix"] } };
    const s2 = reduce(s, { type: "USE_HOTFIX", hotfixId: "failover_hotfix", targetId: null });
    expect(s2.player.headroom).toBe(25);
    expect(s2.player.hotfixes).toHaveLength(0);
  });

  it("no-op if hotfix not in slots", () => {
    const s = startedRun();
    const s2 = reduce(s, { type: "USE_HOTFIX", hotfixId: "rollback_hotfix", targetId: null });
    expect(s2).toBe(s);
  });

  it("win condition triggers if hotfix kills last enemy", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = {
      ...s,
      player: { ...s.player, hotfixes: ["rollback_hotfix"] },
      combat: { ...s.combat!, enemies: [{ ...enemy, stability: 1 }] },
    };
    const s2 = reduce(s, { type: "USE_HOTFIX", hotfixId: "rollback_hotfix", targetId: enemy.instanceId });
    expect(s2.scene).toBe("won");
  });
});
```

- [ ] **Step 4: Run `npm test` — new tests FAIL**

- [ ] **Step 5: Add `USE_HOTFIX` case to `src/engine/reducer.ts`**

Add import:
```ts
import { HOTFIX_DEFS } from "../content/hotfixes";
```

Add case:
```ts
```ts
    case "USE_HOTFIX": {
      const { hotfixId, targetId } = action;
      if (!state.player.hotfixes.includes(hotfixId)) return state;
      const def = HOTFIX_DEFS[hotfixId];
      if (!def) return state;

      // Remove first occurrence of hotfixId
      const hotfixIdx = state.player.hotfixes.indexOf(hotfixId);
      let s: GameState = {
        ...state,
        player: {
          ...state.player,
          hotfixes: [
            ...state.player.hotfixes.slice(0, hotfixIdx),
            ...state.player.hotfixes.slice(hotfixIdx + 1),
          ],
        },
      };

      // Apply effects (same logic as PLAY_CARD effects, no energy cost)
      for (const effect of def.effects) {
        if (effect.kind === "burn") {
          const tid = targetId ?? s.combat?.enemies[0]?.instanceId;
          if (tid) {
            const enemy = s.combat?.enemies.find(e => e.instanceId === tid);
            const finalDamage = burnWithModifiers(effect.amount, s.player.statuses, enemy?.statuses ?? {});
            if (s.player.statuses.confidence) s = consumeStatus(s, "player", "confidence");
            s = burnEnemy(s, tid, finalDamage);
          }
        } else if (effect.kind === "headroom") {
          s = addHeadroom(s, headroomWithModifiers(effect.amount, s.player.statuses));
        }
      }

      // Win / loss checks
      if (s.combat && s.combat.enemies.every(e => e.stability <= 0)) {
        return { ...s, scene: "won", combat: undefined };
      }
      if (s.player.budget <= 0) {
        return { ...s, scene: "lost", combat: undefined };
      }

      return s;
    }
```

- [ ] **Step 6: Run `npm test` — expect **83 + 4 = 87 pass****

- [ ] **Step 7: Commit**

```bash
git add slothespire/src/content/hotfixes.ts slothespire/src/engine/actions.ts slothespire/src/engine/reducer.ts slothespire/tests/combat-flow.test.ts
git commit -m "feat(engine): hotfix system — USE_HOTFIX action, 2 hotfixes, consumable during player turn"
```

---

## Task 7: Combat UI — status pills, power zone, hotfix buttons

**Files:**
- Modify: `src/ui/scene-combat.ts`

No new Vitest tests — verified in the smoke test (Task 8).

- [ ] **Step 1: Update `scene-combat.ts` to render status pills, power zone, hotfix buttons**

Add status pills below each enemy's name in the `enemiesHtml` map:

```ts
    const statusPills = Object.entries(enemy.statuses)
      .filter(([, v]) => v && v > 0)
      .map(([id, v]) => `<span class="sc-status-pill">${id.replace(/_/g," ")} ${v}</span>`)
      .join("");
```

Insert `<div class="sc-status-pills">${statusPills}</div>` below `.sc-enemy-hp`.

Add player status pills in the stats panel:

```ts
    const playerStatusPills = Object.entries(state.player.statuses)
      .filter(([, v]) => v && v > 0)
      .map(([id, v]) => `<span class="sc-status-pill sc-status-player">${id.replace(/_/g," ")} ${v}</span>`)
      .join("");
```

Add `<div class="sc-player-statuses">${playerStatusPills}</div>` to the stats section.

Add a power zone strip between enemies and play area if `combat.activePowers.length > 0`:

```ts
    const powersHtml = state.combat.activePowers.length > 0
      ? `<div class="sc-power-zone">POWERS: ${state.combat.activePowers.map(p => `<span class="sc-power-pill">${p.name}</span>`).join(" ")}</div>`
      : "";
```

Insert `${powersHtml}` inside the `.sc-play` div.

Add hotfix buttons to the left piles section:

```ts
    const hotfixHtml = ["slot0", "slot1", "slot2"].map((_, i) => {
      const hfId = state.player.hotfixes[i];
      const def = hfId ? HOTFIX_DEFS[hfId] : null;
      return def
        ? `<button class="sc-hotfix-btn" data-hotfix="${hfId}">${def.name}</button>`
        : `<div class="sc-hotfix-empty">HOTFIX<br>—</div>`;
    }).join("");
```

Add `import { HOTFIX_DEFS } from "../content/hotfixes";` to the imports.

Wire the hotfix button events after rendering:

```ts
  root.querySelectorAll<HTMLButtonElement>(".sc-hotfix-btn").forEach(btn => {
    const hotfixId = btn.dataset.hotfix!;
    btn.addEventListener("click", () =>
      dispatch({ type: "USE_HOTFIX", hotfixId, targetId })
    );
  });
```

Add minimal CSS for the new elements:

```css
.sc-status-pill { font-size: 8px; background: var(--color-border-low); padding: 1px 4px; border-radius: 3px; color: var(--color-text-dim); margin: 1px; display: inline-block; }
.sc-status-player { color: var(--color-accent); }
.sc-power-zone { color: var(--color-energy); font-family: var(--font-display); font-size: 10px; display: flex; gap: 6px; flex-wrap: wrap; padding: 4px; }
.sc-power-pill { background: var(--color-border-low); border: 1px solid var(--color-energy); padding: 2px 6px; border-radius: 3px; font-size: 9px; }
.sc-hotfix-btn { width: 64px; padding: 4px 2px; font-size: 8px; background: var(--color-base-deep); color: var(--color-pop); border: 1px solid var(--color-pop); border-radius: 3px; cursor: pointer; }
.sc-hotfix-empty { width: 60px; padding: 4px 2px; text-align: center; border: 1px dashed var(--color-border-low); border-radius: 3px; font-size: 9px; color: var(--color-text-dim); }
```

- [ ] **Step 2: Run `npm run build` — must pass**
- [ ] **Step 3: Run `npm test` — 89 still pass**

- [ ] **Step 4: Commit**

```bash
git add slothespire/src/ui/scene-combat.ts
git commit -m "feat(ui): status pills, power zone, hotfix buttons in combat scene"
```

---

## Task 8: Smoke test

- [ ] **Step 1: Boot dev server**

Run: `npm run dev` (background). Open http://localhost:5173.

- [ ] **Step 2: Status effects verified via unit tests**

Status effects (Customer-Facing, Pressure, Confidence, etc.) are fully covered by the reducer unit tests added in Tasks 4–5. The smoke test focuses on visual rendering and the full combat flow, not status math (which can't easily be injected via browser without dev tooling not yet built).

- [ ] **Step 3: Page Senior Engineer now grants Flow**

Start a run. If Page Senior Engineer (cost 2) is in the opening hand, play it. Verify:
- 2 cards drawn
- On the NEXT turn (after END_TURN), Energy shows 4/3 — Flow granted +1

- [ ] **Step 4: Auto-Scaling power persists**

If Auto-Scaling is available in the reward pool after winning a combat (or add it via the console state injection pattern), play it and verify the power zone appears at the top of the play area with "Auto-Scaling" listed. After clicking END_TURN, verify Headroom shows 4 briefly (from power trigger) before the next enemy attacks.

Note: Auto-Scaling is not in the starter deck — it won't appear until M4's reward screen. Smoke test via console is:

```js
// In browser devtools — temporary hack to test
```

Since M4 hasn't shipped rewards yet, the Power card and Exhaust card / Curse mechanics are best verified via the reducer unit tests (which all pass). Smoke test verifies visual rendering on load and basic combat loop; new mechanics verified by tests.

- [ ] **Step 5: Verify hotfix empty slots display**

The left pile panel should show 3 gray "HOTFIX —" slots (player starts with no hotfixes). This is visual — verify it renders.

- [ ] **Step 6: Run final test suite**

Run: `npm test`
Expected: **87 tests pass**.

- [ ] **Step 7: Update README**

Update `README.md` status:

```markdown
## Status

M3 combat depth — all 10 statuses (apply/tick/resolve), Power cards persist in play,
Exhaust pile, Curses punish when held, Hotfix system (USE_HOTFIX action, 2 hotfixes).
Page Senior Engineer gains Flow. 87 tests.
```

Commit:

```bash
git add slothespire/README.md
git commit -m "docs: update README for M3 completion"
```

---

## Done

At the end of M3:
- `npm test` passes **≥87 tests** across 6 files (53 baseline + 14 status primitives + 8 PLAY_CARD + 8 END_TURN + 4 hotfix = 87).
- `npm run build` is clean.
- All 10 statuses are implemented, apply correctly, tick at end of round, and modify burn/headroom/energy.
- Power cards stay in play and trigger each turn.
- Exhaust cards leave combat permanently.
- Curses deal self-harm each turn they sit in your hand.
- Hotfixes can be used any time during your turn.
- Page Senior Engineer correctly grants Flow (energy +1 next turn).
- Enemy intents include `buff` and `debuff` types that actually apply statuses.

**What M3 does NOT include** (deferred):
- RNG O(cursor) perf fix (still safe at M3 scale; addressed before M5 content work)
- Card upgrades via rest sites (M4, needs rest-site scene)
- Hotfixes in starting inventory (M4, needs reward system to grant them)
- Observability status wired to intent rendering (the data is there; rendering it means showing future intents in the UI — M4 polish)
- Full status tooltip text in the UI (status pills show ID only; tooltips in M4 polish)

**M4 will implement** the branching map, all node-type scenes (map, reward, shop, rest, event, treasure), and wire the engine to a navigable run flow. Plan written after M3 ships.
