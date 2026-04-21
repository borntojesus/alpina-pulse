"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Flame,
  MessageSquare,
  PhoneCall,
  Radar,
  Repeat,
  Swords,
} from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function IntelSnapshotCard() {
  const conversations = usePulseStore((s) => s.conversations);
  const calls = usePulseStore((s) => s.calls);
  const signals = usePulseStore((s) => s.signals);
  const sequences = usePulseStore((s) => s.sequences);

  const stats = useMemo(() => {
    const now = Date.now();
    const last7 = now - 7 * 24 * 60 * 60 * 1000;
    const unread = conversations.reduce((a, c) => a + c.unread, 0);
    const callsThisWeek = calls.filter(
      (c) => new Date(c.startedAt).getTime() >= last7,
    ).length;
    const highIntent = signals.filter(
      (s) => s.intent === "high" && new Date(s.timestamp).getTime() >= last7,
    ).length;
    const activeSequences = sequences.filter(
      (s) => s.status === "active",
    ).length;
    const avgSentiment =
      calls.length === 0
        ? 0
        : calls.reduce((a, c) => a + c.sentiment, 0) / calls.length;
    return {
      unread,
      conversationCount: conversations.length,
      callsThisWeek,
      highIntent,
      activeSequences,
      avgSentiment,
    };
  }, [conversations, calls, signals, sequences]);

  const items = [
    {
      href: "/app/conversations",
      icon: MessageSquare,
      label: "Conversations",
      value: stats.conversationCount,
      hint: stats.unread > 0 ? `${stats.unread} unread` : "Inbox zero",
      tone: stats.unread > 0 ? "accent" : "muted",
    },
    {
      href: "/app/calls",
      icon: PhoneCall,
      label: "Calls · 7d",
      value: stats.callsThisWeek,
      hint: `Sentiment ${
        stats.avgSentiment >= 0 ? "+" : ""
      }${stats.avgSentiment.toFixed(2)}`,
      tone: stats.avgSentiment >= 0.2 ? "success" : "muted",
    },
    {
      href: "/app/signals",
      icon: Radar,
      label: "High-intent · 7d",
      value: stats.highIntent,
      hint: "Pricing + demo + competitor",
      tone: stats.highIntent >= 10 ? "warning" : "muted",
    },
    {
      href: "/app/sequences",
      icon: Repeat,
      label: "Active sequences",
      value: stats.activeSequences,
      hint: `${sequences.length} total`,
      tone: "muted",
    },
  ] as const;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Flame className="size-4 text-accent" />
          Intelligence snapshot
        </CardTitle>
        <Link
          href="/app/market"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Swords className="size-3" />
          Why this matters
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="group flex flex-col gap-2 rounded-lg border border-border/60 bg-card/40 p-3.5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <it.icon className="size-3.5" />
                </span>
                <Badge
                  variant={
                    it.tone === "success"
                      ? "success"
                      : it.tone === "warning"
                        ? "warning"
                        : it.tone === "accent"
                          ? "accent"
                          : "outline"
                  }
                  className="text-[10px]"
                >
                  {it.hint}
                </Badge>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {it.label}
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">
                    {it.value}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
