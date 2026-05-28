# M6 — Codex, Balance, and Ship Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1.0.0. Bring the game to a complete, balanced, publicly playable state: fix the 82% sim win rate, add 15 cards + 10 relics, build the Codex screen (the educational payoff layer), implement card-upgrade deck-picker UI, and deploy to GitHub Pages.

**Architecture:** Five additions to M5. (1) **Balance**: stat adjustments to enemies + rest heal, verified by sim. (2) **Content**: 15 cards → ~37 total, 10 relics → ~15 total. (3) **Codex**: `src/content/codex-entries.ts` (write-ups + links), `src/engine/codex.ts` (localStorage unlock tracking outside GameState), `src/ui/scene-codex.ts` (3-tab UI). (4) **Upgrade picker**: new `"upgrading"` scene + `CHOOSE_CARD_TO_UPGRADE` action. (5) **Deploy**: static Vite build → GitHub Pages via `gh-pages` npm script.

**Tech Stack:** TypeScript + Vite. Add `gh-pages` as dev dependency for deploy. Vitest.

**Reference spec:** `docs/superpowers/specs/2026-05-27-slothespire-design.md` §5 (content), §7 (Codex educational layer), §11 (non-goals — no WCAG audit, no formal brand approval).

**M5 baseline:** 133 tests. 82% sim win rate. 22 unique cards, 5 relics, 10 enemies.

---

## File structure (changes from M5)

```
slothespire/src/
├── content/
│   ├── cards.ts        MODIFY — 15 new card defs
│   ├── relics.ts       MODIFY — 10 new relic defs + 5 existing get hooks
│   └── codex-entries.ts  NEW  — CodexEntry type + CODEX_ENTRIES record (~37 entries)
├── engine/
│   ├── codex.ts        NEW  — unlock tracking in localStorage (outside GameState)
│   ├── actions.ts      MODIFY — SHOW_UPGRADE_PICKER, CHOOSE_CARD_TO_UPGRADE, GO_TO_CODEX
│   ├── reducer.ts      MODIFY — balance tweaks; new scene transitions; upgrade action
│   └── state.ts        MODIFY — add "upgrading" to Scene union
└── ui/
    ├── scene-codex.ts  NEW  — 3-tab Codex with search + entry detail panel
    ├── scene-upgrading.ts NEW — deck picker for upgrade selection
    ├── scene-rest.ts   MODIFY — "Upgrade" button → SHOW_UPGRADE_PICKER
    └── main.ts         MODIFY — route "upgrading" + "codex" + fire codex unlocks

slothespire/
├── scripts/
│   └── deploy.sh       NEW  — gh-pages deploy helper
└── tests/
    ├── codex.test.ts   NEW  — unlock/load/save/isUnlocked (4 tests)
    └── upgrade.test.ts NEW  — SHOW_UPGRADE_PICKER, CHOOSE_CARD_TO_UPGRADE (4 tests)
```

---

## Design decisions (locked in before coding)

### Balance targets (from sim analysis)

The 82% win rate means enemies need ~3× more pressure. Key levers:

| Change | Current | New |
|---|---|---|
| Rest heal % | 30% maxBudget | 20% maxBudget |
| Pager Storm stability | 60 | 85 |
| Pager Storm turn-3 burn | 14 | 18 |
| Total Outage stability | 80 | 120 |
| Total Outage turn-3 burn | 18 | 24 |
| Memory Leak stability | 28 | 36 |
| Cascading Failure stability | 40 | 55 |
| Act II combat row 3-4 pool | mostly low-HP | add cascading_failure |
| Act II rest heal | same formula | same (already changed above) |

Also add a new harder Act II standard enemy: `deadlock` (stability 30, intent: [debuff toil 2, burn 10]).

Target after tuning: sim win rate 30-50% (heuristic AI; real player gets 25-40%).

### New cards — 15 additions (target ~37 total)

Focus: fill the sparse uncommon/rare tiers with cards that teach status mechanics.

| ID | Name | Type | Cost | Effects | Upgraded |
|---|---|---|---|---|---|
| `on_call_swap` | On-Call Swap | skill | 0 | Exhaust; gain 2 Energy | Exhaust; gain 3 Energy |
| `incident_playbook` | Incident Playbook | power | 2 | powerTrigger: Draw 1, +2 Headroom | powerTrigger: Draw 1, +4 Headroom |
| `error_budget_calc` | Error Budget Calc | skill | 1 | Apply Confidence 1 to self | Apply Confidence 1, +4 Headroom |
| `dependency_audit` | Dependency Audit | attack | 2 | Burn 12; Apply Throttled 2 to single | Burn 16; Apply Throttled 2 |
| `blue_green_deploy` | Blue-Green Deploy | attack | 1 | Burn 7; Draw 1 | Burn 10; Draw 1 |
| `chaos_monkey` | Chaos Monkey | attack | 1 | Burn 6; Apply Customer-Facing 1 to single | Burn 8; Apply Customer-Facing 1 |
| `toil_reduction` | Toil Reduction | skill | 2 | Remove Toil. +8 Headroom. | Remove Toil. +12 Headroom. |
| `load_shedding` | Load Shedding | skill | 1 | Apply Throttled 3 to all enemies | Apply Throttled 4 |
| `slo_tightening` | SLO Tightening | power | 3 | powerTrigger: Apply Pressure 1 to self (attacks gain flat) | powerTrigger: Apply Pressure 2 |
| `capacity_planning` | Capacity Planning | skill | 2 | Restore 8 Budget; Draw 2 | Restore 12 Budget; Draw 2 |
| `on_fire` | On Fire | attack | 0 | Burn 5 | Burn 8 |
| `war_room` | War Room | skill | 3 | Exhaust; Restore 20 Budget | Exhaust; Restore 28 Budget |
| `retry_with_backoff` | Retry with Backoff | attack | 1 | Burn 6 twice (2 separate hits) | Burn 8 twice |
| `observability_pipeline` | Observability Pipeline | power | 2 | powerTrigger: Apply Observability 1 to self | powerTrigger: Apply Observability 2 |
| `postmortem_template` | Postmortem Template | skill | 1 | Restore 6 Budget; Apply Flow 1 | Restore 9 Budget; Apply Flow 1 |

Note on "Burn N twice": use `effects: [{ kind: "burn", amount: 6 }, { kind: "burn", amount: 6 }]` — two separate burn effects, each modified by status. This creates interesting interactions with Customer-Facing (both hits get amplified) and Confidence (only first hit doubled).

Note on `toil_reduction`: add a new `{ kind: "removeStatus"; status: StatusId; target: "self" }` EffectSpec variant — removes all stacks of a status from the player.

### New relics — 10 additions (target ~15 total)

All are Datadog products:

| ID | Product | onCombatStart | onTurnStart |
|---|---|---|---|
| `error_tracking` | Error Tracking | — | first time this combat you take ≥10 burn, source becomes Customer-Facing 1 (one-shot per combat; needs combat counter — skip for M6, just apply Customer-Facing 1 to all at combat start) |
| `continuous_profiler` | Continuous Profiler | — | every 3rd attack you play deals +2 extra burn (track in `relicCounters.profilerCount`) |
| `notebooks` | Notebooks | onCombatStart: pick 1 card in hand, upgrade it for this combat only | — |
| `dashboards` | Dashboards | — | onTurnStart: +1 Headroom |
| `incident_management` | Incident Management | — | once per run, when budget would reach 0, restore 25 instead (M6 stub: onCombatStart apply Confidence 1 — simpler) |
| `service_catalog` | Service Catalog | onCombatStart: first enemy never has "unknown" intent (apply Observability 1 to self) | — |
| `cloud_cost_mgmt` | Cloud Cost Management | — | onTurnStart: +5 Credits per combat (first turn only — M6 stub: +5 on each turn start) |
| `workflow_automation` | Workflow Automation | onCombatStart: if you played 4+ cards last combat, gain 1 Hotfix slot (M6: just gain 1 Headroom at combat start — simpler) | — |
| `sensitive_data_scanner` | Sensitive Data Scanner | onCombatStart: randomly remove 1 curse from deck (M6: if deck has a curse, remove it) | — |
| `rum` | RUM Session Replay | — | onTurnStart: if hand size < 3, draw 1 extra card |

