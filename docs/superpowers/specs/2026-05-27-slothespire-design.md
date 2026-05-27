# Slothespire — Design Spec

**Date:** 2026-05-27
**Status:** Approved (brainstorming phase) — ready for implementation planning
**Author:** Max Saltonstall (with Claude)

---

## 1. Vision

**Slothespire** is a web-based deckbuilding roguelike in the Slay-the-Spire mold that teaches DevOps, SRE, and Platform Engineering through play.

The name is the load-bearing pun: **Slay → SLO**. **Service Level Objective**, the core currency of an SRE, is the player's literal hit-point pool. The sloth motif is a fun second layer (sleepy services, slow-moving operators) but the central mechanic is error-budget management.

### 1.1 Core thesis

The game is a direct simulation of error-budget management. Every turn the player asks the same question a real on-call SRE asks: *what's burning my budget right now, what's my headroom, and which practice should I spend my attention on?*

- **Cards** are SRE/DevOps practices (Canary Deploy, Circuit Breaker, Blameless Postmortem, Chaos Engineering).
- **Relics** are Datadog products (APM Tracing, Watchdog, Live Tail) acting as run-long passive buffs.
- **Enemies** are incidents and anti-patterns (Memory Leak, Cron Storm, Cascading Failure).
- **Encounters are lessons.** Each enemy embodies a real production problem with a telegraphed intent; winning rewards picking the right practice for the situation. That's the actual SRE skill we want to build.

### 1.2 Core resource model (SLO vocabulary)

| Concept | Renamed to | Meaning |
|---|---|---|
| HP | **SLO Budget** | Error budget. Starts at 80. Run ends at 0. |
| Damage | **Burn** | What enemies do to your budget. |
| Block | **Headroom** | Per-turn defensive buffer. Reset at end of player turn. |
| Heal | **Window Refresh / Postmortem Learnings** | Restores Budget. Rare, expensive, deliberate. |
| Energy | **Energy** | 3/turn default. Spend on cards. |
| Vulnerable | **Customer-Facing** | +50% Burn taken. Decays. |
| Weak | **Throttled** | −25% Burn dealt. Decays. |
| Strength | **Pressure** | +N Burn per attack. Permanent. |
| Dexterity | **Stability** | +N Headroom per Headroom card. Permanent. |
| Potions | **Hotfixes** | One-shot consumables, 3 slots. |
| Curses | **Tech Debt** | Junk cards permanently in deck. |

Six additional SRE-flavored statuses: **Toil** (−1 Energy next turn), **Flow** (+1 Energy next turn), **Burnout** (−1 draw next turn), **Confidence** (next attack double), **On-Call Fatigue** (lose 2 Budget at end of turn), **Observability** (see N more turns of intent — granted by certain relics/cards).

### 1.3 v1 ship criteria

1. One full run is playable end-to-end: **2 acts** (Act I — Single-Service SLO, Act II — User-Journey SLO), ~30 nodes, 1 character (The On-Call Engineer), 2 boss fights.
2. Combat implements the full StS feature set, retitled to SLO vocabulary.
3. Content: **~53 unique cards, ~20 relics, ~15 standard enemies + 4 elites + 2 bosses, ~8 events, ~10 hotfixes.**
4. **Codex** auto-populates with every card/relic/enemy/event seen, with flavor text + a "Real Concept" write-up + an external docs link.
5. **localStorage** save/resume one active run; pure-roguelike loss model (Codex unlocks persist across runs).
6. **Cyberspace-neon** visual style, all DOM/CSS, single-page Vite app.

### 1.4 Explicit non-goals for v1

- Multiple playable characters (engine designed to allow it later)
- Ascension/difficulty levels
- Daily seeds and leaderboards
- Mobile/touch layouts
- Music (light SFX only)
- Full WCAG accessibility audit (semantic HTML + contrast, no formal pass)
- Datadog brand-approval pipeline (respectful product-name use only)

---

## 2. Player experience — the run loop

### 2.1 Title screen
Four options: **New Run**, **Continue** (if a saved run exists), **Codex**, **Settings**. Logo "SLOTHESPIRE" with subtitle "// SLO the Spire". Build/version stamp bottom-right.

