"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  ChartNoAxesCombined,
  Crown,
  DollarSign,
  Flame,
  Headset,
  KanbanSquare,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";

type Report = {
  href: string;
  eyebrow: string;
  title: string;
  question: string;
  audience: ("SDR" | "Manager" | "Exec")[];
  cadence: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const REPORTS: Report[] = [
  {
    href: "/app/reports/pipeline-health",
    eyebrow: "Pipeline",
    title: "Pipeline health",
    question: "Is our pipeline breathing, or is it stalling out?",
    audience: ["Manager", "Exec"],
    cadence: "Weekly",
    icon: KanbanSquare,
    accent: "from-[color:var(--chart-1)]/40",
  },
  {
    href: "/app/reports/activity",
    eyebrow: "Team",
    title: "Team activity",
    question: "Who's doing the work that produces pipeline?",
    audience: ["Manager"],
    cadence: "Daily",
    icon: CalendarCheck,
    accent: "from-[color:var(--chart-2)]/40",
  },
  {
    href: "/app/reports/revenue-scorecard",
    eyebrow: "Executive",
    title: "Revenue scorecard",
    question: "Are we hitting the number? By how much, and where?",
    audience: ["Exec"],
    cadence: "Weekly",
    icon: DollarSign,
    accent: "from-[color:var(--chart-3)]/40",
  },
  {
    href: "/app/reports/forecast",
    eyebrow: "Forecast",
    title: "Forecast",
    question: "What's commit, what's best-case, what's at risk?",
    audience: ["Manager", "Exec"],
    cadence: "Weekly",
    icon: ChartNoAxesCombined,
    accent: "from-[color:var(--chart-4)]/40",
  },
  {
    href: "/app/reports/sources",
    eyebrow: "Attribution",
    title: "Source attribution",
    question: "Which channels convert? Where do we double down?",
    audience: ["Manager", "Exec"],
    cadence: "Monthly",
    icon: Target,
    accent: "from-[color:var(--chart-5)]/40",
  },
  {
    href: "/app/reports/team",
    eyebrow: "Team",
    title: "Rep performance",
    question: "Who's on track, who needs coaching?",
    audience: ["Manager"],
    cadence: "Weekly",
    icon: Users,
    accent: "from-[color:var(--success)]/40",
  },
  {
    href: "/app/reports/quality",
    eyebrow: "Scoring",
    title: "Lead quality",
    question: "Is our scoring calibrated? Do hot leads convert better?",
    audience: ["Manager", "Exec"],
    cadence: "Monthly",
    icon: BarChart3,
    accent: "from-[color:var(--warning)]/40",
  },
];

const AUDIENCE_ICON = {
  SDR: Headset,
  Manager: TrendingUp,
  Exec: Crown,
} as const;

export function ReportsIndexClient() {
  return (
    <div className="flex flex-col">
      <div className="relative isolate overflow-hidden border-b border-border/60">
        <Image
          src="/marketing/report-banner.png"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="pointer-events-none absolute inset-0 -z-10 object-cover opacity-40 [mask-image:linear-gradient(to_bottom,black_30%,transparent)]"
        />
        <PageHeader
          eyebrow="Workspace"
          title="Reports"
          description="Seven focused reports — each answers one question a stakeholder actually asks. Pick your view by role, cadence, or the hypothesis you're testing."
          actions={
            <Badge variant="outline" className="gap-1.5">
              <Flame className="size-3 text-accent" />
              {REPORTS.length} reports
            </Badge>
          }
        />
      </div>

      <div className="grid gap-4 px-4 py-6 md:grid-cols-2 md:px-8 xl:grid-cols-3">
        {REPORTS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-[0_12px_40px_-20px_oklch(0.5_0.22_265/0.6)]"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${r.accent} to-transparent opacity-70`}
              aria-hidden
            />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <r.icon className="size-4" />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {r.cadence}
                </span>
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {r.eyebrow}
              </div>
              <h3 className="text-lg font-semibold tracking-tight">
                {r.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {r.question}
              </p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center gap-1.5">
                  {r.audience.map((a) => {
                    const Icon = AUDIENCE_ICON[a];
                    return (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        <Icon className="size-3" />
                        {a}
                      </span>
                    );
                  })}
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
