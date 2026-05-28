import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { EVENTS } from "../content/events";

export function renderEvent(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-event";
  const event = EVENTS.find(e => e.id === state.currentEventId) ?? EVENTS[0];

  const choicesHtml = event.choices.map((choice, idx) => `
    <button class="event-choice" data-idx="${idx}">${choice.text}</button>
  `).join("");

  root.innerHTML = `
    <style>
      .scene-event { flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 24px; padding: 48px; }
      .event-card {
        max-width: 500px; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low); border-radius: 8px; padding: 32px;
      }
      .event-title { font-family: var(--font-display); font-size: 18px;
        color: var(--color-pop); margin: 0 0 16px; letter-spacing: 1px; }
      .event-text { font-size: 13px; line-height: 1.7; opacity: 0.9; }
      .event-choices { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 500px; }
      .event-choice {
        text-align: left; padding: 12px 16px; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low); border-radius: 4px;
        font-family: var(--font-display); font-size: 12px; cursor: pointer;
        color: var(--color-text); transition: border-color 0.1s;
      }
      .event-choice:hover { border-color: var(--color-accent); color: var(--color-accent); }
    </style>
    <div class="event-card">
      <div class="event-title">// ${event.title.toUpperCase()}</div>
      <div class="event-text">${event.text}</div>
    </div>
    <div class="event-choices">${choicesHtml}</div>
  `;

  root.querySelectorAll<HTMLButtonElement>(".event-choice").forEach(btn => {
    btn.addEventListener("click", () =>
      dispatch({ type: "EVENT_CHOICE", choiceIndex: parseInt(btn.dataset.idx!) })
    );
  });

  return root;
}
