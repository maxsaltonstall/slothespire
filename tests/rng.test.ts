import { describe, it, expect } from "vitest";
import { mulberry32, parseSeed, nextRng } from "../src/engine/rng";
import { initialState } from "../src/engine/state";

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

describe("nextRng", () => {
  it("advances rngCursor on each call", () => {
    const s0 = initialState("cursor-test");
    const [v1, s1] = nextRng(s0);
    const [v2, s2] = nextRng(s1);
    expect(s1.meta.rngCursor).toBe(1);
    expect(s2.meta.rngCursor).toBe(2);
    expect(v1).not.toBe(v2);
  });

  it("produces deterministic values for a given seed and cursor", () => {
    const s0 = initialState("det-test");
    const [v1a] = nextRng(s0);
    const [v1b] = nextRng(s0);
    expect(v1a).toBe(v1b); // same cursor position → same value
  });
});

describe("nextRng O(1) caching", () => {
  it("produces the same value for the same seed+cursor regardless of call order", () => {
    const s0 = initialState("cache-test");
    const [v1] = nextRng(s0);
    const [v2] = nextRng(s0); // same starting cursor
    expect(v1).toBe(v2);
  });

  it("advancing cursor produces different values", () => {
    const s0 = initialState("adv-test");
    const [v1, s1] = nextRng(s0);
    const [v2] = nextRng(s1);
    expect(v1).not.toBe(v2);
  });

  it("re-initializes correctly when seed changes between calls", () => {
    const sa = initialState("seed-x");
    const sb = initialState("seed-y");
    const [va] = nextRng(sa);
    const [vb] = nextRng(sb);
    const [va2] = nextRng(sa); // back to seed-x at same cursor
    expect(va).toBe(va2);
    expect(va).not.toBe(vb);
  });
});