### 2.2 Run start
- Fixed starting deck of 10 cards: 5× **Manual Fix** (1E Attack, Burn 6), 4× **Failover** (1E Skill, Headroom 5), 1× **Page Senior Engineer** (2E Skill, draw 2, gain 1 Energy next turn).
- One starting relic: **Pager** ("When Budget drops below 30%, draw 1 card. Once per combat.").
- Starting Budget: 80. Starting Energy/turn: 3. Hand size: 5.

### 2.3 The map
StS-style branching grid, ~15 nodes per act, single screen showing the whole act with node types visible from the start. Node types:

| Icon | Type | Frequency | Behavior |
|---|---|---|---|
| ⚔ | Combat | most | Standard fight (1–3 enemies) |
| ☠ | Elite | 2–3/act | Harder fight; **guaranteed relic** reward |
| ✝ | Rest (Postmortem) | 2–3/act | Choose: heal 30% Budget OR upgrade one card OR (rare variant) remove one card |
| ⚙ | Shop (Build Server) | 1–2/act | Buy cards / relics / hotfixes; card-removal service for 75 credits |
| ? | Event (Incident) | 2–3/act | Text scenario with 2–3 choices and tradeoffs |
| 🎁 | Treasure | 1/act | One free relic, no fight |
| 👑 | Boss | 1/act | Bespoke multi-phase fight |

Paths diverge and reconverge before the boss. Current position pulses; visited nodes dim.

### 2.4 Combat turn flow
1. **Enemy intent updates.** Each enemy displays an icon + number above its sprite indicating its planned action.
2. **Player turn.** Draw to hand size. Spend Energy on cards. Cards animate hand → play zone. Cards can be queued and undone before End Turn (undo behavior is on by default in v1; killed if playtest shows abuse).
3. **Enemy turn.** Each enemy resolves its telegraphed action in board order. Headroom consumed first; overflow Burn hits Budget.
4. **End of round.** Headroom resets to 0. Discard remaining hand (except Powers and Exhausted cards). Statuses tick. Loop.

### 2.5 Reward, rest, shop, event
- **Combat reward:** gold (credits) + pick 1 of 3 cards (or Skip). Sometimes a Hotfix or relic (always on elite / boss / treasure).
- **Rest (Postmortem):** two choices per visit; one rare variant offers card removal as a third option.
- **Shop (Build Server):** 3 cards + 2 relics + 3 hotfixes + remove-card service. Prices scale with act.
- **Event (Incident):** 1 text screen with 2–3 choices, each with a tradeoff (e.g., "gain a rare card OR avoid a Tech Debt curse").

### 2.6 Loss & victory
- **Loss:** Budget hits 0 → post-mortem flavor screen ("Service degraded. Customers noticed. Here's what we learned…") → run-summary stats. Saved run cleared; Codex unlocks persist.
- **Victory:** beat Act II boss → run-summary stats with success cinematic → "Start New Run."

### 2.7 Codex (always available)
Reachable from title and in-run pause menu. Three tabs (Cards / Relics / Enemies). Search + filter. Locked entries are grayed silhouettes. See §8 for entry structure.

---

## 3. Architecture

### 3.1 Top-level
- **Static SPA.** Single-page Vite app, TypeScript everywhere. No backend. Settings, Codex unlocks, and active-run state in `localStorage`.
- **No framework** — plain TS view layer. (Considered React; rejected for v1.)
- **No build-time content pipeline** beyond Vite's static asset handling.

### 3.2 State model — immutable reducer
A single `GameState` root, mutated only through a reducer.

