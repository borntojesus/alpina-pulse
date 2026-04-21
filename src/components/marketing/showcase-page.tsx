"use client";

import Link from "next/link";
import { ArrowUpRight, FileCode2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MarketingHeader } from "@/components/marketing/header";
import { Logo } from "@/components/logo";
import { AlpinaTechMark } from "@/components/alpina-tech-mark";

const STUDIO_URL = "https://alpina-tech.com/shadcn-development/";

type ComponentEntry = {
  name: string;
  desc: string;
  route: string;
  routeLabel: string;
};

type Group = {
  title: string;
  blurb: string;
  items: ComponentEntry[];
};

const groups: Group[] = [
  {
    title: "Layout",
    blurb: "The scaffolding every page sits on.",
    items: [
      {
        name: "Card",
        desc: "Default surface for KPIs, list rows, and content blocks.",
        route: "/app/dashboard",
        routeLabel: "/app/dashboard",
      },
      {
        name: "Sheet",
        desc: "Right-side drawer for lead detail, filters, and quick edits.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Separator",
        desc: "Thin divider used inside cards, menus, and setting groups.",
        route: "/app/settings",
        routeLabel: "/app/settings",
      },
      {
        name: "Scroll Area",
        desc: "Styled scroll container for long lists and activity feeds.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Tabs",
        desc: "Section switching inside lead detail and the reports hub.",
        route: "/app/reports",
        routeLabel: "/app/reports",
      },
      {
        name: "Collapsible",
        desc: "Expandable sections in settings and the pipeline side panel.",
        route: "/app/pipeline",
        routeLabel: "/app/pipeline",
      },
    ],
  },
  {
    title: "Forms",
    blurb: "Every input the team touches.",
    items: [
      {
        name: "Input",
        desc: "Single-line text for name, email, company, and search.",
        route: "/contact",
        routeLabel: "/contact",
      },
      {
        name: "Label",
        desc: "Accessible labels paired with every form control.",
        route: "/contact",
        routeLabel: "/contact",
      },
      {
        name: "Textarea",
        desc: "Multi-line notes on the lead form and lead detail.",
        route: "/contact",
        routeLabel: "/contact",
      },
      {
        name: "Select",
        desc: "Role, stage, source, and assignment pickers.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Checkbox",
        desc: "Row selection on the leads table and filter groups.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Form",
        desc: "React-hook-form + Zod wiring for the public lead form.",
        route: "/contact",
        routeLabel: "/contact",
      },
      {
        name: "Toggle · Toggle Group",
        desc: "Persona switcher — SDR / Manager / Exec views.",
        route: "/app/dashboard",
        routeLabel: "/app/dashboard",
      },
      {
        name: "Slider",
        desc: "Score thresholds and range filters in reports.",
        route: "/app/reports/quality",
        routeLabel: "/app/reports/quality",
      },
    ],
  },
  {
    title: "Feedback",
    blurb: "How the product talks back.",
    items: [
      {
        name: "Sonner",
        desc: "Toast notifications for optimistic actions and form results.",
        route: "/contact",
        routeLabel: "/contact",
      },
      {
        name: "Skeleton",
        desc: "Placeholder loaders for dashboard cards and tables.",
        route: "/app/dashboard",
        routeLabel: "/app/dashboard",
      },
      {
        name: "Progress",
        desc: "Quota attainment and forecast progress on the exec view.",
        route: "/app/reports/forecast",
        routeLabel: "/app/reports/forecast",
      },
      {
        name: "Badge",
        desc: "Status, stage, source, and score pills everywhere.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Tooltip",
        desc: "Inline explanations for score components and KPIs.",
        route: "/app/dashboard",
        routeLabel: "/app/dashboard",
      },
      {
        name: "Accordion",
        desc: "FAQ on the about page and long-form reports copy.",
        route: "/about",
        routeLabel: "/about",
      },
    ],
  },
  {
    title: "Navigation",
    blurb: "Menus, commands, and jump-around.",
    items: [
      {
        name: "Dropdown Menu",
        desc: "Row actions, user menu, and the bulk-action menu on leads.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Popover",
        desc: "Date pickers, filter panels, and inline assignment.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Command",
        desc: "Fuzzy search across leads, deals, and reports.",
        route: "/app",
        routeLabel: "/app",
      },
      {
        name: "Carousel",
        desc: "Onboarding walkthrough and report highlights.",
        route: "/app",
        routeLabel: "/app",
      },
    ],
  },
  {
    title: "Data display",
    blurb: "Tables, avatars, and charts.",
    items: [
      {
        name: "Table",
        desc: "The leads table — sortable, filterable, selectable.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Avatar",
        desc: "Rep and contact avatars — DiceBear-seeded for the demo.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Chart",
        desc: "Recharts-powered revenue, pipeline, and source charts.",
        route: "/app/reports/revenue-scorecard",
        routeLabel: "/app/reports/revenue-scorecard",
      },
    ],
  },
  {
    title: "Overlay",
    blurb: "Everything that floats above the page.",
    items: [
      {
        name: "Dialog",
        desc: "Confirmations, quick-edit forms, and lead detail on mobile.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Sheet",
        desc: "Right-side drawer for lead detail on desktop.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Popover",
        desc: "Filters, date pickers, and inline editors.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
      {
        name: "Dropdown Menu",
        desc: "Row actions and the rep-assignment picker.",
        route: "/app/leads",
        routeLabel: "/app/leads",
      },
    ],
  },
];

// Unique component count across groups
const uniqueComponents = new Set(
  groups.flatMap((g) => g.items.map((i) => i.name)),
).size;
const blockCount = groups.length;
const routeCount = 22;

export function ShowcasePage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <MarketingHeader />

      <main className="relative">
        <HeroSection />
        <StatsStrip />
        <GroupsSection />
        <CtaSection />
      </main>

      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Logo className="size-5" />
            <span>Alpina CRM — a demo by</span>
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <AlpinaTechMark height={18} />
            </a>
          </div>
          <span>© 2026 — Built for client showcases.</span>
        </div>
      </footer>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/60">
      <div
        className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-8 px-6 py-20 md:py-24">
        <Badge variant="outline" className="gap-2 py-1 pr-3 pl-2 text-xs">
          <FileCode2 className="size-3 text-accent" />
          Spec sheet · for technical stakeholders
        </Badge>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Every shadcn/ui component,{" "}
          <span className="bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
            battle-tested
          </span>{" "}
          inside Alpina CRM.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          This is our shadcn playbook — the exact primitives, compositions, and
          routes we use on every client project. Open for any team we work with.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xl" asChild>
            <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer">
              Hire{" "}
              <span className="inline-flex items-center">
                <AlpinaTechMark height={16} className="mx-1" />
              </span>
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/app">Open the demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const stats = [
    { label: "Components", value: uniqueComponents },
    { label: "Blocks", value: blockCount },
    { label: "Routes", value: routeCount },
  ];
  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-3 divide-x divide-border/60 px-6 py-8">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 px-4">
            <span className="text-3xl font-semibold tracking-tight md:text-4xl">
              {s.value}
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function GroupsSection() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-20">
        {groups.map((g) => (
          <div key={g.title} className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-2">
              <Badge variant="outline" className="text-xs">
                {g.title}
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {g.blurb}
              </h2>
            </div>
            <Separator />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {g.items.map((c) => (
                <div
                  key={`${g.title}-${c.name}`}
                  className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-medium tracking-tight">
                      {c.name}
                    </h3>
                    <Link
                      href={c.route}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      Used in {c.routeLabel}
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.5_0.22_265/0.18),transparent_60%)]"
        aria-hidden
      />
      <div className="mx-auto w-full max-w-5xl px-6 py-24 text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
          Want this playbook on your next project?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
          Every component on this page is wired, themed, and production-ready
          inside Alpina CRM.{" "}
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center align-middle"
          >
            <AlpinaTechMark height={16} />
          </a>{" "}
          ships the same foundation for clients in two weeks.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="xl" asChild>
            <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer">
              Hire Alpina Tech
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/about">About the studio</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
