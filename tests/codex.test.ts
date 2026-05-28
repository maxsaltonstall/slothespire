import { describe, it, expect, beforeEach } from "vitest";
import { unlock, isUnlocked, allUnlocked, clearCodex, CODEX_KEY } from "../src/engine/codex";

beforeEach(() => {
  localStorage.clear();
  clearCodex();
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

  it("persists to localStorage — round-trips correctly", () => {
    unlock("postmortem");
    const raw = localStorage.getItem(CODEX_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toContain("postmortem");
  });
});