```ts
type GameState = {
  meta: { runId: string; seed: string; rngCursor: number; startedAt: number; };
  player: {
    budget: number; maxBudget: number;
    energy: number; energyPerTurn: number;
    hand: Card[]; draw: Card[]; discard: Card[]; exhaust: Card[];
    statuses: StatusMap;
    relics: RelicId[];
    hotfixes: HotfixId[];
  };
  combat?: {
    enemies: Enemy[];
    intentByEnemy: Record<string, Intent>;
    turn: number;
    phase: "player" | "enemy" | "transitioning";
  };
  map: {
    act: 1 | 2;
    nodes: Node[][];
    currentNodeId: string | null;
    visitedNodeIds: string[];     // serialized as array, not Set
  };
  deck: Card[];                    // master deck owned this run
  credits: number;
  scene: "title" | "map" | "combat" | "reward" | "shop" | "rest" | "event" | "codex" | "won" | "lost";
  history: GameEvent[];            // turn-by-turn record for "what happened" panel
};

type Action =
  | { type: "PLAY_CARD"; cardInstanceId: string; targetId?: string }
  | { type: "USE_HOTFIX"; slot: 0 | 1 | 2; targetId?: string }
  | { type: "END_TURN" }
  | { type: "CHOOSE_MAP_NODE"; nodeId: string }
  | { type: "PICK_REWARD_CARD"; cardId: string | null }
  | { type: "PICK_REWARD_RELIC"; relicId: string }
  | { type: "CHOOSE_REST_OPTION"; option: "refresh" | "upgrade" | "remove" }
  | { type: "EVENT_CHOICE"; choiceIndex: number }
  | { type: "SHOP_BUY"; itemKind: "card" | "relic" | "hotfix" | "remove"; itemId: string }
  | { type: "START_RUN" }
  | { type: "LOAD_RUN"; state: GameState };

declare function reduce(state: GameState, action: Action): GameState;
```

All mutations flow through `reduce`. No other function modifies state.

### 3.3 Card and relic effects — hybrid authoring
Effects are pure functions: `(ctx: EffectCtx) => GameState`.

- **~80% of cards** are authored declaratively as a JSON-like list of effect primitives (vocabulary of ~25):

```ts
{
  id: "canary_deploy", name: "Canary Deploy", type: "attack",
  rarity: "common", cost: 1,
  effects: [
    { kind: "burn", amount: 5, target: "single" },
    { kind: "draw", amount: 1 }
  ],
  flavor: "Ship a little, learn a lot.",
}
```

- **~20% of cards** (the unique ones) escape into a TypeScript function returning a new `GameState`:

```ts
{
  id: "chaos_engineering",
  name: "Chaos Engineering",
  rarity: "rare", cost: 2, type: "skill",
  effect: (ctx) => {
    const afterApply = applyToAll(ctx, "customer_facing", 3);
    return burnSelf({ ...ctx, state: afterApply }, ctx.sourceId, 5);
  },
}
```

Relics use the same model. Relics subscribe to a fixed set of named hooks:
`onTurnStart`, `onTurnEnd`, `onCardPlayed`, `onDamageTaken`, `onEnemyDeath`, `onCombatStart`, `onCombatEnd`, `onRest`, `onShop`. Hook order is defined and deterministic.

### 3.4 RNG
Single seeded RNG (`mulberry32`) in `state.meta`. Every randomized event advances `rngCursor`. Wins us:
- Deterministic replays
- Debuggable bug reports ("seed X turn Y")
- v2 daily-seed feature with zero engine work

### 3.5 Rendering
DOM/CSS. Tiny view layer: `mount(rootEl, render: (s: GameState) => void)` pattern with focused DOM-diff helpers per scene (`renderHand`, `renderEnemies`, `renderMap`). CSS transitions handle card-flying, glow, damage flash.

### 3.6 Save model
- `localStorage["slothespire:run"]` — full serialized `GameState`. Written after every reducer call at a save-worthy boundary (turn end, scene change, map node entered).
- `localStorage["slothespire:codex"]` — array of unlocked entry IDs. **Never cleared on loss.**
- `localStorage["slothespire:settings"]` — preferences (SFX volume, undo toggle).

### 3.7 File structure

