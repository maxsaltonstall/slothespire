import { describe, it, expect } from "vitest";
import { reduce } from "../src/engine/reducer";
import { initialState } from "../src/engine/state";
import { applyStatus } from "../src/engine/effects";
import { makeCard } from "../src/content/cards";

function startedRun() {
  const s1 = reduce(initialState("combat-test"), { type: "START_RUN" });
  const combatNode = s1.map.nodes[0][0];
  return reduce(s1, { type: "NAVIGATE", nodeId: combatNode.id });
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

describe("PLAY_CARD with statuses", () => {
  it("pressure adds flat burn on top of base damage", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, "player", "pressure", 2);
    const attackCard = s.player.hand.find(c => c.defId === "manual_fix")!;
    const stabilityBefore = enemy.stability;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: attackCard.instanceId, targetId: enemy.instanceId });
    // Manual Fix base 6 + pressure 2 = 8
    expect(s2.combat!.enemies[0].stability).toBe(stabilityBefore - 8);
  });

  it("customer_facing on enemy amplifies burn ×1.5 (ceil)", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, enemy.instanceId, "customer_facing", 1);
    const attackCard = s.player.hand.find(c => c.defId === "manual_fix")!;
    const stabilityBefore = enemy.stability;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: attackCard.instanceId, targetId: enemy.instanceId });
    // Manual Fix 6 × 1.5 = 9 (ceil)
    expect(s2.combat!.enemies[0].stability).toBe(stabilityBefore - 9);
  });

  it("confidence doubles next attack and is consumed", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, "player", "confidence", 1);
    const attackCard = s.player.hand.find(c => c.defId === "manual_fix")!;
    const stabilityBefore = enemy.stability;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: attackCard.instanceId, targetId: enemy.instanceId });
    expect(s2.combat!.enemies[0].stability).toBe(stabilityBefore - 12); // 6 × 2
    expect(s2.player.statuses.confidence).toBeUndefined();
  });

  it("stability adds flat headroom to headroom cards", () => {
    let s = startedRun();
    s = applyStatus(s, "player", "stability", 3);
    const skillCard = s.player.hand.find(c => c.defId === "failover")!;
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: skillCard.instanceId, targetId: null });
    expect(s2.player.headroom).toBe(5 + 3); // failover base 5 + stability 3
  });

  it("applyStatus effect applies customer_facing to all enemies", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    const ceCard = makeCard("chaos_engineering");
    // Give enough energy and add the card to hand
    s = { ...s, player: { ...s.player, hand: [...s.player.hand, ceCard], energy: 3 } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: ceCard.instanceId, targetId: enemy.instanceId });
    const updatedEnemy = s2.combat!.enemies.find(e => e.instanceId === enemy.instanceId)!;
    expect(updatedEnemy.statuses.customer_facing).toBe(3);
    // Also verify self-burn (5 hits player budget)
    expect(s2.player.budget).toBe(80 - 5);
  });

  it("Power card goes to activePowers, not discard", () => {
    let s = startedRun();
    const powerCard = makeCard("auto_scaling");
    s = { ...s, player: { ...s.player, hand: [...s.player.hand, powerCard] } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: powerCard.instanceId, targetId: null });
    expect(s2.combat!.activePowers.map(c => c.instanceId)).toContain(powerCard.instanceId);
    expect(s2.player.discard.map(c => c.instanceId)).not.toContain(powerCard.instanceId);
  });

  it("Exhaust card goes to exhaust pile, not discard", () => {
    let s = startedRun();
    const exhaCard = makeCard("page_the_ceo");
    s = { ...s, player: { ...s.player, hand: [...s.player.hand, exhaCard], energy: 3 } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: exhaCard.instanceId, targetId: null });
    expect(s2.player.exhaust.map(c => c.instanceId)).toContain(exhaCard.instanceId);
    expect(s2.player.discard.map(c => c.instanceId)).not.toContain(exhaCard.instanceId);
  });

  it("Curse card cannot be played (returns unchanged state reference)", () => {
    let s = startedRun();
    const curse = makeCard("tech_debt");
    s = { ...s, player: { ...s.player, hand: [...s.player.hand, curse] } };
    const s2 = reduce(s, { type: "PLAY_CARD", cardInstanceId: curse.instanceId, targetId: null });
    expect(s2).toBe(s);
  });
});

