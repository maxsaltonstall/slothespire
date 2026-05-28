import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";

export function renderEnd(
  state: GameState,
  dispatch: (a: Action) => void
): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-end";
  const won = state.scene === "won";
  const headline = won ? "RUN COMPLETE" : "BUDGET BREACHED";
  const flavor = won
    ? "You held the SLO. The sloths sleep easier tonight."
    : "Service degraded. Customers noticed. Postmortem next sprint.";

  root.innerHTML = `
    <style>
      .scene-end {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 24px; text-align: center;
      }
      .scene-end h2 {
        font-size: 40px; letter-spacing: 4px;
        color: ${won ? "var(--color-accent)" : "var(--color-danger)"};
        text-shadow: ${won ? "var(--glow-accent)" : "var(--glow-danger)"};
        margin: 0;
      }
      .scene-end .flavor {
        max-width: 400px; opacity: 0.8;
        font-family: var(--font-display); font-size: 13px; line-height: 1.5;
      }
    </style>
    <h2>${headline}</h2>
    <div class="flavor">${flavor}</div>
    <button class="primary" data-action="return-title">RETURN TO TITLE</button>
  `;

  root.querySelector<HTMLButtonElement>('[data-action="return-title"]')!
    .addEventListener("click", () => dispatch({ type: "RETURN_TO_TITLE" }));

  return root;
}