```
slothespire/
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts                      # boot, scene router
│   ├── engine/
│   │   ├── state.ts                 # GameState types + initial state
│   │   ├── reducer.ts               # the single reducer
│   │   ├── actions.ts               # action types
│   │   ├── effects.ts               # ~25 effect primitives
│   │   ├── triggers.ts              # relic hook dispatch
│   │   ├── rng.ts                   # seeded RNG
│   │   ├── combat.ts                # turn flow, intent resolution
│   │   ├── map.ts                   # act-map generation
│   │   ├── rewards.ts               # reward generation
│   │   ├── save.ts                  # localStorage serialize/load
│   │   └── codex.ts                 # codex unlock tracking
│   ├── content/
│   │   ├── cards.ts                 # all cards
│   │   ├── relics.ts                # all relics (Datadog products)
│   │   ├── enemies.ts               # all enemies + bosses + elites
│   │   ├── events.ts                # incident events
│   │   ├── hotfixes.ts              # potions
│   │   └── codex-entries.ts         # long-form "Real Concept" text + docs links
│   ├── ui/
│   │   ├── scene-title.ts
│   │   ├── scene-map.ts
│   │   ├── scene-combat.ts
│   │   ├── scene-reward.ts
│   │   ├── scene-shop.ts
│   │   ├── scene-rest.ts
│   │   ├── scene-event.ts
│   │   ├── scene-codex.ts
│   │   ├── scene-end.ts             # won / lost
│   │   ├── components/              # card, intent badge, status pill, tooltip
│   │   └── theme.css                # cyberspace-neon variables + base
│   └── lib/
│       └── dom.ts                   # tiny DOM helpers
├── tests/
│   ├── effects.test.ts              # all effect primitives, deterministic
│   ├── cards.test.ts                # snapshot test per card vs known state
│   ├── relics.test.ts               # relic triggers fire correctly
│   ├── combat-flow.test.ts          # full turn sequences
│   └── balance.test.ts              # sim runner
├── docs/
│   └── superpowers/specs/           # this spec lives here
└── README.md
```

---

## 4. Combat mechanics (reference)

### 4.1 Resources

| Resource | Default | Notes |
|---|---|---|
| Budget | 80 (max) | Loss at 0. |
| Energy | 3/turn | Cards cost 0–3 (some cost X = spend all). |
| Hand size | 5 | Drawn at start of each player turn. |
| Headroom | 0 at turn start | Reset at end of player turn (unless modifier). |
| Hotfix slots | 3 | Acquired from combat reward, shop, events. |

### 4.2 Card types

| Type | Behavior |
|---|---|
| Attack | Deals Burn. Goes to discard after play. |
| Skill | Utility. Goes to discard after play. |
| Power | Persistent in-combat buff. Stays in play, doesn't discard. |
| Status | Junk inserted by enemies; unplayable, self-clears at end of turn. |
| Curse | Junk added to deck permanently; unplayable. |

### 4.3 Statuses (10 total)

Reskinned StS analogues (4):
- **Customer-Facing** — target takes +50% Burn from attacks. Decays 1/turn.
- **Throttled** — target deals −25% Burn. Decays 1/turn.
- **Pressure** — +N Burn per attack. Permanent unless removed.
- **Stability** — +N Headroom per Headroom card. Permanent unless removed.

New SRE-themed (6):
- **Toil** — at start of your turn, lose 1 Energy. Decays 1/turn.
- **Flow** — at start of your turn, gain 1 Energy. Decays 1/turn.
- **Burnout** — −1 card drawn next turn. One-shot.
- **Confidence** — next attack deals double. One-shot.
- **On-Call Fatigue** — at end of turn, lose 2 Budget. Decays 1/turn.
- **Observability** — see N more turns of enemy intent. Granted by certain relics (e.g., APM Tracing) and a small number of cards. Permanent for the combat.

### 4.4 Intent telegraphs (visual vocabulary)

Same icon set on cards and enemy intents so the player learns one visual language:

| Icon | Color | Meaning |
|---|---|---|
| ⚔ | red | Burn (damage to Budget) |
| 🛡 | cyan | Headroom (enemy self-block) |
| ⬆ | amber | Buff (positive status on self) |
| ⬇ | magenta | Debuff (negative status on player) |
| ✦ | pale | Multi-effect or special |
| ? | gray | Unknown (revealed by APM Tracing relic) |

