"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckSquare,
  Contact,
  DollarSign,
  Download,
  Eye,
  Globe,
  MousePointerClick,
  Presentation,
  Sparkles,
  Swords,
} from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatNumber, formatPercent } from "@/lib/selectors";
import { KpiCard } from "@/components/app/kpi-card";
import { ChartFrame, ReportShell } from "@/components/app/reports/report-shell";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { ChartTooltipBox } from "@/components/charts/tooltip-box";
import { cn } from "@/lib/utils";
import type { Lead, Signal, SignalType } from "@/lib/types";

const SIGNAL_ICONS: Record<
  SignalType,
  React.ComponentType<{ className?: string }>
> = {
  website_visit: Globe,
  pricing_page: DollarSign,
  content_download: Download,
  email_open: Eye,
  email_click: MousePointerClick,
  linkedin_view: Contact,
  linkedin_engage: Contact,
  competitor_research: Swords,
  webinar_attend: Presentation,
  form_fill: CheckSquare,
  demo_request: Sparkles,
};

const SIGNAL_LABEL: Record<SignalType, string> = {
  website_visit: "Website visit",
  pricing_page: "Pricing page",
  content_download: "Content download",
  email_open: "Email open",
  email_click: "Email click",
  linkedin_view: "LinkedIn view",
  linkedin_engage: "LinkedIn engage",
  competitor_research: "Competitor research",
  webinar_attend: "Webinar attend",
  form_fill: "Form fill",
  demo_request: "Demo request",
};

const SIGNAL_TYPE_COLORS: Record<SignalType, string> = {
  website_visit: "var(--chart-1)",
  pricing_page: "var(--chart-2)",
  content_download: "var(--chart-3)",
  email_open: "var(--chart-4)",
  email_click: "var(--chart-5)",
  linkedin_view: "var(--chart-1)",
  linkedin_engage: "var(--chart-2)",
  competitor_research: "var(--chart-3)",
  webinar_attend: "var(--chart-4)",
  form_fill: "var(--chart-5)",
  demo_request: "var(--chart-1)",
};

const INTENT_COLORS = {
  low: "var(--muted)",
  medium: "var(--warning)",
  high: "var(--success)",
} as const;

const INTENT_TEXT = {
  low: "text-muted-foreground",
  medium: "text-[color:var(--warning)]",
  high: "text-[color:var(--success)]",
} as const;

const INTENT_BG = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  high: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
} as const;

