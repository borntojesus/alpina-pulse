"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Swords,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/app/kpi-card";
import { ReportShell, ChartFrame } from "@/components/app/reports/report-shell";
import { ChartTooltipBox } from "@/components/charts/tooltip-box";

type Category = "CRM" | "Conversation" | "Cadence" | "Intent" | "Forecast";

type Vendor = {
  name: string;
  category: Category;
  /** ARR proxy in millions of USD */
  arr: number;
  /** Depth: 0..100 (higher = deeper workflow) */
  depth: number;
  /** Specialization: 0..100 (higher = more specialist / vertical) */
  specialization: number;
};

const CATEGORY_COLOR: Record<Category, string> = {
  CRM: "var(--chart-1)",
  Conversation: "var(--chart-2)",
  Cadence: "var(--chart-3)",
  Intent: "var(--chart-4)",
  Forecast: "var(--chart-5)",
};

const VENDORS: Vendor[] = [
  // CRM
  {
    name: "Salesforce",
    category: "CRM",
    arr: 34000,
    depth: 78,
    specialization: 22,
  },
  {
    name: "HubSpot",
    category: "CRM",
    arr: 2400,
    depth: 62,
    specialization: 28,
  },
  {
    name: "Pipedrive",
    category: "CRM",
    arr: 220,
    depth: 42,
    specialization: 40,
  },
  { name: "Zoho", category: "CRM", arr: 1100, depth: 48, specialization: 26 },
  { name: "Monday", category: "CRM", arr: 960, depth: 40, specialization: 30 },
  { name: "Attio", category: "CRM", arr: 40, depth: 70, specialization: 62 },
  // Conversation
  {
    name: "Gong",
    category: "Conversation",
    arr: 400,
    depth: 82,
    specialization: 70,
  },
  {
    name: "Chorus",
    category: "Conversation",
    arr: 120,
    depth: 68,
    specialization: 72,
  },
  {
    name: "Clari Copilot",
    category: "Conversation",
    arr: 90,
    depth: 66,
    specialization: 68,
  },
  // Cadence
  {
    name: "Outreach",
    category: "Cadence",
    arr: 240,
    depth: 74,
    specialization: 60,
  },
  {
    name: "Salesloft",
    category: "Cadence",
    arr: 210,
    depth: 72,
    specialization: 62,
  },
  {
    name: "Apollo",
    category: "Cadence",
    arr: 180,
    depth: 58,
    specialization: 56,
  },
  {
    name: "Lemlist",
    category: "Cadence",
    arr: 55,
    depth: 50,
    specialization: 72,
  },
  // Intent
  {
    name: "6sense",
    category: "Intent",
    arr: 250,
    depth: 70,
    specialization: 78,
  },
  {
    name: "Clearbit",
    category: "Intent",
    arr: 80,
    depth: 52,
    specialization: 74,
  },
  {
    name: "Bombora",
    category: "Intent",
    arr: 95,
    depth: 54,
    specialization: 80,
  },
  // Forecast
  {
    name: "Clari",
    category: "Forecast",
    arr: 180,
    depth: 76,
    specialization: 72,
  },
  {
    name: "InsightSquared",
    category: "Forecast",
    arr: 70,
    depth: 64,
    specialization: 74,
  },
];

const ALPINA_POINT = { name: "Alpina CRM", depth: 88, specialization: 90 };

