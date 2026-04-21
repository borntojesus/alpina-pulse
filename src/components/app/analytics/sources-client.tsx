"use client";

import { useMemo } from "react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatCurrency, formatPercent, leadsBySource } from "@/lib/selectors";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/app/kpi-card";
import { SourceMixChart } from "@/components/charts/source-mix-chart";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";

const CPL: Record<string, number> = {
  Website: 0,
  "LinkedIn Ads": 140,
  "Google Ads": 95,
  Referral: 0,
  Outbound: 35,
  Event: 180,
  Content: 45,
};

export function SourcesAnalyticsClient() {
  const hydrated = useHydrated();
  const leads = usePulseStore((s) => s.leads);
  const deals = usePulseStore((s) => s.deals);

  const rows = useMemo(() => {
    const bySource = leadsBySource(leads);
    const dealsByLead = new Map(deals.map((d) => [d.leadId, d]));
    return bySource.map((row) => {
      const relevantDeals = leads
        .filter((l) => l.source === row.source)
        .map((l) => dealsByLead.get(l.id))
        .filter((d): d is NonNullable<typeof d> => !!d);
      const won = relevantDeals
        .filter((d) => d.stage === "closed-won")
        .reduce((a, d) => a + d.value, 0);
      const conv = row.count === 0 ? 0 : row.converted / row.count;
      const cpl = CPL[row.source] ?? 0;
      const spend = cpl * row.count;
      return {
        source: row.source,
        leads: row.count,
        converted: row.converted,
        conv,
        won,
        spend,
        roi: spend === 0 ? Infinity : (won - spend) / spend,
      };
    });
  }, [leads, deals]);

  if (!hydrated) return <DashboardSkeleton />;

  const totalLeads = rows.reduce((a, r) => a + r.leads, 0);
  const totalWon = rows.reduce((a, r) => a + r.won, 0);
  const totalSpend = rows.reduce((a, r) => a + r.spend, 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Analytics"
        title="Source attribution"
        description="Where leads come from, what they cost, what they close."
        actions={<Badge variant="outline">Manager · Exec view</Badge>}
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Total leads"
            value={totalLeads.toLocaleString()}
            hint="Across all sources · last 12 months"
          />
          <KpiCard
            label="Paid spend"
            value={formatCurrency(totalSpend)}
            hint="Estimated using market CPLs"
          />
          <KpiCard
            label="Closed-won revenue"
            value={formatCurrency(totalWon)}
            tone="positive"
          />
          <KpiCard
            label="Blended ROI"
            value={
              totalSpend === 0
                ? "—"
                : formatPercent(
                    (totalWon - totalSpend) / Math.max(totalSpend, 1),
                  )
            }
            delta={{ value: "+4pp", direction: "up" }}
            tone="positive"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Leads by source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SourceMixChart leads={leads} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Channel performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium">
                        Source
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium">
                        Leads
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium">
                        Conv
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium">
                        Won
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium">
                        ROI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.source}
                        className="border-t border-border/60"
                      >
                        <td className="px-3 py-2.5 font-medium">
                          {row.source}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {row.leads}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {formatPercent(row.conv)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {formatCurrency(row.won)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {row.spend === 0 ? "∞" : formatPercent(row.roi)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Funnel by source
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {rows.map((row) => {
              const width = totalLeads === 0 ? 0 : row.leads / totalLeads;
              return (
                <div key={row.source} className="flex items-center gap-3">
                  <div className="w-28 shrink-0 text-sm font-medium">
                    {row.source}
                  </div>
                  <div className="relative h-6 flex-1 rounded-md bg-muted">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-primary/70 to-accent"
                      style={{ width: `${width * 100}%` }}
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-[11px] font-medium">
                      <span>{row.leads} leads</span>
                      <span className="tabular-nums text-muted-foreground">
                        → {row.converted} converted
                      </span>
                    </div>
                  </div>
                  <div className="w-20 text-right text-xs tabular-nums text-muted-foreground">
                    {formatPercent(row.conv)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
