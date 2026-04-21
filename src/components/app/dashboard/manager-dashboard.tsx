"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, ChartNoAxesCombined, Target } from "lucide-react";
import type { Deal, Lead, Rep } from "@/lib/types";
import {
  closedWonValue,
  formatCurrency,
  formatNumber,
  formatPercent,
  repLeaderboard,
  weightedPipelineValue,
} from "@/lib/selectors";
import { KpiCard } from "@/components/app/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PersonAvatar } from "@/components/app/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PipelineStageChart } from "@/components/charts/pipeline-stage-chart";
import { LeadsTrendChart } from "@/components/charts/leads-trend-chart";

export function ManagerDashboard({
  leads,
  deals,
  reps,
}: {
  leads: Lead[];
  deals: Deal[];
  reps: Rep[];
}) {
  const pipeline = weightedPipelineValue(deals);
  const won = closedWonValue(deals);
  const target = 1_500_000;
  const conversion =
    leads.length === 0
      ? 0
      : leads.filter((l) => l.status === "converted").length / leads.length;
  const openDeals = deals.filter(
    (d) => d.stage !== "closed-won" && d.stage !== "closed-lost",
  ).length;
  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), []);
  const stuckDeals = useMemo(
    () =>
      deals.filter(
        (d) =>
          (d.stage === "discovery" || d.stage === "proposal") &&
          now - new Date(d.updatedAt).getTime() > 14 * 24 * 60 * 60 * 1000,
      ),
    [deals, now],
  );

  const leaderboard = repLeaderboard(reps, deals).filter(
    (l) => l.rep.role !== "SDR",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Weighted pipeline"
          value={formatCurrency(pipeline)}
          delta={{ value: "+12%", direction: "up" }}
          hint={`${openDeals} open deals`}
          tone="neutral"
        />
        <KpiCard
          label="Closed won (QTD)"
          value={formatCurrency(won)}
          delta={{ value: "+8%", direction: "up" }}
          hint={`${formatPercent(won / target)} of ${formatCurrency(target)} target`}
          tone="positive"
        />
        <KpiCard
          label="Conversion rate"
          value={formatPercent(conversion)}
          delta={{ value: "+0.8pp", direction: "up" }}
          hint="Leads → converted"
        />
        <KpiCard
          label="Stuck deals"
          value={formatNumber(stuckDeals.length)}
          delta={{ value: "+3", direction: "up" }}
          hint="No activity for 14+ days"
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <ChartNoAxesCombined className="size-4 text-primary" />
              Pipeline by stage
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/pipeline">Open pipeline</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <PipelineStageChart deals={deals} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Target className="size-4 text-accent" />
              Rep leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {leaderboard.map((row, i) => {
              const pct = Math.min(
                (row.rep.achievedQuarter / row.rep.quotaQuarter) * 100,
                100,
              );
              return (
                <div key={row.rep.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <PersonAvatar
                      name={row.rep.name}
                      src={row.rep.avatar}
                      size={32}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {row.rep.name}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {row.rep.role}
                        </Badge>
                        {i === 0 ? (
                          <Badge variant="success" className="text-[10px]">
                            Top
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(row.wonValue)} won</span>
                        <span className="tabular-nums">
                          {pct.toFixed(0)}% quota
                        </span>
                      </div>
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Leads over time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsTrendChart leads={leads} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <AlertTriangle className="size-4 text-[color:var(--warning)]" />
              Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {stuckDeals.slice(0, 5).map((d) => (
              <Link
                href={`/app/pipeline/${d.id}`}
                key={d.id}
                className="flex items-center justify-between rounded-md border border-border/60 bg-card/50 p-2.5 hover:border-primary/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.stage} · no activity 14+ days
                  </div>
                </div>
                <span className="font-medium tabular-nums">
                  {formatCurrency(d.value)}
                </span>
              </Link>
            ))}
            {stuckDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No stuck deals — velocity is looking healthy this week.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
