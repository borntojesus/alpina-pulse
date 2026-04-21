"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import * as React from "react";
import { format } from "date-fns";
import { ArrowLeft, Megaphone, Play, Quote, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { PersonAvatar } from "@/components/app/person-avatar";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CallMoment, CallMomentType } from "@/lib/types";
import { formatDuration, sentimentTone } from "./calls-index-client";

const MOMENT_STYLE: Record<
  CallMomentType,
  { label: string; className: string }
> = {
  commitment: {
    label: "Commitment",
    className:
      "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  },
  objection: {
    label: "Objection",
    className:
      "bg-[color:var(--danger)]/15 text-[color:var(--danger)] border-[color:var(--danger)]/30",
  },
  question: {
    label: "Question",
    className: "bg-muted text-foreground border-border/60",
  },
  pricing: {
    label: "Pricing",
    className:
      "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
  },
  competitor: {
    label: "Competitor",
    className: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  next_steps: {
    label: "Next steps",
    className: "bg-accent/15 text-accent border-accent/30",
  },
};

function transcriptLineId(callId: string, timestamp: number) {
  return `transcript-${callId}-${timestamp}`;
}

export function CallDetailClient({ id }: { id: string }) {
  const hydrated = useHydrated();
  const calls = usePulseStore((s) => s.calls);
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);

  if (!hydrated) return <DashboardSkeleton />;

  const call = calls.find((c) => c.id === id);
  if (!call) return notFound();

  const lead = leads.find((l) => l.id === call.leadId);
  const rep = reps.find((r) => r.id === call.repId);

  const sentiment = sentimentTone(call.sentiment);
  const talkPct = Math.round(call.talkRatio * 100);

  // Sentiment bar: map [-1, 1] → [0, 100]
  const sentimentPct = Math.round(((call.sentiment + 1) / 2) * 100);

  function jumpTo(ts: number) {
    const el = document.getElementById(transcriptLineId(call!.id, ts));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary/50");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-primary/50");
      }, 1600);
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow={`Call · ${call.id}`}
        title={
          lead ? `${lead.firstName} ${lead.lastName} · ${lead.company}` : "Call"
        }
        description={`${format(new Date(call.startedAt), "PPp")} · ${formatDuration(call.duration)}`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/calls">
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Waveform */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Recording</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast.info("Audio playback is disabled in the demo")
                }
              >
                <Play className="size-3.5" />
                Play
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Waveform waveform={call.waveform} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="tabular-nums">00:00</span>
                <span>Playhead at ~35%</span>
                <span className="tabular-nums">
                  {formatDuration(call.duration)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex max-h-[560px] flex-col gap-3 overflow-y-auto pr-1">
                {call.transcript.map((line, i) => {
                  const isRep = line.speaker === "rep";
                  const name = isRep
                    ? (rep?.name ?? "Rep")
                    : lead
                      ? `${lead.firstName} ${lead.lastName}`
                      : "Prospect";
                  const avatar = isRep ? rep?.avatar : lead?.avatar;
                  return (
                    <div
                      key={`${line.timestamp}-${i}`}
                      id={transcriptLineId(call.id, line.timestamp)}
                      className={cn(
                        "flex gap-3 rounded-lg p-2 transition-shadow",
                        isRep ? "flex-row" : "flex-row-reverse",
                      )}
                    >
                      <PersonAvatar name={name} src={avatar} size={28} />
                      <div
                        className={cn(
                          "min-w-0 flex-1",
                          isRep ? "text-left" : "text-right",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-2 text-[11px]",
                            isRep ? "justify-start" : "justify-end",
                          )}
                        >
                          <Badge
                            variant={isRep ? "default" : "accent"}
                            className="text-[10px]"
                          >
                            {isRep ? "Rep" : "Prospect"}
                          </Badge>
                          <span className="tabular-nums text-muted-foreground">
                            {formatDuration(line.timestamp)}
                          </span>
                          <span className="text-muted-foreground">
                            · {name}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "mt-1 rounded-lg px-3 py-2 text-sm",
                            isRep
                              ? "bg-primary/10 text-foreground"
                              : "bg-muted/60 text-foreground",
                          )}
                        >
                          {line.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Metrics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider text-muted-foreground">
                    Sentiment
                  </span>
                  <span className={cn("font-medium", sentiment.color)}>
                    {sentiment.label} · {call.sentiment.toFixed(2)}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("absolute inset-y-0 left-1/2 w-px bg-border")}
                    aria-hidden
                  />
                  <div
                    className={cn(
                      "absolute inset-y-0",
                      call.sentiment >= 0
                        ? "bg-[color:var(--success)]/70"
                        : "bg-[color:var(--danger)]/70",
                    )}
                    style={{
                      left: `${Math.min(sentimentPct, 50)}%`,
                      width: `${Math.abs(sentimentPct - 50)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider text-muted-foreground">
                    Talk ratio
                  </span>
                  <span className="font-medium tabular-nums">
                    Rep {talkPct}% · Prospect {100 - talkPct}%
                  </span>
                </div>
                <Progress value={talkPct} className="h-2" />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Duration
                  </div>
                  <div className="text-base font-medium tabular-nums">
                    {formatDuration(call.duration)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Type
                  </div>
                  <Badge variant="outline" className="mt-0.5">
                    Discovery call
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Badge variant="accent" className="gap-1 text-[10px]">
                    <Sparkles className="size-3" />
                    AI
                  </Badge>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    AI-generated summary
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{call.summary}</p>
                <p className="mt-2 text-xs italic text-muted-foreground">
                  Alpina-CRM conversation intelligence is under the hood.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lead info */}
          {lead ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Lead</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <PersonAvatar
                  name={`${lead.firstName} ${lead.lastName}`}
                  src={lead.avatar}
                  size={44}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {lead.firstName} {lead.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lead.company} · {lead.industry}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/app/leads/${lead.id}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* Key moments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Megaphone className="size-4 text-accent" />
                Key moments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex flex-col gap-4">
                <div
                  className="absolute left-2 top-2 bottom-2 w-px bg-border/60"
                  aria-hidden
                />
                {call.keyMoments.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No key moments flagged.
                  </div>
                ) : (
                  call.keyMoments.map((m, i) => (
                    <KeyMomentRow
                      key={`${m.type}-${m.timestamp}-${i}`}
                      moment={m}
                      onJump={() => jumpTo(m.timestamp)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Waveform({ waveform }: { waveform: number[] }) {
  const bars =
    waveform.length > 0 ? waveform : Array.from({ length: 80 }, () => 0.3);
  const max = bars.reduce((m, v) => (v > m ? v : m), 0) || 1;
  return (
    <div className="relative h-20 w-full overflow-hidden rounded-md border border-border/60 bg-muted/30 px-2">
      <div className="flex h-full items-center gap-[2px]">
        {bars.map((v, i) => {
          const h = Math.max(6, Math.round((v / max) * 72));
          const played = i / bars.length <= 0.35;
          return (
            <div
              key={i}
              className={cn(
                "w-[3px] flex-1 rounded-sm",
                played ? "bg-primary" : "bg-primary/30",
              )}
              style={{ height: `${h}px` }}
            />
          );
        })}
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-primary"
        style={{ left: "35%" }}
        aria-hidden
      />
    </div>
  );
}

function KeyMomentRow({
  moment,
  onJump,
}: {
  moment: CallMoment;
  onJump: () => void;
}) {
  const style = MOMENT_STYLE[moment.type];
  return (
    <div className="relative flex items-start gap-3 pl-6">
      <div
        className={cn(
          "absolute left-0 top-1 z-10 flex size-4 items-center justify-center rounded-full border bg-card",
          style.className,
        )}
      >
        <Quote className="size-2.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-[10px]", style.className)}
          >
            {style.label}
          </Badge>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatDuration(moment.timestamp)}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-6 px-2 text-[11px]"
            onClick={onJump}
          >
            Jump to
          </Button>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{moment.text}</div>
      </div>
    </div>
  );
}
