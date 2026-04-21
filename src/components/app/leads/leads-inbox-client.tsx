"use client";

import Link from "next/link";
import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, Flame, Filter, SearchIcon } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { ScoreBadge } from "@/components/app/score-badge";
import { PersonAvatar } from "@/components/app/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_LABEL } from "@/lib/selectors";
import type { Lead, LeadStatus, Source } from "@/lib/types";

const STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
];
const SOURCES: Source[] = [
  "Website",
  "LinkedIn Ads",
  "Google Ads",
  "Referral",
  "Outbound",
  "Event",
  "Content",
];

type SortKey = "score" | "createdAt";

export function LeadsInboxClient() {
  const hydrated = useHydrated();
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | LeadStatus>("all");
  const [source, setSource] = React.useState<"all" | Source>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const repMap = React.useMemo(
    () => new Map(reps.map((r) => [r.id, r])),
    [reps],
  );

  const filtered = React.useMemo(() => {
    let arr = leads;
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((l) =>
        `${l.firstName} ${l.lastName} ${l.email} ${l.company}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (status !== "all") arr = arr.filter((l) => l.status === status);
    if (source !== "all") arr = arr.filter((l) => l.source === source);
    arr = [...arr].sort((a, b) => {
      const direction = sortDir === "asc" ? 1 : -1;
      if (sortKey === "score") return (a.score - b.score) * direction;
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        direction
      );
    });
    return arr;
  }, [leads, search, status, source, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Workspace"
        title="Leads"
        description="Every lead that landed — scored, enriched, tagged. Filter, sort, and dig in."
        actions={
          <Badge variant="outline">
            {hydrated ? filtered.length : 0} visible of{" "}
            {hydrated ? leads.length : 0}
          </Badge>
        }
      />

      <div className="flex flex-col gap-4 px-4 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, or company"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "all" | LeadStatus)}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={source}
              onValueChange={(v) => setSource(v as "all" | Source)}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!hydrated ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[70px]">
                    <SortButton
                      label="Score"
                      active={sortKey === "score"}
                      dir={sortDir}
                      onClick={() => toggleSort("score")}
                    />
                  </TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">
                    <SortButton
                      label="Created"
                      active={sortKey === "createdAt"}
                      dir={sortDir}
                      onClick={() => toggleSort("createdAt")}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 120).map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    assigneeName={
                      lead.assignedTo
                        ? (repMap.get(lead.assignedTo)?.name ?? "—")
                        : undefined
                    }
                  />
                ))}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/marketing/empty-state.png"
                          alt=""
                          aria-hidden
                          className="size-32 rounded-xl object-cover opacity-80"
                        />
                        <div className="text-sm font-medium">
                          No leads match your filters
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Try clearing a filter — or submit a test lead from{" "}
                          <Link
                            href="/contact"
                            target="_blank"
                            className="underline underline-offset-2 hover:text-foreground"
                          >
                            /contact
                          </Link>{" "}
                          and watch it land here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            {filtered.length > 120 ? (
              <div className="border-t border-border/60 bg-muted/20 px-4 py-2 text-center text-xs text-muted-foreground">
                Showing 120 of {filtered.length}. Tighten filters to see the
                rest.
              </div>
            ) : null}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Button variant="outline" size="sm" asChild>
            <Link href="/contact" target="_blank" rel="noopener noreferrer">
              Submit a test lead
            </Link>
          </Button>
          <span>— form lives at /contact. Your lead lands here.</span>
        </div>
      </div>
    </div>
  );
}

function LeadRow({
  lead,
  assigneeName,
}: {
  lead: Lead;
  assigneeName?: string;
}) {
  return (
    <TableRow className="group">
      <TableCell>
        <ScoreBadge score={lead.score} />
      </TableCell>
      <TableCell>
        <Link
          href={`/app/leads/${lead.id}`}
          className="flex items-center gap-3 group-hover:text-primary"
        >
          <PersonAvatar
            name={`${lead.firstName} ${lead.lastName}`}
            src={lead.avatar}
            size={32}
          />
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              {lead.firstName} {lead.lastName}
              {lead.tags.includes("highlight") ? (
                <Badge variant="accent" className="gap-1 text-[10px]">
                  <Flame className="size-3" />
                  Your lead
                </Badge>
              ) : null}
            </span>
            <span className="text-xs text-muted-foreground">{lead.email}</span>
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <div className="text-sm">{lead.company}</div>
        <div className="text-xs text-muted-foreground">
          {lead.industry} · {lead.companySize}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {lead.source}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant={
            lead.status === "converted"
              ? "success"
              : lead.status === "unqualified"
                ? "outline"
                : lead.status === "qualified"
                  ? "accent"
                  : "secondary"
          }
          className="text-xs"
        >
          {STATUS_LABEL[lead.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {assigneeName ?? "Unassigned"}
      </TableCell>
      <TableCell className="text-right text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(lead.createdAt))} ago
      </TableCell>
    </TableRow>
  );
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      {label}
      <ArrowUpDown
        className={`size-3 ${active ? "text-foreground" : ""} ${
          active && dir === "asc" ? "rotate-180" : ""
        } transition-transform`}
      />
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