For M6, implement these as simple hooks without complex tracking (no `relicCounters` state). Where the spec says complex behavior, use a simpler approximation noted above.

### Codex architecture

**`src/engine/codex.ts`** — pure module, no reducer. Operates on `localStorage` directly.

```ts
const CODEX_KEY = "slothespire:codex";

export function isUnlocked(id: string): boolean
export function unlock(id: string): void        // saves immediately
export function allUnlocked(): string[]
export function clearCodex(): void             // dev/reset only
```

Module-level `_unlocked: Set<string> | null` — loaded lazily from localStorage on first call.

**`src/content/codex-entries.ts`** — static content.

```ts
export interface CodexEntry {
  id: string;
  kind: "card" | "relic" | "enemy";
  name: string;
  description: string;   // in-game effect (for cards = effect text)
  realConcept: string;   // ~100 words: what it is, when to use, SRE intuition
  docsLink?: string;     // Datadog docs URL (relics only) or neutral primary source (concepts)
}

export const CODEX_ENTRIES: Record<string, CodexEntry> = { ... };
```

Write entries for: 10 starter + common cards, 5 key relics, 5 key enemies. Total ~20 entries authored in M6. Remaining entries added in post-v1.

**Unlock triggers in `main.ts`** — after each `render()` call, fire codex unlocks based on current state:
```ts
function fireCodexUnlocks(s: GameState): void {
  // Cards: unlock when seen in hand or reward
  for (const c of [...s.player.hand, ...s.rewardCards ?? []]) codex.unlock(c.defId);
  // Relics: unlock on first possession
  for (const r of s.player.relics) codex.unlock(r);
  // Current node's enemy
  if (s.combat) for (const e of s.combat.enemies) codex.unlock(e.defId);
}
```

**Scene-codex.ts** — 3 tabs: Cards, Relics, Enemies. Grid of 64×96 thumbnails. Locked = `opacity: 0.3`, name shown, "?" in icon. Unlocked = full entry with description. Click → side panel expands with `realConcept` and `docsLink`. Search bar filters by name. Back button dispatches GO_TO_MAP or RETURN_TO_TITLE depending on where opened.

**`GO_TO_CODEX` action** — routes to `scene: "codex"`, stores `codexReturnScene: "map" | "title"` in state so BACK knows where to go.

### Card upgrade selection

Current behavior: rest site "Upgrade" auto-picks first non-upgraded card. New behavior:
- "Upgrade" button dispatches `SHOW_UPGRADE_PICKER` → scene = `"upgrading"`
- New scene `scene-upgrading.ts` shows the full deck, each card clickable
- Clicking a card dispatches `CHOOSE_CARD_TO_UPGRADE { cardInstanceId }` → upgrades it, scene = "map"
- BACK / cancel dispatches `GO_TO_MAP`

---

## Task 1: Balance pass

**Files:**
- Modify: `src/content/enemies.ts`
- Modify: `src/engine/reducer.ts` (rest heal % only)

- [ ] **Step 1: Update enemy stats in `src/content/enemies.ts`**

```ts
  memory_leak:        { ..., stability: 36 },
  cascading_failure:  { ..., stability: 55 },
  the_pager_storm:    { ..., stability: 85,
    intentPattern: [
      { kind: "burn" as const, amount: 10 },
      { kind: "debuff" as const, status: "on_call_fatigue" as const, stacks: 1 },
      { kind: "burn" as const, amount: 18 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 2 },
    ],
  },
  total_outage: { ..., stability: 120,
    intentPattern: [
      { kind: "burn" as const, amount: 14 },
      { kind: "debuff" as const, status: "customer_facing" as const, stacks: 2 },
      { kind: "burn" as const, amount: 24 },
      { kind: "buff" as const, status: "pressure" as const, stacks: 3 },
    ],
  },
```

Add new enemy:
```ts
  deadlock: {
    id: "deadlock", name: "Deadlock", stability: 30,
    intentPattern: [
      { kind: "debuff" as const, status: "toil" as const, stacks: 2 },
      { kind: "burn" as const, amount: 10 },
    ],
  },
```

Add `deadlock` to the routing table:
```ts
  "2-2": ["deadlock", "memory_leak"],
  "2-3": ["zombie_process", "deadlock"],
  "2-4": ["memory_leak", "deadlock"],
  "2-elite": ["cascading_failure"],
```

- [ ] **Step 2: Reduce rest heal from 30% to 20% in `src/engine/reducer.ts`**

Find the `CHOOSE_REST_OPTION "refresh"` case and change `0.3` to `0.2`:
```ts
        const healed = Math.min(
          state.player.maxBudget,
          state.player.budget + Math.floor(state.player.maxBudget * 0.2)
        );
```

Also update the rest scene preview in `src/ui/scene-rest.ts` (same `0.3` → `0.2`).

- [ ] **Step 3: Update existing NAVIGATE test that checks rest heal math**

In `tests/navigation.test.ts`, find the rest refresh test:
```ts
    expect(s2.player.budget).toBe(64); // 40 + floor(80 × 0.3) = 40 + 24 = 64
```

Change to:
```ts
    expect(s2.player.budget).toBe(56); // 40 + floor(80 × 0.2) = 40 + 16 = 56
```

- [ ] **Step 4: Run `npm test` — all 133 still pass (one updated assertion)**

- [ ] **Step 5: Run `npm run sim` — verify improvement**

Expected: 40-60% win rate (better, not yet tuned to perfection). Record result.

- [ ] **Step 6: Commit**

```bash
git add slothespire/src/content/enemies.ts slothespire/src/engine/reducer.ts \
        slothespire/src/ui/scene-rest.ts slothespire/tests/navigation.test.ts
git commit -m "fix(balance): buff enemy stats, add deadlock, reduce rest heal 30%→20%"
```

---

## Task 2: New cards + relics content

**Files:**
- Modify: `src/content/cards.ts`
- Modify: `src/content/relics.ts`

No new tests for static data.

- [ ] **Step 1: Add `removeStatus` to `EffectSpec` in `cards.ts`**

```ts
  | { kind: "removeStatus"; status: StatusId; target: "self" | "single" }
```

- [ ] **Step 2: Add 15 new card defs to `CARD_DEFS`**

