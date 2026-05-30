export interface EventChoice {
  text: string;
  outcome: EventOutcome;
}

export type EventOutcome =
  | { kind: "nothing" }
  | { kind: "gainCredits"; amount: number }
  | { kind: "loseCredits"; amount: number }
  | { kind: "loseMaxBudget"; amount: number }
  | { kind: "gainMaxBudget"; amount: number }
  | { kind: "restoreBudget"; amount: number }
  | { kind: "gainCard"; rarity: "common" | "uncommon" | "rare" }
  | { kind: "addCurse" }
  | { kind: "gainHotfix"; hotfixId: string };

export interface IncidentEvent {
  id: string;
  title: string;
  text: string;
  choices: EventChoice[];
}

export const EVENTS: IncidentEvent[] = [
  // ── REDESIGNED EXISTING EVENTS ──────────────────────────────────

  {
    id: "untested_migration",
    title: "The Untested Migration",
    text: "A schema migration: 'low risk.' Never tested against production data. Three engineers say it's fine. One of them wrote it at 2am.",
    choices: [
      { text: "Run it — move fast, fix if needed",
        outcome: { kind: "gainCredits", amount: 60 } },
      { text: "Run it with a rollback script ready",
        outcome: { kind: "gainCredits", amount: 30 } },
      { text: "Delay until you can write a test",
        outcome: { kind: "gainCard", rarity: "uncommon" } },
    ],
  },

  {
    id: "heroic_engineer",
    title: "The Hero Pattern",
    text: "A senior engineer offers to stay up all night and manually fix the issue. 'I know this system better than anyone.' They are already tired. This is the third time this month.",
    choices: [
      { text: "Accept — you need the fix now",
        outcome: { kind: "gainHotfix", hotfixId: "runbook_hotfix" } },
      { text: "Insist they document the runbook first",
        outcome: { kind: "gainCard", rarity: "uncommon" } },
      { text: "Escalate to management about on-call sustainability",
        outcome: { kind: "gainMaxBudget", amount: 5 } },
    ],
  },

  {
    id: "vendor_outage",
    title: "Vendor Outage",
    text: "Your cloud provider has been 'investigating elevated error rates' for 45 minutes. No ETA. Your SLO window closes in two hours.",
    choices: [
      { text: "Wait for the vendor to resolve it",
        outcome: { kind: "loseMaxBudget", amount: 5 } },
      { text: "Fail over to your backup region",
        outcome: { kind: "loseCredits", amount: 60 } },
      { text: "Enable degraded mode and communicate to customers",
        outcome: { kind: "restoreBudget", amount: 12 } },
    ],
  },

  {
    id: "mystery_microservice",
    title: "Mystery Box Microservice",
    text: "A service: no owner, no docs, 40k req/s. Your tracing shows it makes calls to seven other services. Disabling it would be 'interesting.'",
    choices: [
      { text: "Leave it — touching it is worse",
        outcome: { kind: "addCurse" } },
      { text: "Add a README, assign an owner, file a ticket",
        outcome: { kind: "gainCredits", amount: 75 } },
      { text: "Trace every dependency and document the blast radius",
        outcome: { kind: "gainCard", rarity: "rare" } },
    ],
  },

  {
    id: "on_call_handoff",
    title: "On-Call Handoff",
    text: "The departing engineer says 'everything's fine.' Seven incidents are marked 'investigating.' One hasn't been touched in four days.",
    choices: [
      { text: "Accept the handoff — you'll handle it",
        outcome: { kind: "addCurse" } },
      { text: "Do a proper handoff review — 90 minutes",
        outcome: { kind: "gainHotfix", hotfixId: "clear_slate_hotfix" } },
      { text: "Escalate the undocumented incident before accepting",
        outcome: { kind: "gainCard", rarity: "uncommon" } },
    ],
  },

  {
    id: "forgotten_cron",
    title: "Forgotten Cron",
    text: "A cron job has consumed 40% of database CPU for six months. No alerts fired. No one noticed. It's not doing anything wrong. It's not doing anything at all.",
    choices: [
      { text: "Disable it and see what screams",
        outcome: { kind: "loseMaxBudget", amount: 4 } },
      { text: "Optimize the query, write a test, monitor carefully",
        outcome: { kind: "gainCard", rarity: "uncommon" } },
      { text: "Leave it — you have bigger problems",
        outcome: { kind: "loseCredits", amount: 25 } },
    ],
  },

  {
    id: "old_status_page",
    title: "The Honest Dashboard",
    text: "Status page: 'All Systems Operational.' Customers are reporting errors. The page hasn't been updated in 47 days. Your VP of Sales just texted.",
    choices: [
      { text: "Update the status page immediately — transparency first",
        outcome: { kind: "gainCredits", amount: 50 } },
      { text: "Fix the outage first, communicate after",
        outcome: { kind: "loseMaxBudget", amount: 3 } },
      { text: "Write an incident postmortem preemptively",
        outcome: { kind: "gainCard", rarity: "common" } },
    ],
  },

  {
    id: "refactor_time",
    title: "The 6,000-Line File",
    text: "6,000 lines. No tests. One author, gone eight months. Between you and the boss fight. The comment at line 1 says 'TODO: clean this up.'",
    choices: [
      { text: "Write tests before touching anything",
        outcome: { kind: "gainCard", rarity: "rare" } },
      { text: "Extract the function you need and move on",
        outcome: { kind: "gainCredits", amount: 40 } },
      { text: "Commit a comment explaining what you found",
        outcome: { kind: "restoreBudget", amount: 18 } },
    ],
  },

  // ── NEW EVENTS ────────────────────────────────────────────────────

  {
    id: "three_am_page",
    title: "The 3am Page",
    text: "Your phone goes off. P1 incident. You were asleep. You are very much not asleep now. It's your service. Probably.",
    choices: [
      { text: "Jump in — this is what you trained for",
        outcome: { kind: "gainHotfix", hotfixId: "caffeine_hotfix" } },
      { text: "Triage first, then escalate if needed",
        outcome: { kind: "restoreBudget", amount: 15 } },
      { text: "Auto-escalate to secondary on-call",
        outcome: { kind: "addCurse" } },
    ],
  },

  {
    id: "production_database_migration",
    title: "The Database Migration",
    text: "The schema migration has been delayed three sprints. It blocks two features. The CTO wants it done this week. It's 4pm on a Thursday.",
    choices: [
      { text: "Run it now with a maintenance window",
        outcome: { kind: "gainCard", rarity: "uncommon" } },
      { text: "Blue-green deploy — risky but no downtime",
        outcome: { kind: "gainCredits", amount: 80 } },
      { text: "Write the rollback script first, run tomorrow",
        outcome: { kind: "gainHotfix", hotfixId: "rollback_hotfix" } },
    ],
  },

  {
    id: "the_postmortem",
    title: "The Postmortem Meeting",
    text: "Two hours blocked for a postmortem. Half the team has another incident. The doc is blank. The last action item from the previous postmortem isn't done.",
    choices: [
      { text: "Cancel it — the team is overwhelmed",
        outcome: { kind: "addCurse" } },
      { text: "Run a 30-minute focused session, document only action items",
        outcome: { kind: "gainCredits", amount: 50 } },
      { text: "Run the full postmortem properly",
        outcome: { kind: "gainCard", rarity: "uncommon" } },
    ],
  },

  {
    id: "the_on_call_rotation",
    title: "The On-Call Rotation",
    text: "The team's on-call schedule is empty next month. Everyone is avoiding it. Three people have already 'not seen' the calendar invite.",
    choices: [
      { text: "Volunteer for extra shifts — lead by example",
        outcome: { kind: "gainMaxBudget", amount: 8 } },
      { text: "Mandate fair rotation — no exceptions",
        outcome: { kind: "gainCard", rarity: "common" } },
      { text: "Automate as much as possible first, then schedule",
        outcome: { kind: "gainHotfix", hotfixId: "reboot_hotfix" } },
    ],
  },

  {
    id: "compliance_audit",
    title: "The Compliance Audit",
    text: "Auditors want evidence of your incident response procedures. You have procedures. They are in a Google Doc. Last edited: two years ago.",
    choices: [
      { text: "Present what you have with confidence",
        outcome: { kind: "gainCredits", amount: 70 } },
      { text: "Stay up updating documentation first",
        outcome: { kind: "loseMaxBudget", amount: 5 } },
      { text: "Show them your actual runbooks and dashboards",
        outcome: { kind: "gainCard", rarity: "uncommon" } },
    ],
  },

  {
    id: "the_feature_request",
    title: "Feature Request Mid-Incident",
    text: "Product wants their feature shipped today. The incident is 'basically resolved.' The CEO retweeted a competitor. This is not a great time.",
    choices: [
      { text: "Ship the feature — the incident is stable",
        outcome: { kind: "gainCredits", amount: 60 } },
      { text: "Hold the line — incident resolution first",
        outcome: { kind: "restoreBudget", amount: 20 } },
      { text: "Ship without testing to make everyone happy",
        outcome: { kind: "addCurse" } },
    ],
  },

  {
    id: "the_overloaded_service",
    title: "Traffic Spike",
    text: "A viral post. Your service is handling 20x normal traffic. The CDN is holding for now. You have 15 minutes before it doesn't.",
    choices: [
      { text: "Rate limit aggressively — protect the backend",
        outcome: { kind: "loseCredits", amount: 50 } },
      { text: "Scale horizontally — expensive but thorough",
        outcome: { kind: "loseMaxBudget", amount: 4 } },
      { text: "Enable caching at the edge — might work",
        outcome: { kind: "gainCard", rarity: "uncommon" } },
    ],
  },

  {
    id: "the_reorg",
    title: "The Reorg",
    text: "Platform infrastructure is being reorganized. Your team owns 'everything related to reliability.' That could mean anything. It currently means everything.",
    choices: [
      { text: "Define a clear scope and push back on scope creep",
        outcome: { kind: "gainMaxBudget", amount: 6 } },
      { text: "Accept the ambiguity and keep shipping",
        outcome: { kind: "gainCard", rarity: "common" } },
      { text: "Document everything you own right now",
        outcome: { kind: "gainCredits", amount: 55 } },
    ],
  },
];
