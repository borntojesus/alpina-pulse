"use client";

import { useMemo } from "react";
import {
  CheckSquare,
  Contact,
  Mail,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatNumber, formatPercent } from "@/lib/selectors";
import { KpiCard } from "@/components/app/kpi-card";
import { ChartFrame, ReportShell } from "@/components/app/reports/report-shell";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { PersonAvatar } from "@/components/app/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  Rep,
  Sequence,
  SequenceStep,
  SequenceStepType,
} from "@/lib/types";

const STEP_ICONS: Record<SequenceStepType, LucideIcon> = {
  email: Mail,
  call: Phone,
  linkedin: Contact,
  task: CheckSquare,
};

const STATUS_VARIANT: Record<
  Sequence["status"],
  "success" | "warning" | "secondary"
> = {
  active: "success",
  paused: "warning",
  draft: "secondary",
};

const FUNNEL_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function SequencesClient() {
  const hydrated = useHydrated();
  const sequences = usePulseStore((s) => s.sequences);
  const reps = usePulseStore((s) => s.reps);

  const repMap = useMemo(
    () => new Map<string, Rep>(reps.map((r) => [r.id, r])),
    [reps],
  );

  const totals = useMemo(() => {
    return sequences.reduce(
      (acc, s) => ({
        enrolled: acc.enrolled + s.enrolled,
        delivered: acc.delivered + s.delivered,
        opened: acc.opened + s.opened,
        replied: acc.replied + s.replied,
        booked: acc.booked + s.booked,
      }),
      { enrolled: 0, delivered: 0, opened: 0, replied: 0, booked: 0 },
    );
  }, [sequences]);

  const activeCount = useMemo(
    () => sequences.filter((s) => s.status === "active").length,
    [sequences],
  );

  const blendedReplyRate =
    totals.delivered === 0 ? 0 : totals.replied / totals.delivered;

  if (!hydrated) return <DashboardSkeleton />;

  return (
    <ReportShell
      eyebrow="Outreach"
      title="Sequences"
      question="Which cadences produce meetings?"
      answer="Step 3 (LinkedIn) has 2.4× the reply rate of step 1 (email). Use that insight to redesign your cold opener."
      audience={["SDR", "Manager"]}
      cadence="Weekly"
    >
      <TooltipProvider delayDuration={150}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard
              label="Active sequences"
              value={formatNumber(activeCount)}
              hint={`${sequences.length} total`}
              tone="positive"
            />
            <KpiCard
              label="Total enrolled"
              value={formatNumber(totals.enrolled)}
              hint="Across all sequences"
            />
            <KpiCard
              label="Blended reply rate"
              value={formatPercent(blendedReplyRate)}
              tone={
                blendedReplyRate >= 0.1
                  ? "positive"
                  : blendedReplyRate >= 0.04
                    ? "neutral"
                    : "warning"
              }
              hint={`${formatNumber(totals.replied)} replies / ${formatNumber(totals.delivered)} delivered`}
            />
            <KpiCard
              label="Meetings booked"
              value={formatNumber(totals.booked)}
              tone="positive"
              hint="This quarter"
            />
          </div>

          <ChartFrame
            hypothesis="Which sequences are producing? Where do reps drop off?"
            soWhat="Scan the funnel bar on each card — the biggest gap is where you fix the script, not the channel."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {sequences.map((seq) => (
                <SequenceCard
                  key={seq.id}
                  sequence={seq}
                  owner={repMap.get(seq.ownerId)}
                />
              ))}
              {sequences.length === 0 ? (
                <div className="col-span-full rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                  No sequences yet.
                </div>
              ) : null}
            </div>
          </ChartFrame>
        </div>
      </TooltipProvider>
    </ReportShell>
  );
}

