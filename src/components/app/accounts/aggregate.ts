import type {
  CallRecording,
  Conversation,
  Deal,
  Industry,
  Lead,
  Signal,
} from "@/lib/types";

export type AccountRow = {
  company: string;
  companyLogo?: string;
  industry: Industry;
  country: string;
  leads: Lead[];
  leadCount: number;
  hotLeadCount: number;
  totalPipelineValue: number;
  openPipelineValue: number;
  wonValue: number;
  openDealCount: number;
  deals: Deal[];
  lastActivity: number | null;
  signalIntensity7d: number;
  avgScore: number;
  signalsForCompany: Signal[];
  conversationsForCompany: Conversation[];
  callsForCompany: CallRecording[];
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function buildAccounts({
  leads,
  deals,
  conversations,
  calls,
  signals,
  now = Date.now(),
}: {
  leads: Lead[];
  deals: Deal[];
  conversations: Conversation[];
  calls: CallRecording[];
  signals: Signal[];
  now?: number;
}): AccountRow[] {
  const byCompany = new Map<string, Lead[]>();
  for (const l of leads) {
    const arr = byCompany.get(l.company) ?? [];
    arr.push(l);
    byCompany.set(l.company, arr);
  }

  const cutoff7d = now - SEVEN_DAYS_MS;

  const rows: AccountRow[] = [];

  for (const [company, companyLeads] of byCompany) {
    const leadIds = new Set(companyLeads.map((l) => l.id));
    const companyDeals = deals.filter((d) => leadIds.has(d.leadId));
    const companyConvos = conversations.filter((c) => leadIds.has(c.leadId));
    const companyCalls = calls.filter((c) => leadIds.has(c.leadId));
    const companySignals = signals.filter((s) => leadIds.has(s.leadId));

    const totalPipelineValue = companyDeals.reduce(
      (sum, d) => sum + d.value,
      0,
    );
    const openDeals = companyDeals.filter(
      (d) => d.stage !== "closed-won" && d.stage !== "closed-lost",
    );
    const openPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
    const wonValue = companyDeals
      .filter((d) => d.stage === "closed-won")
      .reduce((sum, d) => sum + d.value, 0);

    // industry: majority vote
    const industryCounts = new Map<Industry, number>();
    for (const l of companyLeads) {
      industryCounts.set(l.industry, (industryCounts.get(l.industry) ?? 0) + 1);
    }
    let industry: Industry = companyLeads[0].industry;
    let best = -1;
    for (const [ind, count] of industryCounts) {
      if (count > best) {
        best = count;
        industry = ind;
      }
    }

    const allTimestamps: number[] = [
      ...companyConvos.map((c) => new Date(c.lastMessageAt).getTime()),
      ...companyCalls.map((c) => new Date(c.startedAt).getTime()),
      ...companySignals.map((s) => new Date(s.timestamp).getTime()),
    ];
    const lastActivity = allTimestamps.length
      ? Math.max(...allTimestamps)
      : null;

    const signalIntensity7d = companySignals.filter(
      (s) => new Date(s.timestamp).getTime() >= cutoff7d,
    ).length;

    const avgScore =
      companyLeads.reduce((sum, l) => sum + l.score, 0) / companyLeads.length;

    const hotLeadCount = companyLeads.filter((l) => l.score >= 70).length;

    // companyLogo: use the first non-empty one from leads
    const companyLogo =
      companyLeads.find((l) => l.companyLogo)?.companyLogo ?? undefined;
    const country = companyLeads[0].country;

    rows.push({
      company,
      companyLogo,
      industry,
      country,
      leads: companyLeads,
      leadCount: companyLeads.length,
      hotLeadCount,
      totalPipelineValue,
      openPipelineValue,
      wonValue,
      openDealCount: openDeals.length,
      deals: companyDeals,
      lastActivity,
      signalIntensity7d,
      avgScore,
      signalsForCompany: companySignals,
      conversationsForCompany: companyConvos,
      callsForCompany: companyCalls,
    });
  }

  return rows;
}
