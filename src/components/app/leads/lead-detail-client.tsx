"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Globe2,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { STATUS_LABEL } from "@/lib/selectors";
import type { Activity, Lead, ScoreCategory } from "@/lib/types";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScoreBadge } from "@/components/app/score-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadDetailClient({ id }: { id: string }) {
  const hydrated = useHydrated();
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);
  const addActivity = usePulseStore((s) => s.addActivity);
  const updateStatus = usePulseStore((s) => s.updateLeadStatus);
  const convertToDeal = usePulseStore((s) => s.convertLeadToDeal);
  const assignLead = usePulseStore((s) => s.assignLead);

  if (!hydrated) return <LoadingDetail />;
  const lead = leads.find((l) => l.id === id);
  if (!lead) return notFound();

  const assignee = lead.assignedTo
    ? reps.find((r) => r.id === lead.assignedTo)
    : undefined;

  function logActivity(
    type: Activity["type"],
    description: string,
    repId?: string,
  ) {
    addActivity(id, { type, description, repId });
    toast.success("Activity logged", { description });
  }

  function doConvert() {
    const value = Math.round(15000 + lead!.score * 1200);
    const deal = convertToDeal(id, value);
    if (deal) {
      toast.success("Converted to deal", {
        description: `${deal.name} · ${value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })}`,
      });
    }
  }

  const categoryTotals = lead.scoreBreakdown.reduce<
    Record<ScoreCategory, number>
  >(
    (acc, b) => {
      acc[b.category] = (acc[b.category] ?? 0) + b.points;
      return acc;
    },
    { fit: 0, intent: 0, engagement: 0 },
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow={`Lead · ${lead.id}`}
        title={`${lead.firstName} ${lead.lastName}`}
        description={`${lead.company} · ${lead.industry} · ${lead.country}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/leads">
                <ArrowLeft className="size-3.5" />
                Back
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Change status</DropdownMenuLabel>
                {(["contacted", "qualified", "unqualified"] as const).map(
                  (s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => {
                        updateStatus(id, s);
                        toast.success(`Status → ${STATUS_LABEL[s]}`);
                      }}
                    >
                      Mark as {STATUS_LABEL[s]}
                    </DropdownMenuItem>
                  ),
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Assign</DropdownMenuLabel>
                {reps
                  .filter((r) => r.role !== "Manager")
                  .map((r) => (
                    <DropdownMenuItem
                      key={r.id}
                      onClick={() => {
                        assignLead(id, r.id);
                        toast.success(`Assigned to ${r.name}`);
                      }}
                    >
                      Assign to {r.name}
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={doConvert}>
                  <Sparkles className="size-3.5" />
                  Convert to deal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">
                Activity timeline
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    logActivity(
                      "email",
                      `Email sent to ${lead.firstName}`,
                      assignee?.id,
                    )
                  }
                >
                  <Mail className="size-3.5" />
                  Log email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    logActivity(
                      "call",
                      `Call with ${lead.firstName} ${lead.lastName}`,
                      assignee?.id,
                    )
                  }
                >
                  <Phone className="size-3.5" />
                  Log call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    logActivity(
                      "meeting",
                      `Demo hosted for ${lead.company}`,
                      assignee?.id,
                    )
                  }
                >
                  <CalendarClock className="size-3.5" />
                  Log meeting
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Timeline activities={[...lead.activities].reverse()} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Score breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <CategoryCard
                  label="Fit"
                  points={categoryTotals.fit}
                  tone="primary"
                />
                <CategoryCard
                  label="Intent"
                  points={categoryTotals.intent}
                  tone="accent"
                />
                <CategoryCard
                  label="Engagement"
                  points={categoryTotals.engagement}
                  tone="success"
                />
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                {lead.scoreBreakdown.map((b, i) => (
                  <div
                    key={`${b.label}-${i}`}
                    className="flex items-center gap-3 rounded-md border border-transparent px-2 py-1.5 hover:border-border/60"
                  >
                    <div className="flex-1">
                      <div className="text-sm">{b.label}</div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {b.category}
                      </div>
                    </div>
                    <Badge
                      variant={b.points >= 10 ? "success" : "secondary"}
                      className="tabular-nums"
                    >
                      +{b.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <ScoreBadge score={lead.score} size="lg" />
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Lead score
                </div>
                <div className="text-3xl font-semibold tabular-nums">
                  {lead.score}
                </div>
                <div className="text-sm text-muted-foreground">
                  {lead.score >= 70
                    ? "Hot — prioritize today"
                    : lead.score >= 40
                      ? "Warm — nurture this week"
                      : "Cold — automated cadence"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-right">
                <Badge
                  variant={
                    lead.status === "converted"
                      ? "success"
                      : lead.status === "qualified"
                        ? "accent"
                        : lead.status === "unqualified"
                          ? "outline"
                          : "secondary"
                  }
                >
                  {STATUS_LABEL[lead.status]}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(lead.createdAt))} ago
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Company info
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <Row icon={Building2} label="Company" value={lead.company} />
              <Row icon={Mail} label="Email" value={lead.email} mono />
              <Row icon={Globe2} label="Country" value={lead.country} />
              <Row
                icon={Sparkles}
                label="Source"
                value={`${lead.source}${
                  lead.utm.campaign ? ` / ${lead.utm.campaign}` : ""
                }`}
              />
              <Row
                icon={assignee ? CheckCircle2 : XCircle}
                label="Assigned"
                value={assignee?.name ?? "Unassigned"}
              />
              {lead.message ? (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <MessageSquare className="size-3" />
                    Message on form
                  </div>
                  {lead.message}
                </div>
              ) : null}
              {lead.tags.length ? (
                <div>
                  <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.tags.map((t) => (
                      <Badge
                        key={t}
                        variant={t === "highlight" ? "accent" : "outline"}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Timeline({ activities }: { activities: Activity[] }) {
  return (
    <div className="relative flex flex-col gap-5">
      <div
        className="absolute left-3 top-3 bottom-3 w-px bg-border"
        aria-hidden
      />
      {activities.map((a) => (
        <div key={a.id} className="relative flex items-start gap-4 pl-1">
          <div
            className={`relative z-10 mt-0.5 flex size-6 items-center justify-center rounded-full border bg-card ${
              a.type === "created"
                ? "text-primary"
                : a.type === "email"
                  ? "text-accent"
                  : a.type === "call"
                    ? "text-[color:var(--warning)]"
                    : a.type === "meeting"
                      ? "text-[color:var(--success)]"
                      : "text-muted-foreground"
            }`}
          >
            <TimelineIcon type={a.type} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm">{a.description}</div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(a.timestamp), "PPp")} ·{" "}
              {formatDistanceToNow(new Date(a.timestamp))} ago
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineIcon({ type }: { type: Activity["type"] }) {
  const cls = "size-3";
  if (type === "email") return <Mail className={cls} />;
  if (type === "call") return <Phone className={cls} />;
  if (type === "meeting") return <CalendarClock className={cls} />;
  if (type === "created") return <Sparkles className={cls} />;
  if (type === "status_change" || type === "stage_change")
    return <CheckCircle2 className={cls} />;
  return <MessageSquare className={cls} />;
}

function CategoryCard({
  label,
  points,
  tone,
}: {
  label: string;
  points: number;
  tone: "primary" | "accent" | "success";
}) {
  const max = tone === "success" ? 24 : 40;
  const toneColor =
    tone === "primary"
      ? "bg-primary/15 text-primary"
      : tone === "accent"
        ? "bg-accent/15 text-[color:var(--accent)]"
        : "bg-[color:var(--success)]/15 text-[color:var(--success)]";
  return (
    <div className="rounded-md border border-border/60 bg-card/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Badge className={`${toneColor} text-[10px]`} variant="secondary">
          +{points}
        </Badge>
      </div>
      <Progress value={Math.min((points / max) * 100, 100)} className="h-1.5" />
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div
          className={`truncate text-sm ${mono ? "font-mono" : ""}`}
          title={String(value)}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function LoadingDetail() {
  return (
    <div className="flex flex-col p-6">
      <Skeleton className="mb-4 h-8 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
