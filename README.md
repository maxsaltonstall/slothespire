# Slothespire

A deckbuilding roguelike where **SLO = HP**, cards are SRE/DevOps practices,
relics are Datadog products, and enemies are incidents. *Slay → SLO. The Spire.*

## Status

M3 combat depth — all 10 statuses (apply/tick/resolve), Power cards persist in play,
Exhaust pile, Curses punish when held, Hotfix system (USE_HOTFIX action, 2 hotfixes).
Page Senior Engineer gains Flow. 88 tests.

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
