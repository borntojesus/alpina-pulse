"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { differenceInDays } from "date-fns";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { STAGE_LABEL, formatCurrency, formatPercent } from "@/lib/selectors";
import { KpiCard } from "@/components/app/kpi-card";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/app/person-avatar";
import { CompanyLogo } from "@/components/app/company-logo";
import { Progress } from "@/components/ui/progress";
import { ReportShell, ChartFrame } from "@/components/app/reports/report-shell";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { ChartTooltipBox } from "@/components/charts/tooltip-box";
import type { Deal, Industry, Source } from "@/lib/types";

const SOURCES: Source[] = [
  "Website",
  "LinkedIn Ads",
  "Google Ads",
  "Referral",
  "Outbound",
  "Event",
  "Content",
];

const INDUSTRIES: Industry[] = [
  "SaaS",
  "eCommerce",
  "Fintech",
  "Healthcare",
  "Manufacturing",
  "Media",
];

const PIE_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "oklch(0.7 0.15 30)",
  "oklch(0.7 0.15 200)",
];

const BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "$0–25k", min: 0, max: 25_000 },
  { label: "$25–50k", min: 25_000, max: 50_000 },
  { label: "$50–100k", min: 50_000, max: 100_000 },
  { label: "$100k+", min: 100_000, max: Number.POSITIVE_INFINITY },
];

