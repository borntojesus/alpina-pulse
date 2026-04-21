"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  KanbanSquare,
  Paintbrush,
  Plug,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarketingHeader } from "@/components/marketing/header";
import { Logo } from "@/components/logo";
import { AlpinaTechMark } from "@/components/alpina-tech-mark";
import { avatarUrl, initials } from "@/lib/utils";

const STUDIO_URL = "https://alpina-tech.com/shadcn-development/";

const buildCards = [
  {
    icon: KanbanSquare,
    title: "CRMs",
    body: "Custom sales CRMs that fit the way your team actually sells. Alpina CRM is the template — your version gets your pipeline, your scoring, your terminology.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Dashboards",
    body: "Revenue, pipeline, and ops dashboards built on real data — not Looker screenshots. Role-aware views for SDRs, managers, and execs.",
  },
  {
    icon: Workflow,
    title: "Sales ops automation",
    body: "Routing, enrichment, scoring, handoffs. We take the manual work out of your pipeline and wire it into the tools your team already uses.",
  },
  {
    icon: Bot,
    title: "Custom AI scoring",
    body: "Fit, intent, and engagement models tuned to your ICP. Every score comes with a reason a human can read and a knob a human can turn.",
  },
  {
    icon: Plug,
    title: "Integrations",
    body: "Salesforce, HubSpot, Pipedrive, Segment, Snowflake, your data warehouse. We write the glue so your team doesn't.",
  },
  {
    icon: Paintbrush,
    title: "Design systems",
    body: "shadcn/ui-based component libraries, Tailwind tokens, and Figma parity. The same playbook we used to ship this demo.",
  },
];

const processSteps = [
  {
    n: "01",
    title: "Discovery",
    length: "Week 1",
    body: "We map your pipeline, scoring logic, and the three reports your team opens most. You walk away with a scoped plan and a fixed price.",
  },
  {
    n: "02",
    title: "Pilot",
    length: "Weeks 2–4",
    body: "We ship a working slice — one persona, one pipeline, real data. You test it with a real rep. We calibrate, not guess.",
  },
  {
    n: "03",
    title: "Ship",
    length: "Weeks 5–8",
    body: "Full product, integrations live, team onboarded. We stay on for a month of tuning, then hand off the keys — or stay on retainer.",
  },
];

const techStack = [
  "Next.js",
  "React",
  "shadcn/ui",
  "Tailwind CSS",
  "TypeScript",
  "Vercel",
  "Postgres",
  "Prisma",
];

const team = [
  {
    name: "Dmytro Antonyuk",
    role: "Founder · Engineering",
    bio: "Twelve years building sales and analytics products. Still writes the tricky pipeline queries himself.",
  },
  {
    name: "Sofia Kovalenko",
    role: "Product Design",
    bio: "Turns spreadsheets into surfaces reps actually open. Lives inside Figma and the shadcn component tree.",
  },
  {
    name: "Taras Melnyk",
    role: "Full-Stack Engineering",
    bio: "Next.js, Postgres, and the integrations nobody wants to write. Ships the unsexy middle of the stack.",
  },
  {
    name: "Oksana Dovzhenko",
    role: "Delivery · Sales Ops",
    bio: "Was a VP of Revenue Ops before joining. Translates between the reps who use the product and the engineers who build it.",
  },
];

const faqs = [
  {
    q: "How long does a pilot take?",
    a: "Two to three weeks, usually. Week one is discovery and scoping. Week two is a working slice — one persona, one pipeline, real data on screen. If we can't demo something you can click by end of week three, the pilot was mis-scoped and we tell you.",
  },
  {
    q: "Do you build from scratch or extend our existing tools?",
    a: "Both. If Salesforce or HubSpot already holds your data, we build the surface on top — the views your team keeps asking for and never gets. If you've outgrown the off-the-shelf product, we replace it with something that fits.",
  },
  {
    q: "Which CRMs do you integrate with?",
    a: "Salesforce, HubSpot, Pipedrive, Attio, Close, and any CRM with a documented API. For data warehouses we work with Postgres, Snowflake, BigQuery, and Redshift. If it has an API, we've probably already written the adapter.",
  },
  {
    q: "Do you ship with our brand?",
    a: "Yes. Every project starts with a tokens pass — colors, typography, spacing, radii. The result is a shadcn/ui component library that looks like your company, not like a template. You own the design system when we're done.",
  },
  {
    q: "What does a week with Alpina Tech look like?",
    a: "Monday scoping call with the team lead. Daily async updates in Slack or Linear with a Loom when something moves. Friday demo — always something clickable, always on a staging URL. No status decks.",
  },
  {
    q: "What's the smallest engagement you take?",
    a: "A two-week sprint to ship one screen or one integration — around the cost of a senior hire for a month. If you're not sure whether we're the right fit, that's usually how we find out together.",
  },
];