describe("END_TURN with statuses", () => {
  it("flow grants +1 energy at start of next turn and decays to 0", () => {
    let s = startedRun();
    s = applyStatus(s, "player", "flow", 1);
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.energy).toBe(4); // 3 base + 1 flow
    expect(s1.player.statuses.flow).toBeUndefined(); // decayed 1→0→removed
  });

  it("toil costs -1 energy at start of next turn and decays", () => {
    let s = startedRun();
    s = applyStatus(s, "player", "toil", 1);
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.energy).toBe(2); // 3 base - 1 toil
    expect(s1.player.statuses.toil).toBeUndefined();
  });

  it("on_call_fatigue drains 2×stacks budget at end of round and decays", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, "player", "on_call_fatigue", 2);
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.budget).toBe(80 - 4); // 2 stacks × 2 = 4
    expect(s1.player.statuses.on_call_fatigue).toBe(1); // decayed 2→1
  });

  it("customer_facing on player amplifies enemy burn ×1.5 (ceil)", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, "player", "customer_facing", 1);
    s = { ...s, player: { ...s.player, headroom: 0 }, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 6 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.budget).toBe(80 - 9); // ceil(6 × 1.5) = 9
    expect(s1.player.statuses.customer_facing).toBeUndefined(); // decayed 1→0→removed
  });

  it("power trigger fires at end of turn — Auto-Scaling grants headroom", () => {
    let s = startedRun();
    const powerCard = makeCard("auto_scaling");
    s = { ...s, combat: { ...s.combat!, activePowers: [powerCard] } };
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    // headroom resets to 0 after enemy turn (Phase 4), then power fires (Phase 10) granting +4
    expect(s1.player.headroom).toBe(4);
  });

  it("curse in hand causes self-burn at end of turn", () => {
    let s = startedRun();
    const curse = makeCard("tech_debt");
    // Replace entire hand with just the curse
    s = { ...s, player: { ...s.player, hand: [curse] } };
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.budget).toBe(80 - 2); // 1 curse × selfBurn 2
  });

  it("all decaying statuses tick down by 1 each round", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = applyStatus(s, "player", "toil", 2);
    s = applyStatus(s, "player", "customer_facing", 3);
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.statuses.toil).toBe(1);
    expect(s1.player.statuses.customer_facing).toBe(2);
  });

  it("enemy debuff intent applies status to player", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "debuff", status: "toil", stacks: 1 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.statuses.toil).toBe(1);
  });

  it("burnout reduces draw by 1 and is consumed (one-shot)", () => {
    let s = startedRun();
    s = applyStatus(s, "player", "burnout", 1);
    const enemy = s.combat!.enemies[0];
    s = { ...s, combat: { ...s.combat!, intentByEnemy: { [enemy.instanceId]: { kind: "burn", amount: 0 } } } };
    const s1 = reduce(s, { type: "END_TURN" });
    expect(s1.player.hand.length).toBe(4); // 5 - 1 burnout penalty
    expect(s1.player.statuses.burnout).toBeUndefined(); // consumed
  });
});

describe("USE_HOTFIX", () => {
  it("removes hotfix from slots and applies burn effect", () => {
    let s = startedRun();
    s = { ...s, player: { ...s.player, hotfixes: ["rollback_hotfix"] } };
    const enemy = s.combat!.enemies[0];
    // Set stability high enough that 20 burn doesn't kill the enemy
    s = { ...s, combat: { ...s.combat!, enemies: [{ ...enemy, stability: 50 }] } };
    const stabilityBefore = 50;
    const s2 = reduce(s, { type: "USE_HOTFIX", hotfixId: "rollback_hotfix", targetId: enemy.instanceId });
    expect(s2.player.hotfixes).not.toContain("rollback_hotfix");
    expect(s2.combat!.enemies[0].stability).toBe(stabilityBefore - 20);
  });

  it("failover hotfix adds headroom and removes from slots", () => {
    let s = startedRun();
    s = { ...s, player: { ...s.player, hotfixes: ["failover_hotfix"] } };
    const s2 = reduce(s, { type: "USE_HOTFIX", hotfixId: "failover_hotfix", targetId: null });
    expect(s2.player.headroom).toBe(25);
    expect(s2.player.hotfixes).toHaveLength(0);
  });

  it("no-op if hotfix not in player slots", () => {
    const s = startedRun();
    const s2 = reduce(s, { type: "USE_HOTFIX", hotfixId: "rollback_hotfix", targetId: null });
    expect(s2).toBe(s);
  });

  it("win condition triggers if hotfix kills last enemy", () => {
    let s = startedRun();
    const enemy = s.combat!.enemies[0];
    s = {
      ...s,
      player: { ...s.player, hotfixes: ["rollback_hotfix"] },
      combat: { ...s.combat!, enemies: [{ ...enemy, stability: 1 }] },
    };
    const s2 = reduce(s, { type: "USE_HOTFIX", hotfixId: "rollback_hotfix", targetId: enemy.instanceId });
    expect(s2.scene).toBe("won");
    expect(s2.combat).toBeUndefined();
  });
});
