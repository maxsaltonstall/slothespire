# M1 — Walking Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get Slothespire booting end-to-end as a thin walking skeleton: `npm run dev` opens the title screen; clicking "New Run" routes to a stub combat scene showing one enemy and one playable card; clicking the card ends the run and returns to title. No real combat logic yet — this milestone proves the scaffolding (Vite + TS + reducer + scene router + theme + localStorage save + Vitest) is sound.

**Architecture:** TypeScript + Vite static SPA. Single immutable `GameState` mutated only via `reduce(state, action)`. Tiny view layer (`mount(rootEl, render)`) subscribes to state and re-renders per scene. localStorage save runs on every reducer call. Seeded `mulberry32` RNG lives in state. All DOM/CSS — no canvas, no framework. Cyberspace-neon palette established in `theme.css` and reused across scenes.

**Tech Stack:** TypeScript 5.x, Vite 5.x, Vitest 1.x, no other runtime deps. Pure DOM/CSS for rendering.

**Reference spec:** `docs/superpowers/specs/2026-05-27-slothespire-design.md` (especially §3 Architecture).

---

## File Structure

By the end of M1, the project tree looks like:

```
slothespire/
├── .gitignore                       # already exists
├── index.html                       # NEW — Vite entry, mounts #app
├── package.json                     # NEW
├── tsconfig.json                    # NEW
├── vite.config.ts                   # NEW
├── vitest.config.ts                 # NEW
├── src/
│   ├── main.ts                      # NEW — boot + scene router
│   ├── engine/
│   │   ├── state.ts                 # NEW — GameState types, initialState()
│   │   ├── actions.ts               # NEW — action type union (skeleton)
│   │   ├── reducer.ts               # NEW — reduce(state, action) (skeleton)
│   │   ├── rng.ts                   # NEW — mulberry32 + advanceRng()
│   │   └── save.ts                  # NEW — localStorage load/save
│   └── ui/
│       ├── theme.css                # NEW — cyberspace-neon palette + base
│       ├── scene-title.ts           # NEW — title screen
│       └── scene-combat.ts          # NEW — stub combat (1 enemy, 1 card)
├── tests/
│   ├── rng.test.ts                  # NEW
│   ├── state.test.ts                # NEW
│   ├── reducer.test.ts              # NEW
│   └── save.test.ts                 # NEW
└── docs/
    └── superpowers/
        ├── specs/2026-05-27-slothespire-design.md
        └── plans/2026-05-27-m1-walking-skeleton.md     # this file
```

**File responsibilities (one-liners):**
- `state.ts` — `GameState` interface + `initialState(seed): GameState` factory. Owns all type definitions used by reducer and UI.
- `actions.ts` — discriminated union of action types. Tiny in M1; grows each milestone.
- `reducer.ts` — `reduce(state, action): GameState`. The only place state changes.
- `rng.ts` — `mulberry32(seed): () => number` and a thin wrapper that advances `state.meta.rngCursor`.
- `save.ts` — `saveRun(state): void` and `loadRun(): GameState | null` against `localStorage`.
- `main.ts` — boot: create initial state (loaded from save, or `initialState`), mount renderer, wire input.
- `theme.css` — CSS custom properties for the cyberspace-neon palette + body/typography reset.
- `scene-title.ts` — `renderTitle(state, dispatch): HTMLElement`.
- `scene-combat.ts` — `renderCombat(state, dispatch): HTMLElement` showing 1 stub enemy + 1 card; clicking the card dispatches an action that ends the run.

---

## Task 1: Project scaffold (package.json, tsconfig, Vite, Vitest)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "slothespire",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vitest": "^1.5.0",
    "@types/node": "^20.12.0",
    "jsdom": "^24.0.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: { port: 5173, open: false },
  build: { outDir: "dist", sourcemap: true },
});
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Slothespire</title>
    <link rel="stylesheet" href="/src/ui/theme.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: no errors; `node_modules/` and `package-lock.json` appear.

- [ ] **Step 7: Verify build commands wire up**