export function SignalsClient() {
  const hydrated = useHydrated();
  const signals = usePulseStore((s) => s.signals);
  const leads = usePulseStore((s) => s.leads);

  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), []);

  const leadMap = useMemo(
    () => new Map<string, Lead>(leads.map((l) => [l.id, l])),
    [leads],
  );

  const sortedSignals = useMemo(
    () =>
      [...signals].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [signals],
  );

  const last7d = useMemo(() => {
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;
    return signals.filter((s) => new Date(s.timestamp).getTime() >= cutoff);
  }, [signals, now]);

  const highIntentCount = useMemo(
    () => signals.filter((s) => s.intent === "high").length,
    [signals],
  );

  const accountsByDensity = useMemo(() => {
    const counts = new Map<
      string,
      { low: number; medium: number; high: number; total: number }
    >();
    for (const s of last7d) {
      const entry = counts.get(s.leadId) ?? {
        low: 0,
        medium: 0,
        high: 0,
        total: 0,
      };
      entry[s.intent] += 1;
      entry.total += 1;
      counts.set(s.leadId, entry);
    }
    return Array.from(counts.entries())
      .map(([leadId, v]) => ({ leadId, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [last7d]);

  const accountsWith3Plus = useMemo(
    () => accountsByDensity.filter((a) => a.total >= 3).length,
    [accountsByDensity],
  );

  const signalsPerLead = useMemo(() => {
    if (leads.length === 0) return 0;
    return signals.length / leads.length;
  }, [signals, leads]);

  const topAccounts = useMemo(() => {
    return accountsByDensity.slice(0, 10).map((row) => {
      const lead = leadMap.get(row.leadId);
      const label = lead ? lead.company : "Unknown";
      return {
        leadId: row.leadId,
        label,
        leadName: lead ? `${lead.firstName} ${lead.lastName}` : "",
        low: row.low,
        medium: row.medium,
        high: row.high,
        total: row.total,
      };
    });
  }, [accountsByDensity, leadMap]);

  const signalMix = useMemo(() => {
    const counts = new Map<SignalType, number>();
    for (const s of signals) {
      counts.set(s.type, (counts.get(s.type) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([type, count]) => ({
        type,
        label: SIGNAL_LABEL[type],
        count,
        fill: SIGNAL_TYPE_COLORS[type],
      }))
      .sort((a, b) => b.count - a.count);
  }, [signals]);

  if (!hydrated) return <DashboardSkeleton />;

  const totalSignals = signals.length;
  const recent = sortedSignals.slice(0, 30);

  return (
    <ReportShell
      eyebrow="Intent"
      title="Buying signals"
      question="Which accounts are showing buying intent right now?"
      answer="22% of this week's signals came from just 14 accounts. That's your Friday cold-call list."
      audience={["SDR", "Manager"]}
      cadence="Daily"
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Signals last 7d"
            value={formatNumber(last7d.length)}
            tone="neutral"
          />
          <KpiCard
            label="High-intent signals"
            value={formatNumber(highIntentCount)}
            tone="positive"
            hint={`${formatPercent(highIntentCount / Math.max(totalSignals, 1))} of all signals`}
          />
          <KpiCard
            label="Accounts ≥ 3 signals / wk"
            value={formatNumber(accountsWith3Plus)}
            hint="This week"
            tone="warning"
          />
          <KpiCard
            label="Signals / lead (avg)"
            value={signalsPerLead.toFixed(1)}
            hint="Across the base"
          />
        </div>

        <ChartFrame
          hypothesis="What's happening right now across your accounts?"
          soWhat="Each row is a real trigger — coach your SDRs to react to the top 10 in under 2 hours."
        >
          <ol className="flex flex-col">
            {recent.map((signal, idx) => (
              <SignalRow
                key={signal.id}
                signal={signal}
                lead={leadMap.get(signal.leadId)}
                isLast={idx === recent.length - 1}
              />
            ))}
            {recent.length === 0 ? (
              <li className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                No signals yet.
              </li>
            ) : null}
          </ol>
        </ChartFrame>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <ChartFrame
            hypothesis="Which accounts are lit up this week?"
            soWhat="Top-10 accounts by signal density, stacked by intent. If the stack is green-heavy, call today."
          >
            <div style={{ height: Math.max(280, topAccounts.length * 34) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topAccounts}
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                  barCategoryGap={6}
                >
                  <XAxis
                    type="number"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <ChartTooltipBox title={payload[0].payload.label}>
                          <div className="flex justify-between gap-3 text-muted-foreground">
                            High
                            <span className="font-medium text-[color:var(--success)]">
                              {payload[0].payload.high}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 text-muted-foreground">
                            Medium
                            <span className="font-medium text-[color:var(--warning)]">
                              {payload[0].payload.medium}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 text-muted-foreground">
                            Low
                            <span className="font-medium text-foreground">
                              {payload[0].payload.low}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 border-t border-border/50 pt-1 text-muted-foreground">
                            Total
                            <span className="font-semibold text-foreground">
                              {payload[0].payload.total}
                            </span>
                          </div>
                        </ChartTooltipBox>
                      ) : null
                    }
                  />
                  <Bar
                    dataKey="low"
                    stackId="intent"
                    fill={INTENT_COLORS.low}
                    radius={[4, 0, 0, 4]}
                  />
                  <Bar
                    dataKey="medium"
                    stackId="intent"
                    fill={INTENT_COLORS.medium}
                  />
                  <Bar
                    dataKey="high"
                    stackId="intent"
                    fill={INTENT_COLORS.high}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: INTENT_COLORS.low }}
                />
                Low
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: INTENT_COLORS.medium }}
                />
                Medium
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: INTENT_COLORS.high }}
                />
                High
              </span>
            </div>
          </ChartFrame>

          <ChartFrame
            hypothesis="What's the signal mix?"
            soWhat="If pricing and demo signals dominate, marketing's doing its job. If only email opens, nothing's actually happening."
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={signalMix}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {signalMix.map((d) => (
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
                        <ChartTooltipBox title={payload[0].payload.label}>
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
                                payload[0].payload.count /
                                  Math.max(totalSignals, 1),
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
            <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[11px]">
              {signalMix.map((d) => (
                <span
                  key={d.type}
                  className="inline-flex items-center gap-1.5 text-muted-foreground"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: d.fill }}
                  />
                  {d.label}
                </span>
              ))}
            </div>
          </ChartFrame>
        </div>
      </div>
    </ReportShell>
  );
}

function SignalRow({
  signal,
  lead,
  isLast,
}: {
  signal: Signal;
  lead: Lead | undefined;
  isLast: boolean;
}) {
  const Icon = SIGNAL_ICONS[signal.type];
  return (
    <li className="relative flex gap-4 pb-4 last:pb-0">
      {!isLast ? (
        <span
          aria-hidden
          className="absolute left-[15px] top-8 bottom-0 w-px bg-border/60"
        />
      ) : null}
      <div
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card",
          INTENT_TEXT[signal.intent],
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border border-border/60 bg-card/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {lead ? (
              <Link
                href={`/app/leads/${lead.id}`}
                className="truncate text-sm font-medium hover:text-primary hover:underline"
              >
                {lead.firstName} {lead.lastName}
              </Link>
            ) : (
              <span className="truncate text-sm font-medium text-muted-foreground">
                Unknown lead
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {lead ? `· ${lead.company}` : ""}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                INTENT_BG[signal.intent],
              )}
            >
              {signal.intent}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(signal.timestamp), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">
            {SIGNAL_LABEL[signal.type]}
          </span>
          <span className="mx-1.5">·</span>
          {signal.detail}
        </div>
      </div>
    </li>
  );
}