export function WinLossClient() {
  const hydrated = useHydrated();
  const deals = usePulseStore((s) => s.deals);
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);

  const leadMap = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const repMap = useMemo(() => new Map(reps.map((r) => [r.id, r])), [reps]);

  const won = useMemo(
    () => deals.filter((d) => d.stage === "closed-won"),
    [deals],
  );
  const lost = useMemo(
    () => deals.filter((d) => d.stage === "closed-lost"),
    [deals],
  );
  const closed = useMemo(() => [...won, ...lost], [won, lost]);

  const winRate = useMemo(() => {
    const total = won.length + lost.length;
    return total === 0 ? 0 : won.length / total;
  }, [won.length, lost.length]);

  const avgWonValue = useMemo(() => {
    if (won.length === 0) return 0;
    return won.reduce((a, d) => a + d.value, 0) / won.length;
  }, [won]);

  const avgLostValue = useMemo(() => {
    if (lost.length === 0) return 0;
    return lost.reduce((a, d) => a + d.value, 0) / lost.length;
  }, [lost]);

  const avgCycleDays = useMemo(() => {
    if (closed.length === 0) return 0;
    const total = closed.reduce(
      (a, d) =>
        a +
        Math.max(
          0,
          differenceInDays(
            new Date(d.updatedAt).getTime(),
            new Date(d.createdAt).getTime(),
          ),
        ),
      0,
    );
    return total / closed.length;
  }, [closed]);

  const lostReasons = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of lost) {
      const key = d.lostReason ?? "Unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const total = lost.length;
    return Array.from(map.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        pct: total === 0 ? 0 : count / total,
      }))
      .sort((a, b) => b.count - a.count);
  }, [lost]);

  const topLostReason = lostReasons[0];

  const winRateBySource = useMemo(() => {
    return SOURCES.map((source) => {
      let w = 0;
      let l = 0;
      for (const d of closed) {
        const lead = leadMap.get(d.leadId);
        if (!lead || lead.source !== source) continue;
        if (d.stage === "closed-won") w += 1;
        else l += 1;
      }
      const total = w + l;
      return {
        source,
        won: w,
        lost: l,
        total,
        rate: total === 0 ? 0 : w / total,
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [closed, leadMap]);

  const winRateByIndustry = useMemo(() => {
    return INDUSTRIES.map((industry) => {
      let w = 0;
      let l = 0;
      for (const d of closed) {
        const lead = leadMap.get(d.leadId);
        if (!lead || lead.industry !== industry) continue;
        if (d.stage === "closed-won") w += 1;
        else l += 1;
      }
      const total = w + l;
      return {
        industry,
        won: w,
        lost: l,
        total,
        rate: total === 0 ? 0 : w / total,
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [closed, leadMap]);

  const repBoard = useMemo(() => {
    return reps
      .map((rep) => {
        const owned = closed.filter((d) => d.ownerId === rep.id);
        const wonDeals = owned.filter((d) => d.stage === "closed-won");
        const lostDeals = owned.filter((d) => d.stage === "closed-lost");
        const wonValue = wonDeals.reduce((a, d) => a + d.value, 0);
        const lostValue = lostDeals.reduce((a, d) => a + d.value, 0);
        const total = wonDeals.length + lostDeals.length;
        return {
          rep,
          wonCount: wonDeals.length,
          lostCount: lostDeals.length,
          wonValue,
          lostValue,
          winRate: total === 0 ? 0 : wonDeals.length / total,
        };
      })
      .sort((a, b) => b.wonValue - a.wonValue);
  }, [reps, closed]);

  const sizeDistribution = useMemo(() => {
    return BUCKETS.map((b) => ({
      bucket: b.label,
      won: won.filter((d) => d.value >= b.min && d.value < b.max).length,
      lost: lost.filter((d) => d.value >= b.min && d.value < b.max).length,
    }));
  }, [won, lost]);

  const recentClosed = useMemo(() => {
    return [...closed]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 10);
  }, [closed]);

  // Best combo for headline answer — scan source × industry
  const bestCombo = useMemo(() => {
    const combos = new Map<
      string,
      { source: Source; industry: Industry; won: number; lost: number }
    >();
    for (const d of closed) {
      const lead = leadMap.get(d.leadId);
      if (!lead) continue;
      const key = `${lead.source}|${lead.industry}`;
      const entry = combos.get(key) ?? {
        source: lead.source,
        industry: lead.industry,
        won: 0,
        lost: 0,
      };
      if (d.stage === "closed-won") entry.won += 1;
      else entry.lost += 1;
      combos.set(key, entry);
    }
    let best: {
      source: Source;
      industry: Industry;
      rate: number;
      total: number;
    } | null = null;
    for (const c of combos.values()) {
      const total = c.won + c.lost;
      if (total < 3) continue;
      const rate = c.won / total;
      if (!best || rate > best.rate) {
        best = { source: c.source, industry: c.industry, rate, total };
      }
    }
    return best;
  }, [closed, leadMap]);

  if (!hydrated) return <DashboardSkeleton />;

  const avgMultiple = winRate === 0 ? 0 : (bestCombo?.rate ?? 0) / winRate;
  const answer = (() => {
    const parts: string[] = [];
    if (bestCombo) {
      parts.push(
        `${bestCombo.source} + ${bestCombo.industry} wins ${formatPercent(
          bestCombo.rate,
        )}${
          avgMultiple > 1.2
            ? ` — ${avgMultiple.toFixed(1)}× company average`
            : ""
        }.`,
      );
    }
    if (topLostReason) {
      parts.push(
        `${topLostReason.reason} is the #1 lost reason (${formatPercent(
          topLostReason.pct,
        )}) — look at packaging and positioning, not just sales execution.`,
      );
    } else {
      parts.push(
        "No closed-lost deals to learn from yet — celebrate, then pressure-test the wins.",
      );
    }
    return parts.join(" ");
  })();

  return (
    <ReportShell
      eyebrow="Sales ops"
      title="Win / Loss analysis"
      question="When we win, why? When we lose, why?"
      answer={answer}
      audience={["Manager", "Exec"]}
      cadence="Monthly"
      banner="/marketing/report-banner.png"
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Win rate"
            value={formatPercent(winRate)}
            tone={
              winRate >= 0.35
                ? "positive"
                : winRate >= 0.2
                  ? "warning"
                  : "danger"
            }
            hint={`${won.length} won · ${lost.length} lost`}
          />
          <KpiCard
            label="Avg won deal"
            value={formatCurrency(avgWonValue)}
            tone="positive"
          />
          <KpiCard
            label="Avg lost deal"
            value={formatCurrency(avgLostValue)}
            tone="warning"
            hint={
              avgLostValue > avgWonValue
                ? "Losing bigger deals than we win"
                : "Losing smaller deals than we win"
            }
          />
          <KpiCard
            label="Avg sales cycle"
            value={`${avgCycleDays.toFixed(0)} days`}
            hint="Created → closed, all closed deals"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
          <ChartFrame
            hypothesis="Why do we lose?"
            soWhat={
              topLostReason
                ? `"${topLostReason.reason}" tops the list at ${formatPercent(
                    topLostReason.pct,
                  )}. If that's pricing or product, it's not a rep problem — fix it at the source.`
                : "No closed-lost deals on file. Add reasons when you do lose so we can learn."
            }
          >
            {lostReasons.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                No lost deals recorded.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-center">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={lostReasons}
                        dataKey="count"
                        nameKey="reason"
                        innerRadius={48}
                        outerRadius={80}
                        paddingAngle={2}
                        stroke="var(--card)"
                        strokeWidth={2}
                      >
                        {lostReasons.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_PALETTE[i % PIE_PALETTE.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <ChartTooltipBox
                              title={String(payload[0].payload.reason)}
                            >
                              <div className="flex justify-between gap-3 text-muted-foreground">
                                Deals
                                <span className="font-medium text-foreground">
                                  {payload[0].payload.count}
                                </span>
                              </div>
                              <div className="flex justify-between gap-3 text-muted-foreground">
                                Share
                                <span className="font-medium text-foreground">
                                  {formatPercent(payload[0].payload.pct)}
                                </span>
                              </div>
                            </ChartTooltipBox>
                          ) : null
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2">
                  {lostReasons.map((r, i) => (
                    <div
                      key={r.reason}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className="size-2.5 rounded-sm"
                        style={{
                          background: PIE_PALETTE[i % PIE_PALETTE.length],
                        }}
                      />
                      <span className="flex-1 truncate font-medium">
                        {r.reason}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {r.count}
                      </span>
                      <span className="w-12 text-right tabular-nums">
                        {formatPercent(r.pct)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartFrame>

          <ChartFrame
            hypothesis="Which lead sources actually close?"
            soWhat={`Average is ${formatPercent(winRate)}. Sources above the line deserve more budget; sources below need a qualification change, not more volume.`}
            right={
              <Badge variant="outline" className="text-[10px]">
                Baseline {formatPercent(winRate)}
              </Badge>
            }
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={winRateBySource}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeDasharray="2 3"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 1]}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatPercent(v as number)}
                  />
                  <YAxis
                    type="category"
                    dataKey="source"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={96}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <ChartTooltipBox
                          title={String(payload[0].payload.source)}
                        >
                          <div className="flex justify-between gap-3 text-muted-foreground">
                            Win rate
                            <span className="font-medium text-foreground">
                              {formatPercent(payload[0].payload.rate)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 text-muted-foreground">
                            Closed deals
                            <span className="font-medium text-foreground">
                              {payload[0].payload.won} won ·{" "}
                              {payload[0].payload.lost} lost
                            </span>
                          </div>
                        </ChartTooltipBox>
                      ) : null
                    }
                  />
                  <ReferenceLine
                    x={winRate}
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 3"
                  />
                  <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={16}>
                    {winRateBySource.map((d) => (
                      <Cell
                        key={d.source}
                        fill={
                          d.total === 0
                            ? "var(--muted)"
                            : d.rate >= winRate
                              ? "var(--success)"
                              : "var(--warning)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>
        </div>

        <ChartFrame
          hypothesis="Which industries convert, which chew cycles?"
          soWhat="High-win-rate industries are ideal-customer-profile signal — feed them into targeting. Low-win-rate industries may need a vertical play or should be deprioritised."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={winRateByIndustry}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="2 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="industry"
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
                  domain={[0, 1]}
                  tickFormatter={(v) => formatPercent(v as number)}
                  width={48}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <ChartTooltipBox
                        title={String(payload[0].payload.industry)}
                      >
                        <div className="flex justify-between gap-3 text-muted-foreground">
                          Win rate
                          <span className="font-medium text-foreground">
                            {formatPercent(payload[0].payload.rate)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 text-muted-foreground">
                          Deals
                          <span className="font-medium text-foreground">
                            {payload[0].payload.won} won ·{" "}
                            {payload[0].payload.lost} lost
                          </span>
                        </div>
                      </ChartTooltipBox>
                    ) : null
                  }
                />
                <ReferenceLine
                  y={winRate}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 3"
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={44}>
                  {winRateByIndustry.map((d) => (
                    <Cell
                      key={d.industry}
                      fill={
                        d.total === 0
                          ? "var(--muted)"
                          : d.rate >= winRate
                            ? "var(--success)"
                            : "var(--warning)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>

        <ChartFrame
          hypothesis="Who closes, who leaks?"
          soWhat="Sorted by won $. A high lost-$ rep with a low win rate is either chasing the wrong deals or needs coaching on negotiation — the table tells you which."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Rep</th>
                  <th className="pb-2 pr-2 text-right font-medium">Won</th>
                  <th className="pb-2 pr-2 text-right font-medium">Lost</th>
                  <th className="pb-2 pr-2 text-right font-medium">Won $</th>
                  <th className="pb-2 pr-2 text-right font-medium">Lost $</th>
                  <th className="w-48 pb-2 font-medium">Win rate</th>
                </tr>
              </thead>
              <tbody>
                {repBoard.map((row) => (
                  <tr
                    key={row.rep.id}
                    className="border-b border-border/40 last:border-none"
                  >
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-2">
                        <PersonAvatar
                          name={row.rep.name}
                          src={row.rep.avatar}
                          size={24}
                        />
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium">{row.rep.name}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {row.rep.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums text-[color:var(--success)]">
                      {row.wonCount}
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums text-[color:var(--danger)]">
                      {row.lostCount}
                    </td>
                    <td className="py-2 pr-2 text-right font-medium tabular-nums">
                      {formatCurrency(row.wonValue)}
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(row.lostValue)}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={row.winRate * 100}
                          className="h-1.5 flex-1"
                        />
                        <span className="w-12 text-right text-xs tabular-nums">
                          {formatPercent(row.winRate)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartFrame>

        <ChartFrame
          hypothesis="Do we win and lose at the same deal sizes?"
          soWhat="If losses skew larger than wins, we're reaching above our weight — either up the discovery rigor or partner on enterprise bids. If losses skew smaller, stop wasting cycles on deals below the ICP floor."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sizeDistribution}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="2 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="bucket"
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
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <ChartTooltipBox title={String(label)}>
                        {payload.map((p) => (
                          <div
                            key={String(p.dataKey)}
                            className="flex justify-between gap-3 text-muted-foreground"
                          >
                            <span className="flex items-center gap-1.5">
                              <span
                                className="size-2 rounded-full"
                                style={{ background: p.color }}
                              />
                              {p.dataKey === "won" ? "Won" : "Lost"}
                            </span>
                            <span className="font-medium text-foreground">
                              {p.value as number}
                            </span>
                          </div>
                        ))}
                      </ChartTooltipBox>
                    ) : null
                  }
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(v) =>
                    v === "won" ? "Won" : v === "lost" ? "Lost" : String(v)
                  }
                />
                <Bar
                  dataKey="won"
                  fill="var(--success)"
                  radius={[4, 4, 0, 0]}
                  barSize={26}
                />
                <Bar
                  dataKey="lost"
                  fill="var(--danger)"
                  radius={[4, 4, 0, 0]}
                  barSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>

        <ChartFrame
          hypothesis="Recent closes — what happened?"
          soWhat="Scan the last ten: do the lost reasons cluster? Two Pricing losses in a row is a pattern, not bad luck."
        >
          {recentClosed.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
              No closed deals yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentClosed.map((d: Deal) => {
                const lead = leadMap.get(d.leadId);
                const owner = repMap.get(d.ownerId);
                const isWon = d.stage === "closed-won";
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 rounded-md border border-border/60 bg-card/40 p-3"
                  >
                    {lead ? (
                      <CompanyLogo
                        src={lead.companyLogo}
                        company={lead.company}
                        size={28}
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {d.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {owner ? (
                          <span className="inline-flex items-center gap-1">
                            <PersonAvatar
                              name={owner.name}
                              src={owner.avatar}
                              size={16}
                            />
                            {owner.name}
                          </span>
                        ) : null}
                        {lead ? (
                          <>
                            <span>·</span>
                            <span>{lead.industry}</span>
                            <span>·</span>
                            <span>{lead.source}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <Badge
                      variant={isWon ? "success" : "destructive"}
                      className="text-[10px]"
                    >
                      {STAGE_LABEL[d.stage]}
                    </Badge>
                    <div className="w-24 text-right">
                      <div className="text-sm font-semibold tabular-nums">
                        {formatCurrency(d.value)}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {isWon ? "—" : (d.lostReason ?? "Unknown")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartFrame>
      </div>
    </ReportShell>
  );
}