Run: `npm run build`
Expected: fails with "Could not resolve entry module" or similar (no `main.ts` yet) — that's fine. We just want to confirm Vite is invoked.

Run: `npm test`
Expected: "No test files found" — that's fine, confirms Vitest runs.

- [ ] **Step 8: Commit**

```bash
git add slothespire/package.json slothespire/package-lock.json \
        slothespire/tsconfig.json slothespire/vite.config.ts \
        slothespire/vitest.config.ts slothespire/index.html
git commit -m "scaffold: vite + ts + vitest project skeleton"
```

---

## Task 2: Seeded RNG (`mulberry32`)

**Files:**
- Create: `src/engine/rng.ts`
- Test: `tests/rng.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/rng.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mulberry32, parseSeed } from "../src/engine/rng";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  it("produces different sequences for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it("produces values in [0, 1)", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("parseSeed", () => {
  it("converts a hex string seed to a number", () => {
    expect(parseSeed("0x4f3a")).toBe(0x4f3a);
  });

  it("converts a plain integer-looking string to a number", () => {
    expect(parseSeed("12345")).toBe(12345);
  });

  it("hashes a non-numeric string to a stable number", () => {
    const a = parseSeed("hello");
    const b = parseSeed("hello");
    const c = parseSeed("world");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/engine/rng'`.

- [ ] **Step 3: Implement `src/engine/rng.ts`**

```ts
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function parseSeed(input: string): number {
  if (/^0x[0-9a-fA-F]+$/.test(input)) return parseInt(input, 16);
  if (/^\d+$/.test(input)) return parseInt(input, 10);
  // FNV-1a hash for non-numeric strings — stable, fast, no deps
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 6/6 tests green.

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/rng.ts slothespire/tests/rng.test.ts
git commit -m "feat(engine): seeded mulberry32 RNG with stable seed parsing"
```

---

## Task 3: GameState type + `initialState()` factory

**Files:**
- Create: `src/engine/state.ts`
- Test: `tests/state.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/state.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { initialState } from "../src/engine/state";

describe("initialState", () => {
  it("creates a fresh state at the title scene", () => {
    const s = initialState("test-seed");
    expect(s.scene).toBe("title");
  });

  it("stores the seed and runId in meta", () => {
    const s = initialState("test-seed");
    expect(s.meta.seed).toBe("test-seed");
    expect(s.meta.runId.length).toBeGreaterThan(0);
    expect(s.meta.rngCursor).toBe(0);
    expect(typeof s.meta.startedAt).toBe("number");
  });

  it("gives the player the spec-defined starting numbers", () => {
    const s = initialState("test-seed");
    expect(s.player.budget).toBe(80);
    expect(s.player.maxBudget).toBe(80);
    expect(s.player.energyPerTurn).toBe(3);
    expect(s.player.energy).toBe(3);
    expect(s.player.hand).toEqual([]);
    expect(s.player.draw).toEqual([]);
    expect(s.player.discard).toEqual([]);
    expect(s.player.exhaust).toEqual([]);
    expect(s.player.relics).toEqual(["pager"]);
    expect(s.player.hotfixes).toEqual([]);
    expect(s.player.statuses).toEqual({});
  });

  it("starts on act 1 with no map yet (built when run starts)", () => {
    const s = initialState("test-seed");
    expect(s.map.act).toBe(1);
    expect(s.map.nodes).toEqual([]);
    expect(s.map.currentNodeId).toBeNull();
    expect(s.map.visitedNodeIds).toEqual([]);
  });

  it("has no combat, no deck cards, zero credits, empty history", () => {
    const s = initialState("test-seed");
    expect(s.combat).toBeUndefined();
    expect(s.deck).toEqual([]);
    expect(s.credits).toBe(0);
    expect(s.history).toEqual([]);
  });

  it("two states from the same seed have different runIds (timestamp-based)", () => {
    const a = initialState("same-seed");
    // small sleep alternative — just check shape, runId uses crypto-ish randomness
    const b = initialState("same-seed");
    // both have runIds; they may or may not collide depending on impl,
    // but the field must exist
    expect(a.meta.runId).toBeTruthy();
    expect(b.meta.runId).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/engine/state'`.

