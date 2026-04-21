"use client";

import Link from "next/link";
import { Building2, DollarSign, TrendingUp } from "lucide-react";
import type { Deal, Lead, Rep } from "@/lib/types";
import {
  closedWonValue,
  formatCurrency,
  formatPercent,
  leadsBySource,
  weightedPipelineValue,
} from "@/lib/selectors";
import { KpiCard } from "@/components/app/kpi-card";
import { IntelSnapshotCard } from "@/components/app/dashboard/intel-snapshot";
import { TodayActivityStream } from "@/components/app/dashboard/today-activity-stream";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenueTrendChart } from "@/components/charts/revenue-trend-chart";
import { SourceMixChart } from "@/components/charts/source-mix-chart";

export function ExecDashboard({
  leads,
  deals,
  reps: _reps,
}: {
  leads: Lead[];
  deals: Deal[];
  reps: Rep[];
}) {
  const pipeline = weightedPipelineValue(deals);
  const won = closedWonValue(deals);
  const target = 1_500_000;
  const lost = deals
    .filter((d) => d.stage === "closed-lost")
    .reduce((a, d) => a + d.value, 0);
  const winRate =
    deals.filter((d) => d.stage === "closed-won").length /
    Math.max(
      deals.filter((d) => d.stage === "closed-won" || d.stage === "closed-lost")
        .length,
      1,
    );

  const topAccounts = [...deals]
    .filter((d) => d.stage !== "closed-lost")
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const sourceMix = leadsBySource(leads).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Forecast (weighted)"
          value={formatCurrency(pipeline)}
          delta={{ value: "+12%", direction: "up" }}
          hint="Best-case tied to pipeline × probability"
        />
        <KpiCard
          label="Closed won (QTD)"
          value={formatCurrency(won)}
          delta={{ value: "+8%", direction: "up" }}
          hint={`${formatPercent(won / target)} of ${formatCurrency(target)} target`}
          tone="positive"
        />
        <KpiCard
          label="Win rate"
          value={formatPercent(winRate)}
          delta={{ value: "+2pp", direction: "up" }}
          hint="Won / (won + lost) — last 12 months"
        />
        <KpiCard
          label="Closed lost"
          value={formatCurrency(lost)}
          delta={{ value: "-5%", direction: "down" }}
          hint="Value of lost deals"
          tone="danger"
        />
      </div>

      <IntelSnapshotCard />

      <TodayActivityStream />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <DollarSign className="size-4 text-primary" />
              Revenue trend
            </CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[color:var(--chart-4)]" />
                Closed won
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[color:var(--chart-1)]" />
                Weighted forecast
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart deals={deals} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Building2 className="size-4 text-accent" />
              Top accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {topAccounts.map((d, i) => (
              <Link
                key={d.id}
                href={`/app/pipeline/${d.id}`}
                className="flex items-center gap-3 rounded-md border border-transparent p-2 hover:border-border hover:bg-muted/40"
              >
                <span className="size-7 shrink-0 rounded-md bg-muted text-xs font-semibold tabular-nums flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.stage} · {d.probability}% probability
                  </div>
                </div>
                <span className="tabular-nums text-sm font-medium">
                  {formatCurrency(d.value)}
                </span>
              </Link>
            ))}
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/app/pipeline">Open pipeline</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <TrendingUp className="size-4 text-accent" />
              Attribution — top sources
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
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Channel
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Leads
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Conv. rate
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Quality
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sourceMix.map((row) => {
                    const rate =
                      row.count === 0 ? 0 : row.converted / row.count;
                    const quality =
                      rate >= 0.2 ? "High" : rate >= 0.12 ? "Medium" : "Low";
                    return (
                      <tr
                        key={row.source}
                        className="border-t border-border/60"
                      >
                        <td className="px-3 py-2.5 font-medium">
                          {row.source}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {row.count}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {formatPercent(rate)}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <Badge
                            variant={
                              quality === "High"
                                ? "success"
                                : quality === "Medium"
                                  ? "warning"
                                  : "outline"
                            }
                            className="text-[10px]"
                          >
                            {quality}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
