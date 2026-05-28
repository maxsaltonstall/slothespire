# M5 — Content + Relics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the game with real content: 12 new unique cards (with upgrade effects), 6 new enemies routed by floor, a working shop (buy cards, remove cards), a relic system (5 Datadog-product relics with combat effects), 4 Act II events, a fixed O(1) RNG, and a balance simulation script.

**Architecture:** Four layers added to M4. (1) **Content**: 12 new `CardDef` entries, `restoreBudget` EffectSpec, `upgradedEffects` field, 6 new enemies, 4 Act II events, `src/content/relics.ts`. (2) **Engine**: RNG performance fix; `REMOVE_CARD`/`BUY_CARD`/`PICK_REWARD_RELIC` actions; relic hook dispatch in `NAVIGATE` and `END_TURN`; `shopCards?` and `rewardRelic?` in state. (3) **UI**: `scene-shop.ts` rewritten to show purchasable cards and deck removal; `scene-reward.ts` extended for relic rewards. (4) **Sim**: `scripts/sim.ts` + `npm run sim`.

**Tech Stack:** TypeScript + Vite (unchanged). Add `tsx` as dev dependency for sim script. Vitest.

**Reference spec:** `docs/superpowers/specs/2026-05-27-slothespire-design.md` §5 (content scope), §7 (educational layer — relic Codex entries are the Datadog product learning layer).

**M4 baseline:** 110 tests. 9 unique cards (3 starter + 6 others), 4 enemies, 0 working relics, shop stub.

---

## File structure (changes from M4)

```
slothespire/src/
├── content/
│   ├── cards.ts       MODIFY — add 12 new defs, restoreBudget EffectSpec, upgradedEffects field
│   ├── enemies.ts     MODIFY — add 6 new enemies + enemy pool table + rowFromNodeId helper
│   ├── events.ts      MODIFY — add 4 Act II events
│   └── relics.ts      NEW    — RelicDef, RELIC_DEFS (5 relics), generateRelicReward()
├── engine/
│   ├── rng.ts         MODIFY — O(1) cached generator
│   ├── actions.ts     MODIFY — REMOVE_CARD, BUY_CARD, PICK_REWARD_RELIC
│   ├── reducer.ts     MODIFY — PLAY_CARD upgradedEffects; NAVIGATE uses enemy pool + relic
│   │                            reward + shopCards; relic hook dispatch; new action cases
│   └── state.ts       MODIFY — shopCards?, rewardRelic? fields
└── ui/
    ├── scene-shop.ts  REWRITE — shows cards for sale + deck removal
    └── scene-reward.ts MODIFY  — relic reward display when rewardRelic is set

slothespire/scripts/
└── sim.ts             NEW    — heuristic-AI balance simulation

slothespire/tests/
├── cards.test.ts      NEW    — upgraded card effects (4 tests)
├── routing.test.ts    NEW    — enemy routing + relic hooks (8 tests)
├── shop.test.ts       NEW    — REMOVE_CARD, BUY_CARD (5 tests)
└── rng.test.ts        MODIFY — add O(1) performance/correctness tests (3 new)
```

---

## Design decisions (locked in before coding)

### New cards — 12 additions

| ID | Name | Type | Cost | Effects | Upgraded effects |
|---|---|---|---|---|---|
| `rollback` | Rollback | attack | 1 | Burn 8 | Burn 11 |
| `load_balancer` | Load Balancer | skill | 1 | +7 Headroom | +10 Headroom |
| `monitoring_alert` | Monitoring Alert | attack | 0 | Burn 4 | Burn 6 |
| `feature_flag` | Feature Flag | skill | 1 | Draw 2 | Draw 3 |
| `health_check` | Health Check | skill | 1 | +4 Headroom, Draw 1 | +5 Headroom, Draw 1 |
| `graceful_degradation` | Graceful Degradation | skill | 1 | +9 Headroom | +12 Headroom |
| `rate_limiter` | Rate Limiter | skill | 1 | Apply Throttled 2 to single enemy | Apply Throttled 3 |
| `zero_downtime_deploy` | Zero Downtime Deploy | attack | 2 | Burn 10, Apply Flow 1 to self | Burn 14, Apply Flow 1 |
| `sli_dashboard` | SLI Dashboard | skill | 2 | Draw 3, Apply Confidence 1 to self | Draw 3, Apply Confidence 1, +2 Headroom |
| `postmortem` | Blameless Postmortem | skill | 2 | Exhaust, Restore 12 Budget | Exhaust, Restore 18 Budget |
| `runbook` | Runbook | skill | 1 | Draw 2, Apply Flow 1 to self | Draw 3, Apply Flow 1 |
| `service_mesh` | Service Mesh | power | 1 | powerTrigger: +3 Headroom, Draw 1 | powerTrigger: +5 Headroom, Draw 1 |

### New `restoreBudget` EffectSpec

Add `| { kind: "restoreBudget"; amount: number }` to `EffectSpec`. The reducer applies it as:

```ts
s = { ...s, player: { ...s.player, budget: Math.min(s.player.maxBudget, s.player.budget + amount) } };
```

### `upgradedEffects?: EffectSpec[]` on CardDef

When `card.upgraded === true` AND `def.upgradedEffects` exists, PLAY_CARD uses `def.upgradedEffects` instead of `def.effects`. Same for power triggers: `upgradedPowerTrigger?: EffectSpec[]`.

### New enemies + floor routing (Act I)

| ID | Name | Stability | Intent pattern | Appears in rows |
|---|---|---|---|---|
| `phantom_read` | Phantom Read | 16 | [burn 5, debuff throttled 1] | 1–2 |
| `cron_storm` | Cron Storm | 24 | [burn 6, burn 3, burn 3] | 2–3 |
| `stale_cache` | Stale Cache | 22 | [harden 6, burn 7] | 2–3 |
| `misconfigured_tls` | Misconfigured TLS | 20 | [debuff toil 1, burn 8] | 3–4 |
| `cascading_failure` | Cascading Failure (elite) | 40 | [burn 8, buff pressure 1, burn 10, buff pressure 1] | elite |
| `total_outage` | Total Outage (Act II boss) | 80 | [burn 12, debuff customer_facing 2, burn 18, buff pressure 3] | boss |

Floor routing: `ENEMY_POOL_BY_ROW` maps `(act, rowIdx)` to an array of defIds. NAVIGATE picks one using `nextRng`.

```ts
const ENEMY_POOL: Record<string, string[]> = {
  "1-0": ["flapping_health_check"],
  "1-1": ["flapping_health_check", "phantom_read"],
  "1-2": ["phantom_read", "cron_storm", "stale_cache"],
  "1-3": ["memory_leak", "cron_storm", "misconfigured_tls"],
  "1-4": ["memory_leak", "zombie_process", "misconfigured_tls"],
  "1-elite": ["cascading_failure"],
  "2-0": ["zombie_process", "stale_cache"],
  "2-1": ["memory_leak", "misconfigured_tls"],
  "2-2": ["cron_storm", "memory_leak"],
  "2-3": ["zombie_process", "misconfigured_tls"],
  "2-4": ["memory_leak", "cron_storm"],
  "2-elite": ["cascading_failure"],
};
```

Row is parsed from node ID: `a1r3c0` → row 3. Helper: `rowFromNodeId(id: string): number`.

### New events — 4 Act II events