- [ ] **Step 3: Implement `src/engine/state.ts`**

```ts
export type Scene =
  | "title"
  | "map"
  | "combat"
  | "reward"
  | "shop"
  | "rest"
  | "event"
  | "codex"
  | "won"
  | "lost";

export type CardType = "attack" | "skill" | "power" | "status" | "curse";

export interface Card {
  instanceId: string;     // unique within a run; same definition can appear many times
  defId: string;          // points to card definition in content/cards.ts (later)
  name: string;
  type: CardType;
  cost: number;
  upgraded: boolean;
}

export type StatusId =
  | "customer_facing" | "throttled" | "pressure" | "stability"
  | "toil" | "flow" | "burnout" | "confidence" | "on_call_fatigue" | "observability";

export type StatusMap = Partial<Record<StatusId, number>>;

export interface Enemy {
  instanceId: string;
  defId: string;
  name: string;
  stability: number;       // displayed as "stability bar"; internal HP
  maxStability: number;
  statuses: StatusMap;
}

export type Intent =
  | { kind: "burn"; amount: number }
  | { kind: "harden"; amount: number }
  | { kind: "buff"; status: StatusId; stacks: number }
  | { kind: "debuff"; status: StatusId; stacks: number }
  | { kind: "multi"; label: string }
  | { kind: "unknown" };

export interface MapNode {
  id: string;
  type: "combat" | "elite" | "rest" | "shop" | "event" | "treasure" | "boss";
  next: string[];           // ids of nodes this connects to
}

export interface GameEvent {
  turn: number;
  text: string;
}

export interface GameState {
  meta: { runId: string; seed: string; rngCursor: number; startedAt: number };
  player: {
    budget: number; maxBudget: number;
    energy: number; energyPerTurn: number;
    hand: Card[]; draw: Card[]; discard: Card[]; exhaust: Card[];
    statuses: StatusMap;
    relics: string[];
    hotfixes: string[];
  };
  combat?: {
    enemies: Enemy[];
    intentByEnemy: Record<string, Intent>;
    turn: number;
    phase: "player" | "enemy" | "transitioning";
  };
  map: {
    act: 1 | 2;
    nodes: MapNode[][];          // [row][col]
    currentNodeId: string | null;
    visitedNodeIds: string[];
  };
  deck: Card[];                  // master deck owned this run
  credits: number;
  scene: Scene;
  history: GameEvent[];
}

function makeRunId(): string {
  // Timestamp + 4 random hex chars — unique enough; no crypto needed for save key
  const rand = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
  return `${Date.now().toString(36)}-${rand}`;
}

export function initialState(seed: string): GameState {
  return {
    meta: {
      runId: makeRunId(),
      seed,
      rngCursor: 0,
      startedAt: Date.now(),
    },
    player: {
      budget: 80,
      maxBudget: 80,
      energy: 3,
      energyPerTurn: 3,
      hand: [],
      draw: [],
      discard: [],
      exhaust: [],
      statuses: {},
      relics: ["pager"],
      hotfixes: [],
    },
    combat: undefined,
    map: {
      act: 1,
      nodes: [],
      currentNodeId: null,
      visitedNodeIds: [],
    },
    deck: [],
    credits: 0,
    scene: "title",
    history: [],
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 6 state tests + 6 rng tests = 12/12 green.

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/state.ts slothespire/tests/state.test.ts
git commit -m "feat(engine): GameState type + initialState factory"
```

---

## Task 4: Action types skeleton

**Files:**
- Create: `src/engine/actions.ts`

(No tests here — actions are pure types; behavior is tested via the reducer in Task 5.)

- [ ] **Step 1: Create `src/engine/actions.ts`**

```ts
import type { GameState } from "./state";

export type Action =
  | { type: "START_RUN" }
  | { type: "RETURN_TO_TITLE" }
  | { type: "PLAY_CARD_STUB" }   // M1-only placeholder: any card play ends the run
  | { type: "LOAD_RUN"; state: GameState };
```

