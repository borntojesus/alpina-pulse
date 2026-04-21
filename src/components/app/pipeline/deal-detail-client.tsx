"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarClock, Target } from "lucide-react";
import { toast } from "sonner";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { DEAL_STAGES, STAGE_LABEL, formatCurrency } from "@/lib/selectors";
import type { DealStage } from "@/lib/types";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScoreBadge } from "@/components/app/score-badge";

export function DealDetailClient({ id }: { id: string }) {
  const hydrated = useHydrated();
  const deals = usePulseStore((s) => s.deals);
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);
  const moveStage = usePulseStore((s) => s.moveDealStage);

  if (!hydrated) {
    return (
      <div className="flex flex-col p-6">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const deal = deals.find((d) => d.id === id);
  if (!deal) return notFound();
  const lead = leads.find((l) => l.id === deal.leadId);
  const owner = reps.find((r) => r.id === deal.ownerId);

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow={`Deal · ${deal.id}`}
        title={deal.name}
        description={`${lead?.company ?? "Account"} · ${
          lead?.industry ?? ""
        } · Owner ${owner?.name ?? "—"}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/pipeline">
                <ArrowLeft className="size-3.5" />
                Back
              </Link>
            </Button>
            {lead ? (
              <Button size="sm" asChild variant="outline">
                <Link href={`/app/leads/${lead.id}`}>
                  Lead record
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Target className="size-4 text-primary" />
                Stage
              </CardTitle>
              <Select
                value={deal.stage}
                onValueChange={(v) => {
                  moveStage(deal.id, v as DealStage);
                  toast.success(`Moved to ${STAGE_LABEL[v as DealStage]}`);
                }}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STAGE_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Probability</span>
                <span className="tabular-nums">{deal.probability}%</span>
              </div>
              <Progress value={deal.probability} className="h-2" />
              {deal.lostReason ? (
                <div className="rounded-md border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 p-3 text-sm">
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[color:var(--danger)]">
                    Lost reason
                  </div>
                  {deal.lostReason}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {lead ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Recent activity from lead
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[...lead.activities]
                  .reverse()
                  .slice(0, 8)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 border-l border-border/60 pl-3"
                    >
                      <div className="flex-1">
                        <div className="text-sm">{a.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(a.timestamp), "PPp")}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {a.type.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Deal value
                </div>
                <div className="text-3xl font-semibold tabular-nums">
                  {formatCurrency(deal.value)}
                </div>
              </div>
              <div className="grid gap-3">
                <DetailRow
                  label="Stage"
                  value={
                    <Badge variant="secondary">{STAGE_LABEL[deal.stage]}</Badge>
                  }
                />
                <DetailRow
                  label="Expected close"
                  value={
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <CalendarClock className="size-3.5 text-muted-foreground" />
                      {format(new Date(deal.expectedCloseDate), "PP")}
                    </span>
                  }
                />
                <DetailRow label="Owner" value={owner?.name ?? "Unassigned"} />
                <DetailRow
                  label="Weighted value"
                  value={formatCurrency((deal.value * deal.probability) / 100)}
                />
              </div>
            </CardContent>
          </Card>

          {lead ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Linked lead
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <ScoreBadge score={lead.score} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {lead.firstName} {lead.lastName}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {lead.email}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/app/leads/${lead.id}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