```ts
  { id: "on_call_handoff", title: "On-Call Handoff",
    text: "The engineer going off-call insists everything is fine. The only open incident is labeled 'investigating.' There are seven of them.",
    choices: [
      { text: "Accept the handoff cheerfully", outcome: { kind: "nothing" } },
      { text: "Spend an hour doing a proper status review", outcome: { kind: "gainCredits", amount: 40 } },
      { text: "Immediately page the departing engineer", outcome: { kind: "addCurse" } },
    ]
  },
  { id: "forgotten_cron", title: "Forgotten Cron",
    text: "A cron job that runs every 60 seconds has been consuming 40% of database CPU for six months. Nobody noticed because it never threw an error.",
    choices: [
      { text: "Disable it and see what breaks", outcome: { kind: "loseMaxBudget", amount: 5 } },
      { text: "Optimize it properly", outcome: { kind: "gainCard", rarity: "uncommon" } },
    ]
  },
  { id: "old_status_page", title: "Old Status Page",
    text: "Your status page proudly reads 'All Systems Operational.' It last updated 47 days ago. Customers are reporting a 500-second outage.",
    choices: [
      { text: "Update the status page first", outcome: { kind: "gainCredits", amount: 30 } },
      { text: "Fix the outage first, update later", outcome: { kind: "nothing" } },
    ]
  },
  { id: "refactor_time", title: "Refactor Time",
    text: "A 6,000-line service file. No tests. One author, who left the company eight months ago. It's the only thing standing between you and the boss.",
    choices: [
      { text: "Add tests before touching anything", outcome: { kind: "gainCard", rarity: "rare" } },
      { text: "Comment out the suspicious lines and ship it", outcome: { kind: "addCurse" } },
      { text: "Leave it alone", outcome: { kind: "nothing" } },
    ]
  },
```

### Relic system

**`src/content/relics.ts`:**

```ts
export interface RelicDef {
  id: string;
  name: string;         // Datadog product name
  description: string;  // effect text for UI
  flavor: string;
  onCombatStart?: (state: GameState) => GameState;
  onTurnStart?: (state: GameState) => GameState;
}
```

Five relics in M5:

| ID | Datadog Product | Effect |
|---|---|---|
| `pager` | Pager | onTurnStart: if budget ≤ 30% maxBudget, draw 1 extra card |
| `apm_tracing` | APM Tracing | onCombatStart: apply Observability 2 to player |
| `live_tail` | Live Tail | onCombatStart: draw 1 extra card |
| `watchdog` | Watchdog | onCombatStart: apply Customer-Facing 1 to enemy with highest stability |
| `synthetic_tests` | Synthetic Tests | onTurnStart: gain 1 Headroom |

Hook dispatch points:
- **`onCombatStart`**: at the end of the NAVIGATE combat/boss case (after `drawCards(fresh, 5)`)
- **`onTurnStart`**: in END_TURN Phase 9 (restore energy + draw phase), after energy restore

**Relic rewards:**
- Elite win → generates 1 relic (instead of card reward)
- Treasure NAVIGATE → generates 1 relic (instead of card reward)
- `PICK_REWARD_RELIC` action adds relic to `state.player.relics`, clears `rewardRelic`, returns to map

**State fields added:**
- `rewardRelic?: string` — relic ID offered in reward screen
- `shopCards?: Card[]` — cards currently in the shop

### RNG fix — O(1) cached generator

Module-level state in `rng.ts`:

```ts
let _cachedSeed = "";
let _cachedCursor = 0;
let _cachedGen: (() => number) | null = null;

export function nextRng(state: GameState): [number, GameState] {
  const { seed, rngCursor } = state.meta;
  // Re-initialize only when seed changes or cursor went backward (e.g., after save load)
  if (seed !== _cachedSeed || rngCursor < _cachedCursor || _cachedGen === null) {
    _cachedGen = mulberry32(parseSeed(seed));
    for (let i = 0; i < rngCursor; i++) _cachedGen();
    _cachedSeed = seed;
    _cachedCursor = rngCursor;
  }
  // Advance from cached position to current cursor if needed (e.g., after state loaded mid-run)
  while (_cachedCursor < rngCursor) {
    _cachedGen();
    _cachedCursor++;
  }
  const value = _cachedGen();
  _cachedCursor++;
  return [value, { ...state, meta: { ...state.meta, rngCursor: rngCursor + 1 } }];
}
```

This is O(1) for sequential calls; O(cursor) only on re-init (seed change or save/load). All tests must still pass.

---

## Task 1: New cards + Act II events + restoreBudget

**Files:**
- Modify: `src/content/cards.ts`
- Modify: `src/content/events.ts`

No tests for static data.

- [ ] **Step 1: Add `restoreBudget` to `EffectSpec` in `src/content/cards.ts`**

```ts
export type EffectSpec =
  | { kind: "burn"; amount: number }
  | { kind: "selfBurn"; amount: number }
  | { kind: "headroom"; amount: number }
  | { kind: "draw"; amount: number }
  | { kind: "restoreBudget"; amount: number }
  | { kind: "applyStatus"; status: StatusId; stacks: number; target: "single" | "all" | "self" };
```

- [ ] **Step 2: Add `upgradedEffects` and `upgradedPowerTrigger` fields to `CardDef`**

```ts
export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  effects: EffectSpec[];
  flavor: string;
  exhaust?: boolean;
  powerTrigger?: EffectSpec[];
  upgradedEffects?: EffectSpec[];        // ← add
  upgradedPowerTrigger?: EffectSpec[];   // ← add
  curseEffect?: EffectSpec[];
}
```

- [ ] **Step 3: Update existing cards with `upgradedEffects`**

Add `upgradedEffects` to the 5 starter + 4 existing non-starter cards:

```ts
  manual_fix:           { ..., upgradedEffects: [{ kind: "burn", amount: 9 }] },
  failover:             { ..., upgradedEffects: [{ kind: "headroom", amount: 8 }] },
  page_senior_engineer: { ..., upgradedEffects: [{ kind: "draw", amount: 3 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }] },
  canary_deploy:        { ..., upgradedEffects: [{ kind: "burn", amount: 8 }, { kind: "draw", amount: 1 }] },
  circuit_breaker:      { ..., upgradedEffects: [{ kind: "headroom", amount: 12 }] },
  chaos_engineering:    { ..., upgradedEffects: [{ kind: "applyStatus", status: "customer_facing", stacks: 5, target: "all" }, { kind: "selfBurn", amount: 5 }] },
  auto_scaling:         { ..., upgradedPowerTrigger: [{ kind: "headroom", amount: 6 }] },
  page_the_ceo:         { ..., upgradedEffects: [{ kind: "burn", amount: 40 }] },
```

- [ ] **Step 4: Add 12 new card defs to `CARD_DEFS`**

```ts
  rollback: {
    id: "rollback", name: "Rollback", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 8 }],
    upgradedEffects: [{ kind: "burn", amount: 11 }],
    flavor: "Revert to last known good. (That was three deployments ago.)",
  },
  load_balancer: {
    id: "load_balancer", name: "Load Balancer", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 7 }],
    upgradedEffects: [{ kind: "headroom", amount: 10 }],
    flavor: "Distribute the pain.",
  },
  monitoring_alert: {
    id: "monitoring_alert", name: "Monitoring Alert", type: "attack", cost: 0,
    effects: [{ kind: "burn", amount: 4 }],
    upgradedEffects: [{ kind: "burn", amount: 6 }],
    flavor: "Better late than never.",
  },
  feature_flag: {
    id: "feature_flag", name: "Feature Flag", type: "skill", cost: 1,
    effects: [{ kind: "draw", amount: 2 }],
    upgradedEffects: [{ kind: "draw", amount: 3 }],
    flavor: "Ship it. Just turn it off first.",
  },
  health_check: {
    id: "health_check", name: "Health Check", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 4 }, { kind: "draw", amount: 1 }],
    upgradedEffects: [{ kind: "headroom", amount: 5 }, { kind: "draw", amount: 1 }],
    flavor: "Are you up? Are you actually up?",
  },
  graceful_degradation: {
    id: "graceful_degradation", name: "Graceful Degradation", type: "skill", cost: 1,
    effects: [{ kind: "headroom", amount: 9 }],
    upgradedEffects: [{ kind: "headroom", amount: 12 }],
    flavor: "Do less. Survive.",
  },
  rate_limiter: {
    id: "rate_limiter", name: "Rate Limiter", type: "skill", cost: 1,
    effects: [{ kind: "applyStatus", status: "throttled", stacks: 2, target: "single" }],
    upgradedEffects: [{ kind: "applyStatus", status: "throttled", stacks: 3, target: "single" }],
    flavor: "You get 100 requests. You don't get 101.",
  },
  zero_downtime_deploy: {
    id: "zero_downtime_deploy", name: "Zero Downtime Deploy", type: "attack", cost: 2,
    effects: [{ kind: "burn", amount: 10 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "burn", amount: 14 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    flavor: "Phased rollout. No one even noticed.",
  },
  sli_dashboard: {
    id: "sli_dashboard", name: "SLI Dashboard", type: "skill", cost: 2,
    effects: [{ kind: "draw", amount: 3 }, { kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "draw", amount: 3 }, { kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }, { kind: "headroom", amount: 2 }],
    flavor: "The graph goes up. For now.",
  },
  postmortem: {
    id: "postmortem", name: "Blameless Postmortem", type: "skill", cost: 2,
    effects: [{ kind: "restoreBudget", amount: 12 }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 18 }],
    exhaust: true,
    flavor: "The system failed, not the person.",
  },
  runbook: {
    id: "runbook", name: "Runbook", type: "skill", cost: 1,
    effects: [{ kind: "draw", amount: 2 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "draw", amount: 3 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    flavor: "Step 1: Don't panic. Step 2: Follow this document.",
  },
  service_mesh: {
    id: "service_mesh", name: "Service Mesh", type: "power", cost: 1,
    effects: [],
    powerTrigger: [{ kind: "headroom", amount: 3 }, { kind: "draw", amount: 1 }],
    upgradedPowerTrigger: [{ kind: "headroom", amount: 5 }, { kind: "draw", amount: 1 }],
    flavor: "Distributed reliability, automatically.",
  },
```

