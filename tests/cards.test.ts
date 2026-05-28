import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";
import { makeCard } from "../src/content/cards";

function inCombat() {
  const s0 = reduce(initialState("upgrade-test"), { type: "START_RUN" });
  const node = s0.map.nodes[0][0];
  return reduce(s0, { type: "NAVIGATE", nodeId: node.id });
}

describe("upgraded card effects", () => {
  it("unupgraded Manual Fix deals 6 Burn", () => {
    let s = inCombat();
    const enemy = s.combat!.enemies[0];
    const card = s.player.hand.find(c => c.defId === "manual_fix")!;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: enemy.instanceId });
    expect(s2.combat!.enemies[0].stability).toBe(enemy.stability - 6);
  });

  it("upgraded Manual Fix deals 9 Burn (uses upgradedEffects)", () => {
    let s = inCombat();
    const enemy = s.combat!.enemies[0];
    const card = s.player.hand.find(c => c.defId === "manual_fix")!;
    const upgradedCard = { ...card, upgraded: true };
    s = { ...s, player: { ...s.player, hand: s.player.hand.map(c => c.instanceId === card.instanceId ? upgradedCard : c) } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: enemy.instanceId });
    expect(s2.combat!.enemies[0].stability).toBe(enemy.stability - 9);
  });

  it("restoreBudget EffectSpec increases budget up to max (Blameless Postmortem)", () => {
    let s = inCombat();
    s = { ...s, player: { ...s.player, budget: 40, hand: [...s.player.hand, makeCard("postmortem")], energy: 3 } };
    const card = s.player.hand.find(c => c.defId === "postmortem")!;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: null });
    expect(s2.player.budget).toBe(52); // 40 + 12
    expect(s2.player.exhaust.map(c => c.defId)).toContain("postmortem");
  });

  it("upgraded Blameless Postmortem restores 18 budget", () => {
    let s = inCombat();
    const baseCard = makeCard("postmortem");
    const upgCard = { ...baseCard, upgraded: true };
    s = { ...s, player: { ...s.player, budget: 40, hand: [...s.player.hand, upgCard], energy: 3 } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: baseCard.instanceId, targetId: null });
    expect(s2.player.budget).toBe(58); // 40 + 18
  });
});
