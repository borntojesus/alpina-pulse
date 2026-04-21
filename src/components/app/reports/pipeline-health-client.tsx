"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { AlertTriangle, Timer, TrendingUp } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import {
  DEAL_STAGES,
  STAGE_LABEL,
  formatCurrency,
  formatPercent,
  stageTotals,
} from "@/lib/selectors";
import { KpiCard } from "@/components/app/kpi-card";
import { ScoreBadge } from "@/components/app/score-badge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ReportShell, ChartFrame } from "@/components/app/reports/report-shell";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { ChartTooltipBox } from "@/components/charts/tooltip-box";
import type { Deal, DealStage } from "@/lib/types";

const STUCK_THRESHOLD_DAYS = 14;

export function PipelineHealthClient() {
  const hydrated = useHydrated();
  const deals = usePulseStore((s) => s.deals);
  const leads = usePulseStore((s) => s.leads);

  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), []);

  const stuckDeals = useMemo(
    () =>
      deals.filter(
        (d) =>
          d.stage !== "closed-won" &&
          d.stage !== "closed-lost" &&
          (now - new Date(d.updatedAt).getTime()) / (24 * 60 * 60 * 1000) >=
            STUCK_THRESHOLD_DAYS,
      ),
    [deals, now],
  );

  const velocityByStage = useMemo(() => {
    return DEAL_STAGES.filter(
      (s) => s !== "closed-won" && s !== "closed-lost",
    ).map((stage) => {
      const inStage = deals.filter((d) => d.stage === stage);
      const avgAge =
        inStage.length === 0
          ? 0
          : inStage.reduce(
              (a, d) =>
                a + differenceInDays(now, new Date(d.updatedAt).getTime()),
              0,
            ) / inStage.length;
      return {
        stage: STAGE_LABEL[stage],
        stageKey: stage,
        avgDays: Math.round(avgAge),
        count: inStage.length,
        value: inStage.reduce((a, d) => a + d.value, 0),
      };
    });
  }, [deals, now]);

  const stageConversion = useMemo(() => {
    const counts = stageTotals(deals);
    const open = (s: DealStage) => counts[s].count;
    const won = counts["closed-won"].count;
    const lost = counts["closed-lost"].count;
    const total =
      open("discovery") + open("proposal") + open("negotiation") + won + lost;
    if (total === 0) return [];
    return [
      {
        stage: "Discovery → Proposal",
        rate:
          (open("proposal") + open("negotiation") + won + lost) /
          Math.max(total, 1),
      },
      {
        stage: "Proposal → Negotiation",
        rate:
          (open("negotiation") + won + lost) /
          Math.max(open("proposal") + open("negotiation") + won + lost, 1),
      },
      {
        stage: "Negotiation → Close",
        rate: (won + lost) / Math.max(open("negotiation") + won + lost, 1),
      },
      { stage: "Close → Won", rate: won / Math.max(won + lost, 1) },
    ];
  }, [deals]);

  const dealAgeHistogram = useMemo(() => {
    const openDeals = deals.filter(
      (d) => d.stage !== "closed-won" && d.stage !== "closed-lost",
    );
    const buckets = [
      { label: "0-7d", min: 0, max: 7 },
      { label: "8-14d", min: 8, max: 14 },
      { label: "15-30d", min: 15, max: 30 },
      { label: "31-60d", min: 31, max: 60 },
      { label: "60d+", min: 61, max: 9999 },
    ];
    return buckets.map((b) => {
      const count = openDeals.filter((d) => {
        const age = differenceInDays(now, new Date(d.updatedAt).getTime());
        return age >= b.min && age <= b.max;
      }).length;
      return { bucket: b.label, count };
    });
  }, [deals, now]);

  if (!hydrated) return <DashboardSkeleton />;

  const openDeals = deals.filter(
    (d) => d.stage !== "closed-won" && d.stage !== "closed-lost",
  );
  const totalPipelineValue = openDeals.reduce((a, d) => a + d.value, 0);
  const avgDealValue =
    openDeals.length === 0 ? 0 : totalPipelineValue / openDeals.length;
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      100 - (stuckDeals.length / Math.max(openDeals.length, 1)) * 100,
    ),
  );
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  return (
    <ReportShell
      eyebrow="Pipeline"
      title="Pipeline health"
      question="Is our pipeline breathing, or is it stalling out?"
      answer={`${stuckDeals.length} deals haven't moved in ${STUCK_THRESHOLD_DAYS}+ days — that's ${formatPercent(stuckDeals.length / Math.max(openDeals.length, 1))} of open pipeline value at risk. Focus coaching on Proposal-stage deals first.`}
      audience={["Manager", "Exec"]}
      cadence="Weekly"
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Open deals"
            value={openDeals.length.toString()}
            hint="Excluding closed-won/lost"
          />
          <KpiCard
            label="Total pipeline value"
            value={formatCurrency(totalPipelineValue)}
            tone="neutral"
          />
          <KpiCard
            label="Avg deal size"
            value={formatCurrency(avgDealValue)}
            hint="Open deals only"
          />
          <KpiCard
            label="Health score"
            value={`${healthScore.toFixed(0)} / 100`}
            tone={
              healthScore >= 80
                ? "positive"
                : healthScore >= 60
                  ? "warning"
                  : "danger"
            }
            hint="100 − stuck% of pipeline"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <ChartFrame
            hypothesis="How long does the average deal sit in each stage?"
            soWhat="If average age spikes past 30 days in Proposal, you have a qualification or proposal-quality problem, not a close problem."
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={velocityByStage}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeDasharray="2 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="stage"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}d`}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <ChartTooltipBox title={payload[0].payload.stage}>
                          <div className="flex justify-between gap-3 text-muted-foreground">
                            Avg age
                            <span className="font-medium text-foreground">
                              {payload[0].payload.avgDays} days
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 text-muted-foreground">
                            Deals
                            <span className="font-medium text-foreground">
                              {payload[0].payload.count}
                            </span>
                          </div>
                        </ChartTooltipBox>
                      ) : null
                    }
                  />
                  <Bar dataKey="avgDays" radius={[6, 6, 0, 0]} barSize={40}>
                    {velocityByStage.map((d) => (
                      <Cell
                        key={d.stageKey}
                        fill={
                          d.avgDays <= 14
                            ? "var(--chart-4)"
                            : d.avgDays <= 30
                              ? "var(--chart-3)"
                              : "var(--chart-5)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>

          <ChartFrame
            hypothesis="How many deals are aging on the board?"
            soWhat="A healthy board has most deals under 30 days. Anything past 60 is usually dead but not yet marked lost."
          >
            <div className="flex flex-col gap-2.5">
              {dealAgeHistogram.map((b) => {
                const pct =
                  openDeals.length === 0
                    ? 0
                    : (b.count / openDeals.length) * 100;
                const danger = b.bucket === "31-60d" || b.bucket === "60d+";
                return (
                  <div key={b.bucket} className="flex items-center gap-3">
                    <div className="w-16 shrink-0 text-xs font-medium">
                      {b.bucket}
                    </div>
                    <div className="relative h-5 flex-1 rounded-md bg-muted">
                      <div
                        className={`h-full rounded-md transition-all ${
                          danger
                            ? "bg-[color:var(--danger)]/70"
                            : "bg-primary/70"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium tabular-nums">
                        {b.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartFrame>
        </div>

        <ChartFrame
          hypothesis="Where does the funnel leak?"
          soWhat="Biggest drop-off tells you what to coach. Discovery → Proposal below 50% means too many under-qualified deals make it into pipeline."
        >
          <div className="flex flex-col gap-3">
            {stageConversion.map((row) => {
              const tone =
                row.rate >= 0.6
                  ? "bg-[color:var(--success)]"
                  : row.rate >= 0.35
                    ? "bg-[color:var(--warning)]"
                    : "bg-[color:var(--danger)]";
              return (
                <div
                  key={row.stage}
                  className="flex items-center gap-3 rounded-md border border-border/60 bg-card/40 p-3"
                >
                  <div className="w-52 shrink-0 text-sm font-medium">
                    {row.stage}
                  </div>
                  <div className="relative h-2.5 flex-1 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${tone}`}
                      style={{ width: `${row.rate * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-medium tabular-nums">
                    {formatPercent(row.rate)}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartFrame>

        <ChartFrame
          hypothesis="Which deals should a manager walk through with the rep today?"
          soWhat="Ranked by pipeline value × days stuck. Highest impact first — save the deals, then fix the root cause."
          right={
            <Badge variant="outline" className="gap-1 text-[10px]">
              <AlertTriangle className="size-3 text-[color:var(--warning)]" />
              {stuckDeals.length} stuck
            </Badge>
          }
        >
          {stuckDeals.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
              <TrendingUp className="mx-auto mb-2 size-5 text-[color:var(--success)]" />
              Every open deal has moved in the last {STUCK_THRESHOLD_DAYS} days.
              Great week.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {stuckDeals
                .sort((a: Deal, b: Deal) => b.value - a.value)
                .slice(0, 8)
                .map((d) => {
                  const lead = leadMap.get(d.leadId);
                  const daysStuck = differenceInDays(
                    now,
                    new Date(d.updatedAt).getTime(),
                  );
                  return (
                    <Link
                      key={d.id}
                      href={`/app/pipeline/${d.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-3 transition-colors hover:border-primary/40"
                    >
                      {lead ? <ScoreBadge score={lead.score} /> : null}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {d.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {STAGE_LABEL[d.stage]} · Last activity{" "}
                          {formatDistanceToNow(new Date(d.updatedAt))} ago
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[color:var(--warning)]/15 px-2 py-0.5 text-xs font-medium text-[color:var(--warning)]">
                          <Timer className="size-3" />
                          {daysStuck}d
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCurrency(d.value)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </ChartFrame>
      </div>
    </ReportShell>
  );
}
