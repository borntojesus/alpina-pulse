"use client";

import Image from "next/image";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  ArrowRightLeft,
  MessageSquare,
  PhoneCall,
  Radar,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonAvatar } from "@/components/app/person-avatar";

type StreamKind = "lead" | "message" | "call" | "stage" | "signal";

type StreamItem = {
  id: string;
  kind: StreamKind;
  timestamp: string;
  line: string;
  avatarName?: string;
  avatarSrc?: string;
};

const KIND_META: Record<
  StreamKind,
  { icon: LucideIcon; tint: string; label: string }
> = {
  lead: {
    icon: UserPlus,
    tint: "bg-primary/10 text-primary",
    label: "New lead",
  },
  message: {
    icon: MessageSquare,
    tint: "bg-accent/15 text-accent",
    label: "Message",
  },
  call: {
    icon: PhoneCall,
    tint: "bg-[color:var(--chart-3)]/20 text-[color:var(--chart-3)]",
    label: "Call",
  },
  stage: {
    icon: ArrowRightLeft,
    tint: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    label: "Stage change",
  },
  signal: {
    icon: Radar,
    tint: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    label: "High-intent signal",
  },
};

export function TodayActivityStream() {
  const hydrated = useHydrated();
  const leads = usePulseStore((s) => s.leads);
  const conversations = usePulseStore((s) => s.conversations);
  const calls = usePulseStore((s) => s.calls);
  const signals = usePulseStore((s) => s.signals);

  const items = useMemo<StreamItem[]>(() => {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;
    const leadById = new Map(leads.map((l) => [l.id, l]));
    const out: StreamItem[] = [];

    for (const l of leads) {
      const t = new Date(l.createdAt).getTime();
      if (t < cutoff) continue;
      out.push({
        id: `lead-${l.id}`,
        kind: "lead",
        timestamp: l.createdAt,
        line: `${l.firstName} ${l.lastName} — ${l.company} submitted a demo request`,
        avatarName: `${l.firstName} ${l.lastName}`,
        avatarSrc: l.avatar,
      });
    }

    for (const c of conversations) {
      if (c.messages.length === 0) continue;
      const latest = c.messages[c.messages.length - 1];
      const t = new Date(latest.timestamp).getTime();
      if (t < cutoff) continue;
      const lead = leadById.get(c.leadId);
      const who = lead
        ? `${lead.firstName} ${lead.lastName} — ${lead.company}`
        : "Unknown contact";
      out.push({
        id: `msg-${c.id}`,
        kind: "message",
        timestamp: latest.timestamp,
        line: `${latest.direction === "inbound" ? "Reply from" : "Message to"} ${who} · ${c.channel}`,
        avatarName: lead ? `${lead.firstName} ${lead.lastName}` : undefined,
        avatarSrc: lead?.avatar,
      });
    }

    for (const call of calls) {
      const t = new Date(call.startedAt).getTime();
      if (t < cutoff) continue;
      const lead = leadById.get(call.leadId);
      const company = lead?.company ?? "unknown account";
      const s = call.sentiment;
      const sentimentStr = `sentiment ${s >= 0 ? "+" : ""}${s.toFixed(1)}`;
      out.push({
        id: `call-${call.id}`,
        kind: "call",
        timestamp: call.startedAt,
        line: `Call — ${company} — ${sentimentStr}`,
        avatarName: lead ? `${lead.firstName} ${lead.lastName}` : undefined,
        avatarSrc: lead?.avatar,
      });
    }

    for (const l of leads) {
      for (const a of l.activities) {
        if (a.type !== "stage_change") continue;
        const t = new Date(a.timestamp).getTime();
        if (t < cutoff) continue;
        out.push({
          id: `stage-${a.id}`,
          kind: "stage",
          timestamp: a.timestamp,
          line: `${l.company} — ${a.description}`,
          avatarName: `${l.firstName} ${l.lastName}`,
          avatarSrc: l.avatar,
        });
      }
    }

    for (const sig of signals) {
      if (sig.intent !== "high") continue;
      const t = new Date(sig.timestamp).getTime();
      if (t < cutoff) continue;
      const lead = leadById.get(sig.leadId);
      const company = lead?.company ?? "unknown account";
      out.push({
        id: `signal-${sig.id}`,
        kind: "signal",
        timestamp: sig.timestamp,
        line: `High-intent signal — ${company} — ${sig.detail}`,
        avatarName: lead ? `${lead.firstName} ${lead.lastName}` : undefined,
        avatarSrc: lead?.avatar,
      });
    }

    return out
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 15);
  }, [leads, conversations, calls, signals]);

  if (!hydrated) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Activity className="size-4 text-primary" />
            Today at Alpina
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse rounded-md bg-muted/40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Activity className="size-4 text-primary" />
          Today at Alpina
        </CardTitle>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[color:var(--success)] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[color:var(--success)]" />
          </span>
          Live — synthetic events via Play demo
        </span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Image
              src="/marketing/empty-state.png"
              alt="Empty activity stream"
              width={140}
              height={100}
              className="opacity-80"
            />
            <p className="max-w-xs text-sm text-muted-foreground">
              Nothing in the last 24 hours. Click{" "}
              <span className="font-medium text-foreground">Play demo</span> in
              the header to simulate live activity.
            </p>
          </div>
        ) : (
          <ol className="relative flex flex-col gap-3 pl-4 before:absolute before:left-[11px] before:top-1 before:h-[calc(100%-0.5rem)] before:w-px before:bg-border/70">
            {items.map((it, i) => {
              const meta = KIND_META[it.kind];
              const Icon = meta.icon;
              return (
                <li
                  key={it.id}
                  className={`relative flex items-start gap-3 ${
                    i === 0 ? "animate-pulse" : ""
                  }`}
                >
                  <span
                    className={`relative z-10 -ml-4 inline-flex size-6 shrink-0 items-center justify-center rounded-md ring-2 ring-card ${meta.tint}`}
                  >
                    <Icon className="size-3" />
                  </span>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {meta.label}
                        </span>{" "}
                        <span className="text-foreground">{it.line}</span>
                      </p>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {formatDistanceToNow(new Date(it.timestamp))} ago
                      </span>
                    </div>
                  </div>
                  {it.avatarName ? (
                    <PersonAvatar
                      name={it.avatarName}
                      src={it.avatarSrc}
                      size={22}
                      className="mt-0.5"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