Intent badges float **above** the enemy sprite with a downward-pointing stem, distinctly non-card visual.

### 4.5 Enemy turn resolution
All enemies act in board order. Each enemy applies its intent fully before the next enemy resolves. Burn passes through Headroom; overflow hits Budget. Statuses tick at end of round (both sides); intent re-rolls; next round begins.

### 4.6 Hotfixes (potions)
One-shot consumables, 0 Energy, usable any time during your turn. Up to 3 slots.

| Hotfix | Effect |
|---|---|
| Rollback | Deal 20 Burn (single target) |
| Failover | Gain 25 Headroom |
| Postmortem | Restore 20 Budget |
| Runbook | Draw 3 cards |
| Caffeine | Gain 2 Energy this turn |
| Escalation | Apply Customer-Facing to all enemies |
| Hotpatch | Exhaust your hand, draw 5 new |
| Status-Page | Skip enemy turn |
| Pair | Next card costs 0 |
| Logs Dump | Reveal all hidden intent for this combat |

### 4.7 Exhaust
Some cards have **Exhaust** keyword: leave play permanently for this combat (don't reshuffle from discard). Enables powerful one-shots (e.g., "Page the CEO" — Burn 30, Exhaust) and curse-removal cards ("Refactor" — exhaust a card from your hand).

### 4.8 Card upgrades
Every non-curse card has a `+` variant. Rest sites are the main upgrade source. A handful of cards (high-energy attacks) can be upgraded multiple times.

### 4.9 Bosses
Multi-phase. Phase transitions at fixed % thresholds of the boss's Burn-pool. The player sees only a "stability bar" — internal HP/Burn-pool is the implementation detail.

---

## 5. Content scope

### 5.1 Cards

Total **unique** cards in v1: ~53 (3 starter + 20 common + 20 uncommon + 10 rare). The starting deck contains 10 cards but only 3 unique designs (with duplicates).

| Rarity | Unique cards | Notes |
|---|---|---|
| Starter | 3 unique (10 in starting deck) | 5× Manual Fix, 4× Failover, 1× Page Senior Engineer |
| Common | 20 | Single-effect workhorses |
| Uncommon | 20 | Two-effect / conditional |
| Rare | 10 | Powers + high-impact one-shots |

Plus 4 curses (Tech Debt, Phantom Read, Stale Doc, Yak Shave) and 2 status cards enemies insert (Distraction, Wake-Up Call) — these are not in the rewardable card pool.

**Concrete card examples:**

| Name | Rarity | Cost | Type | Effect | Flavor |
|---|---|---|---|---|---|
| Canary Deploy | Common | 1 | Attack | Burn 5; Draw 1 | "Ship a little, learn a lot." |
| Circuit Breaker | Common | 1 | Skill | +8 Headroom | "Stop the bleeding before you debug it." |
| Blameless Postmortem | Uncommon | 2 | Skill (Exhaust) | Restore 12 Budget | "The system failed, not the person." |
| Auto-Scaling | Uncommon | 1 | Power | +4 Headroom at end of turn | "Demand goes up. Capacity goes up." |
| Chaos Engineering | Rare | 2 | Skill | Apply 3 Customer-Facing to ALL; take 5 Burn | "Break it on purpose so it doesn't break you on Friday." |

### 5.2 Relics (~20)

Rule: every non-starter relic represents a Datadog product. The starter relic (**Pager**) is intentionally generic — it represents the universal on-call rotation concept, so the Codex entry for Pager links to neutral on-call references (Google SRE book, PagerDuty/Atlassian on-call guides) rather than Datadog docs. This keeps the entry-point relic platform-agnostic and the Datadog-branded relics start at the first reward.

| Rarity | Count |
|---|---|
| Starter | 1 (Pager — generic) |
| Common | 10 (Datadog products) |
| Uncommon | 5 (Datadog products) |
| Rare | 4 (Datadog products) |

**The v1 list:**

| Tier | Relic (Datadog product) | Effect |
|---|---|---|
| Starter | Pager | When Budget drops below 30%, draw 1 card. Once per combat. |
| Common | APM Tracing | See intent +1 turn ahead. |
| Common | Live Tail | Start combat with +1 card. |
| Common | Watchdog | Apply Customer-Facing to highest-Burn enemy on combat start. |
| Common | Synthetic Tests | Gain 1 Headroom at turn start. |
| Common | Error Tracking | First 10+ Burn taken in a turn → source enemy becomes Customer-Facing. |
| Common | Service Catalog | Turn-1 intent is never Unknown. |
| Common | Continuous Profiler | Every 3rd Attack deals +2 Burn. |
| Common | Notebooks | Once per combat, temporarily upgrade a card in hand. |
| Common | Dashboards | See all enemy status details, no tooltip needed. |
| Common | Incident Management | When Budget would drop to 0, restore 25 instead. Once per run. |
| Uncommon | Database Monitoring | First DB-tier enemy each act has starting Burn-pool halved. |
| Uncommon | Network Performance Monitoring | +5 Headroom per relic owned at combat start. |
| Uncommon | Cloud Cost Management | Shops offer +25% items (wider selection). |
| Uncommon | Workflow Automation | End of turn: if 4+ cards played, gain 1 Hotfix slot for combat. |
| Uncommon | Sensitive Data Scanner | End of combat: scan reward for hidden bonus credits. |
| Rare | RUM Session Replay | Every 5 turns, replay last turn's draw for free. |
| Rare | LLM Observability | Start each combat with a "predict" Hotfix (show next 3 enemy actions). |
| Rare | Audit Trail | Choose 1 of 3 starting cards added to combat. |
| Rare | Bits the Dog | Restore 5% max Budget at combat start (capped). |

### 5.3 Enemies / elites / bosses

| Act | Standard (8 / 7) | Elites (2 each) | Boss |
|---|---|---|---|
| **I — Single-Service SLO** | Flapping Health Check, Memory Leak, Cron Storm, Zombie Process, Stale Cache, Misconfigured TLS, Noisy Neighbor, Phantom Read | Cascading Failure, Thundering Herd | **The Pager Storm** — multi-phase; teaches alert fatigue |
| **II — User-Journey SLO** | Cross-Service Latency, Deadlock, Data Skew, Backpressure Burst, Replication Lag, Silent Data Corruption, Retry Storm | Split-Brain Cluster, Schema Migration Beast | **Total Outage** — phase 2 teaches graceful degradation |

### 5.4 Events (~8 total)
The Untested Migration, Forgotten Cron, Heroic Engineer, Old Status Page, Vendor Outage, On-Call Handoff, Refactor Time, Mystery Box Microservice. Each: 1 screen of text, 2–3 choices with tradeoffs.

### 5.5 Hotfixes (~10)
See §4.6.

### 5.6 Codex entries (~98)
- All unique cards (~53), relics (~20), enemies + elites + bosses (~17), events (~8).
- Hotfixes are **not** in the Codex in v1 — their effect text on the item itself is sufficient.
- Per entry: in-game stats, flavor (1 line), **The Real Concept** (~80–150 words), optional docs link.

---

## 6. Visual & UI

### 6.1 Palette and typography
- Base: deep navy `#0a0e27`
- Accent: neon cyan `#00ffd1`
- Pop: magenta `#ff00aa`
- Body text: parchment warm-white `#f4e8c1`
- Danger: red-orange `#ff4a4a`
- Energy: amber gradient (`#ffd34d` → `#ff8800`)
- Display font: monospaced sans (JetBrains Mono / Space Mono)
- Body font: humanist sans (Inter or system stack)
- Glow via `box-shadow` and `text-shadow`; subtle scanline overlay on full-screen panels

### 6.2 Combat layout
- **Top bar:** breadcrumbs ("Act I · Single-Service SLO · Floor 4") + turn counter
- **Left rail:** Draw / Discard / Exhaust pile counters + 3 Hotfix slots
- **Center top:** enemies, each with **intent badge floating above the sprite**, name, stability bar, statuses below
- **Center middle:** play area (cards animate here)
- **Center bottom:** hand of cards
- **Right rail:** SLO Budget bar (red→amber gradient), Headroom badge, player statuses
- **Bottom-right action cluster (adjacent to hand):** Energy orb + End Turn button
- **Bottom bar:** Codex, Pause, RNG seed (small)

### 6.3 Other scenes
- **Title:** centered logo, 4 large buttons, version stamp
- **Map:** vertical layout, current node at bottom, boss at top, paths as thin neon lines
- **Reward:** modal over dimmed combat, 3 card choices + Skip
- **Rest:** cyberpunk campfire, 2 big buttons (3 for the rare remove variant)
- **Shop:** grid (cards top, relics middle, hotfixes bottom, remove service sidebar)
- **Event:** centered text card, 2–3 stacked choice buttons
- **Codex:** 3-tab layout with grid of entries; locked = grayed silhouettes
- **End:** run-summary stats + flavor narrative

---

## 7. Educational layer

The lesson lives in three places, layered:

### 7.1 Flavor (passive exposure)
Every card/relic/enemy has a 1-line flavor (≤80 chars). Passes the player's eyes during normal play.

### 7.2 Encounters as designed scenarios (active learning)
Each enemy embodies a real production problem; intent telegraph teaches the pattern; correct response is a card/relic that addresses it. Examples:

- **Memory Leak** stacks Pressure each turn → teaches *don't ignore growth; kill fast or apply Throttled.*
- **Cron Storm** is many small enemies → teaches *match tool to scale; AoE or status-all is the right answer.*
- **Cross-Service Latency** scales Burn with cards played → teaches *fewer, more impactful actions.*
- **Boss "The Pager Storm"** flips intent shape at 50% → teaches *alert fatigue; triage what NOT to react to.*
- **Boss "Total Outage"** telegraphs an un-soakable 60+ Burn → teaches *graceful degradation; reduce scope of disaster.*

### 7.3 Codex (deep reference)
Each entry:

```
NAME                                  RARITY
Cost · Type
─────────────────────────────────────
In-game effect (one line)

"Flavor text (one line)."
─────────────────────────────────────
THE REAL CONCEPT
80–150 words: what it is, when to use,
trade-offs, SRE intuition.
─────────────────────────────────────
↗ Learn more: <link>
```

**Docs link policy:**
- When the relic *is* a Datadog product → link to `docs.datadoghq.com/...`
- For general SRE concepts → link to neutral primary sources (Google SRE book chapters, RFCs, Wikipedia) so the project doesn't feel like an ad.

**Unlock model:** First encounter (in hand, in reward, in shop, in combat for enemies) unlocks the Codex entry permanently in `localStorage["slothespire:codex"]`. Locked entries appear as grayed silhouettes with name + "Not yet encountered."

No tutorial popups in v1. The scenarios *are* the curriculum.

---

## 8. Build sequence (milestones)

Ten milestones, each producing a demoable artifact.

| # | Milestone | Demoable at end | Effort |
|---|---|---|---|
| M1 | **Walking skeleton** | `npm run dev`; title; New Run → stub combat with one card and one enemy. Reducer + RNG + save/load infra live but empty. | 1–2 days |
| M2 | **Core combat loop** | Real turn loop: draw, spend energy, play cards, end turn → enemy resolves intent. Win/lose. 5 cards, 1 enemy. | 3–5 days |
| M3 | **Combat depth** | All four piles. All 10 statuses. Powers persist. Curses behave. Hotfix slots functional with 2 examples. | 3–5 days |
| M4 | **Map + scene router** | Act I map from seed; node picking; all node types route to a working (minimal) scene. Boss → Run Won stub. | 4–6 days |
| M5 | **Act I content complete** | ~23 unique cards (3 starter + 20 common), 10 relics, 8 enemies + 2 elites + Pager Storm boss, 4 events. Act I genuinely playable end-to-end. | 1 week |
| M6 | **Codex + save/resume** | Codex with 3 tabs, search, filter, unlock-on-first-encounter. Mid-run save persists across refresh. Run-summary screens. | 3–4 days |
| M7 | **Act II + remaining content** | Act II map, 7 enemies + 2 elites + Total Outage boss, 4 more events. Remaining ~30 unique cards (uncommons + rares) + 10 relics (uncommons + rares) + all hotfixes. Full 2-act run. | 1 week |
| M8 | **Balance pass** | `npm run sim` → 1000 deterministic runs with heuristic AI → JSON report. Target win rate 25–35% for informed AI. Tune until on target. | 3–5 days |
| M9 | **Polish** | Card-fly animations, damage flash, victory chime, fade transitions, 10–15 SFX, settings panel (SFX volume, undo on/off), keyboard shortcuts (1–5 hand, Space end turn, Esc pause). | 3–5 days |
| M10 | **Playtest & ship** | 5+ playtest sessions; bug triage into v1 / v1.1; balance fixes from human feedback; README; static deploy. | 2–3 weeks elapsed |

**Total focused effort:** ~6–8 working weeks. **Elapsed time:** ~9–11 weeks including M10 playtest cycles.

**Dependencies:** M1→M2→M3→M4 sequential. M5 blocks M6 and M7. M8 cannot start until M7. M9 elements can land partway through M5–M7.

### 8.1 What's intentionally NOT in this plan
- Datadog brand-approval gate (separate post-v1 workstream)
- CI/CD beyond local `npm test`
- Automated visual regression
- Playwright e2e (relying on M10 human playtests)

---

## 9. Testing strategy

Vitest (Vite-native). Three tiers:

1. **Effect-level (`tests/effects.test.ts`)** — every effect primitive has 2–3 unit tests with hand-built minimal states. Fast, deterministic, catches engine regressions.
2. **Card / relic level (`tests/cards.test.ts`, `tests/relics.test.ts`)** — every authored card has at least one test asserting "from state S, playing this card produces state S' with these specific changes." Snapshot-style.
3. **Flow level (`tests/combat-flow.test.ts`)** — scripted multi-turn combat scenarios (representative, not exhaustive).

**Balance simulator (`npm run sim`)** — heuristic-AI plays 1000 random runs through fixed seeds, produces JSON report:
- Overall win rate
- Win rate by floor
- Card pick rates
- Avg run length
- Distribution of cause-of-death (which enemy/intent type killed the player)

Tunes content until target win rate (25–35% informed-AI) holds.

**No e2e/Playwright in v1.** Manual playtest checklist covers UI-level flows; the unit tier covers engine behavior.

---

## 10. Open questions / risks

| Risk | Mitigation |
|---|---|
| 6–8 week effort estimate is optimistic; balance + polish always slip | M10 is a deliberate buffer; cut content (drop to 50 cards / 16 relics) if M5–M7 slip > 1 week. |
| 10 statuses is enough variety, or do we need more? | Defer. Author content first; add statuses only when a card/relic concretely demands one. |
| Undo within your turn — helpful for learners or trivializes the game? | Default on; settings-togglable; revisit after M10 playtest. |
| Datadog product names without brand approval | Use product *names* respectfully (no logos, no marks, no trademark symbols in v1). Brand approval = separate post-v1 workstream. |
| ~98 Codex entries is a lot of writing | Author alongside content (not as a separate phase). Each entry is ~120 words; total ~12k words across 6–8 weeks = manageable. |
| `localStorage` corruption (mid-save crash) | Wrap loads in try/catch; on parse failure, prompt user "restore? or start fresh?" |
| Card balance edge cases the sim misses (e.g., infinite combos) | Sim has a per-combat turn cap (default 50) that flags suspicious decks for human review. |

---

## 11. Non-goals reaffirmed

For clarity, none of these are v1:
- Multiple playable characters
- Ascension/difficulty levels
- Daily seeds, leaderboards, sharing
- Mobile / touch / responsive layouts
- Music
- Full WCAG accessibility pass
- Backend / accounts / cloud save
- Localization
- Multiplayer or async-versus

The architecture (reducer, deterministic seeding, character-agnostic content modules) is built so these can be added later without rewriting the engine.

---

## 12. Approval

Brainstorming phase complete. Spec ready for implementation planning (`writing-plans` skill next).
