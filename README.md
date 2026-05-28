# Slothespire

A deckbuilding roguelike where **SLO = HP**, cards are SRE/DevOps practices,
relics are Datadog products, and enemies are incidents. *Slay → SLO. The Spire.*

## 🎮 Play

**[Play Slothespire](https://maxsaltonstall.github.io/slothespire/)**

## What is this?

Slothespire teaches DevOps, SRE, and Platform Engineering through deckbuilding gameplay
modeled on Slay the Spire. Every card is a real practice (Canary Deploy, Circuit Breaker,
Blameless Postmortem). Every relic is a Datadog product (APM Tracing, Watchdog, Live Tail).
Every enemy is an incident or anti-pattern (Memory Leak, Cascading Failure, The Pager Storm).

The **Codex** explains the real-world concept behind every card, relic, and enemy you discover.

## Status

**v1.0.0** — Full 2-act run, ~37 unique cards with upgrade effects, ~15 Datadog-product
relics with combat hooks, 11 enemies routed by floor, 8 events, Codex screen with
educational write-ups, working shop (buy/remove cards), card upgrade picker at rest sites,
seeded deterministic RNG, balance sim. 141 tests.

## Dev

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run sim      # balance simulation (100 runs, heuristic AI)
npm run deploy   # deploy to GitHub Pages
```

## Architecture

TypeScript + Vite static SPA. Immutable `GameState` + single reducer pattern.
No backend — everything (run state, Codex unlocks) in localStorage.
Seeded deterministic RNG (`mulberry32`).

```
src/
├── content/     # card/enemy/relic/event/codex definitions (static data)
├── engine/      # reducer, actions, effects, map, RNG, save, codex tracking
└── ui/          # scene renderers (DOM/CSS, no framework)
```

## Docs

- Design spec: `docs/superpowers/specs/2026-05-27-slothespire-design.md`
- Milestone plans: `docs/superpowers/plans/`
