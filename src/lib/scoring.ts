import type {
  CompanySize,
  Industry,
  Lead,
  ScoreComponent,
  Source,
} from "./types";

const FIT_SIZE_POINTS: Record<CompanySize, number> = {
  "1-10": 2,
  "11-50": 6,
  "51-200": 14,
  "201-1000": 22,
  "1000+": 26,
};

const FIT_INDUSTRY_POINTS: Record<Industry, number> = {
  SaaS: 18,
  Fintech: 16,
  eCommerce: 12,
  Healthcare: 14,
  Manufacturing: 10,
  Media: 8,
};

const INTENT_SOURCE_POINTS: Record<Source, number> = {
  Referral: 22,
  Outbound: 10,
  Website: 16,
  Event: 18,
  "LinkedIn Ads": 14,
  "Google Ads": 12,
  Content: 10,
};

export function calculateScore(
  lead: Pick<
    Lead,
    "companySize" | "industry" | "source" | "country" | "message" | "activities"
  >,
): { score: number; breakdown: ScoreComponent[] } {
  const breakdown: ScoreComponent[] = [];

  const sizePoints = FIT_SIZE_POINTS[lead.companySize];
  breakdown.push({
    label: `Company size ${lead.companySize}`,
    points: sizePoints,
    category: "fit",
  });

  const industryPoints = FIT_INDUSTRY_POINTS[lead.industry];
  breakdown.push({
    label: `Industry — ${lead.industry}`,
    points: industryPoints,
    category: "fit",
  });

  const tier1 = new Set([
    "United States",
    "United Kingdom",
    "Germany",
    "Canada",
    "Australia",
    "Netherlands",
    "Sweden",
  ]);
  const tier2 = new Set([
    "France",
    "Spain",
    "Italy",
    "Ireland",
    "Singapore",
    "Poland",
  ]);
  const geoPoints = tier1.has(lead.country)
    ? 8
    : tier2.has(lead.country)
      ? 4
      : 1;
  breakdown.push({
    label: `Region — ${lead.country}`,
    points: geoPoints,
    category: "fit",
  });

  const sourcePoints = INTENT_SOURCE_POINTS[lead.source];
  breakdown.push({
    label: `Source — ${lead.source}`,
    points: sourcePoints,
    category: "intent",
  });

  if (lead.message && lead.message.trim().length >= 30) {
    breakdown.push({
      label: "Detailed message in form",
      points: 8,
      category: "intent",
    });
  }

  const emails = lead.activities.filter((a) => a.type === "email").length;
  const calls = lead.activities.filter((a) => a.type === "call").length;
  const meetings = lead.activities.filter((a) => a.type === "meeting").length;

  if (emails > 0) {
    breakdown.push({
      label: `${emails} email${emails > 1 ? "s" : ""} exchanged`,
      points: Math.min(emails * 2, 6),
      category: "engagement",
    });
  }
  if (calls > 0) {
    breakdown.push({
      label: `${calls} call${calls > 1 ? "s" : ""} logged`,
      points: Math.min(calls * 3, 8),
      category: "engagement",
    });
  }
  if (meetings > 0) {
    breakdown.push({
      label: `${meetings} meeting${meetings > 1 ? "s" : ""} held`,
      points: Math.min(meetings * 5, 10),
      category: "engagement",
    });
  }

  const raw = breakdown.reduce((acc, b) => acc + b.points, 0);
  const score = Math.min(Math.max(Math.round(raw), 0), 100);
  return { score, breakdown };
}

export function scoreTier(score: number): "hot" | "warm" | "cold" {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

export function scoreColor(score: number): string {
  if (score >= 70) return "var(--success)";
  if (score >= 40) return "var(--warning)";
  return "var(--danger)";
}