```ts
  on_call_swap: {
    id: "on_call_swap", name: "On-Call Swap", type: "skill", cost: 0,
    effects: [{ kind: "draw", amount: 2 }],
    upgradedEffects: [{ kind: "draw", amount: 3 }],
    exhaust: true,
    flavor: "Hand it to someone else. Fast.",
  },
  incident_playbook: {
    id: "incident_playbook", name: "Incident Playbook", type: "power", cost: 2,
    effects: [],
    powerTrigger: [{ kind: "draw", amount: 1 }, { kind: "headroom", amount: 2 }],
    upgradedPowerTrigger: [{ kind: "draw", amount: 1 }, { kind: "headroom", amount: 4 }],
    flavor: "Every scenario, pre-planned.",
  },
  error_budget_calc: {
    id: "error_budget_calc", name: "Error Budget Calc", type: "skill", cost: 1,
    effects: [{ kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "applyStatus", status: "confidence", stacks: 1, target: "self" }, { kind: "headroom", amount: 4 }],
    flavor: "You have 0.1% left. Spend it wisely.",
  },
  dependency_audit: {
    id: "dependency_audit", name: "Dependency Audit", type: "attack", cost: 2,
    effects: [{ kind: "burn", amount: 12 }, { kind: "applyStatus", status: "throttled", stacks: 2, target: "single" }],
    upgradedEffects: [{ kind: "burn", amount: 16 }, { kind: "applyStatus", status: "throttled", stacks: 2, target: "single" }],
    flavor: "Forty-seven transitive dependencies. Three are vulnerable.",
  },
  blue_green_deploy: {
    id: "blue_green_deploy", name: "Blue-Green Deploy", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 7 }, { kind: "draw", amount: 1 }],
    upgradedEffects: [{ kind: "burn", amount: 10 }, { kind: "draw", amount: 1 }],
    flavor: "Route traffic. Switch. Celebrate.",
  },
  chaos_monkey: {
    id: "chaos_monkey", name: "Chaos Monkey", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 6 }, { kind: "applyStatus", status: "customer_facing", stacks: 1, target: "single" }],
    upgradedEffects: [{ kind: "burn", amount: 8 }, { kind: "applyStatus", status: "customer_facing", stacks: 1, target: "single" }],
    flavor: "Randomly terminates instances in production. That's the feature.",
  },
  toil_reduction: {
    id: "toil_reduction", name: "Toil Reduction", type: "skill", cost: 2,
    effects: [{ kind: "removeStatus", status: "toil", target: "self" }, { kind: "headroom", amount: 8 }],
    upgradedEffects: [{ kind: "removeStatus", status: "toil", target: "self" }, { kind: "headroom", amount: 12 }],
    flavor: "Automate the thing that pages you at 3am.",
  },
  load_shedding: {
    id: "load_shedding", name: "Load Shedding", type: "skill", cost: 1,
    effects: [{ kind: "applyStatus", status: "throttled", stacks: 3, target: "all" }],
    upgradedEffects: [{ kind: "applyStatus", status: "throttled", stacks: 4, target: "all" }],
    flavor: "Shed load before the load sheds you.",
  },
  slo_tightening: {
    id: "slo_tightening", name: "SLO Tightening", type: "power", cost: 3,
    effects: [],
    powerTrigger: [{ kind: "applyStatus", status: "pressure", stacks: 1, target: "self" }],
    upgradedPowerTrigger: [{ kind: "applyStatus", status: "pressure", stacks: 2, target: "self" }],
    flavor: "Make the target harder. Make yourself stronger.",
  },
  capacity_planning: {
    id: "capacity_planning", name: "Capacity Planning", type: "skill", cost: 2,
    effects: [{ kind: "restoreBudget", amount: 8 }, { kind: "draw", amount: 2 }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 12 }, { kind: "draw", amount: 2 }],
    flavor: "Provision for peak. Not for Tuesday at 2am.",
  },
  on_fire: {
    id: "on_fire", name: "On Fire", type: "attack", cost: 0,
    effects: [{ kind: "burn", amount: 5 }],
    upgradedEffects: [{ kind: "burn", amount: 8 }],
    flavor: "Everything is on fire. Might as well use it.",
  },
  war_room: {
    id: "war_room", name: "War Room", type: "skill", cost: 3,
    effects: [{ kind: "restoreBudget", amount: 20 }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 28 }],
    exhaust: true,
    flavor: "All hands on deck. Only pull once.",
  },
  retry_with_backoff: {
    id: "retry_with_backoff", name: "Retry with Backoff", type: "attack", cost: 1,
    effects: [{ kind: "burn", amount: 6 }, { kind: "burn", amount: 6 }],
    upgradedEffects: [{ kind: "burn", amount: 8 }, { kind: "burn", amount: 8 }],
    flavor: "Try again. Then try again, but slower.",
  },
  postmortem_template: {
    id: "postmortem_template", name: "Postmortem Template", type: "skill", cost: 1,
    effects: [{ kind: "restoreBudget", amount: 6 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    upgradedEffects: [{ kind: "restoreBudget", amount: 9 }, { kind: "applyStatus", status: "flow", stacks: 1, target: "self" }],
    flavor: "Timeline: unclear. Impact: large. Action items: many.",
  },
  observability_pipeline: {
    id: "observability_pipeline", name: "Observability Pipeline", type: "power", cost: 2,
    effects: [],
    powerTrigger: [{ kind: "applyStatus", status: "observability", stacks: 1, target: "self" }],
    upgradedPowerTrigger: [{ kind: "applyStatus", status: "observability", stacks: 2, target: "self" }],
    flavor: "See everything. All the time.",
  },
```

- [ ] **Step 3: Add `removeStatus` handling to `src/engine/reducer.ts` PLAY_CARD case**

In the effect loop, add:
```ts
        } else if (effect.kind === "removeStatus") {
          const tgt = effect.target === "self" ? "player"
                    : (targetId ?? s.combat?.enemies[0]?.instanceId ?? "player");
          s = consumeStatus(s, tgt, effect.status);
```

Also update the reward pool in `src/content/rewards.ts` — add the new card IDs to `CARD_RARITY`:
```ts
const CARD_RARITY: Record<string, "common" | "uncommon" | "rare"> = {
  // Common
  canary_deploy: "common", circuit_breaker: "common", rollback: "common",
  load_balancer: "common", monitoring_alert: "common", feature_flag: "common",
  health_check: "common", graceful_degradation: "common", rate_limiter: "common",
  on_fire: "common", blue_green_deploy: "common", on_call_swap: "common",
  // Uncommon
  chaos_engineering: "uncommon", auto_scaling: "uncommon", zero_downtime_deploy: "uncommon",
  sli_dashboard: "uncommon", runbook: "uncommon", chaos_monkey: "uncommon",
  error_budget_calc: "uncommon", load_shedding: "uncommon", toil_reduction: "uncommon",
  dependency_audit: "uncommon", capacity_planning: "uncommon", retry_with_backoff: "uncommon",
  postmortem_template: "uncommon", incident_playbook: "uncommon", service_mesh: "uncommon",
  // Rare
  slo_tightening: "rare", observability_pipeline: "rare",
  page_the_ceo: "rare", postmortem: "rare", war_room: "rare",
};
```

- [ ] **Step 4: Add 10 new relic defs to `src/content/relics.ts`**

