"use client";

import Link from "next/link";
import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Filter, Flame, SearchIcon } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { CompanyLogo } from "@/components/app/company-logo";
import { AvatarStack } from "@/components/app/person-avatar";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { formatCurrency, formatNumber } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import type { Industry } from "@/lib/types";
import { buildAccounts } from "./aggregate";

const INDUSTRIES: Industry[] = [
  "SaaS",
  "eCommerce",
  "Fintech",
  "Healthcare",
  "Manufacturing",
  "Media",
];

export function AccountsIndexClient() {
  const hydrated = useHydrated();
  const leads = usePulseStore((s) => s.leads);
  const deals = usePulseStore((s) => s.deals);
  const conversations = usePulseStore((s) => s.conversations);
  const calls = usePulseStore((s) => s.calls);
  const signals = usePulseStore((s) => s.signals);

  const [search, setSearch] = React.useState("");
  const [industry, setIndustry] = React.useState<"all" | Industry>("all");

  const accounts = React.useMemo(
    () => buildAccounts({ leads, deals, conversations, calls, signals }),
    [leads, deals, conversations, calls, signals],
  );

  const filtered = React.useMemo(() => {
    let arr = accounts;
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((a) => a.company.toLowerCase().includes(q));
    }
    if (industry !== "all") arr = arr.filter((a) => a.industry === industry);
    return [...arr].sort((a, b) => b.totalPipelineValue - a.totalPipelineValue);
  }, [accounts, search, industry]);

  const accountsTracked = accounts.length;
  const activeAccounts = accounts.filter((a) => a.signalIntensity7d > 0).length;
  const openPipeline = accounts.reduce(
    (sum, a) => sum + a.openPipelineValue,
    0,
  );
  const avgLeadsPerAccount =
    accountsTracked === 0
      ? 0
      : accounts.reduce((sum, a) => sum + a.leadCount, 0) / accountsTracked;

  if (!hydrated) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Workspace"
        title="Accounts"
        description="Every company collapsed into one view — leads, deals, conversations, calls, signals, rolled up the way an enterprise team actually looks at a book of business."
        actions={
          <Badge variant="outline">
            {formatNumber(filtered.length)} of {formatNumber(accountsTracked)}
          </Badge>
        }
      />

      <div className="grid gap-4 px-4 py-6 md:grid-cols-4 md:px-8">
        <KpiCard
          label="Accounts tracked"
          value={formatNumber(accountsTracked)}
          hint="Unique companies"
        />
        <KpiCard
          label="Active accounts"
          value={formatNumber(activeAccounts)}
          tone="positive"
          hint="Signals in the last 7d"
        />
        <KpiCard
          label="Open pipeline"
          value={formatCurrency(openPipeline)}
          tone="warning"
          hint="Across all accounts"
        />
        <KpiCard
          label="Avg leads / account"
          value={avgLeadsPerAccount.toFixed(1)}
          hint="Book breadth"
        />
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search company"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <Select
              value={industry}
              onValueChange={(v) => setIndustry(v as "all" | Industry)}
            >
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Company</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Hot leads</TableHead>
                <TableHead className="text-right">Pipeline</TableHead>
                <TableHead>Signals 7d</TableHead>
                <TableHead className="text-right">Last activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => {
                const href = `/app/accounts/${encodeURIComponent(a.company)}`;
                const topLeads = a.leads
                  .slice()
                  .sort((x, y) => y.score - x.score)
                  .slice(0, 3)
                  .map((l) => ({
                    name: `${l.firstName} ${l.lastName}`,
                    src: l.avatar,
                  }));
                const intentTone =
                  a.signalIntensity7d >= 8
                    ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                    : a.signalIntensity7d >= 3
                      ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]"
                      : "bg-muted text-muted-foreground";
                return (
                  <TableRow key={a.company} className="group">
                    <TableCell>
                      <Link
                        href={href}
                        className="flex items-center gap-3 group-hover:text-primary"
                      >
                        <CompanyLogo
                          src={a.companyLogo}
                          company={a.company}
                          size={32}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {a.company}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {a.industry}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AvatarStack people={topLeads} size={22} max={3} />
                        <span className="text-xs text-muted-foreground">
                          {a.leadCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {a.hotLeadCount > 0 ? (
                        <Badge variant="success" className="gap-1 tabular-nums">
                          <Flame className="size-3" />
                          {a.hotLeadCount}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(a.totalPipelineValue)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums",
                          intentTone,
                        )}
                      >
                        {a.signalIntensity7d}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {a.lastActivity
                        ? `${formatDistanceToNow(new Date(a.lastActivity))} ago`
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="text-sm text-muted-foreground">
                      No accounts match your filters.
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
