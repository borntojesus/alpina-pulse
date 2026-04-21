import Link from "next/link";
import {
  ArrowRight,
  ChartNoAxesCombined,
  KanbanSquare,
  Radar,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingHeader } from "@/components/marketing/header";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <MarketingHeader />

      <main className="relative">
        <HeroSection />
        <LogoStrip />
        <ProductSection />
        <PersonaSection />
        <HowItWorksSection />
        <CtaSection />
      </main>

      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo className="size-5" />
            <span>
              Alpina Pulse — a demo by{" "}
              <a
                href="https://alpina.tech"
                className="text-foreground hover:underline"
              >
                Alpina Tech
              </a>
            </span>
          </div>
          <span>
            © {new Date().getFullYear()} — Built for client showcases.
          </span>
        </div>
      </footer>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate border-b border-border/60">
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/40 via-accent/30 to-transparent blur-3xl"
        aria-hidden
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-6 py-20 md:py-28">
        <Badge variant="outline" className="gap-2 py-1 pr-3 pl-2 text-xs">
          <Sparkles className="size-3 text-accent" />
          Live demo · no sign-up required
        </Badge>
        <h1 className="text-balance text-center text-4xl font-semibold tracking-tight md:text-6xl">
          Lead intelligence for{" "}
          <span className="bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
            B2B sales teams
          </span>
        </h1>
        <p className="max-w-2xl text-balance text-center text-base leading-relaxed text-muted-foreground md:text-lg">
          See how a B2B lead gets from form to forecast. Alpina Pulse shows what
          we build for revenue teams — inbox, scoring, pipeline, and dashboards
          that actually get used.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="xl" asChild>
            <Link href="/app">
              Try the demo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/contact">Submit a test lead</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          3 minutes · SDR / Manager / Exec views · Seeded with 200 leads.
        </p>
      </div>
    </section>
  );
}

function LogoStrip() {
  const logos = ["Acme", "Forge", "Northwind", "Contoso", "Stellar", "Helix"];
  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-10 text-sm text-muted-foreground">
        <span className="uppercase tracking-widest text-[11px]">
          Built for teams that look like
        </span>
        <div className="flex flex-wrap items-center gap-8 opacity-80">
          {logos.map((l) => (
            <span key={l} className="font-medium tracking-tight">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSection() {
  const features = [
    {
      icon: Radar,
      title: "Inbound + outbound inbox",
      description:
        "Every lead lands in a prioritized inbox — scored, enriched, routed. Never miss a hot inbound.",
    },
    {
      icon: ChartNoAxesCombined,
      title: "Scoring you can explain",
      description:
        "Fit + intent + engagement. Every point has a reason reps can show to the prospect.",
    },
    {
      icon: KanbanSquare,
      title: "Pipeline that works the way you sell",
      description:
        "Drag stages. See velocity. Replace the Salesforce views your team avoids.",
    },
    {
      icon: Workflow,
      title: "Role-aware dashboards",
      description:
        "SDR sees activity. Manager sees bottlenecks. Exec sees forecast. One product, three lenses.",
    },
    {
      icon: Zap,
      title: "Fast by default",
      description:
        "Deployed on Vercel. Sub-second page transitions, realtime state, works on mobile.",
    },
    {
      icon: Sparkles,
      title: "Tailored, not templated",
      description:
        "We calibrate scoring to your ICP in week one. This demo is the starting point — your version is yours.",
    },
  ];

  return (
    <section id="product" className="border-b border-border/60">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col items-start gap-3">
          <Badge variant="outline" className="text-xs">
            What Alpina Tech builds
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            A complete sales ops surface — not another dashboard in your stack.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="mb-4 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="size-4.5" />
              </div>
              <h3 className="mb-1.5 text-base font-medium tracking-tight">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonaSection() {
  const personas = [
    {
      role: "SDR",
      focus: "New leads, response time, first contact",
      accent: "from-primary/30 to-accent/20",
      bullets: [
        "Inbox with last 24h of new leads",
        "Personal leaderboard rank",
        "Assign-to-me in one click",
      ],
    },
    {
      role: "Sales Manager",
      focus: "Pipeline health, team performance, bottlenecks",
      accent: "from-accent/30 to-chart-5/20",
      bullets: [
        "Kanban with stage velocity heatmap",
        "Rep leaderboard by revenue",
        "Forecast vs target",
      ],
    },
    {
      role: "Executive",
      focus: "Revenue, growth, attribution",
      accent: "from-chart-5/30 to-primary/10",
      bullets: [
        "Revenue trend (YoY, MoM)",
        "Source attribution with CAC / LTV",
        "Top accounts overview",
      ],
    },
  ];

  return (
    <section id="personas" className="border-b border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col items-start gap-3">
          <Badge variant="outline" className="text-xs">
            Built for three roles
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Same product, the right lens for who&apos;s looking.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {personas.map((p) => (
            <div
              key={p.role}
              className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-6"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${p.accent}`}
                aria-hidden
              />
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                For the {p.role}
              </div>
              <h3 className="mb-4 text-xl font-semibold tracking-tight">
                {p.focus}
              </h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      title: "Submit a lead",
      description:
        "Open the public form, fill it like any prospect would. We score it the moment it arrives.",
    },
    {
      n: "02",
      title: "Watch it land",
      description:
        "Your lead appears in inbox with score, source attribution, and an activity timeline.",
    },
    {
      n: "03",
      title: "Switch roles",
      description:
        "Toggle between SDR, Manager, Exec — see how the same data changes shape for the reader.",
    },
  ];
  return (
    <section id="how" className="border-b border-border/60">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col items-start gap-3">
          <Badge variant="outline" className="text-xs">
            Three minute tour
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            The demo plays itself. You follow along.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-border/60 bg-card p-6"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {s.n}
              </span>
              <h3 className="mt-2 text-lg font-medium tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>
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
          Ready to see it?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
          No sign-up, no password. Your session, your data — click reset
          anytime. This is what we ship for clients, condensed into a demo.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="xl" asChild>
            <Link href="/app">
              Open the demo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/contact">Submit a lead first</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