```ts
  error_tracking: {
    id: "error_tracking", name: "Error Tracking", product: "Datadog Error Tracking",
    description: "At start of combat, apply Customer-Facing 1 to all enemies.",
    flavor: "Group. Deduplicate. Prioritize.",
    onCombatStart: (s) => {
      if (!s.combat) return s;
      let fresh = s;
      for (const enemy of fresh.combat!.enemies) {
        fresh = applyStatus(fresh, enemy.instanceId, "customer_facing", 1);
      }
      return fresh;
    },
  },
  dashboards: {
    id: "dashboards", name: "Dashboards", product: "Datadog Dashboards",
    description: "At start of each turn, gain 1 Headroom.",
    flavor: "The graph goes up. You also go up.",
    onTurnStart: (s) => addHeadroom(s, 1),
  },
  service_catalog: {
    id: "service_catalog", name: "Service Catalog", product: "Datadog Service Catalog",
    description: "At start of combat, gain Observability 1.",
    flavor: "Know your dependencies. Own your services.",
    onCombatStart: (s) => applyStatus(s, "player", "observability", 1),
  },
  incident_management: {
    id: "incident_management", name: "Incident Management", product: "Datadog Incident Management",
    description: "At start of combat, apply Confidence 1 to yourself.",
    flavor: "Declared. Triaged. Resolved.",
    onCombatStart: (s) => applyStatus(s, "player", "confidence", 1),
  },
  workflow_automation: {
    id: "workflow_automation", name: "Workflow Automation", product: "Datadog Workflow Automation",
    description: "At start of combat, gain 6 Headroom.",
    flavor: "Automate the response before the alert fires.",
    onCombatStart: (s) => addHeadroom(s, 6),
  },
  notebooks: {
    id: "notebooks", name: "Notebooks", product: "Datadog Notebooks",
    description: "At start of combat, draw 1 extra card.",
    flavor: "Collaborative investigation, documented.",
    onCombatStart: (s) => drawCards(s, 1),
  },
  cloud_cost_mgmt: {
    id: "cloud_cost_mgmt", name: "Cloud Cost Mgmt", product: "Datadog Cloud Cost Management",
    description: "At start of each turn, gain 5 Credits.",
    flavor: "Tag your resources. Save your money.",
    onTurnStart: (s) => ({ ...s, credits: s.credits + 5 }),
  },
  rum: {
    id: "rum", name: "RUM", product: "Datadog Real User Monitoring",
    description: "At start of each turn, if hand size < 3, draw 1 card.",
    flavor: "See what real users actually experience.",
    onTurnStart: (s) => s.player.hand.length < 3 ? drawCards(s, 1) : s,
  },
  sensitive_data_scanner: {
    id: "sensitive_data_scanner", name: "Sensitive Data Scanner", product: "Datadog SDS",
    description: "At start of combat, if deck contains a curse, remove the first one.",
    flavor: "Find the secrets. Remove the secrets.",
    onCombatStart: (s) => {
      const curseIdx = s.deck.findIndex(c => c.type === "curse");
      if (curseIdx === -1) return s;
      return { ...s, deck: [...s.deck.slice(0, curseIdx), ...s.deck.slice(curseIdx + 1)] };
    },
  },
  continuous_profiler: {
    id: "continuous_profiler", name: "Continuous Profiler", product: "Datadog Continuous Profiler",
    description: "At start of combat, gain Pressure 1 (attacks deal +1 Burn flat).",
    flavor: "Always-on performance visibility.",
    onCombatStart: (s) => applyStatus(s, "player", "pressure", 1),
  },
```

Update `RELIC_POOL` to include new relics (it auto-generates from `Object.keys(RELIC_DEFS).filter(id => id !== "pager")`, so no change needed if new IDs are added to RELIC_DEFS).

- [ ] **Step 5: Run `npm run build` — must pass**

- [ ] **Step 6: Run `npm test` — 133 pass (no new tests for static content)**

- [ ] **Step 7: Commit**

```bash
git add slothespire/src/content/cards.ts slothespire/src/content/relics.ts \
        slothespire/src/content/rewards.ts slothespire/src/engine/reducer.ts
git commit -m "feat(content): 15 new cards, 10 new relics, removeStatus EffectSpec"
```

---

## Task 3: Codex content layer

**Files:**
- Create: `src/content/codex-entries.ts`

No tests for static content.

- [ ] **Step 1: Create `src/content/codex-entries.ts` with ~20 entries**

Write entries for the 10 most played cards, 5 relics, 5 enemies:

```ts
export interface CodexEntry {
  id: string;
  kind: "card" | "relic" | "enemy";
  name: string;
  description: string;
  realConcept: string;
  docsLink?: string;
}

export const CODEX_ENTRIES: Record<string, CodexEntry> = {
  manual_fix: {
    id: "manual_fix", kind: "card", name: "Manual Fix",
    description: "1 Energy · Attack · Burn 6 (Upgraded: 9)",
    realConcept: `A manual fix is the on-call engineer's first tool: directly intervening to stop the bleeding without addressing root cause. In SRE practice, manual fixes are tracked as toil — necessary but unsustainable. Every manual fix should generate a follow-up ticket: automate the detection, the response, or both. The goal is to make this card unnecessary by the end of the run.`,
    docsLink: "https://sre.google/sre-book/eliminating-toil/",
  },
  circuit_breaker: {
    id: "circuit_breaker", kind: "card", name: "Circuit Breaker",
    description: "1 Energy · Skill · +8 Headroom (Upgraded: +12)",
    realConcept: `A circuit breaker pattern stops calls to a failing downstream dependency after a failure threshold is crossed, preventing cascading failures. When open, requests fail fast instead of waiting. After a timeout, it enters half-open state: one probe request decides whether to close (recover) or stay open. Named after the electrical safety device — it breaks the circuit before the system burns out.`,
    docsLink: "https://martinfowler.com/bliki/CircuitBreaker.html",
  },
  canary_deploy: {
    id: "canary_deploy", kind: "card", name: "Canary Deploy",
    description: "1 Energy · Attack · Burn 5, Draw 1 (Upgraded: Burn 8)",
    realConcept: `Canary deployment routes a small percentage of traffic (1-5%) to a new version before a full rollout. Like miners sending canaries into coal mines to detect gas, canary deploys surface problems before they affect all users. Key metrics to watch: error rate, latency, and any SLO-relevant signals. If the canary dies, roll back immediately. If it survives, gradually shift more traffic.`,
    docsLink: "https://docs.datadoghq.com/monitors/",
  },
  postmortem: {
    id: "postmortem", kind: "card", name: "Blameless Postmortem",
    description: "2 Energy · Skill · Exhaust · Restore 12 Budget",
    realConcept: `A blameless postmortem focuses on system failures rather than individual blame. The 5 Whys, timeline reconstruction, and action items are all about making the system more resilient — not finding who to punish. Google SRE formalized this: the goal is learning, not punishment. Postmortems should be shared widely; a failure only experienced by one team is a failure experienced by everyone eventually.`,
    docsLink: "https://sre.google/sre-book/postmortem-culture/",
  },
  chaos_engineering_card: {
    id: "chaos_engineering", kind: "card", name: "Chaos Engineering",
    description: "2 Energy · Skill · Apply Customer-Facing 3 to all enemies, Self-Burn 5",
    realConcept: `Chaos engineering deliberately injects failures into production systems to expose weaknesses before they cause unplanned outages. The principle: it's better to break things on purpose during business hours than to be surprised at 3am. Netflix's Chaos Monkey randomly terminates EC2 instances in production. The practice requires robust monitoring — you need to observe the failure, not just cause it.`,
    docsLink: "https://principlesofchaos.org/",
  },
  flapping_health_check: {
    id: "flapping_health_check", kind: "enemy", name: "Flapping Health Check",
    description: "Stability 20 · Burns 6 and 4 alternating",
    realConcept: `A flapping health check oscillates between passing and failing without a clear root cause. Common causes: resource contention, network jitter, slow disk I/O, or an overly tight timeout. Flapping checks generate alert fatigue — the on-call learns to ignore them, which is dangerous. Fix: add hysteresis (require N failures before alerting), tune timeouts, and investigate the underlying cause.`,
    docsLink: "https://docs.datadoghq.com/monitors/configuration/",
  },
  memory_leak: {
    id: "memory_leak", kind: "enemy", name: "Memory Leak",
    description: "Stability 36 · Stacks Pressure over time",
    realConcept: `A memory leak occurs when a program allocates memory but never frees it, causing memory usage to grow until the process crashes or the system becomes unresponsive. In long-running services, even small leaks accumulate. Key signals: steadily rising heap usage, degrading GC performance, eventual OOM kills. Mitigation: profiling tools (Datadog Continuous Profiler shows heap allocation hotspots), memory limit caps, and scheduled restarts as a temporary measure.`,
    docsLink: "https://docs.datadoghq.com/profiler/",
  },
  pager_relic: {
    id: "pager", kind: "relic", name: "Pager",
    description: "At start of your turn, if SLO Budget ≤ 30%, draw 1 extra card.",
    realConcept: `The on-call pager is the entry point for every incident. Effective paging means: actionable alerts (not informational noise), clear runbook links, and right-person routing. When budget (error budget) is low, the pager fires faster — you need more resources to respond. The Pager relic reflects this: low budget state triggers enhanced draw, simulating the surge of attention that a real pager generates.`,
    docsLink: "https://sre.google/sre-book/being-on-call/",
  },
  apm_tracing_relic: {
    id: "apm_tracing", kind: "relic", name: "APM Tracing",
    description: "At start of combat, gain Observability 2.",
    realConcept: `Application Performance Monitoring distributed tracing follows a request as it traverses multiple services, recording timing and metadata at each hop. With APM, you can pinpoint which service introduced latency or generated an error. Datadog APM uses auto-instrumentation to capture spans without code changes. The Observability status in Slothespire represents what APM gives you: visibility into what's coming before it hits.`,
    docsLink: "https://docs.datadoghq.com/tracing/",
  },
  the_pager_storm: {
    id: "the_pager_storm", kind: "enemy", name: "The Pager Storm",
    description: "Stability 85 · Burns hard, applies On-Call Fatigue, scales Pressure",
    realConcept: `Alert fatigue occurs when on-call engineers receive so many alerts that they stop treating each one with appropriate urgency. A pager storm — hundreds of alerts triggered by a single root cause — is one of the most dangerous failure modes. The correct response: triage, not reaction. Find the root cause; silence derivative alerts. The Pager Storm boss teaches this: brute-forcing through every alert in phase 1 leaves you depleted for phase 2.`,
    docsLink: "https://docs.datadoghq.com/monitors/manage/",
  },
};
```

Add "coming soon" stubs for remaining cards/relics/enemies to show in Codex as locked placeholders — they don't need `realConcept` to be authored yet.

- [ ] **Step 2: Run `npm run build` — must pass**

- [ ] **Step 3: Commit**

```bash
git add slothespire/src/content/codex-entries.ts
git commit -m "feat(content): Codex entries — 20 educational write-ups for cards/relics/enemies"
```

---

## Task 4: Codex engine (localStorage unlock tracking)

**Files:**
- Create: `src/engine/codex.ts`
- Modify: `src/engine/actions.ts`
- Modify: `src/engine/state.ts`
- Test: `tests/codex.test.ts`

- [ ] **Step 1: Write failing tests — create `tests/codex.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { unlock, isUnlocked, allUnlocked, clearCodex, CODEX_KEY } from "../src/engine/codex";

