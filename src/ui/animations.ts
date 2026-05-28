// Combat animation helpers.
// These operate on the CURRENT DOM before state-driven re-render,
// creating the illusion that the action causes the visible effect.

function floatNumber(anchorEl: Element, text: string, color: string): void {
  const rect = anchorEl.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "anim-float-number";
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top + rect.height / 4}px`;
  document.body.appendChild(el);
  // Remove after animation completes (0.62s + small buffer)
  setTimeout(() => el.remove(), 700);
}

/** Shake the enemy sprite and show a floating damage number. */
export function animateAttack(enemyInstanceId: string, damage: number): void {
  const container = document.querySelector<HTMLElement>(`[data-enemy-id="${enemyInstanceId}"]`);
  if (!container) return;

  const sprite = container.querySelector<HTMLElement>(".sc-sprite");
  if (sprite) {
    sprite.classList.add("anim-hit");
    sprite.addEventListener("animationend", () => sprite.classList.remove("anim-hit"), { once: true });
  }

  if (damage > 0) {
    floatNumber(container, `-${damage}`, "var(--color-danger)");
  }
}

/** Show a glowing shield barrier in the play area and a floating headroom number. */
export function animateDefend(headroomGained: number): void {
  const playArea = document.querySelector<HTMLElement>(".sc-play");
  if (playArea) {
    const barrier = document.createElement("div");
    barrier.className = "anim-shield-barrier";
    barrier.textContent = "🛡";
    playArea.appendChild(barrier);
    setTimeout(() => barrier.remove(), 600);
  }

  if (headroomGained > 0) {
    const headroomEl = document.querySelector<HTMLElement>(".sc-headroom");
    if (headroomEl) {
      floatNumber(headroomEl, `+${headroomGained}`, "var(--color-accent)");
    }
  }
}