function SequenceCard({
  sequence,
  owner,
}: {
  sequence: Sequence;
  owner: Rep | undefined;
}) {
  const replyRate =
    sequence.delivered === 0 ? 0 : sequence.replied / sequence.delivered;

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-col gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">
                {sequence.name}
              </span>
              <Badge
                variant={STATUS_VARIANT[sequence.status]}
                className="text-[10px] capitalize"
              >
                {sequence.status}
              </Badge>
            </div>
            <span className="text-xs italic text-muted-foreground">
              {sequence.audience}
            </span>
          </div>
          {owner ? (
            <div className="flex shrink-0 items-center gap-2">
              <PersonAvatar name={owner.name} src={owner.avatar} size={28} />
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs font-medium">{owner.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {owner.role}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 py-4">
        <div className="grid grid-cols-4 gap-2">
          <Metric label="Enrolled" value={formatNumber(sequence.enrolled)} />
          <Metric label="Opened" value={formatNumber(sequence.opened)} />
          <Metric
            label="Replied"
            value={formatPercent(replyRate)}
            hint={`${formatNumber(sequence.replied)}`}
          />
          <Metric
            label="Booked"
            value={formatNumber(sequence.booked)}
            hint="Meetings"
          />
        </div>

        <StepStrip steps={sequence.steps} />

        <Funnel
          enrolled={sequence.enrolled}
          delivered={sequence.delivered}
          opened={sequence.opened}
          replied={sequence.replied}
          booked={sequence.booked}
        />
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-card/40 p-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      {hint ? (
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function StepStrip({ steps }: { steps: SequenceStep[] }) {
  const ordered = useMemo(
    () => [...steps].sort((a, b) => a.day - b.day),
    [steps],
  );
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Steps
      </span>
      <div className="flex flex-wrap items-start gap-2">
        {ordered.map((step, idx) => (
          <StepChip
            key={step.id}
            step={step}
            isLast={idx === ordered.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function StepChip({ step, isLast }: { step: SequenceStep; isLast: boolean }) {
  const Icon = STEP_ICONS[step.type];
  const showReply = step.type === "email" || step.type === "linkedin";
  const chip = (
    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-2 py-1 text-[11px]">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="font-medium tabular-nums">d+{step.day}</span>
      {showReply ? (
        <span className="inline-flex items-center rounded-sm bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
          {formatPercent(step.replyRate)}
        </span>
      ) : null}
    </div>
  );

  const content =
    step.subject || step.body ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="cursor-default outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            {chip}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {step.subject ? (
            <div className="font-medium">{step.subject}</div>
          ) : null}
          {step.body ? (
            <div className="mt-0.5 opacity-80">{step.body}</div>
          ) : null}
          <div className="mt-1 text-[10px] opacity-70">
            open {formatPercent(step.openRate)} · reply{" "}
            {formatPercent(step.replyRate)}
            {typeof step.bounceRate === "number"
              ? ` · bounce ${formatPercent(step.bounceRate)}`
              : ""}
          </div>
        </TooltipContent>
      </Tooltip>
    ) : (
      chip
    );

  return (
    <div className="flex items-center gap-1.5">
      {content}
      {!isLast ? (
        <span className="text-muted-foreground/50" aria-hidden>
          →
        </span>
      ) : null}
    </div>
  );
}

function Funnel({
  enrolled,
  delivered,
  opened,
  replied,
  booked,
}: {
  enrolled: number;
  delivered: number;
  opened: number;
  replied: number;
  booked: number;
}) {
  const stages = [
    { label: "Enrolled", value: enrolled },
    { label: "Delivered", value: delivered },
    { label: "Opened", value: opened },
    { label: "Replied", value: replied },
    { label: "Booked", value: booked },
  ];
  const max = Math.max(enrolled, 1);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Funnel
      </span>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {stages.map((stage, i) => {
          const pct = (stage.value / max) * (100 / stages.length);
          return (
            <div
              key={stage.label}
              className={cn(
                "h-full transition-all",
                i === 0 ? "rounded-l-full" : "",
              )}
              style={{
                width: `${pct}%`,
                background: FUNNEL_COLORS[i],
              }}
              title={`${stage.label}: ${formatNumber(stage.value)}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-[10px] text-muted-foreground">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-1">
            <span
              className="size-2 rounded-full"
              style={{ background: FUNNEL_COLORS[i] }}
            />
            <span className="font-medium text-foreground tabular-nums">
              {formatNumber(stage.value)}
            </span>
            <span>{stage.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
