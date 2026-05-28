import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

function atRest() {
  let s = reduce(initialState("rest-test"), { type: "START_RUN" });
  return { ...s, scene: "rest" as const };
}

describe("SHOW_UPGRADE_PICKER", () => {
  it("transitions to 'upgrading' scene", () => {
    const s = atRest();
    const s2 = reduce(s, { type: "SHOW_UPGRADE_PICKER" });
    expect(s2.scene).toBe("upgrading");
  });

  it("goes to map instead if no upgradeable cards exist", () => {
    let s = atRest();
    s = { ...s, deck: s.deck.map(c => ({ ...c, upgraded: true })) };
    const s2 = reduce(s, { type: "SHOW_UPGRADE_PICKER" });
    expect(s2.scene).toBe("map");
  });
});

describe("CHOOSE_CARD_TO_UPGRADE", () => {
  it("marks chosen deck card as upgraded and appends '+' to name, returns to map", () => {
    let s = atRest();
    const card = s.deck.find(c => !c.upgraded)!;
    const s2 = reduce(s, { type: "CHOOSE_CARD_TO_UPGRADE", cardInstanceId: card.instanceId });
    const upgraded = s2.deck.find(c => c.instanceId === card.instanceId)!;
    expect(upgraded.upgraded).toBe(true);
    expect(upgraded.name.endsWith("+")).toBe(true);
    expect(s2.scene).toBe("map");
  });

  it("no-op if card not in deck", () => {
    const s = atRest();
    const s2 = reduce(s, { type: "CHOOSE_CARD_TO_UPGRADE", cardInstanceId: "not-real" });
    expect(s2).toBe(s);
  });
});
