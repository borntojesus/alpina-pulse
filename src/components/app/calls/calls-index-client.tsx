"use client";

import Link from "next/link";
import * as React from "react";
import { format } from "date-fns";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { PersonAvatar } from "@/components/app/person-avatar";
import { KpiCard } from "@/components/app/kpi-card";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CallRecording } from "@/lib/types";

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.max(0, seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function sentimentTone(value: number): {
  label: string;
  variant: "success" | "warning" | "destructive" | "secondary";
  color: string;
} {
  if (value >= 0.25)
    return {
      label: "Positive",
      variant: "success",
      color: "text-[color:var(--success)]",
    };
  if (value <= -0.25)
    return {
      label: "Negative",
      variant: "destructive",
      color: "text-[color:var(--danger)]",
    };
  if (value >= 0.05)
    return {
      label: "Leaning positive",
      variant: "success",
      color: "text-[color:var(--success)]",
    };
  if (value <= -0.05)
    return {
      label: "Leaning negative",
      variant: "warning",
      color: "text-[color:var(--warning)]",
    };
  return { label: "Neutral", variant: "secondary", color: "text-foreground" };
}

export function CallsIndexClient() {
  const hydrated = useHydrated();
  const calls = usePulseStore((s) => s.calls);
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);

  const leadMap = React.useMemo(
    () => new Map(leads.map((l) => [l.id, l])),
    [leads],
  );
  const repMap = React.useMemo(
    () => new Map(reps.map((r) => [r.id, r])),
    [reps],
  );

  const sorted = React.useMemo(
    () =>
      [...calls].sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      ),
    [calls],
  );

  const totalCalls = calls.length;
  const avgDuration = totalCalls
    ? Math.round(calls.reduce((sum, c) => sum + c.duration, 0) / totalCalls)
    : 0;
  const avgSentiment = totalCalls
    ? calls.reduce((sum, c) => sum + c.sentiment, 0) / totalCalls
    : 0;
  const avgTalkRatio = totalCalls
    ? Math.round(
        (calls.reduce((sum, c) => sum + c.talkRatio, 0) / totalCalls) * 100,
      )
    : 0;

  if (!hydrated) return <DashboardSkeleton />;

  const sentiment = sentimentTone(avgSentiment);

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Workspace"
        title="Call library"
        description="Every recorded call with transcript, sentiment, and key moments. Gong, but it's yours."
      />

      <div className="grid gap-4 px-4 py-6 md:grid-cols-4 md:px-8">
        <KpiCard
          label="Total calls"
          value={totalCalls.toLocaleString()}
          hint="Across all reps"
        />
        <KpiCard
          label="Avg call length"
          value={formatDuration(avgDuration)}
          hint="mm:ss"
        />
        <KpiCard
          label="Avg sentiment"
          value={`${sentiment.label} ${avgSentiment.toFixed(2)}`}
          tone={
            avgSentiment >= 0.05
              ? "positive"
              : avgSentiment <= -0.05
                ? "danger"
                : "neutral"
          }
          hint="-1 to +1"
        />
        <KpiCard
          label="Talk ratio"
          value={`${avgTalkRatio}% / ${100 - avgTalkRatio}%`}
          hint="Rep / prospect"
        />
      </div>

      <div className="px-4 pb-8 md:px-8">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Lead</TableHead>
                <TableHead>Rep</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead className="w-48">Talk ratio</TableHead>
                <TableHead className="text-right">Key moments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.slice(0, 150).map((call) => (
                <CallRow
                  key={call.id}
                  call={call}
                  leadName={
                    leadMap.get(call.leadId)
                      ? `${leadMap.get(call.leadId)!.firstName} ${leadMap.get(call.leadId)!.lastName}`
                      : "Unknown lead"
                  }
                  leadCompany={leadMap.get(call.leadId)?.company ?? "—"}
                  leadAvatar={leadMap.get(call.leadId)?.avatar}
                  repName={repMap.get(call.repId)?.name ?? "—"}
                  repAvatar={repMap.get(call.repId)?.avatar}
                />
              ))}
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="text-sm text-muted-foreground">
                      No calls recorded yet.
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function CallRow({
  call,
  leadName,
  leadCompany,
  leadAvatar,
  repName,
  repAvatar,
}: {
  call: CallRecording;
  leadName: string;
  leadCompany: string;
  leadAvatar?: string;
  repName: string;
  repAvatar?: string;
}) {
  const sentiment = sentimentTone(call.sentiment);
  const talkPct = Math.round(call.talkRatio * 100);
  return (
    <TableRow className="group">
      <TableCell>
        <Link
          href={`/app/calls/${call.id}`}
          className="flex items-center gap-3 group-hover:text-primary"
        >
          <PersonAvatar name={leadName} src={leadAvatar} size={32} />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{leadName}</span>
            <span className="text-xs text-muted-foreground">{leadCompany}</span>
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <PersonAvatar name={repName} src={repAvatar} size={24} />
          <span className="text-sm">{repName}</span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {format(new Date(call.startedAt), "PP")}
      </TableCell>
      <TableCell className="text-sm tabular-nums">
        {formatDuration(call.duration)}
      </TableCell>
      <TableCell>
        <Badge
          variant={
            sentiment.variant === "destructive"
              ? "warning"
              : sentiment.variant === "success"
                ? "success"
                : "secondary"
          }
          className={cn("text-xs", sentiment.color)}
        >
          {sentiment.label} {call.sentiment.toFixed(2)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress value={talkPct} className="h-1.5" />
          <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
            {talkPct}/{100 - talkPct}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Badge variant="outline" className="tabular-nums">
          {call.keyMoments.length}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
