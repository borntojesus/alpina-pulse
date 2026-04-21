"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import {
  closedWonValue,
  formatCurrency,
  formatPercent,
  weightedPipelineValue,
} from "@/lib/selectors";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/app/kpi-card";
import { RevenueTrendChart } from "@/components/charts/revenue-trend-chart";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";

const TARGET = 1_500_000;

export function ForecastAnalyticsClient() {
  const hydrated = useHydrated();
  const deals = usePulseStore((s) => s.deals);

  const scenarios = useMemo(() => {
    const open = deals.filter(
      (d) => d.stage !== "closed-won" && d.stage !== "closed-lost",
    );
    const commit = open.reduce(
      (a, d) => a + (d.probability >= 70 ? d.value : 0),
      0,
    );
    const best = open.reduce(
      (a, d) => a + (d.probability >= 30 ? d.value : 0),
      0,
    );
    const weighted = open.reduce(
      (a, d) => a + (d.value * d.probability) / 100,
      0,
    );
    const worst = commit * 0.7;
    return { commit, best, weighted, worst };
  }, [deals]);

  if (!hydrated) return <DashboardSkeleton />;

  const won = closedWonValue(deals);
  const pipeline = weightedPipelineValue(deals);

  const probabilityTable = [...deals]
    .filter((d) => d.stage !== "closed-won" && d.stage !== "closed-lost")
    .sort(
      (a, b) =>
        b.value * (b.probability / 100) - a.value * (a.probability / 100),
    )
    .slice(0, 10);

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Analytics"
        title="Forecast"
        description="Weighted pipeline + scenarios. Show this one to the board."
        actions={<Badge variant="outline">Manager · Exec view</Badge>}
      />
      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Target"
            value={formatCurrency(TARGET)}
            hint="Quarterly quota"
          />
          <KpiCard
            label="Closed won"
            value={formatCurrency(won)}
            delta={{ value: formatPercent(won / TARGET), direction: "up" }}
            tone="positive"
          />
          <KpiCard
            label="Weighted pipeline"
            value={formatCurrency(pipeline)}
            hint="Value × probability"
          />
          <KpiCard
            label="Gap to target"
            value={formatCurrency(Math.max(TARGET - won, 0))}
            tone={won >= TARGET ? "positive" : "warning"}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Revenue trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart deals={deals} />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Worst case",
              value: scenarios.worst,
              tone: "danger" as const,
              hint: "70% of commit",
            },
            {
              label: "Commit",
              value: scenarios.commit,
              tone: "neutral" as const,
              hint: "Deals ≥ 70% probability",
            },
            {
              label: "Best case",
              value: scenarios.best,
              tone: "positive" as const,
              hint: "Deals ≥ 30% probability",
            },
          ].map((s) => (
            <KpiCard
              key={s.label}
              label={s.label}
              value={formatCurrency(s.value)}
              hint={s.hint}
              tone={s.tone}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Top deals by weighted value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Deal
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Stage
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Probability
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Value
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Weighted
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Close
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {probabilityTable.map((d) => (
                    <tr key={d.id} className="border-t border-border/60">
                      <td className="px-3 py-2.5 font-medium">
                        <Link
                          href={`/app/pipeline/${d.id}`}
                          className="hover:text-primary"
                        >
                          {d.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {d.stage}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {d.probability}%
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {formatCurrency(d.value)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                        {formatCurrency((d.value * d.probability) / 100)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                        {format(new Date(d.expectedCloseDate), "MMM d")}
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