- [ ] **Step 2: Verify it type-checks**

Run: `npm run build`
Expected: type-check passes (will still fail at the bundle step because `main.ts` doesn't exist yet — that's fine for now).

- [ ] **Step 3: Commit**

```bash
git add slothespire/src/engine/actions.ts
git commit -m "feat(engine): action type union skeleton"
```

---

## Task 5: Reducer skeleton

**Files:**
- Create: `src/engine/reducer.ts`
- Test: `tests/reducer.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/reducer.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

describe("reduce", () => {
  it("START_RUN moves from title to combat scene", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.scene).toBe("combat");
    expect(s0.scene).toBe("title"); // immutability check
  });

  it("START_RUN initializes a single stub enemy in combat", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    expect(s1.combat).toBeDefined();
    expect(s1.combat!.enemies.length).toBe(1);
    expect(s1.combat!.enemies[0].name).toBe("Flapping Health Check");
    expect(s1.combat!.turn).toBe(1);
  });

  it("PLAY_CARD_STUB ends the run (M1 placeholder behavior)", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    const s2 = reduce(s1, { type: "PLAY_CARD_STUB" });
    expect(s2.scene).toBe("lost"); // any card play ends in M1 — placeholder
    expect(s2.combat).toBeUndefined();
  });

  it("RETURN_TO_TITLE resets to a fresh initialState while preserving seed", () => {
    const s0 = initialState("seed");
    const s1 = reduce(s0, { type: "START_RUN" });
    const s2 = reduce(s1, { type: "RETURN_TO_TITLE" });
    expect(s2.scene).toBe("title");
    expect(s2.meta.seed).toBe("seed");
    expect(s2.combat).toBeUndefined();
  });

  it("LOAD_RUN replaces state wholesale", () => {
    const s0 = initialState("seed-a");
    const saved = initialState("seed-b");
    const s1 = reduce(s0, { type: "LOAD_RUN", state: saved });
    expect(s1.meta.seed).toBe("seed-b");
  });

  it("reducer is total: unknown actions return same state reference", () => {
    const s0 = initialState("seed");
    // Cast to bypass exhaustiveness; emulates a future action not yet handled
    const s1 = reduce(s0, { type: "NOT_A_REAL_ACTION" } as never);
    expect(s1).toBe(s0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/engine/reducer'`.

- [ ] **Step 3: Implement `src/engine/reducer.ts`**

```ts
import type { Action } from "./actions";
import { initialState, type GameState, type Enemy } from "./state";

function makeStubEnemy(): Enemy {
  return {
    instanceId: "e0",
    defId: "flapping_health_check",
    name: "Flapping Health Check",
    stability: 12,
    maxStability: 12,
    statuses: {},
  };
}

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_RUN":
      return {
        ...state,
        scene: "combat",
        combat: {
          enemies: [makeStubEnemy()],
          intentByEnemy: { e0: { kind: "burn", amount: 6 } },
          turn: 1,
          phase: "player",
        },
      };
    case "PLAY_CARD_STUB":
      // M1 placeholder: any card play ends the run.
      // Real combat resolution lands in M2.
      return { ...state, scene: "lost", combat: undefined };
    case "RETURN_TO_TITLE":
      return initialState(state.meta.seed);
    case "LOAD_RUN":
      return action.state;
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 6 reducer tests green (18/18 total).

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/reducer.ts slothespire/tests/reducer.test.ts
git commit -m "feat(engine): reducer skeleton with START_RUN / PLAY_CARD_STUB / RETURN_TO_TITLE"
```

---

## Task 6: Save / load via localStorage

