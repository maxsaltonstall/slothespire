import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";

function startedRun() {
  return reduce(initialState("combat-test"), { type: "START_RUN" });
}

describe("PLAY_CARD", () => {
  it("removes the card from hand and adds it to discard", () => {
    const s0 = startedRun();
    const cardId = s0.player.hand[0].instanceId;
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: cardId, targetId: null });
    expect(s1.player.hand.map(c => c.instanceId)).not.toContain(cardId);
    expect(s1.player.discard.map(c => c.instanceId)).toContain(cardId);
  });

  it("deducts the card's energy cost from player energy", () => {
    const s0 = startedRun();
    const card = s0.player.hand.find(c => c.cost === 1);
    if (!card) throw new Error("No 1-cost card in starting hand for this seed");
    const energyBefore = s0.player.energy;
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: null });
    expect(s1.player.energy).toBe(energyBefore - 1);
  });

  it("attack card reduces enemy stability", () => {
    const s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    const attackCard = s0.player.hand.find(c => c.type === "attack");
    if (!attackCard) throw new Error("No attack card in starting hand for this seed");
    const s1 = reduce(s0, {
      type: "PLAY_CARD",
      cardInstanceId: attackCard.instanceId,
      targetId: enemy.instanceId,
    });
    expect(s1.combat!.enemies[0].stability).toBeLessThan(20);
  });

  it("skill card with headroom effect increases player headroom", () => {
    const s0 = startedRun();
    const skillCard = s0.player.hand.find(c => c.type === "skill" && c.defId !== "page_senior_engineer");
    if (!skillCard) throw new Error("No non-draw skill in starting hand for this seed");
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: skillCard.instanceId, targetId: null });
    expect(s1.player.headroom).toBeGreaterThan(0);
  });

  it("transitions to 'won' when enemy stability reaches 0", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = {
      ...s,
      combat: { ...s.combat!, enemies: [{ ...enemy, stability: 1 }] },
    };
    const attackCard = s.player.hand.find(c => c.type === "attack");
    if (!attackCard) throw new Error("No attack card in hand");
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: attackCard.instanceId, targetId: enemy.instanceId });
    expect(s2.scene).toBe("won");
    expect(s2.combat).toBeUndefined();
  });

  it("does nothing if cardInstanceId not found in hand", () => {
    const s0 = startedRun();
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: "not-real", targetId: null });
    expect(s1).toBe(s0);
  });

  it("does nothing if player has insufficient energy", () => {
    let s0 = startedRun();
    s0 = { ...s0, player: { ...s0.player, energy: 0 } };
    const card = s0.player.hand[0];
    const s1 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: null });
    expect(s1).toBe(s0);
  });
});

describe("END_TURN", () => {
  it("discards remaining hand and draws 5 new cards", () => {
    const s0 = startedRun();
    expect(s0.player.hand.length).toBe(5);
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.player.hand.length).toBe(5);
  });

  it("restores player energy to energyPerTurn", () => {
    let s0 = startedRun();
    const card = s0.player.hand.find(c => c.cost === 1)!;
    s0 = reduce(s0, { type: "PLAY_CARD", cardInstanceId: card.instanceId, targetId: null });
    expect(s0.player.energy).toBe(2);
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.player.energy).toBe(3);
  });

  it("enemy burn intent reduces player budget (after headroom)", () => {
    let s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    s0 = {
      ...s0,
      player: { ...s0.player, headroom: 0 },
      combat: {
        ...s0.combat!,
        intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 6 } },
      },
    };
    const budgetBefore = s0.player.budget;
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.player.budget).toBe(budgetBefore - 6);
  });

  it("headroom absorbs burn before hitting budget", () => {
    let s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    s0 = {
      ...s0,
      player: { ...s0.player, headroom: 4, budget: 80 },
      combat: {
        ...s0.combat!,
        intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 6 } },
      },
    };
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.player.budget).toBe(78); // 6 burn - 4 headroom = 2 reaches budget
    expect(s1.player.headroom).toBe(0);
  });

  it("headroom fully absorbs burn when headroom >= burn", () => {
    let s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    s0 = {
      ...s0,
      player: { ...s0.player, headroom: 10, budget: 80 },
      combat: {
        ...s0.combat!,
        intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 6 } },
      },
    };
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.player.budget).toBe(80);
    expect(s1.player.headroom).toBe(0);
  });

  it("increments combat turn counter", () => {
    const s0 = startedRun();
    expect(s0.combat!.turn).toBe(1);
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.combat!.turn).toBe(2);
  });

  it("advances enemy intent to the next in the pattern", () => {
    const s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    const intent1 = s0.combat!.intentByEnemy[enemy.instanceId];
    expect(intent1).toMatchObject({ kind: "burn", amount: 6 });
    const s1 = reduce(s0, { type: "END_TURN" });
    const intent2 = s1.combat!.intentByEnemy[enemy.instanceId];
    expect(intent2).toMatchObject({ kind: "burn", amount: 4 });
  });

  it("transitions to 'lost' if budget reaches 0 from enemy burn", () => {
    let s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    s0 = {
      ...s0,
      player: { ...s0.player, budget: 5, headroom: 0 },
      combat: {
        ...s0.combat!,
        intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 10 } },
      },
    };
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.scene).toBe("lost");
    expect(s1.combat).toBeUndefined();
  });

  it("headroom resets to 0 even when enemy intent is not burn", () => {
    let s0 = startedRun();
    const enemy = s0.combat!.enemies[0];
    // Give player some headroom and set a non-burn intent
    s0 = {
      ...s0,
      player: { ...s0.player, headroom: 8 },
      combat: {
        ...s0.combat!,
        intentByEnemy: { [enemy.instanceId]: { kind: "unknown" } },
      },
    };
    const s1 = reduce(s0, { type: "END_TURN" });
    expect(s1.player.headroom).toBe(0); // always resets
    expect(s1.player.budget).toBe(80);  // budget unchanged (no burn)
  });
});