- [ ] **Step 5: Add 4 Act II events to `src/content/events.ts`**

Append to the `EVENTS` array:

```ts
  {
    id: "on_call_handoff",
    title: "On-Call Handoff",
    text: "The engineer going off-call insists everything is fine. The only open incident is labeled 'investigating.' There are seven of them.",
    choices: [
      { text: "Accept the handoff cheerfully", outcome: { kind: "nothing" } },
      { text: "Spend an hour doing a proper status review", outcome: { kind: "gainCredits", amount: 40 } },
      { text: "Immediately page the departing engineer back", outcome: { kind: "addCurse" } },
    ],
  },
  {
    id: "forgotten_cron",
    title: "Forgotten Cron",
    text: "A cron job running every 60 seconds has been consuming 40% of database CPU for six months. Nobody noticed because it never threw an error.",
    choices: [
      { text: "Disable it and see what breaks", outcome: { kind: "loseMaxBudget", amount: 5 } },
      { text: "Optimize it properly", outcome: { kind: "gainCard", rarity: "uncommon" } },
    ],
  },
  {
    id: "old_status_page",
    title: "Old Status Page",
    text: "Your status page reads 'All Systems Operational.' It last updated 47 days ago. Customers are reporting a five-hundred-second outage.",
    choices: [
      { text: "Update the status page first", outcome: { kind: "gainCredits", amount: 30 } },
      { text: "Fix the outage first", outcome: { kind: "nothing" } },
    ],
  },
  {
    id: "refactor_time",
    title: "Refactor Time",
    text: "A 6,000-line service file. No tests. One author, who left eight months ago. It's the only thing standing between you and the boss.",
    choices: [
      { text: "Add tests before touching anything", outcome: { kind: "gainCard", rarity: "rare" } },
      { text: "Comment out the suspicious lines and ship it", outcome: { kind: "addCurse" } },
      { text: "Leave it alone", outcome: { kind: "nothing" } },
    ],
  },
```

- [ ] **Step 6: Run `npm run build` — must pass**

- [ ] **Step 7: Commit**

```bash
git add slothespire/src/content/cards.ts slothespire/src/content/events.ts
git commit -m "feat(content): 12 new cards with upgrade effects, restoreBudget EffectSpec, 4 Act II events"
```

---

## Task 2: Card upgrade values + PLAY_CARD uses `upgradedEffects` — TDD

**Files:**
- Modify: `src/engine/reducer.ts`
- Test: `tests/cards.test.ts`

- [ ] **Step 1: Write failing tests — create `tests/cards.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";
import { makeCard } from "../src/content/cards";

function inCombat() {
  const s0 = reduce(initialState("upgrade-test"), { type: "START_RUN" });
  // Navigate to first combat
  const node = s0.map.nodes[0][0];
  return reduce(s0, { type: "NAVIGATE", nodeId: node.id });
}

describe("upgraded card effects", () => {
  it("unupgraded Manual Fix deals 6 Burn", () => {
    let s = inCombat();
    const enemy = s.combat!.enemies[0];
    const card = s.player.hand.find(c => c.defId === "manual_fix")!;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: enemy.instanceId });
    expect(s2.combat!.enemies[0].stability).toBe(enemy.stability - 6);
  });

  it("upgraded Manual Fix deals 9 Burn (uses upgradedEffects)", () => {
    let s = inCombat();
    const enemy = s.combat!.enemies[0];
    // Manually upgrade a card in hand
    const card = s.player.hand.find(c => c.defId === "manual_fix")!;
    const upgradedCard = { ...card, upgraded: true };
    s = { ...s, player: { ...s.player, hand: s.player.hand.map(c => c.instanceId === card.instanceId ? upgradedCard : c) } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: enemy.instanceId });
    expect(s2.combat!.enemies[0].stability).toBe(enemy.stability - 9);
  });

  it("restoreBudget EffectSpec increases budget (Blameless Postmortem)", () => {
    let s = inCombat();
    s = { ...s, player: { ...s.player, budget: 40, hand: [...s.player.hand, makeCard("postmortem")], energy: 3 } };
    const card = s.player.hand.find(c => c.defId === "postmortem")!;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: null });
    expect(s2.player.budget).toBe(52); // 40 + 12
    expect(s2.player.exhaust.map(c => c.defId)).toContain("postmortem"); // exhaust = true
  });

  it("upgraded Blameless Postmortem restores 18 budget", () => {
    let s = inCombat();
    const baseCard = makeCard("postmortem");
    const upgCard = { ...baseCard, upgraded: true };
    s = { ...s, player: { ...s.player, budget: 40, hand: [...s.player.hand, upgCard], energy: 3 } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: baseCard.instanceId, targetId: null });
    expect(s2.player.budget).toBe(58); // 40 + 18
  });
});
```

- [ ] **Step 2: Run `npm test` — new tests FAIL**

- [ ] **Step 3: Update `PLAY_CARD` in `src/engine/reducer.ts` to use `upgradedEffects`**

In the PLAY_CARD case, change the effect selection from `def.effects` to:
```ts
      const effects = (card.upgraded && def.upgradedEffects) ? def.upgradedEffects : def.effects;
      for (const effect of effects) {
```

Also add handling for `restoreBudget` in the effect loop:
```ts
        } else if (effect.kind === "restoreBudget") {
          s = { ...s, player: { ...s.player, budget: Math.min(s.player.maxBudget, s.player.budget + effect.amount) } };
```

Also update power triggers to use `upgradedPowerTrigger` in the END_TURN power trigger loop:
```ts
      for (const powerCard of activePowers) {
        const def = CARD_DEFS[powerCard.defId];
        const triggerEffects = (powerCard.upgraded && def?.upgradedPowerTrigger) ? def.upgradedPowerTrigger : def?.powerTrigger ?? [];
        for (const effect of triggerEffects) {
```