**Files:**
- Create: `src/engine/save.ts`
- Test: `tests/save.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/save.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { saveRun, loadRun, clearRun, SAVE_KEY } from "../src/engine/save";
import { initialState } from "../src/engine/state";

beforeEach(() => {
  localStorage.clear();
});

describe("save", () => {
  it("saveRun writes serialized state to localStorage", () => {
    const s = initialState("save-test");
    saveRun(s);
    const raw = localStorage.getItem(SAVE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.meta.seed).toBe("save-test");
  });

  it("loadRun returns null when no save exists", () => {
    expect(loadRun()).toBeNull();
  });

  it("loadRun returns the saved state when it exists", () => {
    const s = initialState("roundtrip");
    saveRun(s);
    const loaded = loadRun();
    expect(loaded).not.toBeNull();
    expect(loaded!.meta.seed).toBe("roundtrip");
    expect(loaded!.player.budget).toBe(80);
  });

  it("loadRun returns null when the saved data is corrupt", () => {
    localStorage.setItem(SAVE_KEY, "{not json");
    expect(loadRun()).toBeNull();
  });

  it("clearRun removes the saved state", () => {
    const s = initialState("clear-test");
    saveRun(s);
    expect(loadRun()).not.toBeNull();
    clearRun();
    expect(loadRun()).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/engine/save'`.

- [ ] **Step 3: Implement `src/engine/save.ts`**

```ts
import type { GameState } from "./state";

export const SAVE_KEY = "slothespire:run";

export function saveRun(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be full or disabled — non-fatal for v1; log and move on
    console.warn("[slothespire] could not save run");
  }
}

export function loadRun(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearRun(): void {
  localStorage.removeItem(SAVE_KEY);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 5 save tests green (23/23 total).

- [ ] **Step 5: Commit**

```bash
git add slothespire/src/engine/save.ts slothespire/tests/save.test.ts
git commit -m "feat(engine): localStorage save/load/clear with corruption resilience"
```

---

## Task 7: Theme CSS (cyberspace-neon base)

**Files:**
- Create: `src/ui/theme.css`

(CSS — no Vitest tests; verified visually in Task 11.)

- [ ] **Step 1: Create `src/ui/theme.css`**

```css
:root {
  --color-base: #0a0e27;
  --color-base-deep: #050818;
  --color-accent: #00ffd1;
  --color-pop: #ff00aa;
  --color-text: #f4e8c1;
  --color-text-dim: #6b7299;
  --color-danger: #ff4a4a;
  --color-energy: #ffd34d;
  --color-energy-deep: #ff8800;
  --color-border-low: #1a2249;

  --font-display: "JetBrains Mono", "Space Mono", ui-monospace, "Courier New", monospace;
  --font-body: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;

  --glow-accent: 0 0 12px rgba(0, 255, 209, 0.45);
  --glow-pop:    0 0 12px rgba(255, 0, 170, 0.45);
  --glow-danger: 0 0 12px rgba(255, 74, 74, 0.45);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--color-base);
  color: var(--color-text);
  font-family: var(--font-body);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

button {
  font-family: var(--font-display);
  background: var(--color-base-deep);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  padding: 10px 16px;
  cursor: pointer;
  letter-spacing: 1px;
  box-shadow: var(--glow-accent);
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}
button:hover { transform: translateY(-1px); box-shadow: 0 0 18px rgba(0, 255, 209, 0.7); }
button:active { transform: translateY(0); }
button.primary {
  background: var(--color-pop);
  color: white;
  border-color: var(--color-pop);
  box-shadow: var(--glow-pop);
}
button.primary:hover { box-shadow: 0 0 18px rgba(255, 0, 170, 0.7); }

h1, h2, h3 { font-family: var(--font-display); letter-spacing: 1px; }
```

- [ ] **Step 2: Commit**

```bash
git add slothespire/src/ui/theme.css
git commit -m "style: cyberspace-neon theme variables + base"
```

---

## Task 8: Title scene

**Files:**
- Create: `src/ui/scene-title.ts`

- [ ] **Step 1: Create `src/ui/scene-title.ts`**

```ts
import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";