beforeEach(() => {
  localStorage.clear();
});

describe("codex", () => {
  it("isUnlocked returns false for a new entry", () => {
    expect(isUnlocked("manual_fix")).toBe(false);
  });

  it("unlock makes isUnlocked return true", () => {
    unlock("manual_fix");
    expect(isUnlocked("manual_fix")).toBe(true);
  });

  it("allUnlocked returns all unlocked entry IDs", () => {
    unlock("manual_fix");
    unlock("circuit_breaker");
    const all = allUnlocked();
    expect(all).toContain("manual_fix");
    expect(all).toContain("circuit_breaker");
    expect(all.length).toBe(2);
  });

  it("persists across module re-initialization (round-trips through localStorage)", () => {
    unlock("postmortem");
    // Simulate re-init by writing directly to localStorage and clearing module cache
    const raw = localStorage.getItem(CODEX_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toContain("postmortem");
  });
});
```

- [ ] **Step 2: Run `npm test` — FAIL (no codex module)**

- [ ] **Step 3: Implement `src/engine/codex.ts`**

```ts
export const CODEX_KEY = "slothespire:codex";

let _cache: Set<string> | null = null;

function load(): Set<string> {
  if (_cache !== null) return _cache;
  try {
    const raw = localStorage.getItem(CODEX_KEY);
    _cache = new Set(raw ? JSON.parse(raw) : []);
  } catch {
    _cache = new Set();
  }
  return _cache;
}

function save(ids: Set<string>): void {
  try {
    localStorage.setItem(CODEX_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage full — non-fatal
  }
}

export function isUnlocked(id: string): boolean {
  return load().has(id);
}

export function unlock(id: string): void {
  const ids = load();
  if (!ids.has(id)) {
    ids.add(id);
    save(ids);
  }
}

export function allUnlocked(): string[] {
  return [...load()];
}

export function clearCodex(): void {
  _cache = new Set();
  localStorage.removeItem(CODEX_KEY);
}
```

- [ ] **Step 4: Add actions + state changes**

In `src/engine/actions.ts`:
```ts
  | { type: "GO_TO_CODEX"; returnScene: "map" | "title" }
  | { type: "CLOSE_CODEX" }
```

In `src/engine/state.ts`, add `"upgrading"` to the `Scene` union (codex already exists):
```ts
  | "upgrading"
```

Add to `GameState`:
```ts
  codexReturnScene?: "map" | "title";
```

(Remove the duplicate `"upgrading"` addition in Task 6 — it's done here.)

In `src/engine/reducer.ts`, add cases:
```ts
    case "GO_TO_CODEX":
      return { ...state, scene: "codex", codexReturnScene: action.returnScene };
    case "CLOSE_CODEX":
      return { ...state, scene: state.codexReturnScene ?? "map", codexReturnScene: undefined };
```

- [ ] **Step 5: Add codex unlock calls to `src/main.ts`**

Import codex: `import * as codex from "./engine/codex";`

After each `render()` call (in the `dispatch` function), fire unlocks:

```ts
function dispatch(action: Action): void {
  state = reduce(state, action);
  // ... save policy ...
  render();
  // Fire codex unlocks after render
  for (const c of state.player.hand) codex.unlock(c.defId);
  for (const c of state.rewardCards ?? []) codex.unlock(c.defId);
  for (const r of state.player.relics) codex.unlock(r);
  if (state.combat) for (const e of state.combat.enemies) codex.unlock(e.defId);
}
```

- [ ] **Step 6: Run `npm test` — expect **133 + 4 = 137 pass****

- [ ] **Step 7: Commit**

```bash
git add slothespire/src/engine/codex.ts slothespire/src/engine/actions.ts \
        slothespire/src/engine/state.ts slothespire/src/engine/reducer.ts \
        slothespire/src/main.ts slothespire/tests/codex.test.ts
git commit -m "feat(engine): Codex — localStorage unlock tracking, GO_TO_CODEX action, unlock on encounter"
```

---

## Task 5: Codex UI scene

**Files:**
- Create: `src/ui/scene-codex.ts`
- Modify: `src/ui/scene-title.ts` (enable Codex button)
- Modify: `src/main.ts` (route codex scene, already routes to title stub — replace)

- [ ] **Step 1: Create `src/ui/scene-codex.ts`**

```ts
import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { CODEX_ENTRIES } from "../content/codex-entries";
import { CARD_DEFS } from "../content/cards";
import { RELIC_DEFS } from "../content/relics";
import { ENEMY_DEFS } from "../content/enemies";
import { allUnlocked, isUnlocked } from "../engine/codex";

type Tab = "cards" | "relics" | "enemies";

export function renderCodex(
  state: GameState,
  dispatch: (a: Action) => void
): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-codex";

  // Build entry lists per tab
  const cardIds = Object.keys(CARD_DEFS).filter(id => CARD_DEFS[id].type !== "status");
  const relicIds = Object.keys(RELIC_DEFS);
  const enemyIds = Object.keys(ENEMY_DEFS);

  function renderGrid(ids: string[], kind: "card" | "relic" | "enemy"): string {
    return ids.map(id => {
      const unlocked = isUnlocked(id);
      const entry = CODEX_ENTRIES[id];
      const name = entry?.name
        ?? (kind === "card" ? CARD_DEFS[id]?.name
           : kind === "relic" ? RELIC_DEFS[id]?.name
           : ENEMY_DEFS[id]?.name) ?? id;
      return `
        <div class="codex-tile ${unlocked ? "unlocked" : "locked"}"
             data-entry="${id}" data-kind="${kind}">
          <div class="ct-icon">${unlocked ? (kind === "relic" ? "✦" : kind === "enemy" ? "▲" : "⚔") : "?"}</div>
          <div class="ct-name">${unlocked ? name : "???"}</div>
        </div>
      `;
    }).join("");
  }

  function renderDetail(id: string): string {
    const entry = CODEX_ENTRIES[id];
    if (!entry) return `<p style="opacity:0.5">Full entry coming soon.</p>`;
    return `
      <h3 class="cd-name">${entry.name}</h3>
      <p class="cd-desc">${entry.description}</p>
      <div class="cd-divider"></div>
      <h4 class="cd-concept-label">THE REAL CONCEPT</h4>
      <p class="cd-concept">${entry.realConcept}</p>
      ${entry.docsLink ? `<a class="cd-link" href="${entry.docsLink}" target="_blank" rel="noopener">↗ Learn more</a>` : ""}
    `;
  }

  root.innerHTML = `
    <style>
      .scene-codex { flex: 1; display: grid; grid-template-rows: 48px 44px 1fr; grid-template-columns: 1fr 320px; grid-template-areas: "header header" "tabs tabs" "grid detail"; height: 100vh; }
      .codex-header { grid-area: header; background: var(--color-base-deep); border-bottom: 1px solid var(--color-accent); display: flex; align-items: center; padding: 0 16px; gap: 16px; }
      .codex-header h2 { font-family: var(--font-display); font-size: 18px; color: var(--color-accent); letter-spacing: 3px; margin: 0; }
      .codex-back { font-family: var(--font-display); font-size: 11px; letter-spacing: 1px; margin-left: auto; }
      .codex-tabs { grid-area: tabs; background: var(--color-base-deep); border-bottom: 1px solid var(--color-border-low); display: flex; gap: 0; }
      .codex-tab { padding: 10px 20px; font-family: var(--font-display); font-size: 11px; letter-spacing: 1px; cursor: pointer; color: var(--color-text-dim); border-bottom: 2px solid transparent; transition: color 0.1s; }
      .codex-tab.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }
      .codex-tab:hover:not(.active) { color: var(--color-text); }
      .codex-grid { grid-area: grid; overflow-y: auto; padding: 16px; display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; }
      .codex-tile { width: 80px; padding: 8px 4px; text-align: center; background: var(--color-base-deep); border-radius: 4px; cursor: pointer; border: 1px solid var(--color-border-low); transition: border-color 0.1s; }
      .codex-tile.unlocked { border-color: var(--color-border-low); }
      .codex-tile.unlocked:hover { border-color: var(--color-accent); }
      .codex-tile.locked { opacity: 0.3; cursor: default; }
      .ct-icon { font-size: 20px; color: var(--color-accent); margin-bottom: 4px; }
      .ct-name { font-family: var(--font-display); font-size: 8px; color: var(--color-text-dim); word-break: break-word; line-height: 1.2; }
      .codex-detail { grid-area: detail; background: var(--color-base-deep); border-left: 1px solid var(--color-border-low); padding: 20px; overflow-y: auto; }
      .codex-detail p { font-size: 12px; opacity: 0.8; }
      .cd-name { font-family: var(--font-display); color: var(--color-accent); font-size: 14px; margin: 0 0 6px; }
      .cd-desc { font-size: 11px; color: var(--color-energy); margin-bottom: 12px; }
      .cd-divider { height: 1px; background: var(--color-border-low); margin: 12px 0; }
      .cd-concept-label { font-family: var(--font-display); font-size: 9px; color: var(--color-text-dim); letter-spacing: 1px; margin: 0 0 8px; }
      .cd-concept { font-size: 11px; line-height: 1.7; opacity: 0.9; }
      .cd-link { display: block; margin-top: 12px; color: var(--color-accent); font-family: var(--font-display); font-size: 10px; text-decoration: none; }
      .cd-link:hover { text-decoration: underline; }
      .codex-search { padding: 6px 12px; background: var(--color-base-deep); border: 1px solid var(--color-border-low); color: var(--color-text); font-family: var(--font-display); font-size: 11px; border-radius: 3px; width: 180px; }
      .codex-search::placeholder { color: var(--color-text-dim); }
    </style>
    <div class="codex-header">
      <h2>// CODEX</h2>
      <input class="codex-search" id="codex-search" placeholder="Search..." />
      <button class="codex-back" id="codex-back">← BACK</button>
    </div>
    <div class="codex-tabs">
      <div class="codex-tab active" data-tab="cards">CARDS (${cardIds.filter(isUnlocked).length}/${cardIds.length})</div>
      <div class="codex-tab" data-tab="relics">RELICS (${relicIds.filter(isUnlocked).length}/${relicIds.length})</div>
      <div class="codex-tab" data-tab="enemies">ENEMIES (${enemyIds.filter(isUnlocked).length}/${enemyIds.length})</div>
    </div>
    <div class="codex-grid" id="codex-grid">
      ${renderGrid(cardIds, "card")}
    </div>
    <div class="codex-detail" id="codex-detail">
      <p style="opacity:0.4;font-size:11px;font-family:var(--font-display)">Select a discovered entry to read more.</p>
    </div>
  `;

  // Tab switching
  root.querySelectorAll<HTMLDivElement>(".codex-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      root.querySelectorAll(".codex-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const tabName = tab.dataset.tab as Tab;
      const ids = tabName === "cards" ? cardIds : tabName === "relics" ? relicIds : enemyIds;
      const kind = tabName === "cards" ? "card" : tabName === "relics" ? "relic" : "enemy";
      (root.querySelector("#codex-grid") as HTMLElement).innerHTML = renderGrid(ids, kind as "card" | "relic" | "enemy");
      bindTileClicks();
    });
  });

  // Entry click → detail panel
  function bindTileClicks() {
    root.querySelectorAll<HTMLDivElement>(".codex-tile.unlocked").forEach(tile => {
      tile.addEventListener("click", () => {
        const detail = root.querySelector("#codex-detail") as HTMLElement;
        detail.innerHTML = renderDetail(tile.dataset.entry!);
      });
    });
  }
  bindTileClicks();

  // Search
  root.querySelector<HTMLInputElement>("#codex-search")!.addEventListener("input", (e) => {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    root.querySelectorAll<HTMLDivElement>(".codex-tile").forEach(tile => {
      const name = tile.querySelector(".ct-name")?.textContent?.toLowerCase() ?? "";
      tile.style.display = name.includes(q) || tile.classList.contains("locked") ? "" : "none";
    });
  });

  // Back
  root.querySelector<HTMLButtonElement>("#codex-back")!
    .addEventListener("click", () => dispatch({ type: "CLOSE_CODEX" }));

  return root;
}
```

- [ ] **Step 2: Enable Codex button in `scene-title.ts` + wire in-run Codex from `scene-combat.ts`**

**In `scene-title.ts`:** Change the Codex button from disabled to enabled, and wire click to dispatch GO_TO_CODEX:

Replace:
```ts
      <button data-action="codex" disabled title="Coming in M6">CODEX</button>