- [ ] **Step 4: Run `npm test` — expect **110 + 4 = 114 pass****

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/reducer.ts slothespire/tests/cards.test.ts
git commit -m "feat(engine): upgradedEffects in PLAY_CARD, restoreBudget EffectSpec"
```

---

## Task 3: New enemies + floor-based routing — TDD

**Files:**
- Modify: `src/content/enemies.ts`
- Test: `tests/routing.test.ts`

- [ ] **Step 1: Add 6 new enemies + routing table to `src/content/enemies.ts`**

Add to `ENEMY_DEFS`:

```ts
  phantom_read: {
    id: "phantom_read", name: "Phantom Read", stability: 16,
    intentPattern: [
      { kind: "burn" as const, amount: 5 },
      { kind: "debuff" as const, status: "throttled" as const, stacks: 1 },
    ],
  },
  cron_storm: {
    id: "cron_storm", name: "Cron Storm", stability: 24,
    intentPattern: [
      { kind: "burn" as const, amount: 6 },
      { kind: "burn" as const, amount: 3 },
      { kind: "burn" as const, amount: 3 },
    ],
  },
  stale_cache: {
    id: "stale_cache", name: "Stale Cache", stability: 22,
    intentPattern: [
      { kind: "harden" as const, amount: 6 },
      { kind: "burn" as const, amount: 7 },
    ],
  },
  misconfigured_tls: {
    id: "misconfigured_tls", name: "Misconfigured TLS", stability: 20,
    intentPattern: [
      { kind: "debuff" as const, status: "toil" as const, stacks: 1 },
      { kind: "burn" as const, amount: 8 },
    ],
  },
  cascading_failure: {
    id: "cascading_failure", name: "Cascading Failure", stability: 40,
    intentPattern: [
      { kind: "burn" as const, amount: 8 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 1 },
      { kind: "burn" as const, amount: 10 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 1 },
    ],
  },
  total_outage: {
    id: "total_outage", name: "Total Outage", stability: 80,
    intentPattern: [
      { kind: "burn" as const, amount: 12 },
      { kind: "debuff" as const, status: "customer_facing" as const, stacks: 2 },
      { kind: "burn" as const, amount: 18 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 3 },
    ],
  },
```

Add the routing table and helper (after `ENEMY_DEFS`):

```ts
const ENEMY_POOL: Record<string, string[]> = {
  "1-0": ["flapping_health_check"],
  "1-1": ["flapping_health_check", "phantom_read"],
  "1-2": ["phantom_read", "cron_storm", "stale_cache"],
  "1-3": ["memory_leak", "cron_storm", "misconfigured_tls"],
  "1-4": ["memory_leak", "zombie_process", "misconfigured_tls"],
  "1-elite": ["cascading_failure"],
  "1-boss": ["the_pager_storm"],
  "2-0": ["zombie_process", "stale_cache"],
  "2-1": ["memory_leak", "misconfigured_tls"],
  "2-2": ["cron_storm", "memory_leak"],
  "2-3": ["zombie_process", "misconfigured_tls"],
  "2-4": ["memory_leak", "cron_storm"],
  "2-elite": ["cascading_failure"],
  "2-boss": ["total_outage"],
};

export function rowFromNodeId(nodeId: string): number {
  const match = /r(\d+)c/.exec(nodeId);
  return match ? parseInt(match[1]) : 0;
}

export function pickEnemyForNode(
  nodeType: "combat" | "elite" | "boss",
  nodeId: string,
  act: 1 | 2,
  rand: number
): string {
  const row = rowFromNodeId(nodeId);
  const key = nodeType === "combat" ? `${act}-${row}` :
               nodeType === "elite" ? `${act}-elite` : `${act}-boss`;
  const pool = ENEMY_POOL[key] ?? ["flapping_health_check"];
  return pool[Math.floor(rand * pool.length)];
}
```

- [ ] **Step 2: Write failing tests — create `tests/routing.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { rowFromNodeId, pickEnemyForNode } from "../src/content/enemies";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

describe("rowFromNodeId", () => {
  it("extracts row index from node ID format a1r3c0", () => {
    expect(rowFromNodeId("a1r3c0")).toBe(3);
    expect(rowFromNodeId("a2r0c1")).toBe(0);
    expect(rowFromNodeId("a1r6c0")).toBe(6);
  });
});

describe("pickEnemyForNode", () => {
  it("row 0 combat in act 1 always gives flapping_health_check", () => {
    expect(pickEnemyForNode("combat", "a1r0c0", 1, 0.5)).toBe("flapping_health_check");
  });

  it("elite in act 1 always gives cascading_failure", () => {
    expect(pickEnemyForNode("elite", "a1r3c0", 1, 0.5)).toBe("cascading_failure");
  });

  it("boss in act 2 gives total_outage", () => {
    expect(pickEnemyForNode("boss", "a2r6c0", 2, 0.5)).toBe("total_outage");
  });
});

describe("NAVIGATE enemy routing", () => {
  it("combat node in row 3+ encounters a harder enemy than row 0", () => {
    const s0 = reduce(initialState("routing-test"), { type: "START_RUN" });
    // Navigate to a row 3 combat node if one exists
    const row3Nodes = s0.map.nodes[3]?.filter(n => n.type === "combat") ?? [];
    if (row3Nodes.length === 0) return; // seed may not have row-3 combat
    const s1 = reduce(s0, { type: "NAVIGATE", nodeId: row3Nodes[0].id });
    expect(s1.scene).toBe("combat");
    // Row 3 enemies are harder: memory_leak (28), cron_storm (24), etc.
    expect(s1.combat!.enemies[0].maxStability).toBeGreaterThan(20);
  });
});
```

- [ ] **Step 3: Run `npm test` — FAIL (pickEnemyForNode not yet used in reducer)**

- [ ] **Step 4: Update NAVIGATE in `src/engine/reducer.ts` to use `pickEnemyForNode`**

Add import:
```ts
import { createEnemy, getIntent, pickEnemyForNode } from "../content/enemies";
```

In the NAVIGATE `combat` and `elite` cases, replace `createEnemy("flapping_health_check")` with:
```ts
          const [rand, afterRand] = nextRng(s);
          s = afterRand;
          const enemyDefId = pickEnemyForNode(node.type === "elite" ? "elite" : "combat", nodeId, s.map.act, rand);
          const enemy = createEnemy(enemyDefId);
```

In the NAVIGATE `boss` case, replace `createEnemy("the_pager_storm")` with:
```ts
          const bossDefId = pickEnemyForNode("boss", nodeId, s.map.act, 0.5);
          const boss = createEnemy(bossDefId);
```

(Boss is deterministic — always the act's boss, no RNG needed.)

- [ ] **Step 5: Run `npm test` — expect **114 + 7 = 121 pass** (3 rowFromNodeId + 3 pickEnemyForNode + 1 routing = 7 new)**

- [ ] **Step 6: Commit**

```bash
git add slothespire/src/content/enemies.ts slothespire/tests/routing.test.ts \
        slothespire/src/engine/reducer.ts
git commit -m "feat(content): 6 new enemies + floor routing by act/row"
```

---

## Task 4: RNG performance fix — O(1) cached generator

**Files:**
- Modify: `src/engine/rng.ts`
- Modify: `tests/rng.test.ts`

- [ ] **Step 1: Append 3 new tests to `tests/rng.test.ts`**

```ts
describe("nextRng O(1) caching", () => {
  it("produces the same value for the same seed+cursor regardless of call path", () => {
    const s0 = initialState("cache-test");
    const [v1] = nextRng(s0);                          // cold call (cursor=0)
    const [, s1] = nextRng(s0);                        // cursor advances to 1
    const [v2] = nextRng(s0);                          // same starting cursor=0 again
    expect(v1).toBe(v2);                               // deterministic
  });

  it("advancing cursor produces different values", () => {
    const s0 = initialState("adv-test");
    const [v1, s1] = nextRng(s0);
    const [v2] = nextRng(s1);
    expect(v1).not.toBe(v2);
  });

  it("re-initializes cleanly when seed changes (no stale cache bleed)", () => {
    const sa = initialState("seed-x");
    const sb = initialState("seed-y");
    const [va] = nextRng(sa);
    const [vb] = nextRng(sb);
    // Force another call with sa to verify it re-initializes correctly
    const [va2] = nextRng(sa);
    expect(va).toBe(va2);   // same seed+cursor → same value even after sb used the cache
    expect(va).not.toBe(vb);
  });
});
```

- [ ] **Step 2: Run `npm test` — tests PASS (current nextRng is correct but slow; tests verify correctness)**

- [ ] **Step 3: Replace `nextRng` in `src/engine/rng.ts` with the cached implementation**

Remove the current `nextRng` function and replace with:

```ts
// Module-level cached generator — O(1) for sequential calls
let _cachedSeed = "";
let _cachedCursor = 0;
let _cachedGen: (() => number) | null = null;

