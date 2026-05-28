export interface EventChoice {
  text: string;
  outcome: EventOutcome;
}

export type EventOutcome =
  | { kind: "nothing" }
  | { kind: "gainCredits"; amount: number }
  | { kind: "loseCredits"; amount: number }
  | { kind: "loseMaxBudget"; amount: number }
  | { kind: "gainCard"; rarity: "common" | "uncommon" | "rare" }
  | { kind: "addCurse" };

export interface IncidentEvent {
  id: string;
  title: string;
  text: string;
  choices: EventChoice[];
}

export const EVENTS: IncidentEvent[] = [
  {
    id: "untested_migration",
    title: "The Untested Migration",
    text: "You find a schema migration in the deployment pipeline marked 'low risk.' It has never been run against production data. Three engineers promise it's fine.",
    choices: [
      { text: "Run it anyway", outcome: { kind: "gainCredits", amount: 50 } },
      { text: "Roll it back and schedule a review", outcome: { kind: "nothing" } },
      { text: "Let the intern run it 'for experience'", outcome: { kind: "addCurse" } },
    ],
  },
  {
    id: "heroic_engineer",
    title: "Heroic Engineer",
    text: "A senior engineer offers to stay up all night and manually patch the issue. 'Don't page anyone, I've got this,' they say. Truly inspiring.",
    choices: [
      { text: "Accept their sacrifice", outcome: { kind: "gainCard", rarity: "rare" } },
      { text: "Insist on proper on-call rotation", outcome: { kind: "gainCredits", amount: 30 } },
    ],
  },
  {
    id: "vendor_outage",
    title: "Vendor Outage",
    text: "Your cloud provider is experiencing 'elevated error rates' in the region your database lives in. Their status page says 'investigating.' That's all.",
    choices: [
      { text: "Wait it out (what choice do you have?)", outcome: { kind: "loseMaxBudget", amount: 5 } },
      { text: "Fail over to backup region", outcome: { kind: "loseCredits", amount: 50 } },
    ],
  },
  {
    id: "mystery_microservice",
    title: "Mystery Box Microservice",
    text: "You discover a service in the catalog with no owner, no documentation, and 40,000 requests per second. Disabling it would be catastrophic. Probably.",
    choices: [
      { text: "Leave it alone and pretend you didn't see it", outcome: { kind: "nothing" } },
      { text: "Add a README and assign an owner", outcome: { kind: "gainCredits", amount: 75 } },
      { text: "Refactor it on the spot", outcome: { kind: "addCurse" } },
    ],
  },
];