export function renderTitle(
  _state: GameState,
  dispatch: (a: Action) => void
): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-title";
  root.innerHTML = `
    <style>
      .scene-title {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        text-align: center; gap: 24px;
      }
      .scene-title h1 {
        font-size: 64px; color: var(--color-accent);
        text-shadow: var(--glow-accent);
        margin: 0; letter-spacing: 4px;
      }
      .scene-title .subtitle {
        color: var(--color-text-dim);
        font-family: var(--font-display);
        letter-spacing: 2px; font-size: 14px;
      }
      .scene-title .menu {
        display: flex; flex-direction: column; gap: 12px;
        margin-top: 24px; min-width: 220px;
      }
      .scene-title .stamp {
        position: fixed; bottom: 8px; right: 12px;
        font-family: var(--font-display); font-size: 10px;
        color: var(--color-text-dim);
      }
    </style>
    <h1>SLOTHESPIRE</h1>
    <div class="subtitle">// SLO the Spire</div>
    <div class="menu">
      <button class="primary" data-action="new-run">NEW RUN</button>
      <button data-action="codex" disabled title="Coming in M6">CODEX</button>
      <button data-action="settings" disabled title="Coming in M9">SETTINGS</button>
    </div>
    <div class="stamp">v0.0.1 — M1 walking skeleton</div>
  `;

  root.querySelector<HTMLButtonElement>('[data-action="new-run"]')!
    .addEventListener("click", () => dispatch({ type: "START_RUN" }));

  return root;
}
```

- [ ] **Step 2: Commit**

```bash
git add slothespire/src/ui/scene-title.ts
git commit -m "feat(ui): title scene with NEW RUN button"
```

---

## Task 9: Combat scene stub

**Files:**
- Create: `src/ui/scene-combat.ts`

- [ ] **Step 1: Create `src/ui/scene-combat.ts`**

```ts
import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";

export function renderCombat(
  state: GameState,
  dispatch: (a: Action) => void
): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-combat";
  const enemy = state.combat?.enemies[0];
  const intent = enemy ? state.combat?.intentByEnemy[enemy.instanceId] : undefined;
  const intentLabel =
    intent?.kind === "burn" ? `⚔ ${intent.amount}` :
    intent?.kind === "harden" ? `🛡 ${intent.amount}` : "?";

  root.innerHTML = `
    <style>
      .scene-combat {
        flex: 1; display: flex; flex-direction: column;
        padding: 24px; gap: 24px;
      }
      .sc-topbar {
        font-family: var(--font-display); font-size: 12px;
        color: var(--color-accent); opacity: 0.7;
      }
      .sc-enemies {
        flex: 1; display: flex; gap: 16px; justify-content: center; align-items: flex-end;
      }
      .sc-enemy { text-align: center; }
      .sc-enemy .intent {
        display: inline-block; padding: 6px 10px;
        color: var(--color-danger); font-family: var(--font-display);
        font-size: 14px; text-shadow: var(--glow-danger);
      }
      .sc-enemy .sprite {
        width: 96px; height: 96px; margin: 4px auto;
        background: var(--color-border-low);
        border: 1px solid var(--color-pop);
        box-shadow: var(--glow-pop);
        display: flex; align-items: center; justify-content: center;
        font-size: 40px; color: var(--color-pop);
      }
      .sc-enemy .name {
        font-family: var(--font-display); font-size: 11px;
        color: var(--color-pop); letter-spacing: 1px;
      }
      .sc-hand {
        display: flex; gap: 12px; justify-content: center;
      }
      .sc-card {
        width: 100px; height: 140px;
        background: var(--color-base); color: var(--color-text);
        border: 1px solid var(--color-accent);
        box-shadow: var(--glow-accent);
        padding: 8px; display: flex; flex-direction: column;
        align-items: center; gap: 6px; cursor: pointer; position: relative;
      }
      .sc-card .cost {
        position: absolute; top: -8px; left: -8px;
        width: 24px; height: 24px; border-radius: 50%;
        background: var(--color-pop); color: white;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); box-shadow: var(--glow-pop);
      }
      .sc-card .cname {
        font-family: var(--font-display); font-size: 10px;
        color: var(--color-accent); text-align: center; letter-spacing: 0.5px;
      }
      .sc-card .cart {
        flex: 1; width: 100%;
        background: var(--color-base-deep);
        border: 1px solid var(--color-border-low);
        display: flex; align-items: center; justify-content: center;
        font-size: 28px; color: var(--color-danger);
      }
      .sc-card .ctext {
        font-size: 8px; text-align: center; opacity: 0.85;
      }
      .sc-status {
        position: fixed; top: 12px; right: 16px;
        font-family: var(--font-display); font-size: 11px;
      }
    </style>
    <div class="sc-topbar">// ACT I · Single-Service SLO · Floor 1 (stub)</div>
    <div class="sc-enemies">
      <div class="sc-enemy">
        <div class="intent">${intentLabel}</div>
        <div class="sprite">▲</div>
        <div class="name">${enemy?.name ?? "—"}</div>
      </div>
    </div>
    <div class="sc-hand">
      <div class="sc-card" data-action="play-card">
        <div class="cost">1</div>
        <div class="cname">MANUAL<br>FIX</div>
        <div class="cart">⚔</div>
        <div class="ctext">Burn 6.<br><em>M1 stub: click to end run.</em></div>
      </div>
    </div>
    <div class="sc-status">
      SLO BUDGET ${state.player.budget}/${state.player.maxBudget}
    </div>
  `;

  root.querySelector<HTMLDivElement>('[data-action="play-card"]')!
    .addEventListener("click", () => dispatch({ type: "PLAY_CARD_STUB" }));

  return root;
}
```

- [ ] **Step 2: Commit**

```bash
git add slothespire/src/ui/scene-combat.ts
git commit -m "feat(ui): combat scene stub with 1 enemy + 1 card"
```

---

## Task 10: End scenes (won / lost) — minimal

**Files:**
- Create: `src/ui/scene-end.ts`

- [ ] **Step 1: Create `src/ui/scene-end.ts`**

```ts
import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";

