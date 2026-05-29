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

/**
 * Animate the enemy's turn: intent badge fires, sprite lunges, budget bar takes a hit.
 * Returns the total delay (ms) to wait before re-rendering.
 */
export function animateEnemyTurn(
  enemies: Array<{ instanceId: string; intentKind: string; damage: number }>,
  totalBudgetDamage: number
): number {
  if (enemies.length === 0) return 0;

  enemies.forEach(({ instanceId, intentKind }, i) => {
    const container = document.querySelector<HTMLElement>(`[data-enemy-id="${instanceId}"]`);
    if (!container) return;

    const delay = i * 80; // stagger multiple enemies slightly

    // 1. Intent badge pulses when it fires
    setTimeout(() => {
      const intentBadge = container.querySelector<HTMLElement>(".sc-intent");
      if (intentBadge) {
        intentBadge.classList.add("anim-intent-fire");
        intentBadge.addEventListener("animationend",
          () => intentBadge.classList.remove("anim-intent-fire"), { once: true });
      }
    }, delay);

    // 2. Sprite lunges toward player (only for burn/debuff — skip buff-only turns)
    if (intentKind === "burn" || intentKind === "debuff") {
      setTimeout(() => {
        const sprite = container.querySelector<HTMLElement>(".sc-sprite");
        if (sprite) {
          sprite.classList.add("anim-enemy-attack");
          sprite.addEventListener("animationend",
            () => sprite.classList.remove("anim-enemy-attack"), { once: true });
        }
      }, delay + 120);
    }

    // 3. Debuff cast: status icon floats from enemy toward player
    if (intentKind === "debuff") {
      setTimeout(() => {
        const rect = container.getBoundingClientRect();
        const icon = document.createElement("div");
        icon.className = "anim-debuff-cast";
        icon.textContent = "⬇";
        icon.style.left = `${rect.left + rect.width / 2}px`;
        icon.style.top = `${rect.bottom}px`;
        document.body.appendChild(icon);
        setTimeout(() => icon.remove(), 800);
      }, delay + 100);
    }
  });

  // 4. Budget bar impact (only if damage was taken)
  if (totalBudgetDamage > 0) {
    setTimeout(() => {
      const bar = document.querySelector<HTMLElement>(".sc-budget-fill");
      if (bar) {
        bar.classList.add("anim-budget-hit");
        bar.addEventListener("animationend",
          () => bar.classList.remove("anim-budget-hit"), { once: true });
      }
      const budgetNum = document.querySelector<HTMLElement>(".sc-budget-num");
      if (budgetNum) {
        floatNumber(budgetNum, `-${totalBudgetDamage}`, "var(--color-danger)");
      }
    }, 260 + (enemies.length - 1) * 80);
  }

  return 650 + (enemies.length - 1) * 80;
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
