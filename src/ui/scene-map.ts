import type { GameState, MapNode } from "../engine/state";
import type { Action } from "../engine/actions";
import { MAP_NODE_TOOLTIPS } from "./tooltip";
import { RELIC_DEFS } from "../content/relics";

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
        <div class="${classes}" data-node-id="${node.id}"
             data-tooltip="${MAP_NODE_TOOLTIPS[node.type]}">
          <div class="node-icon">${NODE_ICONS[node.type]}</div>
          <div class="node-label">${NODE_LABELS[node.type]}</div>
        </div>
      `;
    }).join("");
    return `<div class="map-row">${nodesHtml}</div>`;
  }).join("");

  const relicChips = state.player.relics.map(rid => {
    const rdef = RELIC_DEFS[rid];
    if (!rdef) return "";
    const tip = `<b>${rdef.name}</b><br>${rdef.description}`;
    return `<span class="map-relic-chip" data-tooltip="${tip.replace(/"/g, "&quot;")}" title="${rdef.name}">✦</span>`;
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
      .map-relics { display: flex; gap: 3px; align-items: center; }
      .map-relic-chip { color: var(--color-energy); font-size: 13px; cursor: default; }
    </style>
    <div class="map-header">// ACT ${act} · ${act === 1 ? "Single-Service SLO" : "User-Journey SLO"}</div>
    <div class="map-rows">${rowsHtml}</div>
    <div class="map-footer">
      <span>SLO BUDGET <b>${state.player.budget}/${state.player.maxBudget}</b></span>
      <span>DECK <b>${state.deck.length}</b></span>
      <span class="credits">CREDITS <b>${state.credits}</b></span>
      ${relicChips ? `<span class="map-relics" title="Your relics">${relicChips}</span>` : ""}
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

  // Draw connection lines after layout — needs rAF so nodes are positioned
  requestAnimationFrame(() => drawConnections(root, state));

  return root;
}

function drawConnections(root: HTMLElement, state: GameState): void {
  const container = root.querySelector<HTMLElement>(".map-rows");
  if (!container) return;

  const { nodes, currentNodeId, visitedNodeIds } = state.map;

  const reachable = new Set<string>();
  if (!currentNodeId) {
    nodes[0]?.forEach(n => reachable.add(n.id));
  } else {
    nodes.flat().find(n => n.id === currentNodeId)?.next.forEach(id => reachable.add(id));
  }

  // SVG overlay
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;";
  container.style.position = "relative";
  container.appendChild(svg);

  const cRect = container.getBoundingClientRect();

  for (const row of nodes) {
    for (const node of row) {
      const fromEl = root.querySelector<HTMLElement>(`[data-node-id="${node.id}"]`);
      if (!fromEl) continue;
      const fr = fromEl.getBoundingClientRect();
      const fx = fr.left + fr.width / 2 - cRect.left;
      const fy = fr.top + fr.height / 2 - cRect.top;

      for (const nextId of node.next) {
        const toEl = root.querySelector<HTMLElement>(`[data-node-id="${nextId}"]`);
        if (!toEl) continue;
        const tr = toEl.getBoundingClientRect();
        const tx = tr.left + tr.width / 2 - cRect.left;
        const ty = tr.top + tr.height / 2 - cRect.top;

        // Determine visual style
        const bothVisited = visitedNodeIds.includes(node.id) && visitedNodeIds.includes(nextId);
        const isCurrentEdge = node.id === currentNodeId && reachable.has(nextId);
        const isStartEdge = !currentNodeId && row === nodes[0] && reachable.has(nextId);

        let stroke = "#2a3260";
        let width = "1";
        let opacity = "0.35";
        let glow = "";

        if (isCurrentEdge || isStartEdge) {
          stroke = "#00ffd1";
          width = "1.5";
          opacity = "0.75";
          glow = "drop-shadow(0 0 3px #00ffd1)";
        } else if (bothVisited) {
          stroke = "#6b7299";
          opacity = "0.5";
        }

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(fx));
        line.setAttribute("y1", String(fy));
        line.setAttribute("x2", String(tx));
        line.setAttribute("y2", String(ty));
        line.setAttribute("stroke", stroke);
        line.setAttribute("stroke-width", width);
        line.setAttribute("opacity", opacity);
        if (glow) line.setAttribute("filter", glow);
        svg.appendChild(line);
      }
    }
  }
}