```
With:
```ts
      <button data-action="codex">CODEX</button>
```

Add click handler:
```ts
  root.querySelector<HTMLButtonElement>('[data-action="codex"]')!
    .addEventListener("click", () => dispatch({ type: "GO_TO_CODEX", returnScene: "title" }));
```

**In `scene-combat.ts`:** The footer already has a `<span>📖 Codex</span>` text. Change it to a button and wire it:

```ts
// Replace the static span with a button:
<button class="sc-codex-btn" id="sc-codex-btn">📖 Codex</button>
```

Add CSS in the style block:
```css
.sc-codex-btn { background: transparent; border: 0; color: var(--color-accent); font-family: var(--font-display); font-size: 10px; cursor: pointer; padding: 0; }
```

Wire click handler after the end-turn button wiring:
```ts
  root.querySelector<HTMLButtonElement>("#sc-codex-btn")?.addEventListener("click", () =>
    dispatch({ type: "GO_TO_CODEX", returnScene: "map" })
  );
```

- [ ] **Step 3: Update `main.ts` — route codex scene to real renderer**

Replace `case "codex": return renderTitle(s, dispatch);` with:
```ts
    case "codex":  return renderCodex(s, dispatch);
```

Add import: `import { renderCodex } from "./ui/scene-codex";`

- [ ] **Step 4: Run `npm run build` — must pass. Run `npm test` — 137 still pass.**

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/ui/scene-codex.ts slothespire/src/ui/scene-title.ts \
        slothespire/src/main.ts
git commit -m "feat(ui): Codex screen — 3 tabs, search, entry detail, unlock-on-encounter"
```

