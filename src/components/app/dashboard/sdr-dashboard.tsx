"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Clock, Flame, Inbox, TrendingUp } from "lucide-react";
import type { Deal, Lead, Rep } from "@/lib/types";
import {
  formatNumber,
  formatPercent,
  hotLeads,
  newLeadsLast24h,
} from "@/lib/selectors";
import { KpiCard } from "@/components/app/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScoreBadge } from "@/components/app/score-badge";
import { PersonAvatar } from "@/components/app/person-avatar";
import { IntelSnapshotCard } from "@/components/app/dashboard/intel-snapshot";
import { TodayActivityStream } from "@/components/app/dashboard/today-activity-stream";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SourceMixChart } from "@/components/charts/source-mix-chart";
import { LeadsTrendChart } from "@/components/charts/leads-trend-chart";

export function SdrDashboard({
  leads,
  deals,
  reps,
}: {
  leads: Lead[];
  deals: Deal[];
  reps: Rep[];
}) {
  const newToday = newLeadsLast24h(leads);
  const hot = hotLeads(leads);
  const contactedCount = leads.filter((l) => l.status === "contacted").length;
  const conversion =
    leads.length === 0
      ? 0
      : leads.filter((l) => l.status === "converted").length / leads.length;

  const sdrs = reps.filter((r) => r.role === "SDR");
  const me = sdrs[0];
  const leaderboard = sdrs
    .map((s) => ({
      rep: s,
      touches: leads.filter((l) => l.assignedTo === s.id).length,
    }))
    .sort((a, b) => b.touches - a.touches);

  const topLeads = [...leads]
    .filter((l) => l.status === "new" || l.status === "contacted")
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="New in last 24h"
          value={formatNumber(newToday.length)}
          delta={{ value: "+18%", direction: "up" }}
          hint="Fresh inbound — respond within 5 min"
          tone="positive"
        />
        <KpiCard
          label="Hot leads (≥ 70)"
          value={formatNumber(hot.length)}
          delta={{ value: "+6%", direction: "up" }}
          hint="Prioritize these first today"
          tone="warning"
        />
        <KpiCard
          label="Contacted this week"
          value={formatNumber(contactedCount)}
          delta={{ value: "-4%", direction: "down" }}
          hint="Quota pace slightly behind"
        />
        <KpiCard
          label="Conversion rate"
          value={formatPercent(conversion)}
          delta={{ value: "+0.8pp", direction: "up" }}
          hint="Converted / total leads"
          tone="positive"
        />
      </div>

      <IntelSnapshotCard />

      <TodayActivityStream />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Inbox className="size-4 text-primary" />
              Your inbox — top leads by score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pb-6">
            {topLeads.map((l) => (
              <Link
                key={l.id}
                href={`/app/leads/${l.id}`}
                className="flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/40"
              >
                <PersonAvatar
                  name={`${l.firstName} ${l.lastName}`}
                  src={l.avatar}
                  size={32}
                />
                <ScoreBadge score={l.score} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium">
                      {l.firstName} {l.lastName}
                    </div>
                    {l.tags.includes("highlight") ? (
                      <Badge variant="accent" className="gap-1 text-[10px]">
                        <Flame className="size-3" />
                        Your lead
                      </Badge>
                    ) : null}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {l.company} · {l.industry} · {l.country}
                  </div>
                </div>
                <div className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
                  <Clock className="size-3" />
                  {formatDistanceToNow(new Date(l.createdAt))} ago
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {l.source}
                </Badge>
              </Link>
            ))}
            <div className="mt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/leads">Open full inbox</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <TrendingUp className="size-4 text-accent" />
              SDR leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {leaderboard.map(({ rep, touches }, i) => {
              const pct = Math.min(
                (rep.achievedQuarter / rep.quotaQuarter) * 100,
                100,
              );
              return (
                <div key={rep.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                          i === 0
                            ? "bg-[color:var(--warning)]/20 text-[color:var(--warning)]"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="font-medium">
                        {rep.name}
                        {me && rep.id === me.id ? (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      {touches} leads
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{pct.toFixed(0)}% of quota</span>
                    <span>
                      {rep.achievedQuarter} / {rep.quotaQuarter} meetings
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
            <CardTitle className="text-base font-medium">
              Where they come from
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SourceMixChart leads={leads} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
