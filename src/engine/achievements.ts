export const ACHV_KEY = "slothespire:achievements";

export interface AchievementDef {
  id: string;
  icon: string;
  name: string;
  description: string;
  secret?: boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first_response",        icon: "🚨", name: "First Response",          description: "Win your first combat." },
  { id: "slo_met",               icon: "📋", name: "SLO Met",                 description: "Complete a full run (win Act II)." },
  { id: "pager_silenced",        icon: "🌩️", name: "Pager Silenced",          description: "Defeat The Pager Storm." },
  { id: "total_outage_averted",  icon: "💥", name: "Total Outage Averted",    description: "Defeat Total Outage (Act II boss)." },
  { id: "defense_in_depth",      icon: "🛡", name: "Defense in Depth",        description: "End a turn with 30+ Headroom." },
  { id: "flow_state",            icon: "⚡", name: "Flow State",              description: "Spend 5+ Energy in a single turn." },
  { id: "maximum_pressure",      icon: "🔥", name: "Maximum Pressure",        description: "Deal 20+ Burn with a single card." },
  { id: "blameless_culture",     icon: "🎯", name: "Blameless Culture",       description: "Win a combat without playing any attack cards." },
  { id: "minimalist",            icon: "📦", name: "Minimalist",              description: "Win a combat with exactly the 10-card starter deck." },
  { id: "power_trip",            icon: "🔋", name: "Power Trip",              description: "Have 3 Power cards active simultaneously." },
  { id: "best_in_show",          icon: "🐶", name: "Best in Show",            description: "Earn the Bits the Dog relic." },
  { id: "full_observability",    icon: "👁", name: "Full Observability",      description: "Have 3+ Observability stacks active at once." },
  { id: "debt_free",             icon: "🧹", name: "Debt Free",               description: "Remove a Tech Debt curse from your deck." },
  { id: "deploy_on_friday",      icon: "📅", name: "Deploy on Friday",        description: "Win a run with Deploy Every Commit power active." },
  { id: "on_call_veteran",       icon: "⏱", name: "On-Call Veteran",         description: "Survive 20 turns in a single combat." },
  { id: "its_always_dns",        icon: "🌐", name: "It's Always DNS",         description: "Encounter Misconfigured TLS in a run." },
  { id: "page_the_right_person", icon: "🤝", name: "Page the Right Person",   description: "Play Page Senior Engineer and win that combat." },
  { id: "five_nines",            icon: "🏆", name: "Five Nines",              description: "Win a combat with Five Nines active at full Budget." },
  { id: "healthy_boundaries",    icon: "🚪", name: "Healthy Boundaries",      description: "Abandon a run using the Quit button.", secret: true },
  { id: "blameless",             icon: "💀", name: "blameless",               description: "Lose a run. Everyone fails — it's about the system.", secret: true },
];

let _cache: Set<string> | null = null;

function load(): Set<string> {
  if (_cache !== null) return _cache;
  try {
    const raw = localStorage.getItem(ACHV_KEY);
    _cache = new Set(raw ? JSON.parse(raw) : []);
  } catch {
    _cache = new Set();
  }
  return _cache;
}

function save(ids: Set<string>): void {
  try { localStorage.setItem(ACHV_KEY, JSON.stringify([...ids])); } catch {}
}

export function isUnlocked(id: string): boolean { return load().has(id); }
export function allUnlocked(): string[] { return [...load()]; }
export function clearAchievements(): void { _cache = new Set(); localStorage.removeItem(ACHV_KEY); }

export function unlock(id: string): AchievementDef | null {
  if (load().has(id)) return null;
  load().add(id);
  save(load());
  return ACHIEVEMENT_DEFS.find(a => a.id === id) ?? null;
}

export function showToast(def: AchievementDef): void {
  const existing = document.querySelector(".achievement-toast");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.className = "achievement-toast";
  el.innerHTML = `
    <span class="at-icon">${def.icon}</span>
    <div class="at-body">
      <div class="at-label">ACHIEVEMENT</div>
      <div class="at-name">${def.name}</div>
    </div>
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}
