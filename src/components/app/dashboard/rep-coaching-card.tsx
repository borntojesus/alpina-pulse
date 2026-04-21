"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  Cpu,
  MessagesSquare,
  MicOff,
  PhoneOff,
  Sparkles,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/app/person-avatar";

type CoachingFlag =
  | "objectionStreak"
  | "silenceRisk"
  | "callVolume"
  | "missedSLA";

type CoachingCopy = {
  key: CoachingFlag;
  icon: LucideIcon;
  title: string;
  diagnose: (value: number) => string;
  suggestion: string;
};

const COPY: CoachingCopy[] = [
  {
    key: "objectionStreak",
    icon: MicOff,
    title: "Objection streak",
    diagnose: (n) =>
      `${n} calls in the last 14 days ended with negative sentiment — prospects are pushing back late in the conversation.`,
    suggestion:
      "Run a role-play on pricing objections. Share top 3 won-deal clips.",
  },
  {
    key: "silenceRisk",
    icon: MessagesSquare,
    title: "Silence risk",
    diagnose: (n) =>
      `${n} owned deals have gone 10+ days without an inbound reply — they're cooling off.`,
    suggestion:
      "Re-engage with a 'breakup' email sequence — two templates ready.",
  },
  {
    key: "callVolume",
    icon: PhoneOff,
    title: "Low call volume",
    diagnose: (n) =>
      `Only ${n} dials in the last 7 days — well below the 3-call-per-week floor for active AEs.`,
    suggestion: "Block a 90-min call power hour on the calendar.",
  },
  {
    key: "missedSLA",
    icon: Timer,
    title: "Missed 5-min SLA",
    diagnose: (n) =>
      `${n} assigned leads still sit in 'new' after 24h — inbound speed-to-lead has slipped.`,
    suggestion: "Enable auto-assign with 5-minute round-robin.",
  },
];

export function RepCoachingCard() {
  const hydrated = useHydrated();
  const reps = usePulseStore((s) => s.reps);
  const leads = usePulseStore((s) => s.leads);
  const deals = usePulseStore((s) => s.deals);
  const conversations = usePulseStore((s) => s.conversations);
  const calls = usePulseStore((s) => s.calls);

  const focus = useMemo(() => {
    const now = Date.now();
    const d14 = 14 * 24 * 60 * 60 * 1000;
    const d10 = 10 * 24 * 60 * 60 * 1000;
    const d7 = 7 * 24 * 60 * 60 * 1000;
    const d1 = 24 * 60 * 60 * 1000;

    const aes = reps.filter((r) => r.role === "AE");
    if (aes.length === 0) return null;

    const rows = aes.map((rep) => {
      const repCalls = calls.filter((c) => c.repId === rep.id);
      const objectionStreak = repCalls.filter(
        (c) => c.sentiment < 0 && now - new Date(c.startedAt).getTime() <= d14,
      ).length;

      const repDeals = deals.filter(
        (d) =>
          d.ownerId === rep.id &&
          d.stage !== "closed-won" &&
          d.stage !== "closed-lost",
      );
      const silenceRisk = repDeals.filter((d) => {
        const convo = conversations.find((c) => c.leadId === d.leadId);
        if (!convo) return true;
        const lastInbound = [...convo.messages]
          .reverse()
          .find((m) => m.direction === "inbound");
        if (!lastInbound) return true;
        return now - new Date(lastInbound.timestamp).getTime() >= d10;
      }).length;

      const callVolume = repCalls.filter(
        (c) => now - new Date(c.startedAt).getTime() <= d7,
      ).length;

      const missedSLA = leads.filter(
        (l) =>
          l.assignedTo === rep.id &&
          l.status === "new" &&
          now - new Date(l.createdAt).getTime() >= d1,
      ).length;

      const flagged: CoachingFlag[] = [];
      if (objectionStreak >= 2) flagged.push("objectionStreak");
      if (silenceRisk >= 1) flagged.push("silenceRisk");
      if (callVolume < 3) flagged.push("callVolume");
      if (missedSLA >= 1) flagged.push("missedSLA");

      return {
        rep,
        metrics: { objectionStreak, silenceRisk, callVolume, missedSLA },
        flagged,
      };
    });

    // Highlight rep with most flags, or any rep with silenceRisk >= 3
    const silenceHotspot = rows.find((r) => r.metrics.silenceRisk >= 3);
    const byFlags = [...rows].sort(
      (a, b) => b.flagged.length - a.flagged.length,
    );
    const chosen = silenceHotspot ?? byFlags[0];
    if (!chosen || chosen.flagged.length === 0) return null;
    return chosen;
  }, [reps, leads, deals, conversations, calls]);

  if (!hydrated) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Sparkles className="size-4 text-accent" />
            Coaching focus this week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse rounded-md bg-muted/40" />
        </CardContent>
      </Card>
    );
  }

  if (!focus) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Sparkles className="size-4 text-accent" />
            Coaching focus this week
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No coaching flags right now — every AE is hitting their activity and
          sentiment baselines. Nice.
        </CardContent>
      </Card>
    );
  }

  const { rep, metrics, flagged } = focus;
  const quotaPct = Math.min(
    (rep.achievedQuarter / rep.quotaQuarter) * 100,
    100,
  );
  const items = COPY.filter((c) => flagged.includes(c.key)).slice(0, 4);

  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Sparkles className="size-4 text-accent" />
          Coaching focus this week
        </CardTitle>
        <Badge
          variant="accent"
          className="gap-1 text-[10px] uppercase tracking-wider"
        >
          <Cpu className="size-3" />
          AI-generated from last 14 days
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-3">
          <PersonAvatar name={rep.name} src={rep.avatar} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate text-sm font-semibold">{rep.name}</div>
              <Badge variant="outline" className="text-[10px]">
                {rep.role}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {flagged.length} coaching signal{flagged.length === 1 ? "" : "s"}{" "}
              this week
            </div>
          </div>
          <Badge
            variant={quotaPct >= 70 ? "success" : "warning"}
            className="text-[10px] tabular-nums"
          >
            {quotaPct.toFixed(0)}% quota
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((c) => {
            const Icon = c.icon;
            const value = metrics[c.key];
            return (
              <div
                key={c.key}
                className="flex gap-3 rounded-md border border-border/60 bg-card/30 p-3"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{c.title}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.diagnose(value)}
                  </p>
                  <p className="mt-1 text-xs italic text-muted-foreground/80">
                    Suggested next step: {c.suggestion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-3 text-xs">
          <Link
            href="/app/calls"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            Coach from tape
            <ArrowRight className="size-3" />
          </Link>
          <Link
            href="/app/reports/win-loss"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            See win patterns
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