---

## Task 6: Card upgrade selection UI

**Files:**
- Create: `src/ui/scene-upgrading.ts`
- Modify: `src/engine/actions.ts`
- Modify: `src/engine/reducer.ts`
- Modify: `src/ui/scene-rest.ts`
- Modify: `src/main.ts`
- Test: `tests/upgrade.test.ts`

- [ ] **Step 1: Write failing tests — create `tests/upgrade.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

function atRest() {
  let s = reduce(initialState("rest-test"), { type: "START_RUN" });
  return { ...s, scene: "rest" as const };
}

describe("SHOW_UPGRADE_PICKER", () => {
  it("transitions to 'upgrading' scene", () => {
    const s = atRest();
    const s2 = reduce(s, { type: "SHOW_UPGRADE_PICKER" });
    expect(s2.scene).toBe("upgrading");
  });

  it("does nothing if there are no upgradeable cards", () => {
    let s = atRest();
    s = { ...s, deck: s.deck.map(c => ({ ...c, upgraded: true })) };
    const s2 = reduce(s, { type: "SHOW_UPGRADE_PICKER" });
    expect(s2.scene).toBe("map"); // nothing to upgrade → skip to map
  });
});

describe("CHOOSE_CARD_TO_UPGRADE", () => {
  it("marks the chosen deck card as upgraded and returns to map", () => {
    let s = atRest();
    const card = s.deck.find(c => !c.upgraded)!;
    const s2 = reduce(s, { type: "CHOOSE_CARD_TO_UPGRADE", cardInstanceId: card.instanceId });
    const upgraded = s2.deck.find(c => c.instanceId === card.instanceId)!;
    expect(upgraded.upgraded).toBe(true);
    expect(upgraded.name.endsWith("+")).toBe(true);
    expect(s2.scene).toBe("map");
  });

  it("no-op if card not found in deck", () => {
    const s = atRest();
    const s2 = reduce(s, { type: "CHOOSE_CARD_TO_UPGRADE", cardInstanceId: "not-real" });
    expect(s2).toBe(s);
  });
});
```

- [ ] **Step 2: Run `npm test` — FAIL**

- [ ] **Step 3: Add actions + reducer cases**

In `actions.ts`:
```ts
  | { type: "SHOW_UPGRADE_PICKER" }
  | { type: "CHOOSE_CARD_TO_UPGRADE"; cardInstanceId: string }
```

In `reducer.ts`:
```ts
    case "SHOW_UPGRADE_PICKER": {
      const hasUpgradeable = state.deck.some(c => !c.upgraded);
      if (!hasUpgradeable) return { ...state, scene: "map" };
      return { ...state, scene: "upgrading" };
    }

    case "CHOOSE_CARD_TO_UPGRADE": {
      const idx = state.deck.findIndex(c => c.instanceId === action.cardInstanceId);
      if (idx === -1) return state;
      const upgraded = { ...state.deck[idx], upgraded: true, name: state.deck[idx].name.replace(/\+$/, "") + "+" };
      return {
        ...state,
        scene: "map",
        deck: [...state.deck.slice(0, idx), upgraded, ...state.deck.slice(idx + 1)],
      };
    }
```

(Scene already has `"upgrading"` from Task 4 — no change needed here.)

- [ ] **Step 4: Create `src/ui/scene-upgrading.ts`**

```ts
import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { CARD_DEFS } from "../content/cards";

export function renderUpgrading(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-upgrading";
  const upgradeable = state.deck.filter(c => !c.upgraded && c.type !== "curse");

  const cardsHtml = upgradeable.map(card => {
    const def = CARD_DEFS[card.defId];
    const upgEffects = def?.upgradedEffects ?? def?.upgradedPowerTrigger;
    const preview = upgEffects?.map(e => {
      if (e.kind === "burn") return `Burn ${e.amount}`;
      if (e.kind === "headroom") return `+${e.amount} Headroom`;
      if (e.kind === "draw") return `Draw ${e.amount}`;
      if (e.kind === "restoreBudget") return `Restore ${e.amount}`;
      return "";
    }).filter(Boolean).join(", ") ?? "improved";
    return `
      <div class="upg-card" data-id="${card.instanceId}">
        <div class="uc-cost">${card.cost}</div>
        <div class="uc-name">${card.name} → ${card.name}+</div>
        <div class="uc-type">${card.type}</div>
        <div class="uc-preview">${preview}</div>
      </div>
    `;
  }).join("");

  root.innerHTML = `
    <style>
      .scene-upgrading { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 32px; }
      .scene-upgrading h2 { font-family: var(--font-display); font-size: 24px; color: var(--color-accent); letter-spacing: 3px; margin: 0; }
      .upg-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 700px; }
      .upg-card { padding: 12px 16px; background: var(--color-base-deep); border: 1px solid var(--color-border-low); border-radius: 6px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; min-width: 160px; transition: border-color 0.1s; }
      .upg-card:hover { border-color: var(--color-accent); }
      .uc-cost { font-family: var(--font-display); font-size: 10px; color: var(--color-pop); }
      .uc-name { font-family: var(--font-display); font-size: 12px; color: var(--color-accent); }
      .uc-type { font-size: 9px; color: var(--color-text-dim); text-transform: uppercase; }
      .uc-preview { font-size: 10px; color: var(--color-energy); margin-top: 2px; }
      .upg-cancel { font-family: var(--font-display); font-size: 11px; letter-spacing: 1px; }
    </style>
    <h2>UPGRADE A CARD</h2>
    <div class="upg-grid">${cardsHtml}</div>
    <button class="upg-cancel" id="upg-cancel">CANCEL</button>
  `;

  root.querySelectorAll<HTMLDivElement>(".upg-card").forEach(card => {
    card.addEventListener("click", () =>
      dispatch({ type: "CHOOSE_CARD_TO_UPGRADE", cardInstanceId: card.dataset.id! })
    );
  });

  root.querySelector<HTMLButtonElement>("#upg-cancel")!
    .addEventListener("click", () => dispatch({ type: "GO_TO_MAP" }));

  return root;
}
```