export function nextRng(state: GameState): [number, GameState] {
  const { seed, rngCursor } = state.meta;
  // Re-initialize if seed changed, cursor regressed, or generator never set
  if (seed !== _cachedSeed || rngCursor < _cachedCursor || _cachedGen === null) {
    _cachedGen = mulberry32(parseSeed(seed));
    for (let i = 0; i < rngCursor; i++) _cachedGen();
    _cachedSeed = seed;
    _cachedCursor = rngCursor;
  }
  // Advance from cached position if state cursor is ahead (e.g., after save/load gap)
  while (_cachedCursor < rngCursor) {
    _cachedGen();
    _cachedCursor++;
  }
  const value = _cachedGen();
  _cachedCursor++;
  return [value, { ...state, meta: { ...state.meta, rngCursor: rngCursor + 1 } }];
}
```

- [ ] **Step 4: Run `npm test` — all tests including the 3 new must pass**

Expected: **121 + 3 = 124 pass**.

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/rng.ts slothespire/tests/rng.test.ts
git commit -m "perf(engine): O(1) cached RNG generator — sequential calls no longer replay from cursor 0"
```

---

## Task 5: Shop — REMOVE_CARD + BUY_CARD

**Files:**
- Modify: `src/engine/state.ts`
- Modify: `src/engine/actions.ts`
- Modify: `src/engine/reducer.ts`
- Modify: `src/ui/scene-shop.ts`
- Test: `tests/shop.test.ts`

- [ ] **Step 1: Add `shopCards` to `GameState`**

In `src/engine/state.ts`, add to the interface:
```ts
  shopCards?: Card[];
```

- [ ] **Step 2: Add actions to `src/engine/actions.ts`**

Add to the Action union:
```ts
  | { type: "REMOVE_CARD"; cardInstanceId: string }
  | { type: "BUY_CARD"; cardInstanceId: string }
```

- [ ] **Step 3: Write failing tests — create `tests/shop.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

function atShop() {
  let s = reduce(initialState("shop-test"), { type: "START_RUN" });
  const shopNode = s.map.nodes.flat().find(n => n.type === "shop");
  if (!shopNode) throw new Error("No shop node for seed shop-test — try a different seed");
  return reduce(s, { type: "NAVIGATE", nodeId: shopNode.id });
}

describe("NAVIGATE to shop", () => {
  it("generates 3 shop cards in state.shopCards", () => {
    const s = atShop();
    expect(s.shopCards?.length).toBe(3);
    expect(s.scene).toBe("shop");
  });
});

describe("REMOVE_CARD", () => {
  it("removes the chosen card from deck and costs 75 credits", () => {
    let s = atShop();
    s = { ...s, credits: 100 };
    const card = s.deck[0];
    const s2 = reduce(s, { type: "REMOVE_CARD", cardInstanceId: card.instanceId });
    expect(s2.deck.map(c => c.instanceId)).not.toContain(card.instanceId);
    expect(s2.credits).toBe(25); // 100 - 75
  });

  it("no-op if not enough credits", () => {
    let s = atShop();
    s = { ...s, credits: 50 };
    const card = s.deck[0];
    const s2 = reduce(s, { type: "REMOVE_CARD", cardInstanceId: card.instanceId });
    expect(s2).toBe(s); // unchanged
  });
});

describe("BUY_CARD", () => {
  it("adds bought card to deck and deducts price from credits", () => {
    let s = atShop();
    if (!s.shopCards || s.shopCards.length === 0) return;
    s = { ...s, credits: 200 };
    const card = s.shopCards[0];
    const deckBefore = s.deck.length;
    const s2 = reduce(s, { type: "BUY_CARD", cardInstanceId: card.instanceId });
    expect(s2.deck.length).toBe(deckBefore + 1);
    expect(s2.shopCards?.map(c => c.instanceId)).not.toContain(card.instanceId);
    expect(s2.credits).toBeLessThan(200);
  });

  it("no-op if not enough credits", () => {
    let s = atShop();
    if (!s.shopCards || s.shopCards.length === 0) return;
    s = { ...s, credits: 0 };
    const card = s.shopCards[0];
    const s2 = reduce(s, { type: "BUY_CARD", cardInstanceId: card.instanceId });
    expect(s2).toBe(s);
  });
});
```

Note: the `atShop()` helper navigates to a shop node — if seed "shop-test" doesn't have a shop in the map, these tests will throw. Prefer a seed that generates a shop node. If needed, change to "shop-test-2" or build the shop state manually.

Alternative: build the shop state directly without navigating:
```ts
function atShop() {
  let s = reduce(initialState("shop-test"), { type: "START_RUN" });
  // Manually set scene and shopCards to test shop logic without navigation
  const { makeCard } = require("../src/content/cards");
  return {
    ...s,
    scene: "shop" as const,
    shopCards: [makeCard("rollback"), makeCard("circuit_breaker"), makeCard("load_balancer")],
    credits: 150,
  };
}
```

Use this alternative approach to avoid the seed dependency.

- [ ] **Step 4: Run `npm test` — new tests FAIL**

- [ ] **Step 5: Add NAVIGATE→shop generates shopCards + REMOVE_CARD + BUY_CARD to `src/engine/reducer.ts`**

Card prices (add to rewards.ts or inline):
```ts
const CARD_PRICES: Record<string, number> = {
  common: 90,
  uncommon: 120,
  rare: 150,
};
// Default price for unclassified cards
const DEFAULT_CARD_PRICE = 90;
```

In NAVIGATE `shop` case, generate shopCards:
```ts
        case "shop": {
          const [shopOffered, afterShop] = generateCardReward(s, 3);
          s = afterShop;
          return { ...s, scene: "shop", shopCards: shopOffered };
        }
```

Add REMOVE_CARD case:
```ts
    case "REMOVE_CARD": {
      const { cardInstanceId } = action;
      if (state.credits < 75) return state;
      const idx = state.deck.findIndex(c => c.instanceId === cardInstanceId);
      if (idx === -1) return state;
      return {
        ...state,
        credits: state.credits - 75,
        deck: [...state.deck.slice(0, idx), ...state.deck.slice(idx + 1)],
      };
    }
```

Add BUY_CARD case (card price = 90 for all cards in M5 — tiered pricing in M6):
```ts
    case "BUY_CARD": {
      const { cardInstanceId } = action;
      const card = (state.shopCards ?? []).find(c => c.instanceId === cardInstanceId);
      if (!card) return state;
      const price = 90; // flat price in M5; tiered pricing in M6
      if (state.credits < price) return state;
      return {
        ...state,
        credits: state.credits - price,
        deck: [...state.deck, card],
        shopCards: (state.shopCards ?? []).filter(c => c.instanceId !== cardInstanceId),
      };
    }
```

- [ ] **Step 6: Rewrite `src/ui/scene-shop.ts` to show cards for sale + deck removal**

