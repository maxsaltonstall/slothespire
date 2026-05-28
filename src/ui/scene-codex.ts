import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { CODEX_ENTRIES } from "../content/codex-entries";
import { CARD_DEFS } from "../content/cards";
import { RELIC_DEFS } from "../content/relics";
import { ENEMY_DEFS } from "../content/enemies";
import { allUnlocked, isUnlocked } from "../engine/codex";

export function renderCodex(
  state: GameState,
  dispatch: (a: Action) => void
): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-codex";

  const cardIds = Object.keys(CARD_DEFS).filter(id => CARD_DEFS[id].type !== "status" && CARD_DEFS[id].type !== "curse" || id === "tech_debt");
  const relicIds = Object.keys(RELIC_DEFS);
  const enemyIds = Object.keys(ENEMY_DEFS);

  function entryName(id: string, kind: "card" | "relic" | "enemy"): string {
    if (kind === "card") return CARD_DEFS[id]?.name ?? id;
    if (kind === "relic") return RELIC_DEFS[id]?.name ?? id;
    return ENEMY_DEFS[id]?.name ?? id;
  }

  function renderGrid(ids: string[], kind: "card" | "relic" | "enemy"): string {
    return ids.map(id => {
      const unlocked = isUnlocked(id);
      const entry = CODEX_ENTRIES[id];
      const name = entry?.name ?? entryName(id, kind);
      const icon = kind === "relic" ? "✦" : kind === "enemy" ? "▲" : "⚔";
      return `
        <div class="codex-tile ${unlocked ? "unlocked" : "locked"}" data-entry="${id}" data-kind="${kind}">
          <div class="ct-icon">${unlocked ? icon : "?"}</div>
          <div class="ct-name">${unlocked ? name : "???"}</div>
        </div>
      `;
    }).join("");
  }

  function renderDetail(id: string): string {
    const entry = CODEX_ENTRIES[id];
    if (!entry) return `<p style="opacity:0.4;font-size:11px;font-family:var(--font-display)">Entry not yet written.<br>Check back after a future update.</p>`;
    return `
      <h3 class="cd-name">${entry.name}</h3>
      <p class="cd-desc">${entry.description}</p>
      <div class="cd-divider"></div>
      <h4 class="cd-concept-label">THE REAL CONCEPT</h4>
      <p class="cd-concept">${entry.realConcept}</p>
      ${entry.docsLink ? `<a class="cd-link" href="${entry.docsLink}" target="_blank" rel="noopener">↗ Learn more</a>` : ""}
    `;
  }

  const totalUnlocked = allUnlocked().length;
  const totalEntries = cardIds.length + relicIds.length + enemyIds.length;

  root.innerHTML = `
    <style>
      .scene-codex { flex: 1; display: grid; grid-template-rows: 48px 40px 1fr; grid-template-columns: 1fr 300px; grid-template-areas: "header header" "tabs tabs" "grid detail"; height: 100vh; }
      .codex-header { grid-area: header; background: var(--color-base-deep); border-bottom: 1px solid var(--color-accent); display: flex; align-items: center; padding: 0 16px; gap: 12px; }
      .codex-header h2 { font-family: var(--font-display); font-size: 18px; color: var(--color-accent); letter-spacing: 3px; margin: 0; flex: 1; }
      .codex-header .count { font-family: var(--font-display); font-size: 10px; color: var(--color-text-dim); }
      .codex-search { padding: 5px 10px; background: var(--color-base-deep); border: 1px solid var(--color-border-low); color: var(--color-text); font-family: var(--font-display); font-size: 10px; border-radius: 3px; width: 160px; }
      .codex-search::placeholder { color: var(--color-text-dim); }
      .codex-back { font-family: var(--font-display); font-size: 10px; letter-spacing: 1px; }
      .codex-tabs { grid-area: tabs; background: var(--color-base-deep); border-bottom: 1px solid var(--color-border-low); display: flex; }
      .codex-tab { padding: 8px 20px; font-family: var(--font-display); font-size: 10px; letter-spacing: 1px; cursor: pointer; color: var(--color-text-dim); border-bottom: 2px solid transparent; }
      .codex-tab.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }
      .codex-tab:hover:not(.active) { color: var(--color-text); }
      .codex-grid { grid-area: grid; overflow-y: auto; padding: 12px; display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; }
      .codex-tile { width: 74px; padding: 6px 4px; text-align: center; background: var(--color-base-deep); border-radius: 4px; border: 1px solid var(--color-border-low); transition: border-color 0.1s; }
      .codex-tile.unlocked { cursor: pointer; }
      .codex-tile.unlocked:hover { border-color: var(--color-accent); }
      .codex-tile.locked { opacity: 0.25; cursor: default; }
      .ct-icon { font-size: 18px; color: var(--color-accent); margin-bottom: 2px; }
      .ct-name { font-family: var(--font-display); font-size: 7px; color: var(--color-text-dim); word-break: break-word; line-height: 1.2; }
      .codex-detail { grid-area: detail; background: var(--color-base-deep); border-left: 1px solid var(--color-border-low); padding: 16px; overflow-y: auto; }
      .cd-name { font-family: var(--font-display); color: var(--color-accent); font-size: 13px; margin: 0 0 6px; }
      .cd-desc { font-size: 10px; color: var(--color-energy); margin-bottom: 10px; }
      .cd-divider { height: 1px; background: var(--color-border-low); margin: 10px 0; }
      .cd-concept-label { font-family: var(--font-display); font-size: 8px; color: var(--color-text-dim); letter-spacing: 1px; margin: 0 0 6px; }
      .cd-concept { font-size: 10px; line-height: 1.7; opacity: 0.9; }
      .cd-link { display: block; margin-top: 10px; color: var(--color-accent); font-family: var(--font-display); font-size: 9px; text-decoration: none; }
      .cd-link:hover { text-decoration: underline; }
    </style>
    <div class="codex-header">
      <h2>// CODEX</h2>
      <span class="count">${totalUnlocked} / ${totalEntries} discovered</span>
      <input class="codex-search" id="codex-search" placeholder="Search..." />
      <button class="codex-back" id="codex-back">← BACK</button>
    </div>
    <div class="codex-tabs">
      <div class="codex-tab active" data-tab="cards">CARDS (${cardIds.filter(isUnlocked).length}/${cardIds.length})</div>
      <div class="codex-tab" data-tab="relics">RELICS (${relicIds.filter(isUnlocked).length}/${relicIds.length})</div>
      <div class="codex-tab" data-tab="enemies">ENEMIES (${enemyIds.filter(isUnlocked).length}/${enemyIds.length})</div>
    </div>
    <div class="codex-grid" id="codex-grid">${renderGrid(cardIds, "card")}</div>
    <div class="codex-detail" id="codex-detail"><p style="opacity:0.4;font-size:10px;font-family:var(--font-display)">Select an entry to read more.</p></div>
  `;

  let currentIds = cardIds;
  let currentKind: "card" | "relic" | "enemy" = "card";

  function bindTileClicks() {
    root.querySelectorAll<HTMLDivElement>(".codex-tile.unlocked").forEach(tile => {
      tile.addEventListener("click", () => {
        (root.querySelector("#codex-detail") as HTMLElement).innerHTML = renderDetail(tile.dataset.entry!);
      });
    });
  }
  bindTileClicks();

  root.querySelectorAll<HTMLDivElement>(".codex-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      root.querySelectorAll(".codex-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const t = tab.dataset.tab as "cards" | "relics" | "enemies";
      currentIds = t === "cards" ? cardIds : t === "relics" ? relicIds : enemyIds;
      currentKind = t === "cards" ? "card" : t === "relics" ? "relic" : "enemy";
      (root.querySelector("#codex-grid") as HTMLElement).innerHTML = renderGrid(currentIds, currentKind);
      bindTileClicks();
    });
  });

  root.querySelector<HTMLInputElement>("#codex-search")!.addEventListener("input", (e) => {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    root.querySelectorAll<HTMLDivElement>(".codex-tile").forEach(tile => {
      const name = tile.querySelector(".ct-name")?.textContent?.toLowerCase() ?? "";
      tile.style.display = (name.includes(q) || !q) ? "" : "none";
    });
  });

  root.querySelector<HTMLButtonElement>("#codex-back")!
    .addEventListener("click", () => dispatch({ type: "CLOSE_CODEX" }));

  void state;
  return root;
}
