"use client";

import { useMemo } from "react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatPercent } from "@/lib/selectors";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreDistributionChart } from "@/components/charts/score-distribution-chart";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { KpiCard } from "@/components/app/kpi-card";
import { Progress } from "@/components/ui/progress";

export function QualityAnalyticsClient() {
  const hydrated = useHydrated();
  const leads = usePulseStore((s) => s.leads);

  const buckets = useMemo(() => {
    const ranges = [
      { label: "0-19", min: 0, max: 20 },
      { label: "20-39", min: 20, max: 40 },
      { label: "40-59", min: 40, max: 60 },
      { label: "60-79", min: 60, max: 80 },
      { label: "80-100", min: 80, max: 101 },
    ];
    return ranges.map((r) => {
      const inRange = leads.filter((l) => l.score >= r.min && l.score < r.max);
      const converted = inRange.filter((l) => l.status === "converted").length;
      const qualified = inRange.filter(
        (l) => l.status === "qualified" || l.status === "converted",
      ).length;
      return {
        label: r.label,
        count: inRange.length,
        converted,
        qualified,
        conv: inRange.length === 0 ? 0 : converted / inRange.length,
        qualRate: inRange.length === 0 ? 0 : qualified / inRange.length,
      };
    });
  }, [leads]);

  const signals = useMemo(() => {
    const map = new Map<string, { total: number; converted: number }>();
    for (const l of leads) {
      for (const b of l.scoreBreakdown) {
        const entry = map.get(b.label) ?? { total: 0, converted: 0 };
        entry.total += 1;
        if (l.status === "converted") entry.converted += 1;
        map.set(b.label, entry);
      }
    }
    return Array.from(map.entries())
      .map(([label, v]) => ({
        label,
        total: v.total,
        converted: v.converted,
        conv: v.total === 0 ? 0 : v.converted / v.total,
      }))
      .sort((a, b) => b.conv - a.conv)
      .slice(0, 8);
  }, [leads]);

  if (!hydrated) return <DashboardSkeleton />;

  const total = leads.length;
  const hot = leads.filter((l) => l.score >= 70).length;
  const warm = leads.filter((l) => l.score >= 40 && l.score < 70).length;
  const cold = total - hot - warm;
  const hotConv =
    hot === 0
      ? 0
      : leads.filter((l) => l.score >= 70 && l.status === "converted").length /
        hot;

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Analytics"
        title="Lead quality"
        description="Is our scoring calibrated? If hot leads don't convert higher, it isn't."
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Total leads"
            value={total.toLocaleString()}
            hint="Seeded 200 + your submissions"
          />
          <KpiCard label="Hot (≥ 70)" value={hot.toString()} tone="positive" />
          <KpiCard
            label="Warm (40-69)"
            value={warm.toString()}
            tone="warning"
          />
          <KpiCard label="Cold (< 40)" value={cold.toString()} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Score distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreDistributionChart leads={leads} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Conversion by score bucket
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {buckets.map((b) => (
                <div key={b.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Score {b.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatPercent(b.conv)} conv
                    </span>
                  </div>
                  <Progress value={b.conv * 100} className="h-1.5" />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{b.count} leads</span>
                    <span>
                      {b.converted} converted · {b.qualified} qualified
                    </span>
                  </div>
                </div>
              ))}
              <div className="mt-2 rounded-md bg-[color:var(--success)]/10 p-3 text-xs text-[color:var(--success)]">
                Hot leads convert{" "}
                <span className="font-semibold">{formatPercent(hotConv)}</span>{" "}
                — that&apos;s your signal scoring works.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Top score signals by conversion lift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Signal
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Leads with signal
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Converted
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Rate
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((row) => (
                    <tr key={row.label} className="border-t border-border/60">
                      <td className="px-3 py-2.5 font-medium">{row.label}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {row.total}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {row.converted}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {formatPercent(row.conv)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Badge
                          variant={
                            row.conv >= 0.25
                              ? "success"
                              : row.conv >= 0.15
                                ? "warning"
                                : "outline"
                          }
                          className="text-[10px]"
                        >
                          {row.conv >= 0.25
                            ? "Boost"
                            : row.conv >= 0.15
                              ? "Keep"
                              : "Review"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
