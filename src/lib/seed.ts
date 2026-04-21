import { faker } from "@faker-js/faker";
import { calculateScore } from "./scoring";
import { avatarUrl } from "./utils";
import {
  generateCalls,
  generateConversations,
  generateSequences,
  generateSignals,
} from "./seed-intel";
import type {
  Activity,
  CallRecording,
  CompanySize,
  Conversation,
  Deal,
  DealStage,
  Industry,
  Lead,
  LeadStatus,
  Rep,
  Sequence,
  Signal,
  Source,
} from "./types";

const INDUSTRIES: Industry[] = [
  "SaaS",
  "eCommerce",
  "Fintech",
  "Healthcare",
  "Manufacturing",
  "Media",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
  "Australia",
  "Netherlands",
  "Sweden",
  "France",
  "Spain",
  "Italy",
  "Ireland",
  "Singapore",
  "Poland",
  "Brazil",
  "Mexico",
  "India",
];

const B2B_COMPANY_SUFFIXES = [
  "Labs",
  "Analytics",
  "Systems",
  "Works",
  "Cloud",
  "Logic",
  "Health",
  "Robotics",
  "Capital",
  "Media",
  "Studio",
  "Dynamics",
  "Networks",
  "Technologies",
  "Solutions",
  "Ventures",
];

const TAGS = [
  "enterprise",
  "smb",
  "tech-touch",
  "highlight",
  "slow-reply",
  "champion",
  "warm-intro",
  "self-serve",
  "competitor-switch",
];

const LOST_REASONS = [
  "No budget",
  "Chose competitor",
  "Timing",
  "No decision",
  "Not a fit",
];

function pickWeighted<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((acc, i) => acc + i.weight, 0);
  const r = faker.number.float({ min: 0, max: total });
  let acc = 0;
  for (const it of items) {
    acc += it.weight;
    if (r <= acc) return it.value;
  }
  return items[items.length - 1].value;
}

function recentWeighted(now: Date): Date {
  const daysBack = Math.floor(
    Math.pow(faker.number.float({ min: 0, max: 1 }), 2) * 365,
  );
  const d = new Date(now);
  d.setDate(d.getDate() - daysBack);
  d.setHours(faker.number.int({ min: 7, max: 20 }));
  d.setMinutes(faker.number.int({ min: 0, max: 59 }));
  return d;
}

function makeCompany(): string {
  const root = faker.company
    .name()
    .split(" ")[0]
    .replace(/[^a-zA-Z]/g, "");
  const suffix = faker.helpers.arrayElement(B2B_COMPANY_SUFFIXES);
  return `${root} ${suffix}`.trim();
}

function makeActivities(
  createdAt: Date,
  status: LeadStatus,
  reps: Rep[],
): Activity[] {
  const activities: Activity[] = [
    {
      id: faker.string.uuid(),
      type: "created",
      timestamp: createdAt.toISOString(),
      description: "Lead captured via form",
    },
  ];

  if (status === "new") return activities;

  const rep = faker.helpers.arrayElement(reps);
  const steps =
    status === "contacted"
      ? 1
      : status === "unqualified"
        ? 2
        : status === "qualified"
          ? faker.number.int({ min: 3, max: 5 })
          : faker.number.int({ min: 4, max: 7 });

  const types: Activity["type"][] = [
    "email",
    "call",
    "email",
    "meeting",
    "note",
    "call",
  ];
  for (let i = 0; i < steps; i++) {
    const t = new Date(createdAt);
    t.setHours(t.getHours() + (i + 1) * faker.number.int({ min: 6, max: 48 }));
    const type = types[i % types.length];
    activities.push({
      id: faker.string.uuid(),
      type,
      timestamp: t.toISOString(),
      repId: rep.id,
      description:
        type === "email"
          ? `${rep.name} sent intro email`
          : type === "call"
            ? `${rep.name} had a discovery call`
            : type === "meeting"
              ? `${rep.name} hosted a demo`
              : `${rep.name} added a note`,
    });
  }

  if (status === "qualified" || status === "converted") {
    const t = new Date(activities[activities.length - 1].timestamp);
    t.setHours(t.getHours() + 2);
    activities.push({
      id: faker.string.uuid(),
      type: "status_change",
      timestamp: t.toISOString(),
      repId: rep.id,
      description: `Status changed to ${status}`,
    });
  }
  if (status === "unqualified") {
    const t = new Date(activities[activities.length - 1].timestamp);
    t.setHours(t.getHours() + 2);
    activities.push({
      id: faker.string.uuid(),
      type: "status_change",
      timestamp: t.toISOString(),
      repId: rep.id,
      description: `Marked as unqualified`,
    });
  }

  return activities;
}

function dealStageFromStatus(status: LeadStatus): DealStage | null {
  if (status !== "qualified" && status !== "converted") return null;
  if (status === "converted") {
    return pickWeighted<DealStage>([
      { value: "closed-won", weight: 0.55 },
      { value: "closed-lost", weight: 0.45 },
    ]);
  }
  return pickWeighted<DealStage>([
    { value: "discovery", weight: 0.4 },
    { value: "proposal", weight: 0.35 },
    { value: "negotiation", weight: 0.25 },
  ]);
}