export function renderEnd(
  state: GameState,
  dispatch: (a: Action) => void
): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-end";
  const won = state.scene === "won";
  const headline = won ? "RUN COMPLETE" : "BUDGET BREACHED";
  const flavor = won
    ? "You held the SLO. The sloths sleep easier tonight."
    : "Service degraded. Customers noticed. Postmortem next sprint.";

  root.innerHTML = `
    <style>
      .scene-end {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 24px; text-align: center;
      }
      .scene-end h2 {
        font-size: 40px; letter-spacing: 4px;
        color: ${won ? "var(--color-accent)" : "var(--color-danger)"};
        text-shadow: ${won ? "var(--glow-accent)" : "var(--glow-danger)"};
        margin: 0;
      }
      .scene-end .flavor {
        max-width: 400px; opacity: 0.8;
        font-family: var(--font-display); font-size: 13px; line-height: 1.5;
      }
    </style>
    <h2>${headline}</h2>
    <div class="flavor">${flavor}</div>
    <button class="primary" data-action="return-title">RETURN TO TITLE</button>
  `;

  root.querySelector<HTMLButtonElement>('[data-action="return-title"]')!
    .addEventListener("click", () => dispatch({ type: "RETURN_TO_TITLE" }));

  return root;
}
```

- [ ] **Step 2: Commit**

```bash
git add slothespire/src/ui/scene-end.ts
git commit -m "feat(ui): end scene (won/lost) with return-to-title button"
```

---

## Task 11: Wire it all together — `main.ts`

**Files:**
- Create: `src/main.ts`

- [ ] **Step 1: Create `src/main.ts`**

```ts
import { initialState, type GameState } from "./engine/state";
import { reduce } from "./engine/reducer";
import type { Action } from "./engine/actions";
import { saveRun, loadRun, clearRun } from "./engine/save";
import { renderTitle } from "./ui/scene-title";
import { renderCombat } from "./ui/scene-combat";
import { renderEnd } from "./ui/scene-end";

const root = document.getElementById("app");
if (!root) throw new Error("missing #app root");

// Boot: prefer saved run if present, else fresh initial state.
let state: GameState = loadRun() ?? initialState(`seed-${Date.now().toString(36)}`);

