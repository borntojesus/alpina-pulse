"use client";

import Link from "next/link";
import * as React from "react";
import { notFound } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  CalendarClock,
  MessageSquare,
  Phone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { CompanyLogo } from "@/components/app/company-logo";
import { PersonAvatar } from "@/components/app/person-avatar";
import { ScoreBadge } from "@/components/app/score-badge";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartTooltipBox } from "@/components/charts/tooltip-box";
import {
  STAGE_LABEL,
  STATUS_LABEL,
  formatCurrency,
  formatNumber,
} from "@/lib/selectors";
import { cn } from "@/lib/utils";
import type {
  CallRecording,
  Channel,
  Deal,
  Lead,
  Rep,
  Signal,
} from "@/lib/types";
import { buildAccounts } from "./aggregate";

const CHANNEL_LABEL: Record<Channel, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  sms: "SMS",
};

const CHANNEL_COLORS: Record<Channel, string> = {
  email: "var(--chart-1)",
  linkedin: "var(--chart-2)",
  whatsapp: "var(--chart-3)",
  telegram: "var(--chart-4)",
  sms: "var(--chart-5)",
};

const INTENT_BG = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  high: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
} as const;

const STAGE_PROGRESS: Record<Deal["stage"], number> = {
  discovery: 25,
  proposal: 50,
  negotiation: 70,
  "closed-won": 100,
  "closed-lost": 100,
};

type TimelineEntry = {
  id: string;
  kind: "conversation" | "call" | "signal" | "deal";
  timestamp: number;
  title: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: string;
};

