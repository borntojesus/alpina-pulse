"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Building2, ShieldAlert, Trophy } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import {
  closedWonValue,
  formatCurrency,
  formatPercent,
  weightedPipelineValue,
} from "@/lib/selectors";
import { KpiCard } from "@/components/app/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PersonAvatar } from "@/components/app/person-avatar";
import { ReportShell, ChartFrame } from "@/components/app/reports/report-shell";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { ChartTooltipBox } from "@/components/charts/tooltip-box";
import type { Deal, Lead, Rep } from "@/lib/types";

const TARGET = 1_500_000;

export function RevenueScorecardClient() {
  const hydrated = useHydrated();
  const deals = usePulseStore((s) => s.deals);
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);

  const leadMap = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const repMap = useMemo(() => new Map(reps.map((r) => [r.id, r])), [reps]);

  const won = closedWonValue(deals);
  const weighted = weightedPipelineValue(deals);
  const target = TARGET;
  const attainment = won / target;

  const monthly = useMemo(() => {
    const now = new Date();
    const result: {
      month: string;
      won: number;
      target: number;
      cumulative: number;
    }[] = [];
    let cumulative = 0;
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthWon = deals
        .filter(
          (d) =>
            d.stage === "closed-won" &&
            new Date(d.updatedAt).getTime() >= start.getTime() &&
            new Date(d.updatedAt).getTime() < end.getTime(),
        )
        .reduce((a, d) => a + d.value, 0);
      cumulative += monthWon;
      result.push({
        month: start.toLocaleString("en-US", { month: "short" }),
        won: monthWon,
        target: target / 12,
        cumulative,
      });
    }
    return result;
  }, [deals, target]);

  const topAccounts = useMemo(
    () =>
      [...deals]
        .filter((d) => d.stage !== "closed-lost")
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    [deals],
  );

  const atRisk = useMemo(
    () =>
      [...deals]
        .filter(
          (d) =>
            d.stage !== "closed-won" &&
            d.stage !== "closed-lost" &&
            d.probability < 40 &&
            d.value >= 50000,
        )
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [deals],
  );

  if (!hydrated) return <DashboardSkeleton />;

  const thisQuarterWon = won;
  const lastQuarterWon = won * 0.82;
  const growth =
    (thisQuarterWon - lastQuarterWon) / Math.max(lastQuarterWon, 1);
  const gap = Math.max(0, target - won);

  return (
    <ReportShell
      eyebrow="Executive"
      title="Revenue scorecard"
      question="Are we hitting the number? By how much, and where?"
      answer={`QTD ${formatCurrency(won)} — ${formatPercent(attainment)} of ${formatCurrency(target)} target. ${gap > 0 ? `Need ${formatCurrency(gap)} to close the gap. ${formatCurrency(weighted)} weighted pipeline covers ${formatPercent(weighted / Math.max(gap, 1))} of it.` : "Target hit — next priority: protect booked revenue."}`}
      audience={["Exec"]}
      cadence="Weekly"
      banner="/marketing/hero-flow.png"
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Quarterly target"
            value={formatCurrency(target)}
            hint="Q2 FY26"
          />
          <KpiCard
            label="Closed won (QTD)"
            value={formatCurrency(won)}
            tone="positive"
            delta={{
              value: formatPercent(growth),
              direction: growth >= 0 ? "up" : "down",
            }}
            hint="vs. Q1 FY26"
          />
          <KpiCard
            label="Attainment"
            value={formatPercent(attainment)}
            tone={
              attainment >= 1
                ? "positive"
                : attainment >= 0.7
                  ? "warning"
                  : "danger"
            }
          />
          <KpiCard
            label="Gap to target"
            value={formatCurrency(gap)}
            tone={
              gap === 0 ? "positive" : gap < weighted ? "neutral" : "warning"
            }
            hint={`Weighted pipeline: ${formatCurrency(weighted)}`}
          />
        </div>

        <ChartFrame
          hypothesis="Are we pacing to hit the number?"
          soWhat="Cumulative won should track the monthly target line. If cumulative falls below target for 2+ months in a row, pull forward pipeline reviews."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthly}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rev-attain" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--chart-4)"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--chart-4)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="2 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
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
                  tickFormatter={(v) => formatCurrency(v as number)}
                  width={48}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <ChartTooltipBox title={label as string}>
                        {payload.map((p) => (
                          <div
                            key={p.name}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <span
                                className="size-2 rounded-full"
                                style={{ background: p.color }}
                              />
                              {p.name === "won"
                                ? "Won"
                                : p.name === "target"
                                  ? "Monthly target"
                                  : "Cumulative won"}
                            </span>
                            <span className="font-medium tabular-nums">
                              {formatCurrency(Number(p.value))}
                            </span>
                          </div>
                        ))}
                      </ChartTooltipBox>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="var(--chart-4)"
                  strokeWidth={2.5}
                  fill="url(#rev-attain)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="won"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[color:var(--chart-4)]" />
              Cumulative won
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-[color:var(--chart-1)]" />
              Monthly won
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-0.5 w-3"
                style={{
                  background:
                    "repeating-linear-gradient(90deg,var(--muted-foreground) 0 3px,transparent 3px 6px)",
                }}
              />
              Monthly target
            </span>
          </div>
        </ChartFrame>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ChartFrame
            hypothesis="Which accounts matter most this quarter?"
            soWhat="Protect the top five. One slip in a top account is five percentage points of attainment."
            right={
              <Badge variant="outline" className="gap-1 text-[10px]">
                <Trophy className="size-3 text-[color:var(--warning)]" />
                Top 6
              </Badge>
            }
          >
            <div className="flex flex-col gap-2">
              {topAccounts.map((d, i) => {
                const lead = leadMap.get(d.leadId);
                const owner = repMap.get(d.ownerId);
                const pctOfTarget = d.value / target;
                return (
                  <Link
                    key={d.id}
                    href={`/app/pipeline/${d.id}`}
                    className="flex items-center gap-3 rounded-md border border-border/60 bg-card/40 p-3 hover:border-primary/40"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums">
                      {i + 1}
                    </span>
                    <Building2 className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {d.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {lead ? <span>{lead.industry}</span> : null}
                        {owner ? (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <PersonAvatar
                                name={owner.name}
                                src={owner.avatar}
                                size={16}
                              />
                              {owner.name}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums">
                        {formatCurrency(d.value)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatPercent(pctOfTarget)} of target
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ChartFrame>

          <ChartFrame
            hypothesis="What could miss the quarter?"
            soWhat="Low-probability deals with high $ — each one is a reason to pull forward a pipeline review this week."
            right={
              <Badge variant="outline" className="gap-1 text-[10px]">
                <ShieldAlert className="size-3 text-[color:var(--danger)]" />
                At risk
              </Badge>
            }
          >
            {atRisk.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                No high-value deals below 40% probability. Unusual — verify reps
                aren&apos;t upgrading probability to look good.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {atRisk.map((d: Deal) => {
                  const lead = leadMap.get(d.leadId);
                  const owner = repMap.get(d.ownerId);
                  return (
                    <Link
                      key={d.id}
                      href={`/app/pipeline/${d.id}`}
                      className="flex items-center gap-3 rounded-md border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/5 p-3 hover:border-[color:var(--danger)]/60"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {d.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          {lead ? <span>{lead.company}</span> : null}
                          {owner ? (
                            <>
                              <span>·</span>
                              <span>Owner: {owner.name}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">
                          {formatCurrency(d.value)}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-[11px] text-[color:var(--danger)]">
                          <ArrowUpRight className="size-3 rotate-180" />
                          {d.probability}% probability
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </ChartFrame>
        </div>

        <ChartFrame
          hypothesis="Are we in the safe zone if nothing unexpected closes?"
          soWhat="Commit = deals ≥ 70% probability. If commit alone covers gap-to-target, you're safe. If not, you need pipeline-creation this week."
        >
          <QuotaGap target={target} won={won} weighted={weighted} />
        </ChartFrame>
      </div>
    </ReportShell>
  );
}

function QuotaGap({
  target,
  won,
  weighted,
}: {
  target: number;
  won: number;
  weighted: number;
}) {
  const wonPct = Math.min(100, (won / target) * 100);
  const covered = Math.min(100, ((won + weighted) / target) * 100);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Won</span>
          <span className="tabular-nums text-foreground">
            {formatCurrency(won)}
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[color:var(--success)]"
            style={{ width: `${wonPct}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary/35"
            style={{
              left: `${wonPct}%`,
              width: `${Math.max(0, covered - wonPct)}%`,
            }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {formatPercent(won / target)} won · {formatPercent(covered / 100)}{" "}
            coverage incl. weighted pipeline
          </span>
          <span className="tabular-nums">Target {formatCurrency(target)}</span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <MiniStat label="Won" value={formatCurrency(won)} color="success" />
        <MiniStat
          label="+ Weighted"
          value={formatCurrency(weighted)}
          color="primary"
        />
        <MiniStat
          label="Shortfall"
          value={formatCurrency(Math.max(0, target - won - weighted))}
          color="danger"
        />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "success" | "primary" | "danger";
}) {
  const map = {
    success:
      "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]",
    primary: "border-primary/30 bg-primary/10 text-primary",
    danger:
      "border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 text-[color:var(--danger)]",
  } as const;
  return (
    <div className={`rounded-md border p-3 ${map[color]}`}>
      <div className="text-[10px] font-medium uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
