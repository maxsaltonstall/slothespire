export interface CodexEntry {
  id: string;
  kind: "card" | "relic" | "enemy";
  name: string;
  description: string;
  realConcept: string;
  docsLink?: string;
}

export const CODEX_ENTRIES: Record<string, CodexEntry> = {
  manual_fix: {
    id: "manual_fix", kind: "card", name: "Manual Fix",
    description: "1 Energy · Attack · Burn 6 (Upgraded: 9)",
    realConcept: `A manual fix is the on-call engineer's first tool: directly intervening to stop the bleeding without addressing root cause. In SRE practice, manual fixes are tracked as toil — necessary but unsustainable. Every manual fix should generate a follow-up ticket: automate the detection, the response, or both. The goal is to make this card unnecessary by the end of the run.`,
    docsLink: "https://sre.google/sre-book/eliminating-toil/",
  },
  circuit_breaker: {
    id: "circuit_breaker", kind: "card", name: "Circuit Breaker",
    description: "1 Energy · Skill · +8 Headroom (Upgraded: +12)",
    realConcept: `A circuit breaker pattern stops calls to a failing downstream dependency after a failure threshold is crossed, preventing cascading failures. When open, requests fail fast instead of waiting. After a timeout, it enters half-open state: one probe request decides whether to close (recover) or stay open. Named after the electrical safety device — it breaks the circuit before the system burns out.`,
    docsLink: "https://martinfowler.com/bliki/CircuitBreaker.html",
  },
  canary_deploy: {
    id: "canary_deploy", kind: "card", name: "Canary Deploy",
    description: "1 Energy · Attack · Burn 5, Draw 1 (Upgraded: Burn 8)",
    realConcept: `Canary deployment routes a small percentage of traffic (1-5%) to a new version before a full rollout. Like miners sending canaries into coal mines to detect gas, canary deploys surface problems before they affect all users. Key metrics to watch: error rate, latency, and any SLO-relevant signals. If the canary dies, roll back immediately. If it survives, gradually shift more traffic.`,
    docsLink: "https://docs.datadoghq.com/monitors/",
  },
  postmortem: {
    id: "postmortem", kind: "card", name: "Blameless Postmortem",
    description: "2 Energy · Skill · Exhaust · Restore 12 Budget",
    realConcept: `A blameless postmortem focuses on system failures rather than individual blame. The 5 Whys, timeline reconstruction, and action items are all about making the system more resilient — not finding who to punish. Google SRE formalized this: the goal is learning, not punishment. Postmortems should be shared widely; a failure only experienced by one team is a failure experienced by everyone eventually.`,
    docsLink: "https://sre.google/sre-book/postmortem-culture/",
  },
  chaos_engineering: {
    id: "chaos_engineering", kind: "card", name: "Chaos Engineering",
    description: "2 Energy · Skill · Apply Customer-Facing 3 to all, Self-Burn 5",
    realConcept: `Chaos engineering deliberately injects failures into production systems to expose weaknesses before they cause unplanned outages. The principle: it's better to break things on purpose during business hours than to be surprised at 3am. Netflix's Chaos Monkey randomly terminates EC2 instances in production. The practice requires robust monitoring — you need to observe the failure, not just cause it.`,
    docsLink: "https://principlesofchaos.org/",
  },
  failover: {
    id: "failover", kind: "card", name: "Failover",
    description: "1 Energy · Skill · +5 Headroom (Upgraded: +8)",
    realConcept: `Failover is the automatic or manual switching to a redundant system when the primary fails. Active-passive failover keeps a standby ready but idle; active-active runs parallel. The SRE question: how long does failover take, and is that acceptable to your SLO? Headroom in Slothespire represents the buffer you buy when you route around a failing component.`,
    docsLink: "https://docs.datadoghq.com/reliability_engineering/",
  },
  rollback: {
    id: "rollback", kind: "card", name: "Rollback",
    description: "1 Energy · Attack · Burn 8 (Upgraded: 11)",
    realConcept: `A rollback reverts a deployment to a previous known-good version. It's one of the fastest ways to stop the bleeding during an incident caused by a bad deploy. Prerequisites: immutable artifacts, tested rollback procedures, and confidence that the previous version is actually safe. Rollbacks are not always possible (database migrations, in-flight transactions), which is why forward fixes sometimes matter more.`,
    docsLink: "https://docs.datadoghq.com/continuous_delivery/",
  },
  graceful_degradation: {
    id: "graceful_degradation", kind: "card", name: "Graceful Degradation",
    description: "1 Energy · Skill · +9 Headroom (Upgraded: +12)",
    realConcept: `Graceful degradation means a system continues operating at reduced capacity when parts fail, rather than failing completely. A recommendation engine going down shouldn't take down the checkout flow. Techniques: fallback responses, feature flags to disable non-critical paths, circuit breakers on non-essential services. The key question: what's the minimum viable version of this service?`,
  },
  pager: {
    id: "pager", kind: "relic", name: "Pager",
    description: "At start of your turn, if SLO Budget ≤ 30%, draw 1 extra card.",
    realConcept: `The on-call pager is the entry point for every incident. Effective paging means: actionable alerts (not informational noise), clear runbook links, and right-person routing. When budget (error budget) is low, the pager fires faster — you need more resources to respond. The Pager relic reflects this: low budget state triggers enhanced draw, simulating the surge of attention that a real pager generates.`,
    docsLink: "https://sre.google/sre-book/being-on-call/",
  },
  apm_tracing: {
    id: "apm_tracing", kind: "relic", name: "APM Tracing",
    description: "At start of combat, gain Observability 2.",
    realConcept: `Application Performance Monitoring distributed tracing follows a request as it traverses multiple services, recording timing and metadata at each hop. With APM, you can pinpoint which service introduced latency or generated an error. Datadog APM uses auto-instrumentation to capture spans without code changes. The Observability status in Slothespire represents what APM gives you: visibility into what's coming before it hits.`,
    docsLink: "https://docs.datadoghq.com/tracing/",
  },
  watchdog: {
    id: "watchdog", kind: "relic", name: "Watchdog",
    description: "At start of combat, apply Customer-Facing 1 to the highest-stability enemy.",
    realConcept: `Datadog Watchdog automatically detects anomalies in metrics, traces, and logs using ML algorithms — without you having to define alert thresholds. It surfaces unusual patterns: a sudden spike in error rate, unexpected latency increase, or abnormal resource utilization. In Slothespire, Watchdog targets the toughest enemy with Customer-Facing — making the most threatening problem exploitable by your next attack.`,
    docsLink: "https://docs.datadoghq.com/watchdog/",
  },
  live_tail: {
    id: "live_tail", kind: "relic", name: "Live Tail",
    description: "At start of combat, draw 1 extra card.",
    realConcept: `Datadog Live Tail streams logs in real time as they are ingested, with no indexing delay. During an incident, Live Tail is often the first tool you reach for: it shows exactly what's happening right now, before you've had time to build a proper query. The extra card in Slothespire represents the immediate situational awareness Live Tail gives you at the start of a fight.`,
    docsLink: "https://docs.datadoghq.com/logs/live_tail/",
  },
  flapping_health_check: {
    id: "flapping_health_check", kind: "enemy", name: "Flapping Health Check",
    description: "Stability 20 · Burns 6 and 4 alternating",
    realConcept: `A flapping health check oscillates between passing and failing without a clear root cause. Common causes: resource contention, network jitter, slow disk I/O, or an overly tight timeout. Flapping checks generate alert fatigue — the on-call learns to ignore them, which is dangerous. Fix: add hysteresis (require N failures before alerting), tune timeouts, and investigate the underlying cause.`,
    docsLink: "https://docs.datadoghq.com/monitors/configuration/",
  },
  memory_leak: {
    id: "memory_leak", kind: "enemy", name: "Memory Leak",
    description: "Stability 36 · Stacks Pressure over time",
    realConcept: `A memory leak occurs when a program allocates memory but never frees it, causing memory usage to grow until the process crashes. In long-running services, even small leaks accumulate. Key signals: steadily rising heap usage, degrading GC performance, eventual OOM kills. Mitigation: profiling tools (Datadog Continuous Profiler shows heap allocation hotspots), memory limit caps, and scheduled restarts as a short-term workaround.`,
    docsLink: "https://docs.datadoghq.com/profiler/",
  },
  the_pager_storm: {
    id: "the_pager_storm", kind: "enemy", name: "The Pager Storm",
    description: "Stability 75 · Burns hard, applies On-Call Fatigue, scales Pressure",
    realConcept: `Alert fatigue occurs when on-call engineers receive so many alerts that they stop treating each one with urgency. A pager storm — hundreds of alerts triggered by a single root cause — is one of the most dangerous failure modes. The correct response: triage, not reaction. Find the root cause; silence derivative alerts. The Pager Storm boss teaches this: brute-forcing through every alert in phase 1 leaves you depleted for phase 2.`,
    docsLink: "https://docs.datadoghq.com/monitors/manage/",
  },
  zombie_process: {
    id: "zombie_process", kind: "enemy", name: "Zombie Process",
    description: "Stability 18 · Applies Toil debuff",
    realConcept: `A zombie process has finished execution but still has an entry in the process table because its parent hasn't read its exit status. In large numbers they waste PID space. More broadly, zombie processes are a metaphor for technical debt: the work is done, but the cleanup wasn't. They apply Toil in Slothespire because managing them costs energy without addressing any real problem.`,
  },
  cascading_failure: {
    id: "cascading_failure", kind: "enemy", name: "Cascading Failure",
    description: "Stability 55 (Elite) · Stacks Pressure each turn",
    realConcept: `A cascading failure starts small and amplifies: one service slows under load, its callers time out and retry, increasing load further, eventually bringing down the whole system. Prevention: circuit breakers, rate limiting, load shedding, bulkheads. In Slothespire, Cascading Failure stacks Pressure — representing how the pressure from each failure makes subsequent failures harder and harder to contain.`,
  },
  cron_storm: {
    id: "cron_storm", kind: "enemy", name: "Cron Storm",
    description: "Stability 24 · Triple burn pattern",
    realConcept: `A cron storm occurs when many cron jobs are scheduled to run at the same time (midnight, top of the hour), creating synchronized load spikes. The fix: stagger job start times, add jitter, and monitor for resource contention. Cron Storm in Slothespire attacks in rapid bursts — three hits in a pattern — reflecting how synchronized load creates sudden, overlapping pressure rather than steady predictable load.`,
  },
  deadlock: {
    id: "deadlock", kind: "enemy", name: "Deadlock",
    description: "Stability 30 · Applies Toil 2 then burns hard",
    realConcept: `A deadlock occurs when two or more processes each wait for a resource held by the other, creating a circular dependency that can never resolve. Classic symptoms: threads stuck at 100% CPU but making no progress, or hanging database queries. Prevention: consistent lock ordering, timeouts on all waits, deadlock detection algorithms. In Slothespire, Deadlock taxes your energy first (Toil), then hits hard — you're stuck and taking damage.`,
  },
  total_outage: {
    id: "total_outage", kind: "enemy", name: "Total Outage",
    description: "Stability 100 (Act II Boss) · Escalating burns + debuffs",
    realConcept: `A total outage is the worst-case scenario: all or most of a service's functionality is unavailable to users. Root causes vary — hardware failure, bad deploy, cascading dependency failures, DDoS — but the response is consistent: establish communication, triage severity, engage the right people, resolve, and write a postmortem. Total Outage in Slothespire teaches graceful degradation: you cannot prevent all the damage, but you can survive it with the right combination of headroom and targeted responses.`,
  },
};
