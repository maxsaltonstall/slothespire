import type { GameState, MapNode } from "../engine/state";
import type { Action } from "../engine/actions";

const NODE_ICONS: Record<MapNode["type"], string> = {
  combat: "⚔",
  elite: "☠",
  rest: "✝",
  shop: "⚙",
  event: "?",
  treasure: "🎁",
  boss: "👑",
};

const NODE_LABELS: Record<MapNode["type"], string> = {
  combat: "Combat",
  elite: "Elite",
  rest: "Postmortem",
  shop: "Build Server",
  event: "Incident",
  treasure: "Treasure",
  boss: "BOSS",
};

export function renderMap(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-map";

  const { nodes, currentNodeId, visitedNodeIds, act } = state.map;

  // Determine reachable node IDs
  const reachable = new Set<string>();
  if (!currentNodeId) {
    nodes[0]?.forEach(n => reachable.add(n.id));
  } else {
    const current = nodes.flat().find(n => n.id === currentNodeId);
    current?.next.forEach(id => reachable.add(id));
  }

  // Render rows bottom-to-top (boss at top)
  const rowsHtml = [...nodes].reverse().map((row) => {
    const nodesHtml = row.map(node => {
      const isVisited = visitedNodeIds.includes(node.id);
      const isReachable = reachable.has(node.id);
      const isCurrent = node.id === currentNodeId;
      const classes = [
        "map-node",
        node.type,
        isVisited ? "visited" : "",
        isReachable ? "reachable" : "",
        isCurrent ? "current" : "",
      ].filter(Boolean).join(" ");
      return `
        <div class="${classes}" data-node-id="${node.id}" title="${NODE_LABELS[node.type]}">
          <div class="node-icon">${NODE_ICONS[node.type]}</div>
          <div class="node-label">${NODE_LABELS[node.type]}</div>
        </div>
      `;
    }).join("");
    return `<div class="map-row">${nodesHtml}</div>`;
  }).join("");

  root.innerHTML = `
    <style>
      .scene-map { flex: 1; display: flex; flex-direction: column; padding: 24px; gap: 8px; }
      .map-header { font-family: var(--font-display); font-size: 12px;
        color: var(--color-accent); opacity: 0.7; margin-bottom: 8px; }
      .map-rows { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; }
      .map-row { display: flex; gap: 16px; justify-content: center; align-items: center; }
      .map-node {
        width: 80px; padding: 8px 4px; text-align: center;
        border: 1px solid var(--color-border-low); border-radius: 6px;
        background: var(--color-base-deep); opacity: 0.4;
        transition: opacity 0.15s, transform 0.1s;
      }
      .map-node.visited { opacity: 0.6; border-color: var(--color-text-dim); }
      .map-node.current { opacity: 0.8; border-color: var(--color-accent); box-shadow: var(--glow-accent); }
      .map-node.reachable { opacity: 1; cursor: pointer; border-color: var(--color-accent); }
      .map-node.reachable:hover { transform: scale(1.08); }
      .map-node.boss.reachable { border-color: var(--color-pop); box-shadow: var(--glow-pop); }
      .map-node.elite.reachable { border-color: var(--color-danger); box-shadow: var(--glow-danger); }
      .node-icon { font-size: 22px; }
      .node-label { font-family: var(--font-display); font-size: 8px;
        color: var(--color-text-dim); letter-spacing: 0.5px; margin-top: 2px; }
      .map-footer { display: flex; align-items: center; gap: 16px;
        font-family: var(--font-display); font-size: 11px; color: var(--color-text-dim); margin-top: 8px; }
      .map-footer .credits { color: var(--color-energy); }
      .map-quit { background: transparent; border: 0; box-shadow: none;
        font-family: var(--font-display); font-size: 10px; color: var(--color-text-dim);
        cursor: pointer; margin-left: auto; padding: 0; letter-spacing: 1px; transition: color 0.15s; }
      .map-quit.confirming { color: var(--color-danger); text-shadow: var(--glow-danger); }
    </style>
    <div class="map-header">// ACT ${act} · ${act === 1 ? "Single-Service SLO" : "User-Journey SLO"}</div>
    <div class="map-rows">${rowsHtml}</div>
    <div class="map-footer">
      <span>SLO BUDGET <b>${state.player.budget}/${state.player.maxBudget}</b></span>
      <span>DECK <b>${state.deck.length}</b></span>
      <span class="credits">CREDITS <b>${state.credits}</b></span>
      <button class="map-quit" id="map-quit-btn">QUIT RUN</button>
    </div>
  `;

  root.querySelectorAll<HTMLDivElement>(".map-node.reachable").forEach(el => {
    el.addEventListener("click", () => {
      dispatch({ type: "NAVIGATE", nodeId: el.dataset.nodeId! });
    });
  });

  {
    const quitBtn = root.querySelector<HTMLButtonElement>("#map-quit-btn")!;
    quitBtn.addEventListener("click", () => {
      if (quitBtn.classList.contains("confirming")) {
        dispatch({ type: "RETURN_TO_TITLE" });
      } else {
        quitBtn.classList.add("confirming");
        quitBtn.textContent = "CONFIRM?";
        setTimeout(() => {
          quitBtn.classList.remove("confirming");
          quitBtn.textContent = "QUIT RUN";
        }, 3000);
      }
    });
  }

  return root;
}
