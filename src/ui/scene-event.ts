import type { GameState } from "../engine/state";
import type { Action } from "../engine/actions";
import { EVENTS } from "../content/events";
import type { EventOutcome } from "../content/events";

function outcomeTooltip(outcome: EventOutcome): string {
  switch (outcome.kind) {
    case "nothing":        return "Nothing happens.";
    case "gainCredits":    return `<b>+${outcome.amount} credits.</b>`;
    case "loseCredits":    return `<b>−${outcome.amount} credits.</b>`;
    case "loseMaxBudget":  return `<b>−${outcome.amount} maximum SLO Budget.</b> Permanent.`;
    case "gainCard":       return `<b>Gain a ${outcome.rarity} card</b> for your deck.`;
    case "addCurse":       return `<b><i>Tech Debt</i> added to your deck.</b> Costs 2 Budget/turn.`;
  }
}

const SHARED_STYLES = `
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
  .event-outcome-box {
    max-width: 500px; background: var(--color-base-deep);
    border: 1px solid var(--color-accent); border-radius: 8px; padding: 32px;
    text-align: center; box-shadow: var(--glow-accent);
  }
  .event-outcome-label {
    font-family: var(--font-display); font-size: 10px; letter-spacing: 2px;
    color: var(--color-text-dim); margin: 0 0 12px;
  }
  .event-outcome-text {
    font-size: 16px; line-height: 1.6; color: var(--color-text);
  }
  .event-outcome-continue {
    font-family: var(--font-display); font-size: 12px; letter-spacing: 1px;
  }
`;

export function renderEvent(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-event";
  const event = EVENTS.find(e => e.id === state.currentEventId) ?? EVENTS[0];

  const choicesHtml = event.choices.map((choice, idx) => {
    const tip = outcomeTooltip(choice.outcome).replace(/"/g, "&quot;");
    return `<button class="event-choice" data-idx="${idx}" data-tooltip="${tip}">${choice.text}</button>`;
  }).join("");

  root.innerHTML = `
    <style>${SHARED_STYLES}</style>
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

export function renderEventOutcome(state: GameState, dispatch: (a: Action) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "scene-event";
  const event = EVENTS.find(e => e.id === state.currentEventId);
  const outcomeText = state.eventOutcomeText ?? "Nothing changes.";

  root.innerHTML = `
    <style>${SHARED_STYLES}</style>
    ${event ? `
    <div class="event-card" style="border-color:var(--color-border-low)">
      <div class="event-title">// ${event.title.toUpperCase()}</div>
      <div class="event-text">${event.text}</div>
    </div>` : ""}
    <div class="event-outcome-box">
      <div class="event-outcome-label">// OUTCOME</div>
      <div class="event-outcome-text">${outcomeText}</div>
    </div>
    <button class="event-outcome-continue primary" id="continue-btn">CONTINUE →</button>
  `;

  root.querySelector<HTMLButtonElement>("#continue-btn")!
    .addEventListener("click", () => dispatch({ type: "GO_TO_MAP" }));

  return root;
}
