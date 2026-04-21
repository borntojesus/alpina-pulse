import type { Deal, DealStage, Lead, LeadStatus, Rep, Role } from "./types";

export const DEAL_STAGES: DealStage[] = [
  "discovery",
  "proposal",
  "negotiation",
  "closed-won",
  "closed-lost",
];

export const STAGE_LABEL: Record<DealStage, string> = {
  discovery: "Discovery",
  proposal: "Proposal",
  negotiation: "Negotiation",
  "closed-won": "Closed / Won",
  "closed-lost": "Closed / Lost",
};

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  unqualified: "Unqualified",
  converted: "Converted",
};

export function weightedPipelineValue(deals: Deal[]): number {
  return deals
    .filter((d) => d.stage !== "closed-won" && d.stage !== "closed-lost")
    .reduce((acc, d) => acc + (d.value * d.probability) / 100, 0);
}

export function closedWonValue(deals: Deal[]): number {
  return deals
    .filter((d) => d.stage === "closed-won")
    .reduce((acc, d) => acc + d.value, 0);
}

export function newLeadsLast24h(leads: Lead[], now = Date.now()): Lead[] {
  const cutoff = now - 24 * 60 * 60 * 1000;
  return leads.filter((l) => new Date(l.createdAt).getTime() >= cutoff);
}

export function newLeadsLast7d(leads: Lead[], now = Date.now()): Lead[] {
  const cutoff = now - 7 * 24 * 60 * 60 * 1000;
  return leads.filter((l) => new Date(l.createdAt).getTime() >= cutoff);
}

export function hotLeads(leads: Lead[]): Lead[] {
  return leads.filter((l) => l.score >= 70);
}

export function conversionRate(leads: Lead[]): number {
  if (leads.length === 0) return 0;
  const converted = leads.filter((l) => l.status === "converted").length;
  return converted / leads.length;
}

export function repFocus(role: Role): {
  title: string;
  subtitle: string;
} {
  switch (role) {
    case "SDR":
      return {
        title: "New leads, fast response, first contact",
        subtitle: "Your inbox and personal leaderboard are the priority.",
      };
    case "Manager":
      return {
        title: "Pipeline health, team performance, bottlenecks",
        subtitle: "Where is velocity breaking? Who needs coaching?",
      };
    case "Exec":
      return {
        title: "Revenue, growth, attribution",
        subtitle: "Forecast vs target. ROI by channel. Top accounts.",
      };
  }
}

export function leadsByMonth(
  leads: Lead[],
  months = 12,
  now = new Date(),
): { month: string; count: number; converted: number }[] {
  const result: { month: string; count: number; converted: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const bucket = leads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= d.getTime() && t < end.getTime();
    });
    result.push({
      month: d.toLocaleString("en-US", { month: "short" }),
      count: bucket.length,
      converted: bucket.filter((l) => l.status === "converted").length,
    });
  }
  return result;
}

export function leadsBySource(
  leads: Lead[],
): { source: string; count: number; converted: number }[] {
  const map = new Map<string, { count: number; converted: number }>();
  for (const l of leads) {
    const entry = map.get(l.source) ?? { count: 0, converted: 0 };
    entry.count += 1;
    if (l.status === "converted") entry.converted += 1;
    map.set(l.source, entry);
  }
  return Array.from(map.entries())
    .map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => b.count - a.count);
}

export function stageTotals(
  deals: Deal[],
): Record<DealStage, { count: number; value: number }> {
  const totals = DEAL_STAGES.reduce(
    (acc, s) => ({ ...acc, [s]: { count: 0, value: 0 } }),
    {} as Record<DealStage, { count: number; value: number }>,
  );
  for (const d of deals) {
    totals[d.stage].count += 1;
    totals[d.stage].value += d.value;
  }
  return totals;
}

export function repLeaderboard(
  reps: Rep[],
  deals: Deal[],
): {
  rep: Rep;
  wonValue: number;
  openValue: number;
  winRate: number;
  dealCount: number;
}[] {
  return reps
    .map((rep) => {
      const owned = deals.filter((d) => d.ownerId === rep.id);
      const won = owned.filter((d) => d.stage === "closed-won");
      const lost = owned.filter((d) => d.stage === "closed-lost");
      const open = owned.filter(
        (d) => d.stage !== "closed-won" && d.stage !== "closed-lost",
      );
      const wonValue = won.reduce((a, d) => a + d.value, 0);
      const openValue = open.reduce((a, d) => a + d.value, 0);
      const winRate =
        won.length + lost.length === 0
          ? 0
          : won.length / (won.length + lost.length);
      return {
        rep,
        wonValue,
        openValue,
        winRate,
        dealCount: owned.length,
      };
    })
    .sort((a, b) => b.wonValue - a.wonValue);
}

export function scoreDistribution(
  leads: Lead[],
): { bucket: string; count: number }[] {
  const buckets = [
    { label: "0-19", min: 0, max: 20 },
    { label: "20-39", min: 20, max: 40 },
    { label: "40-59", min: 40, max: 60 },
    { label: "60-79", min: 60, max: 80 },
    { label: "80-100", min: 80, max: 101 },
  ];
  return buckets.map((b) => ({
    bucket: b.label,
    count: leads.filter((l) => l.score >= b.min && l.score < b.max).length,
  }));
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