export function MarketClient() {
  const vendorsByArr = useMemo(
    () => [...VENDORS].sort((a, b) => b.arr - a.arr),
    [],
  );

  const crowdedReasons = [
    {
      icon: TrendingUp,
      title: "Biggest TAM in SaaS",
      description:
        "Sales tooling sits on top of every B2B revenue dollar. $127B and growing ~23% YoY pulls in founders, PE, and incumbents alike.",
    },
    {
      icon: Zap,
      title: "Category reinvents every ~4 years",
      description:
        "Cloud CRM → cadence → conversation → intent → AI copilots. Each wave rebuilds the stack and creates fresh winners.",
    },
    {
      icon: Users,
      title: "PLG pulled buyers away from reps",
      description:
        "Buyers self-serve, then sales teams need new tools to catch signal. The inbox, scoring, and routing layer is up for grabs.",
    },
    {
      icon: Swords,
      title: "AI-native vendors enter monthly",
      description:
        "A new 'AI SDR' or 'AI forecast' vendor launches every few weeks. Noise is high — depth is the only real moat.",
    },
  ];

  const wedgeReasons = [
    {
      icon: Trophy,
      title: "Vertical focus beats horizontal",
      description:
        "One ICP, one playbook, one scoring model. The generalist CRMs can't calibrate that fast — you can.",
    },
    {
      icon: Sparkles,
      title: "Workflow depth, not feature count",
      description:
        "Reps don't need 400 features. They need 20 screens tuned to how they actually sell today.",
    },
    {
      icon: ShieldCheck,
      title: "Opinionated design wins adoption",
      description:
        "A shadcn-native surface that looks and feels like 2026, not 2014. Reps open it. Managers trust it.",
    },
    {
      icon: Zap,
      title: "Integration-first, not walled garden",
      description:
        "Plug into the existing stack — don't try to replace every tool on day one. Own the layer that matters.",
    },
    {
      icon: Sparkles,
      title: "Alpina Tech playbook",
      description:
        "Week-one ICP calibration, shadcn/ui foundation, Vercel-native deploys. Ship a credible product in ~6 weeks.",
    },
  ];

  return (
    <ReportShell
      eyebrow="Competitive intelligence"
      title="B2B sales tooling — the most competitive SaaS niche"
      question="Why is this category so crowded, and where's the wedge?"
      answer="$100B+ TAM, 200+ vendors, and still the fastest-growing software category. The winners ship depth, not features."
      audience={["Manager", "Exec"]}
      cadence="Quarterly"
      banner="/marketing/hero-flow.png"
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="TAM 2026"
            value="$127B"
            tone="neutral"
            hint="Global B2B sales software spend"
          />
          <KpiCard
            label="Vendors tracked"
            value="218"
            hint="Public + well-funded private"
          />
          <KpiCard
            label="Category YoY growth"
            value="+23%"
            tone="positive"
            delta={{ value: "+23%", direction: "up" }}
            hint="Fastest-growing SaaS segment"
          />
          <KpiCard
            label="Median stack size"
            value="11 tools"
            tone="warning"
            hint="Per sales rep, per quarter"
          />
        </div>

        <ChartFrame
          hypothesis="Who's fighting for this pie?"
          soWhat="Salesforce + HubSpot own the CRM layer. Everything else is a specialist niche you can enter with focused product."
          right={
            <div className="flex flex-wrap items-center gap-1.5">
              {(Object.keys(CATEGORY_COLOR) as Category[]).map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2 py-0.5 text-[10px] font-medium"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLOR[c] }}
                  />
                  {c}
                </span>
              ))}
            </div>
          }
        >
          <div className="h-[520px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vendorsByArr}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 12, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="2 3"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v}M`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={96}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <ChartTooltipBox title={payload[0].payload.name}>
                        <div className="flex justify-between gap-3 text-muted-foreground">
                          Category
                          <span className="font-medium text-foreground">
                            {payload[0].payload.category}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 text-muted-foreground">
                          ARR proxy
                          <span className="font-medium text-foreground">
                            {payload[0].payload.arr >= 1000
                              ? `$${(payload[0].payload.arr / 1000).toFixed(1)}B`
                              : `$${payload[0].payload.arr}M`}
                          </span>
                        </div>
                      </ChartTooltipBox>
                    ) : null
                  }
                />
                <Bar dataKey="arr" radius={[0, 6, 6, 0]} barSize={18}>
                  {vendorsByArr.map((v) => (
                    <Cell key={v.name} fill={CATEGORY_COLOR[v.category]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>

        <ChartFrame
          hypothesis="Why crowded, why opportunity"
          soWhat="The same dynamics that make this niche brutal for generalists create a durable wedge for focused builders."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-[color:var(--warning)]/40 text-[10px]"
                >
                  <Swords className="size-3 text-[color:var(--warning)]" />
                  Why crowded
                </Badge>
              </div>
              <ul className="flex flex-col gap-3">
                {crowdedReasons.map((r) => (
                  <li
                    key={r.title}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-3"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--warning)]/10 text-[color:var(--warning)]">
                      <r.icon className="size-4" />
                    </span>
                    <div>
                      <div className="text-sm font-medium tracking-tight">
                        {r.title}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {r.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-primary/40 text-[10px]"
                >
                  <Trophy className="size-3 text-primary" />
                  Where the wedge is
                </Badge>
              </div>
              <ul className="flex flex-col gap-3">
                {wedgeReasons.map((r) => (
                  <li
                    key={r.title}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-3"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <r.icon className="size-4" />
                    </span>
                    <div>
                      <div className="text-sm font-medium tracking-tight">
                        {r.title}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {r.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ChartFrame>

        <ChartFrame
          hypothesis="Depth × Specialization"
          soWhat="Deep + specialist is the quadrant with the most durable moats. That's exactly where shadcn-native, ICP-calibrated products land."
        >
          <PositioningMatrix />
        </ChartFrame>

        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6 md:p-8">
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <Badge variant="accent" className="w-fit text-[10px]">
                Alpina Tech
              </Badge>
              <h3 className="max-w-2xl text-balance text-xl font-semibold tracking-tight md:text-2xl">
                Want your own shadcn-native CRM in this segment? Alpina Tech
                ships it in ~6 weeks.
              </h3>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                ICP calibration in week one, opinionated workflows, role-aware
                dashboards, and a surface your reps will actually open.
              </p>
            </div>
            <Button size="lg" asChild>
              <a
                href="https://alpina-tech.com/shadcn-development/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a scoping call
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </ReportShell>
  );
}

function PositioningMatrix() {
  // Normalize to 0..100 grid. Place vendors as dots.
  const dots = VENDORS.map((v) => ({
    name: v.name,
    category: v.category,
    x: v.specialization,
    y: v.depth,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border/60 bg-card/40">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden
        >
          {/* Grid */}
          <line
            x1="50"
            y1="0"
            x2="50"
            y2="100"
            stroke="var(--border)"
            strokeWidth="0.3"
            strokeDasharray="1 1.5"
          />
          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            stroke="var(--border)"
            strokeWidth="0.3"
            strokeDasharray="1 1.5"
          />
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="none"
            stroke="var(--border)"
            strokeWidth="0.4"
          />
        </svg>

        {/* Quadrant labels */}
        <div className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Deep · General
        </div>
        <div className="absolute right-3 top-3 text-[10px] font-medium uppercase tracking-wider text-primary">
          Deep · Specialist
        </div>
        <div className="absolute bottom-3 left-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Shallow · General
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Shallow · Specialist
        </div>

        {/* Axis labels */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
          Specialization →
        </div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-muted-foreground">
          Depth →
        </div>

        {/* Vendor dots */}
        {dots.map((d) => (
          <div
            key={d.name}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 items-center"
            style={{
              left: `${d.x}%`,
              top: `${100 - d.y}%`,
            }}
          >
            <span
              className="size-2 rounded-full ring-2 ring-background"
              style={{ backgroundColor: CATEGORY_COLOR[d.category] }}
            />
            <span className="pointer-events-none ml-1.5 whitespace-nowrap text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {d.name}
            </span>
          </div>
        ))}

        {/* Alpina CRM highlight */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${ALPINA_POINT.specialization}%`,
            top: `${100 - ALPINA_POINT.depth}%`,
          }}
        >
          <span className="absolute inset-0 -m-3 animate-pulse rounded-full bg-primary/30 blur-lg" />
          <span className="relative flex items-center gap-1.5">
            <span className="size-3.5 rounded-full bg-primary ring-4 ring-primary/30" />
            <span className="rounded-md border border-primary/40 bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary shadow-sm backdrop-blur">
              Us · Alpina CRM
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
        <span className="font-medium uppercase tracking-wider">Legend:</span>
        {(Object.keys(CATEGORY_COLOR) as Category[]).map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2 py-0.5"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLOR[c] }}
            />
            {c}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 font-medium text-primary">
          <span className="size-2 rounded-full bg-primary" />
          Alpina CRM
        </span>
      </div>
    </div>
  );
}
