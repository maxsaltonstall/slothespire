# Slothespire

A deckbuilding roguelike where **SLO = HP**, cards are SRE/DevOps practices,
relics are Datadog products, and enemies are incidents. *Slay → SLO. The Spire.*

## Status

M2 core combat loop — real deck shuffle, play cards (burn/headroom/draw effects), END TURN with enemy resolution, win/lose detection. 52 tests.

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