- [ ] **Step 5: Update `scene-rest.ts`**

Change the Upgrade choice to dispatch `SHOW_UPGRADE_PICKER` instead of `CHOOSE_REST_OPTION`:

In `renderRest`, change the upgrade option handler:
```ts
    // Change the upgrade option click to SHOW_UPGRADE_PICKER
    root.querySelectorAll<HTMLDivElement>(".rest-choice:not(.disabled)").forEach(el => {
      el.addEventListener("click", () => {
        if (el.dataset.option === "upgrade") {
          dispatch({ type: "SHOW_UPGRADE_PICKER" });
        } else {
          dispatch({ type: "CHOOSE_REST_OPTION", option: "refresh" });
        }
      });
    });
```

- [ ] **Step 6: Update `main.ts`**

Add import: `import { renderUpgrading } from "./ui/scene-upgrading";`

Add to `sceneFor`:
```ts
    case "upgrading": return renderUpgrading(s, dispatch);
```

- [ ] **Step 7: Run `npm test` — expect **137 + 4 = 141 pass****

- [ ] **Step 8: Commit**

```bash
git add slothespire/src/ui/scene-upgrading.ts slothespire/src/ui/scene-rest.ts \
        slothespire/src/engine/actions.ts slothespire/src/engine/reducer.ts \
        slothespire/src/engine/state.ts slothespire/src/main.ts \
        slothespire/tests/upgrade.test.ts
git commit -m "feat(ui): card upgrade picker — SHOW_UPGRADE_PICKER action, deck selection at rest sites"
```

---

## Task 7: Deploy to GitHub Pages

**Files:**
- Modify: `package.json`
- Create: `scripts/deploy.sh`

- [ ] **Step 1: Install gh-pages**

```bash
cd /Users/max.saltonstall/slothespire && npm install -D gh-pages
```

- [ ] **Step 2: Update `vite.config.ts` to set `base` for GitHub Pages**

```ts
export default defineConfig({
  root: ".",
  base: "/slothespire/",   // ← add this: GitHub Pages repo name
  server: { port: 5173, open: false },
  build: { outDir: "dist", sourcemap: true },
});
```

- [ ] **Step 3: Add deploy script to `package.json`**

```json
    "deploy": "npm run build && npx gh-pages -d dist --dotfiles"
```

- [ ] **Step 4: Add `.gitignore` entry for dist/**

The `dist/` is already in `.gitignore`. Verify it's there; if not, add it.

- [ ] **Step 5: Create `scripts/deploy.sh` (optional helper)**

```bash
#!/usr/bin/env bash
set -e
echo "Building Slothespire..."
npm run build
echo "Deploying to GitHub Pages..."
npx gh-pages -d dist --dotfiles
echo "Deployed! Visit: https://maxsaltonstall.github.io/slothespire/"
```

Make executable: `chmod +x slothespire/scripts/deploy.sh`

- [ ] **Step 6: Run `npm run build` — verify it produces dist/ with correct base path**

```bash
npm run build
# Check that dist/index.html references /slothespire/ paths
head -5 dist/index.html
```

- [ ] **Step 7: Run `npm run deploy` — deploy to GitHub Pages**

```bash
npm run deploy
```

Expected: "Published" message. Visit https://maxsaltonstall.github.io/slothespire/ to verify.

- [ ] **Step 8: Commit**

```bash
git add slothespire/package.json slothespire/package-lock.json \
        slothespire/vite.config.ts slothespire/scripts/deploy.sh
git commit -m "feat: deploy to GitHub Pages — npm run deploy"
```

---

## Task 8: Final smoke test + v1.0.0 tag

- [ ] **Step 1: Run dev server and walk the full game**

Run: `npm run dev`. Open http://localhost:5173.

Verify in sequence:
1. Title screen — NEW RUN, CODEX buttons visible and enabled
2. NEW RUN → Act I map with 7 rows
3. Combat with Flapping Health Check → defeat → reward → pick a new card
4. Navigate to rest → "Upgrade" button → upgrading scene shows all non-upgraded cards → pick one → card shows "+" in future reward/combat
5. Navigate to an event → choices work → back to map
6. Navigate to shop → 3 cards for sale with BUY (90¢), full deck with Remove (75¢) buttons
7. Navigate to elite → defeat Cascading Failure → "RELIC FOUND" screen → accept → relic appears in combat (Synthetic Tests: headroom badge shows +1 each turn)
8. Navigate to boss → The Pager Storm at 85 stability (harder than before) → fight
9. After defeating Act I boss → Act II map appears
10. Act II boss (Total Outage) is at 120 stability
11. RETURN TO TITLE → CODEX button on title → Codex screen with 3 tabs, search, discovered entries populated

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: **141 tests pass**.

- [ ] **Step 3: Run sim — record final win rate**

```bash
npm run sim
```

Record the output. If win rate is still >60%, note it — balance is ongoing, v1 ships with sim data for reference.

- [ ] **Step 4: Update README.md to v1.0.0**

```markdown
# Slothespire

A deckbuilding roguelike where **SLO = HP**, cards are SRE/DevOps practices,
relics are Datadog products, and enemies are incidents. *Slay → SLO. The Spire.*

## Play

🎮 **[Play Slothespire](https://maxsaltonstall.github.io/slothespire/)**

## What is this?

Slothespire teaches DevOps, SRE, and Platform Engineering concepts through
deckbuilding gameplay modeled on Slay the Spire. Every card is a real practice
(Canary Deploy, Circuit Breaker, Blameless Postmortem). Every relic is a
Datadog product (APM Tracing, Watchdog, Live Tail). Every enemy is an incident
or anti-pattern (Memory Leak, Cascading Failure, The Pager Storm).

## Status

**v1.0.0** — Full 2-act run, ~37 unique cards, ~15 relics, 11 enemies,
8 events, Codex screen with educational write-ups, working shop,
card upgrade selection. 141 tests.

## Dev

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run sim      # balance simulation (100 runs)
npm run deploy   # deploy to GitHub Pages
```

## Docs

- Design spec: `docs/superpowers/specs/2026-05-27-slothespire-design.md`
- Plans: `docs/superpowers/plans/`
```

- [ ] **Step 5: Commit + tag**

```bash
git add slothespire/README.md
git commit -m "docs: v1.0.0 README — play link, feature summary"
git tag -a v1.0.0 -m "Slothespire v1.0.0 — SLO the Spire, full 2-act run"
```

---

## Done

At the end of M6:
- `npm test` passes **≥141 tests**.
- `npm run build` is clean.
- `npm run deploy` pushes to https://maxsaltonstall.github.io/slothespire/.
- `npm run sim` reports a win rate (target 30-50% after balance pass).
- **~37 unique cards** with upgrade effects.
- **~15 relics** (5 Datadog products with hooks per relic).
- **11 enemies** routed by floor.
- **Codex screen** with 3 tabs, search, unlock-on-encounter, 20 authored entries.
- **Card upgrade deck picker** at rest sites (player chooses which card to upgrade).
- **v1.0.0 git tag** — shippable, playable, educational.

**What ships after v1:**
- Remaining Codex entries (33 stubs → authored)
- Full 53-card set (add remaining ~16 commons/uncommons)
- Full 20-relic set (add 5 more Datadog products)
- Ascension/difficulty levels
- Daily seeds + leaderboard
- Mobile/touch layout
- Music
