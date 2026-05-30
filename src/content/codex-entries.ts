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
  // New relic entries
  synthetic_tests: {
    id: "synthetic_tests", kind: "relic", name: "Synthetic Tests",
    description: "At start of each turn, gain 1 Headroom.",
    realConcept: `Datadog Synthetic Monitoring continuously runs scripted tests against your APIs and UIs from locations around the world — whether or not a real user is triggering them. It's the difference between reactive monitoring (someone reports it's broken) and proactive monitoring (you know it's broken first). The Headroom every turn in Slothespire reflects what synthetic tests give you: a baseline buffer before the real traffic hits.`,
    docsLink: "https://docs.datadoghq.com/synthetics/",
  },
  error_tracking: {
    id: "error_tracking", kind: "relic", name: "Error Tracking",
    description: "When you take 8+ Burn in one hit, apply Customer-Facing 1 to all enemies.",
    realConcept: `Datadog Error Tracking groups, deduplicates, and prioritizes errors across your services. Without it, every unique stack trace looks like a new incident — with it, you see that 500 occurrences are the same root cause. The relic applies Customer-Facing to all enemies because Error Tracking surfaces which problems are user-visible: those are the ones that hurt your SLO fastest and deserve your first attack.`,
    docsLink: "https://docs.datadoghq.com/error_tracking/",
  },
  dashboards: {
    id: "dashboards", kind: "relic", name: "Dashboards",
    description: "At start of each turn, gain +1 Energy if you have no active debuffs.",
    realConcept: `Datadog Dashboards centralize metrics, logs, traces, and events into a single pane of glass. Well-built dashboards let an on-call engineer orient in seconds rather than minutes during an incident: budget burn rate, error rates, latency percentiles, and infrastructure health in one view. The steady Headroom every turn represents operational situational awareness — you're never caught completely off guard.`,
    docsLink: "https://docs.datadoghq.com/dashboards/",
  },
  service_catalog: {
    id: "service_catalog", kind: "relic", name: "Service Catalog",
    description: "At start of combat, apply Throttled 2 to all enemies.",
    realConcept: `Datadog Service Catalog tracks ownership, dependencies, documentation, and SLOs for every service in your organization. When an incident starts, the first question is often "who owns this?" — Service Catalog answers it immediately. Observability in Slothespire means seeing intent ahead; similarly, knowing your service graph means knowing what's likely to fail next and who to page.`,
    docsLink: "https://docs.datadoghq.com/service_catalog/",
  },
  incident_management: {
    id: "incident_management", kind: "relic", name: "Incident Management",
    description: "First time budget drops below 50% in a combat, gain Confidence 1.",
    realConcept: `Datadog Incident Management provides structured workflows for declaring, triaging, communicating, and resolving incidents. Having a framework — even under pressure — improves outcomes: clear ownership, status updates, timeline tracking, and post-mortem linkage. Confidence in Slothespire doubles your next attack. Starting an incident with a proper management process gives you exactly that: the confidence to act decisively rather than reactively.`,
    docsLink: "https://docs.datadoghq.com/service_management/incident_management/",
  },
  workflow_automation: {
    id: "workflow_automation", kind: "relic", name: "Workflow Automation",
    description: "At start of combat, gain 6 Headroom.",
    realConcept: `Datadog Workflow Automation lets you build automated runbooks triggered by monitors, incidents, or security signals. When a P1 fires, automation can already be silencing duplicate alerts, gathering diagnostic data, and paging the right team — before a human has clicked anything. The upfront Headroom in Slothespire represents the buffer automation creates: you start from a position of stability rather than immediately scrambling.`,
    docsLink: "https://docs.datadoghq.com/service_management/workflows/",
  },
  notebooks: {
    id: "notebooks", kind: "relic", name: "Notebooks",
    description: "Draw 1 card whenever you play an Exhaust card.",
    realConcept: `Datadog Notebooks are collaborative, living documents that mix graphs, logs, and narrative text. During incidents they serve as a shared investigation surface — anyone can see what's been tried, what the data shows, and what's still unknown. After incidents they become the foundation for postmortems. The extra card at combat start reflects what a good incident notebook gives you: more information and more options from the opening move.`,
    docsLink: "https://docs.datadoghq.com/notebooks/",
  },
  cloud_cost_mgmt: {
    id: "cloud_cost_mgmt", kind: "relic", name: "Cloud Cost Mgmt",
    description: "At start of each turn, gain 5 Credits.",
    realConcept: `Datadog Cloud Cost Management provides visibility into cloud spending, allocates costs to teams and services, and surfaces optimization opportunities. Idle resources, over-provisioned instances, and wasted reserved capacity all show up here. In Slothespire, credits represent the operational budget you have to invest in improvements — Cloud Cost Management generates steady credits because reducing waste creates a compounding economic advantage over time.`,
    docsLink: "https://docs.datadoghq.com/cloud_cost_management/",
  },
  rum: {
    id: "rum", kind: "relic", name: "RUM",
    description: "At start of each turn, if hand size < 3, draw 1 card.",
    realConcept: `Datadog Real User Monitoring captures what actual users experience: page load times, JavaScript errors, user journeys, and frustration signals. Backend metrics look healthy but users are rage-clicking? RUM shows you. It's the empathy layer of observability — reminding you that SLOs exist to protect real people. When your hand is small (options are limited), RUM draws you a card: sometimes insight about the user experience reveals a path you hadn't considered.`,
    docsLink: "https://docs.datadoghq.com/real_user_monitoring/",
  },
  sensitive_data_scanner: {
    id: "sensitive_data_scanner", kind: "relic", name: "Sensitive Data Scanner",
    description: "At start of combat, remove the first curse from your deck (if any).",
    realConcept: `Datadog Sensitive Data Scanner scans logs and events in real time to detect and redact sensitive information — PII, credit card numbers, API keys — before they're stored or indexed. A secret in your logs is technical debt waiting to become a security incident. The relic removes a curse from your deck at combat start: it finds and eliminates the hidden liability before the fight escalates, exactly as SDS removes data risk before it compounds.`,
    docsLink: "https://docs.datadoghq.com/sensitive_data_scanner/",
  },
  continuous_profiler: {
    id: "continuous_profiler", kind: "relic", name: "Continuous Profiler",
    description: "When you play an attack card, deal 2 extra Burn to the weakest enemy.",
    realConcept: `Datadog Continuous Profiler shows code-level performance at all times — which functions consume the most CPU, memory, or I/O — with near-zero overhead in production. Unlike ad-hoc profiling sessions, it's always running, so you capture the slow path even if it only happens under specific load patterns. Pressure in Slothespire adds flat damage to every attack; the Continuous Profiler gives you constant situational advantage — every action you take is informed by deep system knowledge.`,
    docsLink: "https://docs.datadoghq.com/profiler/",
  },
  // Starter cards
  page_senior_engineer: {
    id: "page_senior_engineer", kind: "card", name: "Page Senior Engineer",
    description: "2 Energy · Skill · Draw 2, gain Flow 1 (Upgraded: Draw 3)",
    realConcept: `Escalation is not failure — it's judgment. Knowing when a problem exceeds your current knowledge and needs a second pair of eyes is a core on-call skill. Senior engineers bring pattern-matching from past incidents; a 2am page to the right person can resolve in minutes what would take hours alone. The Flow status (extra energy next turn) reflects what a good escalation gives you: momentum when you need it most.`,
    docsLink: "https://sre.google/sre-book/being-on-call/",
  },
  // Common cards
  load_balancer: {
    id: "load_balancer", kind: "card", name: "Load Balancer",
    description: "1 Energy · Skill · +7 Headroom (Upgraded: +10)",
    realConcept: `A load balancer distributes incoming requests across multiple backend instances, preventing any single instance from being overwhelmed. It also enables zero-downtime deployments (drain one instance, deploy, re-add) and absorbs traffic spikes by spreading load. In Slothespire, Headroom represents the buffer you gain when load is evenly distributed — no single point collapses under pressure.`,
  },
  monitoring_alert: {
    id: "monitoring_alert", kind: "card", name: "Monitoring Alert",
    description: "0 Energy · Attack · Burn 4 (Upgraded: 6)",
    realConcept: `An alert fires when a metric crosses a threshold — but a good alert is actionable, specific, and routes to someone who can fix it. Most alert fatigue comes from alerts that fire without requiring action (symptom: on-call silences them without investigating). The key practice: every alert should have a runbook, an owner, and a clear reason it woke someone up. At 0 cost, Monitoring Alert is your cheapest offensive option — but only effective if you actually respond.`,
    docsLink: "https://docs.datadoghq.com/monitors/",
  },
  feature_flag: {
    id: "feature_flag", kind: "card", name: "Feature Flag",
    description: "1 Energy · Skill · Draw 2 (Upgraded: Draw 3)",
    realConcept: `Feature flags decouple deployment from release — code ships to production but the feature is hidden behind a flag that can be enabled per user, region, or percentage. This enables dark launches, A/B testing, instant kill switches, and gradual rollouts without re-deploying. Drawing cards represents the options a feature flag gives you: the code is already there, you're choosing when to activate it.`,
    docsLink: "https://docs.datadoghq.com/product_analytics/",
  },
  health_check: {
    id: "health_check", kind: "card", name: "Health Check",
    description: "1 Energy · Skill · +4 Headroom, Draw 1 (Upgraded: +5 Headroom)",
    realConcept: `A health check endpoint lets load balancers and orchestrators verify that a service instance is ready to receive traffic. A well-designed health check verifies actual dependencies (database connectivity, cache reachability) rather than just returning 200 OK. Bad health checks are a class of phantom read — they report green when subsystems are silently degraded. Health Check in Slothespire builds Headroom and draws a card, reflecting situational assessment: you buffer against damage AND learn something new.`,
  },
  rate_limiter: {
    id: "rate_limiter", kind: "card", name: "Rate Limiter",
    description: "1 Energy · Skill · Apply Throttled 2 to single (Upgraded: 3)",
    realConcept: `Rate limiting caps how many requests a client can make in a time window, protecting your service from being overwhelmed by a single caller — whether that's a misbehaving client, a DDoS attempt, or your own batch job eating all capacity. Throttled in Slothespire reduces an enemy's outgoing damage, exactly as rate limiting reduces the throughput of an abusive caller. It doesn't stop the attacker; it limits their impact.`,
    docsLink: "https://docs.datadoghq.com/api/latest/rate-limits/",
  },
  on_fire: {
    id: "on_fire", kind: "card", name: "On Fire",
    description: "0 Energy · Attack · Burn 5 (Upgraded: 8)",
    realConcept: `"Everything is on fire" is the informal on-call descriptor for a cascading outage where problems compound faster than they can be fixed. The phrase captures a real psychological state — when the queue of problems exceeds the capacity to process them, triage breaks down and everything feels equally urgent. On Fire channels that chaos into a 0-cost attack: when the situation is already burning, might as well use it.`,
  },
  blue_green_deploy: {
    id: "blue_green_deploy", kind: "card", name: "Blue-Green Deploy",
    description: "1 Energy · Attack · Burn 7, Draw 1 (Upgraded: Burn 10)",
    realConcept: `Blue-green deployment runs two identical production environments — one serving live traffic (blue), one receiving the new release (green). When the green environment is validated, traffic switches instantly. Rollback is a single DNS or load balancer change. The combination of damage and draw in Slothespire reflects the strategy: you commit fully to the new state (burn) while maintaining the ability to switch perspectives (draw).`,
  },
  chaos_monkey: {
    id: "chaos_monkey", kind: "card", name: "Chaos Monkey",
    description: "1 Energy · Attack · Burn 6, apply Customer-Facing 1 to single (Upgraded: Burn 8)",
    realConcept: `Chaos Monkey is Netflix's tool that randomly terminates EC2 instances in production to verify that services survive node failures without degradation. It forces engineers to build fault-tolerant systems — you cannot harden against failures you haven't experienced. The Customer-Facing debuff reflects Chaos Monkey's insight: deliberately exposing vulnerability makes the system (and your attacks) more effective against the real problems underneath.`,
    docsLink: "https://principlesofchaos.org/",
  },
  zero_downtime_deploy: {
    id: "zero_downtime_deploy", kind: "card", name: "Zero Downtime Deploy",
    description: "2 Energy · Attack · Burn 10, gain Flow 1 (Upgraded: Burn 14)",
    realConcept: `Zero-downtime deployment (also called rolling deployment or in-place upgrade) updates instances one at a time while others continue serving traffic. Prerequisites: backward-compatible API changes, database schema compatibility, and health check endpoints that accurately reflect readiness. Done correctly, users never see the deployment. The Flow status represents the momentum of a smooth deploy: you get back energy to keep moving.`,
  },
  sli_dashboard: {
    id: "sli_dashboard", kind: "card", name: "SLI Dashboard",
    description: "2 Energy · Skill · Draw 3, gain Confidence 1 (Upgraded: +2 Headroom too)",
    realConcept: `A Service Level Indicator dashboard shows the metrics that directly measure user experience: request success rate, latency at the 99th percentile, saturation. It's the difference between seeing "CPU is 80%" (a resource metric) and "0.3% of requests are failing" (an SLI). Confidence in Slothespire doubles your next attack — knowing your SLIs means knowing exactly where to strike.`,
  },
  load_shedding: {
    id: "load_shedding", kind: "card", name: "Load Shedding",
    description: "1 Energy · Skill · Apply Throttled 3 to all enemies (Upgraded: 4)",
    realConcept: `Load shedding deliberately rejects or degrades requests when a system is overwhelmed, preserving capacity for high-priority traffic. It's better to serve 70% of requests well than 100% of requests poorly. Techniques include priority queues, percentage-based rejection, and degraded responses. Applied to all enemies in Slothespire, Load Shedding is the area-of-effect response to a multi-front incident: you slow everything down to stay in control.`,
  },
  runbook: {
    id: "runbook", kind: "card", name: "Runbook",
    description: "1 Energy · Skill · Draw 2, gain Flow 1 (Upgraded: Draw 3)",
    realConcept: `A runbook is a documented procedure for handling a known operational scenario — ideally linked directly from the alert that fires when that scenario occurs. Good runbooks are specific (not "investigate the database" but "check replica lag with this query"), regularly tested, and kept up to date. Drawing cards in Slothespire represents having documented options: a runbook gives you the moves you need in the moment they matter.`,
    docsLink: "https://sre.google/sre-book/on-call/",
  },
  toil_reduction: {
    id: "toil_reduction", kind: "card", name: "Toil Reduction",
    description: "2 Energy · Skill · Remove Toil from self, +8 Headroom (Upgraded: +12)",
    realConcept: `Toil is manual, repetitive, automatable work that scales with service growth. Google SRE targets keeping toil below 50% of engineering time. Toil reduction means identifying recurring manual tasks and building automation for them — not just doing them faster. In Slothespire, Toil costs you Energy every turn it persists. Toil Reduction removes that drain and builds Headroom, reflecting what automation gives you: freed capacity and a stronger position.`,
    docsLink: "https://sre.google/sre-book/eliminating-toil/",
  },
  capacity_planning: {
    id: "capacity_planning", kind: "card", name: "Capacity Planning",
    description: "2 Energy · Skill · Restore 8 Budget, Draw 2 (Upgraded: Restore 12)",
    realConcept: `Capacity planning forecasts future resource needs based on growth trends, then provisions ahead of demand. Getting it right means avoiding both under-provisioning (service degrades under load) and over-provisioning (wasted cost). Good capacity planning integrates SLI data, traffic projections, and launch calendars. In Slothespire, the combination of budget restoration and card draw reflects what good planning gives you: recovery from current pressure AND the options to handle future pressure.`,
  },
  dependency_audit: {
    id: "dependency_audit", kind: "card", name: "Dependency Audit",
    description: "2 Energy · Attack · Burn 12, Apply Throttled 2 to single (Upgraded: Burn 16)",
    realConcept: `A dependency audit catalogs every upstream service your system relies on, maps their SLOs, and evaluates whether your reliability requirements can be met given their failure modes. "Soft dependencies" that are harder to remove than expected, and "surprise critical paths" revealed during incidents, are the most common findings. Slowing down a dependency (Throttled) while dealing damage reflects what an audit does: it exposes load-bearing components and reduces their leverage over you.`,
  },
  postmortem_template: {
    id: "postmortem_template", kind: "card", name: "Postmortem Template",
    description: "1 Energy · Skill · Restore 6 Budget, gain Flow 1 (Upgraded: Restore 9)",
    realConcept: `A postmortem template standardizes incident analysis: timeline, impact, root causes, contributing factors, and action items. Having a template ensures nothing gets skipped under time pressure. The template is not the postmortem — it's the scaffolding that lets you focus on the content. In Slothespire, the small budget restoration and Flow represent what structured analysis gives you: partial recovery from the incident AND energy to address the next one better.`,
    docsLink: "https://sre.google/sre-book/postmortem-culture/",
  },
  service_mesh: {
    id: "service_mesh", kind: "card", name: "Service Mesh",
    description: "1 Energy · Power · Each turn: +3 Headroom, Draw 1 (Upgraded: +5 Headroom)",
    realConcept: `A service mesh (Istio, Linkerd, Consul Connect) handles service-to-service communication at the infrastructure layer: mutual TLS, load balancing, circuit breaking, retries, and observability — without application code changes. It's reliability infrastructure as a platform. The sustained per-turn benefits in Slothespire reflect what a mesh provides: not a one-time fix, but ongoing automatic reliability that compounds as the combat (or system) progresses.`,
  },
  war_room: {
    id: "war_room", kind: "card", name: "War Room",
    description: "3 Energy · Skill · Exhaust · Restore 20 Budget (Upgraded: 28)",
    realConcept: `A war room (or incident bridge) gathers all stakeholders — engineering, product, communications, executives — into a single communication channel during a critical incident. The cost is high (3 energy, Exhaust), but the recovery is significant. War rooms are reserved for the most severe events because pulling everyone in for every incident creates coordination overhead and erodes the concept's value. Use sparingly. Use decisively.`,
  },
  // New enemy entries
  phantom_read: {
    id: "phantom_read", kind: "enemy", name: "Phantom Read",
    description: "Stability 16 · Burns and applies Throttled",
    realConcept: `A phantom read occurs in database transactions when a query returns different rows on successive reads within the same transaction, because another transaction inserted or deleted matching rows in between. It's one of the classic database isolation anomalies. The Throttled debuff in Slothespire reflects what phantom reads do in practice: they create inconsistent views that slow down your decision-making and force you to re-read, costing you efficiency when you can least afford it.`,
  },
  stale_cache: {
    id: "stale_cache", kind: "enemy", name: "Stale Cache",
    description: "Stability 22 · Buffs itself with Pressure then burns hard",
    realConcept: `A stale cache serves outdated data after the source has changed, often because TTL (time-to-live) was set too high or invalidation logic was missed. Worse, a stale cache can mask a broken backend — everything looks fine until the cache expires and the real problem surfaces suddenly. Stale Cache buffs itself before attacking: the problem has been quietly accumulating damage multipliers while you thought everything was fine, then hits hard when the cache finally breaks.`,
  },
  misconfigured_tls: {
    id: "misconfigured_tls", kind: "enemy", name: "Misconfigured TLS",
    description: "Stability 20 · Applies Toil then burns",
    realConcept: `A misconfigured TLS certificate — expired, self-signed, wrong domain, weak cipher — can silently fail clients, cause mysterious connection errors, or expose traffic to interception. The operational cost is high: debugging TLS issues is time-consuming (Toil), and the errors are often cryptic. In Slothespire, Misconfigured TLS first applies Toil (draining your energy), then attacks — representing how TLS problems exhaust on-call before the actual damage becomes apparent.`,
  },
  audit_trail: {
    id: "audit_trail", kind: "relic", name: "Audit Trail",
    description: "At start of combat, gain Confidence 1 and Observability 1. For each relic beyond 4, also gain Stability 1.",
    realConcept: `Datadog Audit Trail provides a tamper-proof, searchable log of every action taken in your Datadog organization — who changed which monitor, when a dashboard was modified, what API key was used. It's the foundation for security investigations, compliance audits, and incident attribution. In Slothespire, Audit Trail combines two immediate bonuses with a scaling synergy: the more observability tools you have, the more each action compounds. More relics means more compounding advantage — which is exactly what a mature observability stack provides.`,
    docsLink: "https://docs.datadoghq.com/account_management/audit_trail/",
  },
  infrastructure_monitoring: {
    id: "infrastructure_monitoring", kind: "relic", name: "Infrastructure Monitoring",
    description: "At turn start, if Headroom ≥ 20, gain +1 Energy.",
    realConcept: `Datadog Infrastructure Monitoring provides a unified view of hosts, containers, and cloud resources in real time. It answers the question: is my infrastructure healthy enough to move? In SRE terms, having ample Headroom (margin before budget burns) is exactly the signal that your infrastructure has room to absorb change. The relic rewards this margin: when you have 20+ Headroom, you earn an extra Energy — the operational equivalent of moving faster because your systems have slack.`,
    docsLink: "https://docs.datadoghq.com/infrastructure/",
  },
  log_archive: {
    id: "log_archive", kind: "relic", name: "Log Archive",
    description: "At start of combat, gain Pressure 1 per curse in your deck (max 4).",
    realConcept: `Datadog Log Management archives logs for long-term storage and compliance, making every past failure searchable. Curses in Slothespire represent accumulated technical debt and operational baggage. Log Archive turns that liability into a weapon: the more failures you've documented, the more offensive pressure you bring into the next fight. The cap at 4 reflects real archive costs — unlimited retention has diminishing returns.`,
    docsLink: "https://docs.datadoghq.com/logs/log_configuration/archives/",
  },
  error_budget_policy: {
    id: "error_budget_policy", kind: "relic", name: "Error Budget Policy",
    description: "At start of combat, if your deck has no curses, gain Stability 2.",
    realConcept: `An error budget policy is a formal agreement between product and SRE: when the error budget is exhausted, feature work stops and reliability work takes priority. The purest form of the policy is a clean slate — a deck with no curses means you've addressed your technical debt, honored your reliability commitments, and earned structural advantage. Stability 2 reflects the protective margin that comes from a healthy, well-managed system.`,
    docsLink: "https://sre.google/sre-book/embracing-risk/",
  },
  mobile_performance: {
    id: "mobile_performance", kind: "relic", name: "Mobile Performance",
    description: "At turn start, if your hand is empty, draw 3 cards.",
    realConcept: `Datadog Mobile Application Performance Monitoring tracks startup time, crash rates, and UI rendering on real devices. An empty hand represents a moment of zero visibility — you have no options and no insight into what's happening. Mobile Performance is the emergency response: when you have nothing left to work with, it floods you with diagnostic data and options. Three cards from nothing is what a well-instrumented mobile app gives you during a crisis.`,
    docsLink: "https://docs.datadoghq.com/real_user_monitoring/mobile_and_tv_monitoring/",
  },
  watchdog_insights: {
    id: "watchdog_insights", kind: "relic", name: "Watchdog Insights",
    description: "When you take 15+ Burn in one hit, gain Confidence 1.",
    realConcept: `Datadog Watchdog Insights surfaces the anomalies most likely to be causing your current SLO pain — automatically, without requiring you to know what to look for. The heaviest hits in Slothespire (15+ Burn in one go) represent the most severe incidents: production outages, cascading failures, P0 alerts. Watchdog Insights triggers on exactly those moments, giving you Confidence — the ability to hit back harder — because big incidents concentrate information and focus.`,
    docsLink: "https://docs.datadoghq.com/watchdog/insights/",
  },
  ci_visibility: {
    id: "ci_visibility", kind: "relic", name: "CI Visibility",
    description: "When an enemy dies, restore 6 Budget.",
    realConcept: `Datadog CI Visibility gives engineering teams end-to-end observability into their CI pipelines — test results, flaky tests, build durations, and failure rates. Every failing test caught before production is a potential incident averted and SLO budget preserved. The relic captures this: each enemy you defeat (each problem you eliminate) restores a portion of your error budget, reflecting how proactive quality work directly preserves reliability.`,
    docsLink: "https://docs.datadoghq.com/continuous_integration/",
  },
  incident_timeline: {
    id: "incident_timeline", kind: "relic", name: "Incident Timeline",
    description: "When an enemy dies, apply Throttled 2 to remaining enemies.",
    realConcept: `Incident timelines document the sequence of events during an outage. When one contributing cause is resolved, it often reveals that the remaining problems are connected — and resolving the first gives you information and leverage to contain the others. Throttled 2 on remaining enemies represents exactly this: eliminating one problem buys you breathing room by reducing the pressure from everything still outstanding.`,
    docsLink: "https://docs.datadoghq.com/service_management/incident_management/",
  },
  service_map: {
    id: "service_map", kind: "relic", name: "Service Map",
    description: "At start of combat, Observability 1 + Throttled 1 to all enemies.",
    realConcept: `Datadog Service Map automatically discovers and visualizes the dependencies between your services, showing how a request flows across your system. When you enter an incident knowing the service graph, you have observability advantage over the problem: you see future intents (what will break next) and can slow the spread (throttle impact). The relic gives both: you see further ahead, and enemies deal less.`,
    docsLink: "https://docs.datadoghq.com/tracing/services/services_map/",
  },
  database_monitoring: {
    id: "database_monitoring", kind: "relic", name: "Database Monitoring",
    description: "When you play an attack on a Customer-Facing enemy, deal 4 extra Burn.",
    realConcept: `Datadog Database Monitoring provides deep visibility into database queries, execution plans, and host metrics. When a service is already customer-facing and struggling, database performance is often the hidden root cause that makes everything worse. The relic rewards targeting these amplified threats: attacking an already-vulnerable enemy (Customer-Facing) triggers deeper investigation and hits harder for it.`,
    docsLink: "https://docs.datadoghq.com/database_monitoring/",
  },
  real_time_notifications: {
    id: "real_time_notifications", kind: "relic", name: "Real-Time Notifications",
    description: "At turn start, remove 1 stack of On-Call Fatigue from yourself.",
    realConcept: `Datadog alerting delivers real-time notifications through the right channel at the right time — PagerDuty, Slack, email, webhooks — so the right person gets exactly one signal, not 47. On-Call Fatigue in Slothespire drains your budget every turn it persists. Real-Time Notifications removes one stack per turn because well-tuned alerting reduces the cumulative cost of being on call: fewer duplicate pages, less cognitive overhead, less degradation over time.`,
    docsLink: "https://docs.datadoghq.com/monitors/notify/",
  },
};