```ts
import type { GameState, Card } from "../engine/state";
import type { Action } from "../engine/actions";
import { CARD_DEFS } from "../content/cards";

function cardEntry(card: Card, label: string, btnClass: string, btnText: string, dataAttr: string): string {
  const def = CARD_DEFS[card.defId];
  return `
    <div class="shop-card-entry">
      <div class="sce-cost">${card.cost < 0 ? "!" : card.cost}${card.upgraded ? "+" : ""}</div>
      <div class="sce-name">${card.name}</div>
      <div class="sce-type">${card.type}</div>
      <button class="${btnClass}" data-id="${card.instanceId}" ${dataAttr}>${btnText}</button>
    </div>
  `;
}

export function renderShop(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-shop";
  const shopCards = state.shopCards ?? [];
  const PRICE = 90;
  const REMOVE_COST = 75;

  const forSaleHtml = shopCards.map(card =>
    cardEntry(card, "FOR SALE", "buy-btn",
      `BUY (${PRICE}¢)`,
      state.credits < PRICE ? "disabled" : "")
  ).join("");

  const deckHtml = state.deck.map(card =>
    cardEntry(card, "DECK", "remove-btn",
      `Remove (${REMOVE_COST}¢)`,
      state.credits < REMOVE_COST ? "disabled" : "")
  ).join("");

  root.innerHTML = `
    <style>
      .scene-shop { flex: 1; display: flex; flex-direction: column; padding: 24px; gap: 20px; }
      .scene-shop h2 { font-family: var(--font-display); font-size: 22px; color: var(--color-accent);
        letter-spacing: 3px; margin: 0; }
      .shop-credits { font-family: var(--font-display); font-size: 14px; color: var(--color-energy); }
      .shop-section-title { font-family: var(--font-display); font-size: 11px;
        color: var(--color-text-dim); letter-spacing: 1px; border-bottom: 1px solid var(--color-border-low); padding-bottom: 4px; }
      .shop-cards-grid { display: flex; flex-wrap: wrap; gap: 8px; }
      .shop-card-entry {
        display: flex; align-items: center; gap: 8px; padding: 6px 10px;
        background: var(--color-base-deep); border: 1px solid var(--color-border-low); border-radius: 4px;
        font-family: var(--font-display); font-size: 11px;
      }
      .sce-cost { width: 20px; text-align: center; color: var(--color-pop); }
      .sce-name { flex: 1; color: var(--color-accent); }
      .sce-type { font-size: 9px; color: var(--color-text-dim); text-transform: uppercase; }
      .buy-btn, .remove-btn {
        padding: 4px 8px; border: 1px solid var(--color-accent); background: transparent;
        color: var(--color-accent); font-family: var(--font-display); font-size: 9px;
        cursor: pointer; letter-spacing: 0.5px;
      }
      .buy-btn:hover:not([disabled]) { background: var(--color-accent); color: var(--color-base); }
      .remove-btn { border-color: var(--color-danger); color: var(--color-danger); }
      .remove-btn:hover:not([disabled]) { background: var(--color-danger); color: white; }
      button[disabled] { opacity: 0.4; cursor: default; }
      .shop-leave { font-family: var(--font-display); font-size: 12px; letter-spacing: 1px; width: 140px; }
    </style>
    <h2>// BUILD SERVER</h2>
    <div class="shop-credits">CREDITS: ${state.credits}</div>
    <div class="shop-section-title">CARDS FOR SALE</div>
    <div class="shop-cards-grid">${forSaleHtml || "<span style='opacity:0.4;font-size:11px'>No cards in stock</span>"}</div>
    <div class="shop-section-title">YOUR DECK — Remove a Card (${REMOVE_COST}¢)</div>
    <div class="shop-cards-grid">${deckHtml}</div>
    <button class="shop-leave" id="leave-shop">LEAVE SHOP</button>
  `;

  root.querySelectorAll<HTMLButtonElement>(".buy-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => dispatch({ type: "BUY_CARD", cardInstanceId: btn.dataset.id! }));
  });

  root.querySelectorAll<HTMLButtonElement>(".remove-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => dispatch({ type: "REMOVE_CARD", cardInstanceId: btn.dataset.id! }));
  });

  root.querySelector<HTMLButtonElement>("#leave-shop")!
    .addEventListener("click", () => dispatch({ type: "GO_TO_MAP" }));

  return root;
}
```

- [ ] **Step 7: Run `npm test` — expect **124 + 5 = 129 pass****

- [ ] **Step 8: Commit**

```bash
git add slothespire/src/engine/state.ts slothespire/src/engine/actions.ts \
        slothespire/src/engine/reducer.ts slothespire/src/ui/scene-shop.ts \
        slothespire/tests/shop.test.ts
git commit -m "feat: working shop — BUY_CARD, REMOVE_CARD, shopCards state, scene rewrite"
```

---

## Task 6: Relic system

**Files:**
- Create: `src/content/relics.ts`
- Modify: `src/engine/state.ts`
- Modify: `src/engine/actions.ts`
- Modify: `src/engine/reducer.ts`
- Modify: `src/ui/scene-reward.ts`
- Test: `tests/routing.test.ts` (append)

- [ ] **Step 1: Create `src/content/relics.ts`**

```ts
import type { GameState } from "../engine/state";
import { applyStatus, addHeadroom, drawCards } from "../engine/effects";

export interface RelicDef {
  id: string;
  name: string;
  product: string;
  description: string;
  flavor: string;
  onCombatStart?: (state: GameState) => GameState;
  onTurnStart?: (state: GameState) => GameState;
}

export const RELIC_DEFS: Record<string, RelicDef> = {
  pager: {
    id: "pager", name: "Pager", product: "On-Call",
    description: "At start of your turn, if SLO Budget ≤ 30%, draw 1 extra card.",
    flavor: "It never rings at a convenient time.",
    onTurnStart: (s) =>
      s.player.budget <= Math.floor(s.player.maxBudget * 0.3)
        ? drawCards(s, 1)
        : s,
  },
  apm_tracing: {
    id: "apm_tracing", name: "APM Tracing", product: "Datadog APM",
    description: "At start of combat, gain Observability 2 (see 2 extra turns of enemy intent).",
    flavor: "Every span tells a story.",
    onCombatStart: (s) => applyStatus(s, "player", "observability", 2),
  },
  live_tail: {
    id: "live_tail", name: "Live Tail", product: "Datadog Live Tail",
    description: "At start of combat, draw 1 extra card.",
    flavor: "Real-time insight. No waiting.",
    onCombatStart: (s) => drawCards(s, 1),
  },
  watchdog: {
    id: "watchdog", name: "Watchdog", product: "Datadog Watchdog",
    description: "At start of combat, apply Customer-Facing 1 to the enemy with the highest stability.",
    flavor: "It finds the anomaly before you do.",
    onCombatStart: (s) => {
      if (!s.combat || s.combat.enemies.length === 0) return s;
      const hardest = s.combat.enemies.reduce((a, b) => a.stability >= b.stability ? a : b);
      return applyStatus(s, hardest.instanceId, "customer_facing", 1);
    },
  },
  synthetic_tests: {
    id: "synthetic_tests", name: "Synthetic Tests", product: "Datadog Synthetic Monitoring",
    description: "At start of your turn, gain 1 Headroom.",
    flavor: "Continuous verification. Always on.",
    onTurnStart: (s) => addHeadroom(s, 1),
  },
};

export const RELIC_POOL = Object.keys(RELIC_DEFS).filter(id => id !== "pager");

let _nextRelicIdx = 0;

export function generateRelicReward(state: import("../engine/state").GameState): [string, import("../engine/state").GameState] {
  const { nextRng } = require("../engine/rng") as { nextRng: typeof import("../engine/rng").nextRng };
  const available = RELIC_POOL.filter(id => !state.player.relics.includes(id));
  if (available.length === 0) return [RELIC_POOL[0], state];
  const [rand, newState] = nextRng(state);
  const relicId = available[Math.floor(rand * available.length)];
  return [relicId, newState];
}
```

Note: avoid circular imports — `relics.ts` imports from `effects.ts` which is fine (no cycle). The `require` in `generateRelicReward` can be replaced with a static import since there's no cycle.

Replace the `require` in `generateRelicReward` with a proper static import at the top of relics.ts:
```ts
import { nextRng } from "../engine/rng";
```

And simplify `generateRelicReward`:
```ts
export function generateRelicReward(state: GameState): [string, GameState] {
  const available = RELIC_POOL.filter(id => !state.player.relics.includes(id));
  if (available.length === 0) return [RELIC_POOL[0], state];
  const [rand, newState] = nextRng(state);
  return [available[Math.floor(rand * available.length)], newState];
}
```

- [ ] **Step 2: Add `rewardRelic?: string` to `GameState`**

In `src/engine/state.ts`, add:
```ts
  rewardRelic?: string;
```

- [ ] **Step 3: Add `PICK_REWARD_RELIC` to actions.ts**

```ts
  | { type: "PICK_REWARD_RELIC" }   // accepts the offered relic (no selection needed — just one)
```

- [ ] **Step 4: Write failing tests — append to `tests/routing.test.ts`**

