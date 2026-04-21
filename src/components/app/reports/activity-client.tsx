"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CalendarCheck, Mail, Phone } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatNumber, formatPercent } from "@/lib/selectors";
import { KpiCard } from "@/components/app/kpi-card";
import { ReportShell, ChartFrame } from "@/components/app/reports/report-shell";
import { PersonAvatar } from "@/components/app/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { ChartTooltipBox } from "@/components/charts/tooltip-box";
import { cn } from "@/lib/utils";
import type { Lead, Rep } from "@/lib/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_BUCKETS = [
  { label: "8a", min: 8, max: 11 },
  { label: "11a", min: 11, max: 14 },
  { label: "2p", min: 14, max: 17 },
  { label: "5p", min: 17, max: 20 },
];

const ACTIVITY_COLORS: Record<string, string> = {
  email: "var(--chart-1)",
  call: "var(--chart-2)",
  meeting: "var(--chart-3)",
  note: "var(--chart-5)",
};

export function ActivityReportClient() {
  const hydrated = useHydrated();
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);

  const allActivities = useMemo(
    () => leads.flatMap((l) => l.activities),
    [leads],
  );
  const countable = useMemo(
    () =>
      allActivities.filter((a) =>
        ["email", "call", "meeting", "note"].includes(a.type),
      ),
    [allActivities],
  );

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of countable) map.set(a.type, (map.get(a.type) ?? 0) + 1);
    return Array.from(map.entries()).map(([type, count]) => ({
      type,
      count,
      fill: ACTIVITY_COLORS[type] ?? "var(--chart-5)",
    }));
  }, [countable]);

  const heatmap = useMemo(() => {
    const grid: number[][] = DAYS.map(() => HOUR_BUCKETS.map(() => 0));
    for (const a of countable) {
      const d = new Date(a.timestamp);
      const dayIdx = (d.getDay() + 6) % 7;
      const hour = d.getHours();
      const bucketIdx = HOUR_BUCKETS.findIndex(
        (b) => hour >= b.min && hour < b.max,
      );
      if (bucketIdx >= 0) grid[dayIdx][bucketIdx] += 1;
    }
    const max = Math.max(1, ...grid.flat());
    return { grid, max };
  }, [countable]);

  const perRep = useMemo(() => {
    const repActivities: Record<
      string,
      {
        calls: number;
        emails: number;
        meetings: number;
        notes: number;
        leads: Set<string>;
      }
    > = {};
    for (const r of reps) {
      repActivities[r.id] = {
        calls: 0,
        emails: 0,
        meetings: 0,
        notes: 0,
        leads: new Set(),
      };
    }
    for (const l of leads) {
      for (const a of l.activities) {
        if (!a.repId || !repActivities[a.repId]) continue;
        repActivities[a.repId].leads.add(l.id);
        if (a.type === "call") repActivities[a.repId].calls += 1;
        else if (a.type === "email") repActivities[a.repId].emails += 1;
        else if (a.type === "meeting") repActivities[a.repId].meetings += 1;
        else if (a.type === "note") repActivities[a.repId].notes += 1;
      }
    }
    return reps
      .map((r) => ({
        rep: r,
        ...repActivities[r.id],
        touches:
          repActivities[r.id].calls +
          repActivities[r.id].emails +
          repActivities[r.id].meetings,
        leads: repActivities[r.id].leads.size,
      }))
      .sort((a, b) => b.touches - a.touches);
  }, [reps, leads]);

  if (!hydrated) return <DashboardSkeleton />;

  const totalTouches = perRep.reduce((a, r) => a + r.touches, 0);
  const avgPerRep = totalTouches / Math.max(perRep.length, 1);
  const topRep = perRep[0];
  const bottomRep = perRep[perRep.length - 1];

  return (
    <ReportShell
      eyebrow="Team"
      title="Team activity"
      question="Who's doing the work that produces pipeline?"
      answer={`${topRep.rep.name} is logging ${topRep.touches} touches — ${Math.round((topRep.touches / Math.max(bottomRep.touches, 1)) * 10) / 10}× the bottom rep. Activity density peaks Tue-Thu 11a-2p.`}
      audience={["Manager"]}
      cadence="Daily"
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Total touches (30d)"
            value={formatNumber(totalTouches)}
            delta={{ value: "+14%", direction: "up" }}
            tone="positive"
          />
          <KpiCard
            label="Avg touches / rep"
            value={formatNumber(Math.round(avgPerRep))}
            hint="Across SDRs + AEs"
          />
          <KpiCard
            label="Top performer"
            value={topRep.touches.toString()}
            hint={topRep.rep.name}
            tone="positive"
          />
          <KpiCard
            label="Coaching flag"
            value={bottomRep.touches.toString()}
            hint={`${bottomRep.rep.name} — below team avg`}
            tone="warning"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <ChartFrame
            hypothesis="When is the team most active?"
            soWhat="Density clusters tell you when to schedule coaching, pipeline review, or promotional blasts. Empty cells are opportunities to redistribute work."
          >
            <div className="overflow-x-auto">
              <div className="inline-grid min-w-full grid-cols-[64px_repeat(4,1fr)] gap-1 text-xs">
                <div />
                {HOUR_BUCKETS.map((b) => (
                  <div
                    key={b.label}
                    className="text-center font-medium text-muted-foreground"
                  >
                    {b.label}
                  </div>
                ))}
                {DAYS.map((d, i) => (
                  <>
                    <div
                      key={`label-${d}`}
                      className="flex items-center text-[11px] font-medium text-muted-foreground"
                    >
                      {d}
                    </div>
                    {heatmap.grid[i].map((count, j) => {
                      const intensity = count / heatmap.max;
                      return (
                        <div
                          key={`${d}-${j}`}
                          className="flex aspect-square items-center justify-center rounded-md border border-border/40 text-[10px] font-medium tabular-nums"
                          style={{
                            background: `color-mix(in oklch, var(--primary) ${intensity * 75}%, var(--muted) ${100 - intensity * 75}%)`,
                            color:
                              intensity > 0.5
                                ? "var(--primary-foreground)"
                                : "var(--muted-foreground)",
                          }}
                          title={`${d} ${HOUR_BUCKETS[j].label} — ${count} touches`}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-0.5">
                  {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                    <div
                      key={v}
                      className="size-3 rounded-sm"
                      style={{
                        background: `color-mix(in oklch, var(--primary) ${v * 75}%, var(--muted) ${100 - v * 75}%)`,
                      }}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </ChartFrame>

          <ChartFrame
            hypothesis="What's the activity mix?"
            soWhat="If calls dominate, reps may be skipping qualifying emails. If emails dominate, no one's talking to prospects."
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byType}
                    dataKey="count"
                    nameKey="type"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {byType.map((d) => (
                      <Cell
                        key={d.type}
                        fill={d.fill}
                        stroke="var(--card)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <ChartTooltipBox title={payload[0].payload.type}>
                          <div className="flex justify-between gap-3 text-muted-foreground">
                            Count
                            <span className="font-medium text-foreground">
                              {payload[0].payload.count}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 text-muted-foreground">
                            Share
                            <span className="font-medium text-foreground">
                              {formatPercent(
                                payload[0].payload.count / totalTouches,
                              )}
                            </span>
                          </div>
                        </ChartTooltipBox>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
              {byType.map((d) => (
                <span
                  key={d.type}
                  className="inline-flex items-center gap-1.5 text-muted-foreground"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: d.fill }}
                  />
                  {d.type}
                </span>
              ))}
            </div>
          </ChartFrame>
        </div>

        <ChartFrame
          hypothesis="How is activity distributed across the team?"
          soWhat="Look for activity-to-outcome ratio. High activity + low conversion → motion without progress. Low activity + high conversion → a rep who closes, not prospects."
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {perRep.map(
              (row: {
                rep: Rep;
                calls: number;
                emails: number;
                meetings: number;
                notes: number;
                touches: number;
                leads: number;
              }) => {
                const mix = row.touches;
                return (
                  <div
                    key={row.rep.id}
                    className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <PersonAvatar
                        name={row.rep.name}
                        src={row.rep.avatar}
                        size={40}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {row.rep.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {row.rep.role} · {row.leads} leads worked
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {row.touches} touches
                      </Badge>
                    </div>
                    <ActivityBar
                      icon={Phone}
                      label="Calls"
                      value={row.calls}
                      max={mix}
                      color="var(--chart-2)"
                    />
                    <ActivityBar
                      icon={Mail}
                      label="Emails"
                      value={row.emails}
                      max={mix}
                      color="var(--chart-1)"
                    />
                    <ActivityBar
                      icon={CalendarCheck}
                      label="Meetings"
                      value={row.meetings}
                      max={mix}
                      color="var(--chart-3)"
                    />
                  </div>
                );
              },
            )}
          </div>
        </ChartFrame>
      </div>
    </ReportShell>
  );
}

function ActivityBar({
  icon: Icon,
  label,
  value,
  max,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max === 0 ? 0 : (value / max) * 100;
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="w-14 text-muted-foreground">{label}</span>
      <div className="relative h-1.5 flex-1 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full")}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-8 text-right font-medium tabular-nums">{value}</span>
    </div>
  );
}