export function generateSeed(): {
  leads: Lead[];
  deals: Deal[];
  reps: Rep[];
  conversations: Conversation[];
  calls: CallRecording[];
  signals: Signal[];
  sequences: Sequence[];
} {
  faker.seed(20260421);

  const repsBase: Omit<Rep, "avatar">[] = [
    {
      id: "rep-1",
      name: "Ava Morales",
      role: "SDR",
      quotaQuarter: 80,
      achievedQuarter: 62,
    },
    {
      id: "rep-2",
      name: "Diego Park",
      role: "SDR",
      quotaQuarter: 80,
      achievedQuarter: 71,
    },
    {
      id: "rep-3",
      name: "Priya Shah",
      role: "AE",
      quotaQuarter: 250000,
      achievedQuarter: 188000,
    },
    {
      id: "rep-4",
      name: "Mateo Ricci",
      role: "AE",
      quotaQuarter: 250000,
      achievedQuarter: 224500,
    },
    {
      id: "rep-5",
      name: "Sara Lindqvist",
      role: "AE",
      quotaQuarter: 250000,
      achievedQuarter: 162300,
    },
    {
      id: "rep-6",
      name: "Kenji Tanaka",
      role: "Manager",
      quotaQuarter: 750000,
      achievedQuarter: 574800,
    },
  ];
  const reps: Rep[] = repsBase.map((r) => ({
    ...r,
    avatar: avatarUrl(r.name, "rep"),
  }));

  const now = new Date("2026-04-21T12:00:00Z");
  const leads: Lead[] = [];
  const deals: Deal[] = [];

  for (let i = 0; i < 200; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const company = makeCompany();
    const industry = faker.helpers.arrayElement(INDUSTRIES);
    const companySize = pickWeighted<CompanySize>([
      { value: "1-10", weight: 0.15 },
      { value: "11-50", weight: 0.25 },
      { value: "51-200", weight: 0.28 },
      { value: "201-1000", weight: 0.2 },
      { value: "1000+", weight: 0.12 },
    ]);
    const source = pickWeighted<Source>([
      { value: "Website", weight: 0.28 },
      { value: "LinkedIn Ads", weight: 0.18 },
      { value: "Google Ads", weight: 0.15 },
      { value: "Referral", weight: 0.12 },
      { value: "Outbound", weight: 0.1 },
      { value: "Event", weight: 0.09 },
      { value: "Content", weight: 0.08 },
    ]);
    const country = pickWeighted<string>([
      { value: "United States", weight: 0.32 },
      { value: "United Kingdom", weight: 0.12 },
      { value: "Germany", weight: 0.09 },
      { value: "Canada", weight: 0.08 },
      { value: "Australia", weight: 0.05 },
      ...COUNTRIES.slice(5).map((c) => ({ value: c, weight: 0.04 })),
    ]);
    const createdAt = recentWeighted(now);

    const status = pickWeighted<LeadStatus>([
      { value: "new", weight: 0.18 },
      { value: "contacted", weight: 0.28 },
      { value: "qualified", weight: 0.22 },
      { value: "unqualified", weight: 0.18 },
      { value: "converted", weight: 0.14 },
    ]);

    const assignedTo =
      status === "new" ? undefined : faker.helpers.arrayElement(reps).id;
    const activities = makeActivities(createdAt, status, reps);

    const base: Omit<Lead, "score" | "scoreBreakdown"> = {
      id: `lead-${i + 1}`,
      createdAt: createdAt.toISOString(),
      firstName,
      lastName,
      avatar: avatarUrl(`${firstName} ${lastName}`, "lead"),
      email: faker.internet
        .email({
          firstName,
          lastName,
          provider: `${company.toLowerCase().replace(/\s+/g, "")}.com`,
        })
        .toLowerCase(),
      company,
      companySize,
      industry,
      country,
      source,
      utm:
        source === "LinkedIn Ads" || source === "Google Ads"
          ? {
              source: source.toLowerCase().split(" ")[0],
              medium: "cpc",
              campaign: faker.helpers.arrayElement([
                "q2-growth",
                "ae-icp",
                "brand-search",
                "ae-retarget",
              ]),
            }
          : {},
      message:
        faker.number.int({ min: 0, max: 2 }) === 0
          ? faker.lorem.sentence({ min: 6, max: 18 })
          : undefined,
      status,
      assignedTo,
      tags: faker.helpers.arrayElements(
        TAGS,
        faker.number.int({ min: 0, max: 3 }),
      ),
      activities,
    };

    const { score, breakdown } = calculateScore({
      companySize,
      industry,
      source,
      country,
      message: base.message,
      activities,
    });

    leads.push({ ...base, score, scoreBreakdown: breakdown });

    const stage = dealStageFromStatus(status);
    if (stage) {
      const probability =
        stage === "discovery"
          ? faker.number.int({ min: 15, max: 30 })
          : stage === "proposal"
            ? faker.number.int({ min: 35, max: 55 })
            : stage === "negotiation"
              ? faker.number.int({ min: 55, max: 80 })
              : stage === "closed-won"
                ? 100
                : 0;

      const expectedClose = new Date(createdAt);
      expectedClose.setDate(
        expectedClose.getDate() + faker.number.int({ min: 20, max: 120 }),
      );

      deals.push({
        id: `deal-${deals.length + 1}`,
        leadId: base.id,
        name: `${company} — ${industry} expansion`,
        value: faker.number.int({ min: 5000, max: 180000 }),
        stage,
        probability,
        expectedCloseDate: expectedClose.toISOString(),
        ownerId: assignedTo ?? reps[2].id,
        createdAt: createdAt.toISOString(),
        updatedAt: activities[activities.length - 1].timestamp,
        lostReason:
          stage === "closed-lost"
            ? faker.helpers.arrayElement(LOST_REASONS)
            : undefined,
      });
    }
  }

  const conversations = generateConversations(leads, reps);
  const calls = generateCalls(leads, reps);
  const signals = generateSignals(leads);
  const sequences = generateSequences(reps);

  return { leads, deals, reps, conversations, calls, signals, sequences };
}