```ts
import { applyStatus } from "../src/engine/effects";
import { RELIC_DEFS } from "../src/content/relics";

describe("relic hooks", () => {
  it("APM Tracing onCombatStart grants Observability 2 to player", () => {
    let s = reduce(initialState("relic-test"), { type: "START_RUN" });
    s = { ...s, player: { ...s.player, relics: ["apm_tracing"] } };
    const node = s.map.nodes[0][0];
    const s2 = reduce(s, { type: "NAVIGATE", nodeId: node.id });
    expect(s2.player.statuses.observability).toBe(2);
  });

  it("Synthetic Tests onTurnStart grants 1 Headroom each turn", () => {
    let s = reduce(initialState("relic-turn"), { type: "START_RUN" });
    s = { ...s, player: { ...s.player, relics: ["synthetic_tests"] } };
    const node = s.map.nodes[0][0];
    s = reduce(s, { type: "NAVIGATE", nodeId: node.id });
    // Set up burn-0 intent to test headroom cleanly
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s2 = reduce(s, { type: "END_TURN" });
    // After end turn: headroom resets to 0 after enemy, then relic fires onTurnStart → 1 headroom
    expect(s2.player.headroom).toBe(1);
  });

  it("Watchdog onCombatStart applies Customer-Facing 1 to highest stability enemy", () => {
    let s = reduce(initialState("watchdog-test"), { type: "START_RUN" });
    s = { ...s, player: { ...s.player, relics: ["watchdog"] } };
    const node = s.map.nodes[0][0];
    const s2 = reduce(s, { type: "NAVIGATE", nodeId: node.id });
    const enemy = s2.combat!.enemies[0];
    expect(enemy.statuses.customer_facing).toBe(1);
  });

  it("PICK_REWARD_RELIC adds relic to player.relics and returns to map", () => {
    let s = reduce(initialState("pick-relic"), { type: "START_RUN" });
    s = { ...s, scene: "reward", rewardRelic: "live_tail", rewardCards: undefined };
    const s2 = reduce(s, { type: "PICK_REWARD_RELIC" });
    expect(s2.player.relics).toContain("live_tail");
    expect(s2.scene).toBe("map");
    expect(s2.rewardRelic).toBeUndefined();
  });
});
```

- [ ] **Step 5: Run `npm test` — FAIL**

- [ ] **Step 6: Update `src/engine/reducer.ts` — dispatch relic hooks + handle new actions**

Add import:
```ts
import { RELIC_DEFS, generateRelicReward } from "../content/relics";
```

**In NAVIGATE combat/boss cases**, after `drawCards(fresh, 5)`, fire `onCombatStart` hooks:

```ts
          fresh = drawCards(fresh, 5);
          // Fire onCombatStart relic hooks
          for (const relicId of fresh.player.relics) {
            const relic = RELIC_DEFS[relicId];
            if (relic?.onCombatStart) fresh = relic.onCombatStart(fresh);
          }
          return { ...fresh, scene: "combat", combat: { ... } };
```

**In END_TURN Phase 9** (after energy restore, before drawing), fire `onTurnStart` hooks:

```ts
          // Phase 9.5: onTurnStart relic hooks (after energy, before draw)
          for (const relicId of s.player.relics) {
            const relic = RELIC_DEFS[relicId];
            if (relic?.onTurnStart) s = relic.onTurnStart(s);
          }
```

**Change elite/treasure combat wins to give a relic:**

In the non-boss combat win check (PLAY_CARD and USE_HOTFIX), update the elite branch:
```ts
        if (currentNode?.type === "elite") {
          // Elite win: relic reward
          const [relicId, afterRelic] = generateRelicReward(s);
          return { ...afterRelic, scene: "reward", combat: undefined, rewardRelic: relicId, rewardCards: undefined, credits: s.credits + ELITE_CREDITS };
        }
        // Standard combat win: card reward
        const [rewardCards, afterReward] = generateCardReward(s);
        return { ...afterReward, scene: "reward", combat: undefined, rewardCards, rewardRelic: undefined, credits: s.credits + COMBAT_CREDITS };
```

In NAVIGATE `treasure`:
```ts
        case "treasure": {
          const [relicId, afterRelic] = generateRelicReward(s);
          s = afterRelic;
          return { ...s, scene: "reward", rewardRelic: relicId, rewardCards: undefined, credits: s.credits + TREASURE_CREDITS };
        }
```

**Add `PICK_REWARD_RELIC` case:**
```ts
    case "PICK_REWARD_RELIC": {
      const relicId = state.rewardRelic;
      if (!relicId) return { ...state, scene: "map" };
      return {
        ...state,
        scene: "map",
        player: { ...state.player, relics: [...state.player.relics, relicId] },
        rewardRelic: undefined,
      };
    }
```

- [ ] **Step 7: Update `src/ui/scene-reward.ts` to display relic reward**

Add a branch at the top of `renderReward` that shows the relic if `state.rewardRelic` is set:

```ts
  // Relic reward mode
  if (state.rewardRelic) {
    const { RELIC_DEFS } = require("../content/relics"); // avoid importing at top due to potential cycle
```

Actually, import statically:
```ts
import { RELIC_DEFS } from "../content/relics";
```

And add the relic mode to `renderReward`:

```ts
  if (state.rewardRelic) {
    const relic = RELIC_DEFS[state.rewardRelic];
    root.innerHTML = `
      <style>
        .scene-reward { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
        .relic-box { padding: 28px 40px; background: var(--color-base-deep); border: 1px solid var(--color-energy); border-radius: 8px; text-align: center; box-shadow: 0 0 20px rgba(255,211,77,0.3); max-width: 400px; }
        .relic-icon { font-size: 48px; margin-bottom: 12px; }
        .relic-name { font-family: var(--font-display); font-size: 18px; color: var(--color-energy); margin-bottom: 4px; }
        .relic-product { font-size: 11px; color: var(--color-text-dim); font-family: var(--font-display); margin-bottom: 12px; }
        .relic-desc { font-size: 12px; line-height: 1.6; }
        .relic-flavor { font-size: 10px; font-style: italic; opacity: 0.6; margin-top: 10px; }
      </style>
      <h2 style="font-family:var(--font-display);color:var(--color-energy);letter-spacing:3px;">RELIC FOUND</h2>
      <div class="relic-box">
        <div class="relic-icon">✦</div>
        <div class="relic-name">${relic?.name ?? state.rewardRelic}</div>
        <div class="relic-product">${relic?.product ?? ""}</div>
        <div class="relic-desc">${relic?.description ?? ""}</div>
        <div class="relic-flavor">"${relic?.flavor ?? ""}"</div>
      </div>
      <button id="accept-relic" style="font-family:var(--font-display);font-size:13px;letter-spacing:1px;" class="primary">ACCEPT RELIC</button>
    `;
    root.querySelector<HTMLButtonElement>("#accept-relic")!
      .addEventListener("click", () => dispatch({ type: "PICK_REWARD_RELIC" }));
    return root;
  }
```

- [ ] **Step 8: Run `npm test` — expect **129 + 4 = 133 pass****

- [ ] **Step 9: Commit**

```bash
git add slothespire/src/content/relics.ts slothespire/src/engine/state.ts \
        slothespire/src/engine/actions.ts slothespire/src/engine/reducer.ts \
        slothespire/src/ui/scene-reward.ts slothespire/tests/routing.test.ts
git commit -m "feat: relic system — 5 Datadog relics, onCombatStart/onTurnStart hooks, relic rewards"
```

---

## Task 7: Balance simulation script

**Files:**
- Modify: `package.json`
- Create: `scripts/sim.ts`

- [ ] **Step 1: Add `tsx` dev dependency**

```bash
cd slothespire && npm install -D tsx
```

- [ ] **Step 2: Add `sim` script to `package.json`**

```json
    "sim": "tsx scripts/sim.ts"
```

- [ ] **Step 3: Create `scripts/sim.ts`**

```ts
import { initialState } from "../src/engine/state";
import { reduce } from "../src/engine/reducer";
import type { GameState } from "../src/engine/state";

const NUM_RUNS = 100;

function pickAction(state: GameState): Parameters<typeof reduce>[1] | null {
  // Heuristic AI:
  // 1. Play highest-cost attack card we can afford (target first enemy)
  // 2. Play highest-cost skill card
  // 3. END_TURN
  if (!state.combat) return null;
  const enemy = state.combat.enemies[0];
  if (!enemy) return null;

  const playable = state.player.hand.filter(
    c => c.type !== "curse" && c.cost >= 0 && c.cost <= state.player.energy
  );
  const attacks = playable.filter(c => c.type === "attack").sort((a, b) => b.cost - a.cost);
  const skills = playable.filter(c => c.type === "skill").sort((a, b) => b.cost - a.cost);

  if (attacks.length > 0) {
    return { type: "PLAY_CARD", cardInstanceId: attacks[0].instanceId, targetId: enemy.instanceId };
  }
  if (skills.length > 0) {
    return { type: "PLAY_CARD", cardInstanceId: skills[0].instanceId, targetId: null };
  }
  return { type: "END_TURN" };
}

function navigateAI(state: GameState): Parameters<typeof reduce>[1] {
  // Always navigate to the first reachable node (prefer combat, then rest, then anything)
  const { nodes, currentNodeId } = state.map;
  const reachableIds = new Set<string>();
  if (!currentNodeId) {
    nodes[0]?.forEach(n => reachableIds.add(n.id));
  } else {
    nodes.flat().find(n => n.id === currentNodeId)?.next.forEach(id => reachableIds.add(id));
  }
  const reachable = nodes.flat().filter(n => reachableIds.has(n.id));
  const combat = reachable.find(n => n.type === "combat" || n.type === "boss");
  const rest = reachable.find(n => n.type === "rest");
  const preferred = combat ?? rest ?? reachable[0];
  return { type: "NAVIGATE", nodeId: preferred.id };
}

function runOne(seed: string): { result: "won" | "lost"; turns: number } {
  let s = reduce(initialState(seed), { type: "START_RUN" });
  let turns = 0;
  const MAX_TURNS = 500; // safety cap

  while (turns < MAX_TURNS) {
    turns++;
    switch (s.scene) {
      case "map":
        s = reduce(s, navigateAI(s));
        break;
      case "combat": {
        const action = pickAction(s);
        if (!action) { s = reduce(s, { type: "END_TURN" }); break; }
        s = reduce(s, action);
        break;
      }
      case "reward":
        s = reduce(s, { type: "PICK_REWARD_CARD", cardInstanceId: s.rewardCards?.[0]?.instanceId ?? null });
        break;
      case "reward": // relic
        if (s.rewardRelic) { s = reduce(s, { type: "PICK_REWARD_RELIC" }); break; }
        s = reduce(s, { type: "PICK_REWARD_CARD", cardInstanceId: s.rewardCards?.[0]?.instanceId ?? null });
        break;
      case "rest":
        s = reduce(s, { type: "CHOOSE_REST_OPTION", option: "refresh" });
        break;
      case "event":
        s = reduce(s, { type: "EVENT_CHOICE", choiceIndex: 0 });
        break;
      case "shop":
        s = reduce(s, { type: "GO_TO_MAP" });
        break;
      case "won":
        return { result: "won", turns };
      case "lost":
        return { result: "lost", turns };
      default:
        s = reduce(s, { type: "GO_TO_MAP" });
    }
  }
  return { result: "lost", turns }; // timed out
}

// Fix the reward case (duplicate switch case):
// TypeScript won't like two "reward" cases — consolidate above

const results = Array.from({ length: NUM_RUNS }, (_, i) => runOne(`sim-${i}`));
const wins = results.filter(r => r.result === "won").length;
const avgTurns = Math.round(results.reduce((s, r) => s + r.turns, 0) / NUM_RUNS);

console.log(`\n=== Slothespire Balance Sim (${NUM_RUNS} runs) ===`);
console.log(`Win rate: ${wins}/${NUM_RUNS} (${wins}%)`);
console.log(`Avg turns: ${avgTurns}`);
console.log(`Target win rate: 25-35%`);
console.log(wins < 25 ? "⚠ Too hard" : wins > 45 ? "⚠ Too easy" : "✓ In range");
```

Note: fix the duplicate `reward` case in the switch before committing:

```ts
      case "reward":
        if (s.rewardRelic) {
          s = reduce(s, { type: "PICK_REWARD_RELIC" });
        } else {
          s = reduce(s, { type: "PICK_REWARD_CARD", cardInstanceId: s.rewardCards?.[0]?.instanceId ?? null });
        }
        break;
```

- [ ] **Step 4: Run the sim**

```bash
npm run sim
```

Expected output format:
```
=== Slothespire Balance Sim (100 runs) ===
Win rate: 28/100 (28%)
Avg turns: 187
Target win rate: 25-35%
✓ In range
```

(Actual numbers depend on current balance — any result is fine for M5, sim is for tuning not gating.)

- [ ] **Step 5: Run `npm test` — 130 must still pass (sim doesn't add tests)**

- [ ] **Step 6: Commit**

```bash
git add slothespire/package.json slothespire/package-lock.json slothespire/scripts/sim.ts
git commit -m "feat: balance simulation — npm run sim runs 100 games and reports win rate"
```

---

## Task 8: Smoke test + README

- [ ] **Step 1: Boot dev server and verify key new features**

Run: `npm run dev` (background). Open http://localhost:5173.

- [ ] **Step 2: Card upgrade visible at rest site**

Start a run, navigate past 2 combats, reach a rest site. Click "Upgrade" — verify the card name in the deck now shows "+" suffix.

- [ ] **Step 3: Shop shows cards for sale**

Navigate to a shop node. Verify 3 cards appear with "BUY (90¢)" buttons and your full deck appears below with "Remove (75¢)" buttons.

- [ ] **Step 4: Relic reward from elite or treasure**

Navigate to an elite node (☠), defeat the enemy. Verify "RELIC FOUND" screen appears with a Datadog product relic name and description. Click ACCEPT RELIC → back to map, relic icon/description should be stored (check console or future relic UI).

- [ ] **Step 5: New enemies appear in later rows**

Navigate to row 2-4 combat nodes. Verify you encounter enemies other than Flapping Health Check (Phantom Read, Cron Storm, etc.) as you progress deeper.

- [ ] **Step 6: Run sim**

```bash
npm run sim
```

Verify it completes and outputs a win rate.

- [ ] **Step 7: Final test suite**

```bash
npm test
```

Expected: **133 tests pass**.

- [ ] **Step 8: Update README.md**

```markdown
## Status

M5 content + relics — 21 unique cards with upgrade effects, floor-based enemy routing
(10 enemies), 5 Datadog-product relics with combat hooks (APM Tracing, Live Tail,
Watchdog, Synthetic Tests, Pager), working shop (buy/remove cards), 8 events (4 per
act), O(1) seeded RNG, balance sim (`npm run sim`). 133 tests.
```

- [ ] **Step 9: Commit**

```bash
git add slothespire/README.md
git commit -m "docs: update README for M5 completion"
```

---

## Done

At the end of M5:
- `npm test` passes **≥133 tests** (110 baseline + 4 cards + 7 routing + 3 rng + 5 shop + 4 relics = 133).
- `npm run build` is clean.
- `npm run sim` outputs a win-rate report for 100 simulated runs.
- 21 unique non-curse cards with upgrade effects (base effects + upgraded variants).
- 10 enemies routed by act/row — harder enemies in later floors.
- 5 working Datadog-product relics with `onCombatStart` and `onTurnStart` hooks.
- Shop: 3 cards for sale + full deck removal UI.
- 8 events (4 per act, 6 outcome types).
- RNG advances in O(1) after the first call each run.

**Explicitly not in M5:**
- Full 53-card set (adds remaining ~32 cards in M6)
- All 20 relics (adds remaining 15 in M6)
- Card-upgrade effect values for new cards (added in M6 alongside remaining cards)
- Codex screen (M6)
- Second boss (Total Outage) is defined and routed; playable as Act II boss
- Relic display in combat UI (status pill for relics in M6 polish)
- Tiered shop card pricing (flat 90¢ in M5; rarity-based in M6)

**M6 will implement** the Codex screen, remaining cards/relics, full WCAG pass, balance tuning from sim data, and the v1 ship checklist.
