"use client";

import * as React from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { toast } from "sonner";
import { format } from "date-fns";
import { GripHorizontal } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/app/score-badge";
import { PersonAvatar } from "@/components/app/person-avatar";
import { cn } from "@/lib/utils";
import { DEAL_STAGES, STAGE_LABEL, formatCurrency } from "@/lib/selectors";
import type { Deal, DealStage, Lead, Rep } from "@/lib/types";

const STAGE_ACCENT: Record<DealStage, string> = {
  discovery: "from-[color:var(--chart-1)]/40",
  proposal: "from-[color:var(--chart-2)]/40",
  negotiation: "from-[color:var(--chart-3)]/40",
  "closed-won": "from-[color:var(--success)]/40",
  "closed-lost": "from-[color:var(--danger)]/40",
};

export function PipelineBoardClient() {
  const hydrated = useHydrated();
  const deals = usePulseStore((s) => s.deals);
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);
  const moveDealStage = usePulseStore((s) => s.moveDealStage);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
  );

  const [activeDealId, setActiveDealId] = React.useState<string | null>(null);
  const activeDeal = deals.find((d) => d.id === activeDealId) ?? null;

  const repMap = React.useMemo(
    () => new Map(reps.map((r) => [r.id, r])),
    [reps],
  );
  const leadMap = React.useMemo(
    () => new Map(leads.map((l) => [l.id, l])),
    [leads],
  );

  function handleDragEnd(e: DragEndEvent) {
    setActiveDealId(null);
    const dealId = e.active.id as string;
    const overId = e.over?.id as DealStage | undefined;
    if (!overId || !DEAL_STAGES.includes(overId)) return;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === overId) return;
    moveDealStage(dealId, overId);
    toast.success("Deal moved", {
      description: `${deal.name} → ${STAGE_LABEL[overId]}`,
    });
  }

  const byStage: Record<DealStage, Deal[]> = DEAL_STAGES.reduce(
    (acc, s) => ({ ...acc, [s]: [] }),
    {} as Record<DealStage, Deal[]>,
  );
  for (const d of deals) byStage[d.stage]?.push(d);

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Workspace"
        title="Pipeline"
        description="Drag deals across stages. Totals update instantly. Each move writes to the deal's activity log."
        actions={<Badge variant="outline">{deals.length} deals</Badge>}
      />

      {!hydrated ? (
        <div className="flex gap-3 overflow-x-auto px-4 py-6 md:px-8">
          {DEAL_STAGES.map((s) => (
            <Skeleton key={s} className="h-[70vh] w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          modifiers={[restrictToWindowEdges]}
          onDragStart={(e) => setActiveDealId(e.active.id as string)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDealId(null)}
        >
          <div
            className="flex gap-3 overflow-x-auto px-4 py-6 md:px-8"
            data-tour="pipeline-board"
          >
            {DEAL_STAGES.map((s) => (
              <StageColumn
                key={s}
                stage={s}
                deals={byStage[s]}
                leadMap={leadMap}
                repMap={repMap}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeDeal ? (
              <DealCardBody
                deal={activeDeal}
                lead={leadMap.get(activeDeal.leadId)}
                owner={repMap.get(activeDeal.ownerId)}
                dragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function StageColumn({
  stage,
  deals,
  leadMap,
  repMap,
}: {
  stage: DealStage;
  deals: Deal[];
  leadMap: Map<string, Lead>;
  repMap: Map<string, Rep>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((a, d) => a + d.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex w-72 shrink-0 flex-col rounded-xl border border-border/60 bg-card/40 transition-colors",
        isOver && "border-primary/60 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-12 rounded-t-xl bg-gradient-to-b to-transparent opacity-60",
          STAGE_ACCENT[stage],
        )}
        aria-hidden
      />
      <div className="relative flex items-center justify-between border-b border-border/50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tracking-tight">
            {STAGE_LABEL[stage]}
          </span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {deals.length}
          </Badge>
        </div>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {formatCurrency(total)}
        </span>
      </div>
      <div className="flex min-h-[320px] flex-col gap-2 px-2.5 py-2.5">
        {deals.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border/60 text-xs text-muted-foreground">
            Drop deals here
          </div>
        ) : (
          deals.map((d) => (
            <DraggableDealCard
              key={d.id}
              deal={d}
              lead={leadMap.get(d.leadId)}
              owner={repMap.get(d.ownerId)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableDealCard({
  deal,
  lead,
  owner,
}: {
  deal: Deal;
  lead?: Lead;
  owner?: Rep;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none select-none rounded-lg border border-border/60 bg-card transition-shadow active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <DealCardBody deal={deal} lead={lead} owner={owner} />
    </div>
  );
}

function DealCardBody({
  deal,
  lead,
  owner,
  dragging,
}: {
  deal: Deal;
  lead?: Lead;
  owner?: Rep;
  dragging?: boolean;
}) {
  return (
    <Link
      href={`/app/pipeline/${deal.id}`}
      onClick={(e) => dragging && e.preventDefault()}
      className={cn(
        "relative flex flex-col gap-2 rounded-lg bg-card p-3 shadow-xs",
        dragging && "pointer-events-none border border-primary/60 shadow-lg",
      )}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <GripHorizontal className="size-3" />
          {deal.id.replace("deal-", "#")}
        </span>
        <span className="tabular-nums">{deal.probability}%</span>
      </div>
      <div className="text-sm font-medium leading-tight">{deal.name}</div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {lead ? (
            <PersonAvatar
              name={`${lead.firstName} ${lead.lastName}`}
              src={lead.avatar}
              size={28}
            />
          ) : (
            <span className="size-7" />
          )}
          {lead ? (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <ScoreBadge score={lead.score} size="sm" />
                <span className="truncate text-sm text-foreground">
                  {lead.company}
                </span>
              </div>
              <div className="mt-0.5 truncate text-[11px]">{lead.industry}</div>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="text-sm font-semibold tabular-nums">
            {formatCurrency(deal.value)}
          </div>
          <div className="flex items-center gap-1">
            <div className="text-[10px] text-muted-foreground">
              {format(new Date(deal.expectedCloseDate), "MMM d")}
            </div>
            {owner ? (
              <PersonAvatar name={owner.name} src={owner.avatar} size={18} />
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
