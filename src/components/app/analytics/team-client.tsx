"use client";

import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatCurrency, formatPercent, repLeaderboard } from "@/lib/selectors";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";

export function TeamAnalyticsClient() {
  const hydrated = useHydrated();
  const reps = usePulseStore((s) => s.reps);
  const deals = usePulseStore((s) => s.deals);

  if (!hydrated) return <DashboardSkeleton />;
  const leaderboard = repLeaderboard(reps, deals);

  const teamWon = leaderboard.reduce((a, r) => a + r.wonValue, 0);
  const teamOpen = leaderboard.reduce((a, r) => a + r.openValue, 0);
  const teamQuota = reps.reduce(
    (a, r) => (r.role === "AE" ? a + r.quotaQuarter : a),
    0,
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Analytics"
        title="Team performance"
        description="Leaderboard + individual quota progress. Spot coaching opportunities."
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Team won
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold tabular-nums">
                {formatCurrency(teamWon)}
              </div>
              <Progress
                value={Math.min((teamWon / teamQuota) * 100, 100)}
                className="mt-2 h-1.5"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                {formatPercent(teamWon / Math.max(teamQuota, 1))} of{" "}
                {formatCurrency(teamQuota)} quota
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Team open pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-3xl font-semibold tabular-nums">
              {formatCurrency(teamOpen)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Average win rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-3xl font-semibold tabular-nums">
              {formatPercent(
                leaderboard.reduce((a, r) => a + r.winRate, 0) /
                  Math.max(leaderboard.length, 1),
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaderboard.map((row, i) => {
            const pct = Math.min(
              (row.rep.achievedQuarter / row.rep.quotaQuarter) * 100,
              100,
            );
            return (
              <Card key={row.rep.id} className="relative overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent"
                  aria-hidden
                />
                <CardHeader className="flex-row items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="text-sm">
                      {row.rep.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      {row.rep.name}
                      {i === 0 ? (
                        <Badge variant="success" className="text-[10px]">
                          Top rep
                        </Badge>
                      ) : null}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {row.rep.role}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Stat
                    label="Closed won"
                    value={formatCurrency(row.wonValue)}
                  />
                  <Stat
                    label="Open pipeline"
                    value={formatCurrency(row.openValue)}
                  />
                  <Stat label="Deals" value={row.dealCount} />
                  <Stat label="Win rate" value={formatPercent(row.winRate)} />
                  <div className="mt-1">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Quota</span>
                      <span className="tabular-nums">{pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