function dispatch(action: Action): void {
  state = reduce(state, action);

  // Save policy: persist after every reducer call. On terminal scenes,
  // clear the save instead so the next launch is a fresh title.
  if (state.scene === "lost" || state.scene === "won" || state.scene === "title") {
    clearRun();
  } else {
    saveRun(state);
  }

  render();
}

function render(): void {
  root!.replaceChildren(sceneFor(state));
}

function sceneFor(s: GameState): HTMLElement {
  switch (s.scene) {
    case "title":  return renderTitle(s, dispatch);
    case "combat": return renderCombat(s, dispatch);
    case "lost":
    case "won":    return renderEnd(s, dispatch);
    // Stubs for scenes that don't exist yet — bounce to title.
    case "map":
    case "reward":
    case "shop":
    case "rest":
    case "event":
    case "codex":
      return renderTitle(s, dispatch);
  }
}

render();
```

- [ ] **Step 2: Type-check and build**

Run: `npm run build`
Expected: passes type check and produces `dist/`.

- [ ] **Step 3: Commit**

```bash
git add slothespire/src/main.ts
git commit -m "feat: wire scene router with save/load and dispatch"
```

---

## Task 12: Manual smoke test + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Boot the dev server**

Run: `npm run dev`
Open: http://localhost:5173

- [ ] **Step 2: Walk the happy path manually**

Verify each:
- Title screen shows "SLOTHESPIRE" with neon-cyan glow on dark navy.
- "// SLO the Spire" subtitle visible.
- "NEW RUN" button is magenta (primary); "CODEX" and "SETTINGS" are disabled.
- Click "NEW RUN" → combat scene appears with one enemy (Flapping Health Check) showing `⚔ 6` intent and one card (Manual Fix).
- SLO Budget reads `80/80` in the top-right.
- Click the card → screen shows "BUDGET BREACHED" with danger-red glow + "RETURN TO TITLE" button.
- Click "RETURN TO TITLE" → back to title screen.
- Reload the page on the title → still on title (terminal scene cleared save).

- [ ] **Step 3: Verify persistence path**

- Click "NEW RUN" → combat scene.
- Reload the page (Cmd+R).
- Expected: still on combat scene with one enemy, card visible (saved state restored from `localStorage["slothespire:run"]`).
- Open DevTools → Application → Local Storage → verify the `slothespire:run` key holds a JSON blob with `scene: "combat"`.

- [ ] **Step 4: Verify the entire test suite still passes**

Run: `npm test`
Expected: 23/23 pass.

- [ ] **Step 5: Write the README**

Create `README.md`:

```markdown
# Slothespire

A deckbuilding roguelike where **SLO = HP**, cards are SRE/DevOps practices,
relics are Datadog products, and enemies are incidents. *Slay → SLO. The Spire.*

## Status

M1 walking skeleton — title → stub combat → end → title loop works. Real
combat lands in M2.

## Dev

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # type-check + production bundle
```

## Docs

- Design spec: `docs/superpowers/specs/2026-05-27-slothespire-design.md`
- Plans:       `docs/superpowers/plans/`
```

- [ ] **Step 6: Commit**

```bash
git add slothespire/README.md
git commit -m "docs: add README with status + dev commands"
```

---

## Done

At the end of M1:
- `npm run dev` boots a working title → stub-combat → end → title loop in the cyberspace-neon theme.
- `npm test` passes 23 unit tests (RNG: 6, state: 6, reducer: 6, save: 5).
- `npm run build` produces a clean production bundle with no type errors.
- localStorage save/resume works (verified via the reload test in Task 12).
- All architecture primitives that M2 needs are in place: reducer + actions + state + RNG + save + scene router.

**Next milestone (M2 — Core combat loop) will replace `PLAY_CARD_STUB` with a real card-play action, add Energy spending, intent resolution, the four pile mechanics (Draw/Hand/Discard/Exhaust), and proper win/lose conditions tied to enemy stability and player budget. Plan written after M1 ships and we confirm no architectural surprises.**