export function AccountDetailClient({ company }: { company: string }) {
  const hydrated = useHydrated();
  const leads = usePulseStore((s) => s.leads);
  const deals = usePulseStore((s) => s.deals);
  const conversations = usePulseStore((s) => s.conversations);
  const calls = usePulseStore((s) => s.calls);
  const signals = usePulseStore((s) => s.signals);
  const reps = usePulseStore((s) => s.reps);

  const repMap = React.useMemo(
    () => new Map<string, Rep>(reps.map((r) => [r.id, r])),
    [reps],
  );

  const account = React.useMemo(() => {
    if (!hydrated) return null;
    const rows = buildAccounts({
      leads,
      deals,
      conversations,
      calls,
      signals,
    });
    return rows.find((a) => a.company === company) ?? null;
  }, [hydrated, leads, deals, conversations, calls, signals, company]);

  if (!hydrated) return <DashboardSkeleton />;
  if (!account) return notFound();

  const leadById = new Map<string, Lead>(account.leads.map((l) => [l.id, l]));
  const now = Date.now();

  // Relationship strength: weighted blend
  const totalSignalsHigh = account.signalsForCompany.filter(
    (s) => s.intent === "high",
  ).length;
  const callsCount = account.callsForCompany.length;
  const msgCount = account.conversationsForCompany.reduce(
    (sum, c) => sum + c.messages.length,
    0,
  );
  const rawStrength =
    totalSignalsHigh * 8 + callsCount * 10 + msgCount * 1.5 + account.avgScore;
  const relationshipStrength = Math.min(100, Math.round(rawStrength));

  const champions = account.leads
    .filter((l) => l.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const openDeals = account.deals.filter(
    (d) => d.stage !== "closed-won" && d.stage !== "closed-lost",
  );

  const daysSinceActivity = account.lastActivity
    ? Math.round((now - account.lastActivity) / (24 * 60 * 60 * 1000))
    : null;

  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
  const wonThisYear = account.deals
    .filter(
      (d) =>
        d.stage === "closed-won" &&
        new Date(d.updatedAt).getTime() >= yearStart,
    )
    .reduce((sum, d) => sum + d.value, 0);

  const signalsTone: "neutral" | "positive" | "warning" | "danger" =
    account.signalIntensity7d >= 8
      ? "positive"
      : account.signalIntensity7d >= 3
        ? "warning"
        : "neutral";

  // Timeline merge
  const timelineEntries: TimelineEntry[] = [];
  for (const c of account.conversationsForCompany) {
    const lead = leadById.get(c.leadId);
    const last = c.messages[c.messages.length - 1];
    timelineEntries.push({
      id: `conv-${c.id}`,
      kind: "conversation",
      timestamp: new Date(c.lastMessageAt).getTime(),
      title: `${lead ? `${lead.firstName} ${lead.lastName}` : "Unknown"} · ${CHANNEL_LABEL[c.channel]}`,
      detail: last ? last.body : c.preview,
      icon: MessageSquare,
      tone: "text-accent",
    });
  }
  for (const c of account.callsForCompany) {
    const lead = leadById.get(c.leadId);
    timelineEntries.push({
      id: `call-${c.id}`,
      kind: "call",
      timestamp: new Date(c.startedAt).getTime(),
      title: `Call with ${lead ? `${lead.firstName} ${lead.lastName}` : "Unknown"}`,
      detail: c.summary,
      icon: Phone,
      tone: "text-[color:var(--warning)]",
    });
  }
  for (const s of account.signalsForCompany) {
    const lead = leadById.get(s.leadId);
    timelineEntries.push({
      id: `sig-${s.id}`,
      kind: "signal",
      timestamp: new Date(s.timestamp).getTime(),
      title: `${s.type.replace(/_/g, " ")} · ${lead ? `${lead.firstName} ${lead.lastName}` : "Unknown"}`,
      detail: s.detail,
      icon: Sparkles,
      tone:
        s.intent === "high"
          ? "text-[color:var(--success)]"
          : s.intent === "medium"
            ? "text-[color:var(--warning)]"
            : "text-muted-foreground",
    });
  }
  for (const lead of account.leads) {
    for (const a of lead.activities) {
      if (a.type === "stage_change") {
        timelineEntries.push({
          id: `act-${a.id}`,
          kind: "deal",
          timestamp: new Date(a.timestamp).getTime(),
          title: `${lead.firstName} ${lead.lastName}`,
          detail: a.description,
          icon: TrendingUp,
          tone: "text-primary",
        });
      }
    }
  }
  timelineEntries.sort((a, b) => b.timestamp - a.timestamp);

  // Channel mix
  const channelCounts = new Map<Channel, number>();
  for (const c of account.conversationsForCompany) {
    channelCounts.set(
      c.channel,
      (channelCounts.get(c.channel) ?? 0) + c.messages.length,
    );
  }
  const channelMix = Array.from(channelCounts.entries()).map(
    ([channel, count]) => ({
      channel,
      label: CHANNEL_LABEL[channel],
      count,
      fill: CHANNEL_COLORS[channel],
    }),
  );

  const recentSignals = [...account.signalsForCompany]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 10);

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Account"
        title={account.company}
        description={`${account.industry} · ${account.country} · Open pipeline: ${formatCurrency(
          account.openPipelineValue,
        )} · Won: ${formatCurrency(account.wonValue)} · Leads: ${account.leadCount} · Last activity: ${
          daysSinceActivity !== null ? `${daysSinceActivity}d ago` : "none"
        }`}
        actions={
          <div className="flex items-center gap-3">
            <CompanyLogo
              src={account.companyLogo}
              company={account.company}
              size={64}
              className="shadow-sm"
            />
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/accounts">
                <ArrowLeft className="size-3.5" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 px-4 py-6 md:grid-cols-4 md:px-8">
        <KpiCard
          label="Open deals"
          value={`${account.openDealCount} · ${formatCurrency(account.openPipelineValue)}`}
          tone="warning"
          hint="Active pipeline"
        />
        <KpiCard
          label="Won this year"
          value={formatCurrency(wonThisYear)}
          tone="positive"
          hint="YTD closed-won"
        />
        <KpiCard
          label="Avg lead score"
          value={account.avgScore.toFixed(0)}
          hint={`Across ${account.leadCount} leads`}
        />
        <KpiCard
          label="Signals 7d"
          value={formatNumber(account.signalIntensity7d)}
          tone={signalsTone}
          hint="Last 7 days"
        />
      </div>

      <div className="px-4 pb-10 md:px-8">
        <Tabs defaultValue="overview" className="flex flex-col gap-5">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-sm">
              <Sparkles className="size-3.5 text-accent" />
              <span className="font-medium">So what:</span>
              <span className="text-muted-foreground">
                {champions.length} buyers engaged ·{" "}
                {formatCurrency(account.openPipelineValue)} open ·{" "}
                {daysSinceActivity !== null
                  ? `${daysSinceActivity} days silent`
                  : "no activity yet"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Relationship strength
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-semibold tabular-nums">
                      {relationshipStrength}
                    </div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                  <Progress value={relationshipStrength} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {callsCount} calls · {msgCount} messages ·{" "}
                    {totalSignalsHigh} high-intent signals
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Champions
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {champions.length === 0 ? (
                    <div className="text-xs text-muted-foreground">
                      No qualified champions yet.
                    </div>
                  ) : (
                    champions.map((l) => {
                      const openDeal = account.deals.find(
                        (d) =>
                          d.leadId === l.id &&
                          d.stage !== "closed-won" &&
                          d.stage !== "closed-lost",
                      );
                      return (
                        <Link
                          key={l.id}
                          href={`/app/leads/${l.id}`}
                          className="flex items-center gap-3 rounded-md border border-transparent p-1.5 hover:border-border/60"
                        >
                          <PersonAvatar
                            name={`${l.firstName} ${l.lastName}`}
                            src={l.avatar}
                            size={32}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                              {l.firstName} {l.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {openDeal
                                ? `${STAGE_LABEL[openDeal.stage]} · ${formatCurrency(openDeal.value)}`
                                : STATUS_LABEL[l.status]}
                            </div>
                          </div>
                          <ScoreBadge score={l.score} size="sm" />
                        </Link>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Open deals
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {openDeals.length === 0 ? (
                    <div className="text-xs text-muted-foreground">
                      No open deals.
                    </div>
                  ) : (
                    openDeals.slice(0, 4).map((d) => (
                      <div
                        key={d.id}
                        className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-card/40 p-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {d.name}
                          </span>
                          <span className="tabular-nums text-sm">
                            {formatCurrency(d.value)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">
                            {STAGE_LABEL[d.stage]}
                          </Badge>
                          <span>{d.probability}% likely</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="people">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {account.leads.map((l) => {
                const assignee = l.assignedTo
                  ? repMap.get(l.assignedTo)
                  : undefined;
                return (
                  <Link
                    key={l.id}
                    href={`/app/leads/${l.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/60"
                  >
                    <div className="flex items-center gap-3">
                      <PersonAvatar
                        name={`${l.firstName} ${l.lastName}`}
                        src={l.avatar}
                        size={44}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {l.firstName} {l.lastName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {l.email}
                        </div>
                      </div>
                      <ScoreBadge score={l.score} size="sm" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          l.status === "converted"
                            ? "success"
                            : l.status === "qualified"
                              ? "accent"
                              : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {STATUS_LABEL[l.status]}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {assignee ? (
                          <>
                            <PersonAvatar
                              name={assignee.name}
                              src={assignee.avatar}
                              size={18}
                            />
                            <span>{assignee.name}</span>
                          </>
                        ) : (
                          <span>Unassigned</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="deals">
            <div className="flex flex-col gap-3">
              {account.deals.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No deals yet.
                  </CardContent>
                </Card>
              ) : (
                account.deals
                  .slice()
                  .sort((a, b) => b.value - a.value)
                  .map((d) => {
                    const owner = repMap.get(d.ownerId);
                    return (
                      <DealRow
                        key={d.id}
                        deal={d}
                        owner={owner}
                        lead={leadById.get(d.leadId)}
                      />
                    );
                  })
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="pt-6">
                <ScrollArea className="h-[520px] pr-3">
                  <ol className="flex flex-col gap-4">
                    {timelineEntries.length === 0 ? (
                      <li className="text-sm text-muted-foreground">
                        No activity yet.
                      </li>
                    ) : (
                      timelineEntries.map((entry) => {
                        const Icon = entry.icon;
                        return (
                          <li key={entry.id} className="flex items-start gap-3">
                            <div
                              className={cn(
                                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card",
                                entry.tone ?? "text-muted-foreground",
                              )}
                            >
                              <Icon className="size-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="truncate text-sm font-medium">
                                  {entry.title}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {format(new Date(entry.timestamp), "PPp")}
                                </span>
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                {entry.detail}
                              </p>
                            </div>
                          </li>
                        );
                      })
                    )}
                  </ol>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intelligence">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Top signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {recentSignals.length === 0 ? (
                    <div className="text-xs text-muted-foreground">
                      No signals yet.
                    </div>
                  ) : (
                    recentSignals.map((s) => (
                      <SignalItem
                        key={s.id}
                        signal={s}
                        lead={leadById.get(s.leadId)}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Call summaries
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {account.callsForCompany.length === 0 ? (
                    <div className="text-xs text-muted-foreground">
                      No calls yet.
                    </div>
                  ) : (
                    summariseCallsPerLead(account.callsForCompany, leadById)
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Channel mix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {channelMix.length === 0 ? (
                    <div className="text-xs text-muted-foreground">
                      No messages yet.
                    </div>
                  ) : (
                    <>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={channelMix}
                              dataKey="count"
                              nameKey="label"
                              innerRadius={45}
                              outerRadius={80}
                              paddingAngle={2}
                            >
                              {channelMix.map((d) => (
                                <Cell
                                  key={d.channel}
                                  fill={d.fill}
                                  stroke="var(--card)"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              content={({ active, payload }) =>
                                active && payload?.length ? (
                                  <ChartTooltipBox
                                    title={payload[0].payload.label}
                                  >
                                    <div className="flex justify-between gap-3 text-muted-foreground">
                                      Messages
                                      <span className="font-medium text-foreground">
                                        {payload[0].payload.count}
                                      </span>
                                    </div>
                                  </ChartTooltipBox>
                                ) : null
                              }
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {channelMix.map((d) => (
                          <span
                            key={d.channel}
                            className="inline-flex items-center gap-1.5"
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{ background: d.fill }}
                            />
                            {d.label} · {d.count}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DealRow({
  deal,
  owner,
  lead,
}: {
  deal: Deal;
  owner?: Rep;
  lead?: Lead;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {owner ? (
          <PersonAvatar name={owner.name} src={owner.avatar} size={32} />
        ) : null}
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{deal.name}</div>
          <div className="text-xs text-muted-foreground">
            {lead ? `${lead.firstName} ${lead.lastName} · ` : ""}
            Owner: {owner?.name ?? "—"} · Close{" "}
            {format(new Date(deal.expectedCloseDate), "PP")}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 md:w-1/2">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{STAGE_LABEL[deal.stage]}</span>
            <span>{deal.probability}%</span>
          </div>
          <Progress value={STAGE_PROGRESS[deal.stage]} className="h-1.5" />
        </div>
        <div className="w-24 text-right tabular-nums text-sm font-medium">
          {formatCurrency(deal.value)}
        </div>
      </div>
    </div>
  );
}

function SignalItem({ signal, lead }: { signal: Signal; lead?: Lead }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border/60 bg-card/40 p-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium">
            {signal.type.replace(/_/g, " ")}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium uppercase",
              INTENT_BG[signal.intent],
            )}
          >
            {signal.intent}
          </span>
        </div>
        <div className="truncate text-[11px] text-muted-foreground">
          {lead ? `${lead.firstName} ${lead.lastName} · ` : ""}
          {signal.detail}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}

function summariseCallsPerLead(
  calls: CallRecording[],
  leadById: Map<string, Lead>,
): React.ReactNode {
  const byLead = new Map<string, CallRecording[]>();
  for (const c of calls) {
    const arr = byLead.get(c.leadId) ?? [];
    arr.push(c);
    byLead.set(c.leadId, arr);
  }
  const out: React.ReactNode[] = [];
  for (const [leadId, leadCalls] of byLead) {
    const lead = leadById.get(leadId);
    const top = leadCalls
      .slice()
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      )
      .slice(0, 3);
    out.push(
      <div
        key={leadId}
        className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-card/40 p-2.5"
      >
        <div className="flex items-center gap-2 text-xs font-medium">
          {lead ? (
            <>
              <PersonAvatar
                name={`${lead.firstName} ${lead.lastName}`}
                src={lead.avatar}
                size={22}
              />
              <span>
                {lead.firstName} {lead.lastName}
              </span>
            </>
          ) : (
            <span>Unknown</span>
          )}
        </div>
        {top.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-2 border-t border-border/40 pt-1.5 text-[11px] text-muted-foreground first:border-0 first:pt-0"
          >
            <CalendarClock className="mt-0.5 size-3 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-foreground/80">{c.summary}</div>
              <div className="text-[10px]">
                {format(new Date(c.startedAt), "PP")}
              </div>
            </div>
          </div>
        ))}
      </div>,
    );
  }
  return out;
}
