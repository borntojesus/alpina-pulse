"use client";

import * as React from "react";
import {
  ArrowRight,
  Flame,
  Info,
  Quote,
  Split,
  ThermometerSun,
  TrendingUp,
  Users,
} from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Lead, Rep } from "@/lib/types";

type Bucket = {
  key: "hot" | "warm" | "cold";
  label: string;
  min: number;
  max: number;
  assignee: "top" | "mid" | "auto";
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

const BUCKETS: Bucket[] = [
  {
    key: "hot",
    label: "Hot ≥ 70",
    min: 70,
    max: 101,
    assignee: "top",
    color:
      "text-[color:var(--success)] border-[color:var(--success)]/30 bg-[color:var(--success)]/10",
    icon: Flame,
    description:
      "Routed instantly to your top-performing AE with a 5-minute SLA.",
  },
  {
    key: "warm",
    label: "Warm 40-69",
    min: 40,
    max: 70,
    assignee: "mid",
    color:
      "text-[color:var(--warning)] border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10",
    icon: ThermometerSun,
    description:
      "Assigned round-robin across qualified AEs. Nurtured via sequence if silent 24h.",
  },
  {
    key: "cold",
    label: "Cold < 40",
    min: 0,
    max: 40,
    assignee: "auto",
    color: "text-muted-foreground border-border/60 bg-muted/30",
    icon: Users,
    description:
      "Enrolled into automated drip. Re-scored when intent signals fire.",
  },
];

const QUOTES = [
  {
    quote:
      "Your best salesperson should be working on your best opportunity. That's the whole game.",
    author: "Mark Roberge",
    role: "Former CRO, HubSpot",
  },
  {
    quote:
      "Speed to lead is the single biggest predictor of close rate. If a hot lead waits more than five minutes, you've already lost half your odds.",
    author: "David Cancel",
    role: "Founder, Drift",
  },
  {
    quote:
      "Top reps don't want more leads. They want better ones. Give them that and they'll out-sell everyone else three to one.",
    author: "Jill Konrath",
    role: "Author, SNAP Selling",
  },
  {
    quote:
      "If you assign every lead the same way, you're subsidising your weakest reps with your hottest leads. That's how pipelines die.",
    author: "Trish Bertuzzi",
    role: "Founder, The Bridge Group",
  },
];

export function LeadSplitterCard() {
  const hydrated = useHydrated();
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);

  const { bucketCounts, routingPreview } = React.useMemo(() => {
    const counts = BUCKETS.map((b) => ({
      ...b,
      count: leads.filter((l) => l.score >= b.min && l.score < b.max).length,
    }));
    const aes = reps.filter((r) => r.role === "AE");
    const topRep = aes.sort((a, b) => b.achievedQuarter - a.achievedQuarter)[0];
    const preview = pickRoutingPreview(leads, reps, topRep);
    return { bucketCounts: counts, routingPreview: preview };
  }, [leads, reps]);

  const total = leads.length;

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Split className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">
              Lead Splitter
            </CardTitle>
            <Badge variant="accent" className="text-[10px]">
              Auto-routing
            </Badge>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">
            The best leads go to your best salespeople. Splitter routes every
            inbound lead by score and assignee capacity — hot leads land with
            your top AE in under five minutes, warm fan out round-robin, cold
            enter automated nurture.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground md:inline-flex">
          <TrendingUp className="size-3.5 text-[color:var(--success)]" />
          Reps with splitter enabled close{" "}
          <span className="font-semibold text-foreground">1.8×</span> more.
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-3 md:grid-cols-3">
          {bucketCounts.map((b) => {
            const pct = total === 0 ? 0 : (b.count / total) * 100;
            return (
              <div
                key={b.key}
                className={`flex flex-col gap-2 rounded-lg border p-3.5 ${b.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <b.icon className="size-3.5" />
                    {b.label}
                  </span>
                  <span className="tabular-nums text-xs">
                    {hydrated ? b.count : "…"} leads
                  </span>
                </div>
                <Progress value={pct} className="h-1" />
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>

        <Separator />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Routing preview — today&apos;s sample
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3" />
              Sample is illustrative — real rules come from your rep tiers.
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {routingPreview.map((row) => (
              <div
                key={row.lead.id}
                className="flex items-center gap-3 rounded-md border border-border/60 bg-card/40 p-2.5"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    row.tier === "hot"
                      ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                      : row.tier === "warm"
                        ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {row.lead.score}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {row.lead.firstName} {row.lead.lastName} —{" "}
                    <span className="text-muted-foreground">
                      {row.lead.company}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {row.lead.industry} · {row.lead.source}
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">
                      {row.rep.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <div className="text-sm font-medium">{row.rep.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {row.reason}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Quote className="size-3.5 text-accent" />
            Why the best reps deserve the best leads
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {QUOTES.map((q) => (
              <figure
                key={q.author}
                className="relative rounded-lg border border-border/60 bg-card/40 p-4"
              >
                <Quote
                  className="absolute right-3 top-3 size-4 text-border"
                  aria-hidden
                />
                <blockquote className="text-sm leading-relaxed text-foreground">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {q.author}
                  </span>{" "}
                  · {q.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function pickRoutingPreview(leads: Lead[], reps: Rep[], topRep?: Rep) {
  const aes = reps.filter((r) => r.role === "AE");
  const sdrs = reps.filter((r) => r.role === "SDR");
  const sorted = [...aes].sort((a, b) => b.achievedQuarter - a.achievedQuarter);
  const top = topRep ?? sorted[0];
  const mid = sorted[1] ?? sorted[0];

  const hot = leads
    .filter(
      (l) => l.score >= 70 && (l.status === "new" || l.status === "contacted"),
    )
    .sort((a, b) => b.score - a.score)[0];
  const warm = leads
    .filter((l) => l.score >= 40 && l.score < 70 && l.status !== "converted")
    .sort((a, b) => b.score - a.score)[0];
  const cold = leads
    .filter((l) => l.score < 40 && l.status !== "converted")
    .sort((a, b) => b.score - a.score)[0];

  const rows: {
    lead: Lead;
    rep: Rep;
    tier: "hot" | "warm" | "cold";
    reason: string;
  }[] = [];
  if (hot && top)
    rows.push({
      lead: hot,
      rep: top,
      tier: "hot",
      reason: "Top AE · 5-min SLA",
    });
  if (warm && mid)
    rows.push({
      lead: warm,
      rep: mid,
      tier: "warm",
      reason: "Round-robin AE",
    });
  if (cold && sdrs[0])
    rows.push({
      lead: cold,
      rep: sdrs[0],
      tier: "cold",
      reason: "SDR nurture queue",
    });
  return rows;
}
