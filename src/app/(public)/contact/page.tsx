import { MarketingHeader } from "@/components/marketing/header";
import { LeadForm } from "@/components/marketing/lead-form";
import { Badge } from "@/components/ui/badge";

export default function ContactPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="relative isolate border-b border-border/60">
          <div
            className="absolute inset-0 -z-10 grid-bg opacity-30"
            aria-hidden
          />
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col gap-5">
              <Badge variant="outline" className="w-fit text-xs">
                Demo lead capture
              </Badge>
              <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                Drop a lead. Watch it land.
              </h1>
              <p className="text-balance text-muted-foreground">
                This form pretends to be your live website. Fill it like a
                prospect would — we&apos;ll score the lead, enrich it with
                source attribution, and drop it into the demo inbox so you can
                work it as any role.
              </p>
              <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  Scoring happens client-side — zero backend required for the
                  demo.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  Your lead is tagged{" "}
                  <span className="text-foreground">highlight</span> so it
                  stands out in the inbox.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  In production, this is your real form — we wire it to your
                  CRM.
                </li>
              </ul>
            </div>
            <div className="relative">
              <div
                className="absolute -inset-8 -z-10 rounded-[28px] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl"
                aria-hidden
              />
              <LeadForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
