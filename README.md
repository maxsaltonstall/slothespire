# Slothespire

A deckbuilding roguelike where **SLO = HP**, cards are SRE/DevOps practices,
relics are Datadog products, and enemies are incidents. *Slay → SLO. The Spire.*

## Status

M5 content + relics — 21 unique cards with upgrade effects (upgradedEffects), floor-based
enemy routing (10 enemies), 5 Datadog-product relics (APM Tracing, Live Tail, Watchdog,
Synthetic Tests, Pager) with onCombatStart/onTurnStart hooks, working shop (BUY_CARD/
REMOVE_CARD), 8 events (4 per act), O(1) seeded RNG, balance sim (`npm run sim`). 133 tests.

## Dev

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # type-check + production bundle
npm run sim      # balance simulation (100 runs, reports win rate)
```

## Docs

- Design spec: `docs/superpowers/specs/2026-05-27-slothespire-design.md`
- Plans:       `docs/superpowers/plans/`
