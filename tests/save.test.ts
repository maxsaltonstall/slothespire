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