export function AboutPage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <MarketingHeader />

      <main className="relative">
        <HeroSection />
        <BuildSection />
        <ProcessSection />
        <TechSection />
        <TeamSection />
        <FaqSection />
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
      <Image
        src="/marketing/hero-flow.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 -z-20 object-cover opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/40 via-accent/30 to-transparent blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-8 px-6 py-24 md:py-32">
        <Badge variant="outline" className="gap-2 py-1 pr-3 pl-2 text-xs">
          About
          <span className="text-muted-foreground">
            the studio behind the demo
          </span>
        </Badge>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          We&apos;re{" "}
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex translate-y-[2px] items-center"
          >
            <AlpinaTechMark height={48} className="md:[&_img]:!h-14" />
          </a>
          . We ship production-grade sales &amp; revenue tooling for{" "}
          <span className="bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
            B2B teams
          </span>
          .
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Alpina CRM is not a product we sell. It&apos;s a demo — the condensed
          version of what we build for clients. Dashboards that get used,
          scoring that makes sense, pipelines that match how your team sells.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xl" asChild>
            <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer">
              Book a call
              <ArrowRight className="size-4" />
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

function BuildSection() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col items-start gap-3">
          <Badge variant="outline" className="text-xs">
            What we build
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Sales and revenue surfaces. Nothing else.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            We don&apos;t do generic web apps. We do the tools revenue teams
            live inside — and we ship them to production, not to staging.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buildCards.map((c) => (
            <div
              key={c.title}
              className="group relative rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="mb-4 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <c.icon className="size-4.5" />
              </div>
              <h3 className="mb-1.5 text-base font-medium tracking-tight">
                {c.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="border-b border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col items-start gap-3">
          <Badge variant="outline" className="text-xs">
            How we work
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Three steps. Fixed scope. No status decks.
          </h2>
        </div>

        <ol className="relative flex flex-col gap-4 md:flex-row md:gap-6">
          <div
            aria-hidden
            className="pointer-events-none absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-primary/40 via-border to-transparent md:block"
          />
          {processSteps.map((s) => (
            <li
              key={s.n}
              className="relative flex-1 rounded-xl border border-border/60 bg-card p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs text-primary">
                  {s.n}
                </span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {s.length}
                </span>
              </div>
              <h3 className="mb-1.5 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function TechSection() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col items-start gap-3">
          <Badge variant="outline" className="text-xs">
            Tech we build with
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Boring stack. Excellent output.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            We stick to a tight, opinionated stack so the team ships faster and
            your product stays easy to hire for.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {techStack.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="border-b border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col items-start gap-3">
          <Badge variant="outline" className="text-xs">
            Team
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Small team. Senior only. Every project.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <div
              key={m.name}
              className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6"
            >
              <Avatar className="size-14">
                <AvatarImage src={avatarUrl(m.name, "rep")} alt={m.name} />
                <AvatarFallback>{initials(m.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-base font-medium tracking-tight">
                  {m.name}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {m.role}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {m.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto w-full max-w-3xl px-6 py-20">
        <div className="mb-10 flex flex-col items-start gap-3">
          <Badge variant="outline" className="text-xs">
            FAQ
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Questions we get on every first call.
          </h2>
        </div>
        <Accordion
          type="single"
          collapsible
          className="rounded-xl border border-border/60 bg-card px-5"
        >
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-base font-medium">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
          Ready to see your data in a dashboard that doesn&apos;t suck?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
          Book a call with{" "}
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center align-middle"
          >
            <AlpinaTechMark height={16} />
          </a>
          . We&apos;ll scope a pilot in 30 minutes, or tell you straight if
          we&apos;re not the right fit.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="xl" asChild>
            <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer">
              Book a call
              <ArrowRight className="size-4" />
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
