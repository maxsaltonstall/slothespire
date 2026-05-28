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

import type { GameState } from "./state";

let _cachedSeed = "";
let _cachedCursor = 0;
let _cachedGen: (() => number) | null = null;

export function nextRng(state: GameState): [number, GameState] {
  const { seed, rngCursor } = state.meta;
  if (seed !== _cachedSeed || rngCursor < _cachedCursor || _cachedGen === null) {
    _cachedGen = mulberry32(parseSeed(seed));
    for (let i = 0; i < rngCursor; i++) _cachedGen();
    _cachedSeed = seed;
    _cachedCursor = rngCursor;
  }
  while (_cachedCursor < rngCursor) {
    _cachedGen();
    _cachedCursor++;
  }
  const value = _cachedGen();
  _cachedCursor++;
  return [value, { ...state, meta: { ...state.meta, rngCursor: rngCursor + 1 } }];
}
