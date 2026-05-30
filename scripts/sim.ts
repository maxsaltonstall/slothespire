import { initialState } from "../src/engine/state";
import { reduce } from "../src/engine/reducer";
import type { GameState, MapNode } from "../src/engine/state";

const NUM_RUNS = 100;

function reachableNodes(state: GameState): MapNode[] {
  const { nodes, currentNodeId } = state.map;
  const reachableIds = new Set<string>();
  if (!currentNodeId) {
    nodes[0]?.forEach(n => reachableIds.add(n.id));
  } else {
    nodes.flat().find(n => n.id === currentNodeId)?.next.forEach(id => reachableIds.add(id));
  }
  return nodes.flat().filter(n => reachableIds.has(n.id));
}

function navigateAI(state: GameState): string | null {
  const available = reachableNodes(state);
  if (available.length === 0) return null;
  const combat = available.find(n => n.type === "combat" || n.type === "boss");
  const rest = available.find(n => n.type === "rest");
  const preferred = combat ?? rest ?? available[0];
  return preferred.id;
}

function playAI(state: GameState): Parameters<typeof reduce>[1] | null {
  if (!state.combat) return null;
  const enemy = state.combat.enemies[0];
  if (!enemy) return null;
  const playable = state.player.hand.filter(
    c => c.type !== "curse" && c.cost >= 0 && c.cost <= state.player.energy
  );
  const attacks = playable.filter(c => c.type === "attack").sort((a, b) => b.cost - a.cost);
  const skills = playable.filter(c => c.type === "skill").sort((a, b) => b.cost - a.cost);
  if (attacks.length > 0) return { type: "PLAY_CARD", cardInstanceId: attacks[0].instanceId, targetId: enemy.instanceId };
  if (skills.length > 0) return { type: "PLAY_CARD", cardInstanceId: skills[0].instanceId, targetId: null };
  return { type: "END_TURN" };
}

function runOne(seed: string): { result: "won" | "lost"; nodes: number } {
  let s = reduce(initialState(seed), { type: "START_RUN" });
  let nodesVisited = 0;
  const MAX_STEPS = 1000;

  for (let step = 0; step < MAX_STEPS; step++) {
    switch (s.scene) {
      case "map": {
        const nodeId = navigateAI(s);
        if (!nodeId) return { result: "lost", nodes: nodesVisited };
        s = reduce(s, { type: "NAVIGATE", nodeId });
        nodesVisited++;
        break;
      }
      case "combat": {
        const action = playAI(s);
        if (!action) { s = reduce(s, { type: "END_TURN" }); break; }
        s = reduce(s, action);
        break;
      }
      case "reward":
        if (s.rewardRelics?.length) {
          s = reduce(s, { type: "PICK_REWARD_RELIC", relicId: s.rewardRelics[0] });
        } else if (s.rewardRelic) {
          s = reduce(s, { type: "PICK_REWARD_RELIC" });
        } else {
          s = reduce(s, { type: "PICK_REWARD_CARD", cardInstanceId: s.rewardCards?.[0]?.instanceId ?? null });
        }
        break;
      case "rest":
        s = reduce(s, { type: "CHOOSE_REST_OPTION", option: "refresh" });
        break;
      case "event":
        s = reduce(s, { type: "EVENT_CHOICE", choiceIndex: 0 });
        break;
      case "shop":
        s = reduce(s, { type: "GO_TO_MAP" });
        break;
      case "won":
        return { result: "won", nodes: nodesVisited };
      case "lost":
        return { result: "lost", nodes: nodesVisited };
      default:
        s = reduce(s, { type: "GO_TO_MAP" });
    }
  }
  return { result: "lost", nodes: nodesVisited };
}

const results = Array.from({ length: NUM_RUNS }, (_, i) => runOne(`sim-${i}`));
const wins = results.filter(r => r.result === "won").length;
const avgNodes = Math.round(results.reduce((sum, r) => sum + r.nodes, 0) / NUM_RUNS);

console.log(`\n=== Slothespire Balance Sim (${NUM_RUNS} runs) ===`);
console.log(`Win rate:  ${wins}/${NUM_RUNS} (${wins}%)`);
console.log(`Avg nodes visited: ${avgNodes}`);
console.log(`Target win rate: 25–35%`);
if (wins < 25) console.log("⚠  Too hard — consider reducing enemy stability or buffing starter cards");
else if (wins > 45) console.log("⚠  Too easy — consider increasing enemy pressure");
else console.log("✓  In range");
