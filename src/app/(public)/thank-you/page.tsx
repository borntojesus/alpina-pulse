import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { Button } from "@/components/ui/button";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const { leadId } = await searchParams;
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="relative w-full max-w-xl text-center">
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-accent/20 via-primary/10 to-transparent blur-2xl"
            aria-hidden
          />
          <div className="rounded-2xl border border-border/80 bg-card p-10">
            <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)]">
              <CheckCircle2 className="size-6" />
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight">
              Lead submitted. Watch it land.
            </h1>
            <p className="mx-auto mt-3 max-w-md text-balance text-sm text-muted-foreground">
              Your lead is in the demo inbox — scored and tagged as a highlight.
              Open the workspace and find it at the top.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href={leadId ? `/app/leads/${leadId}` : "/app/leads"}>
                  Open my lead
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/app">Go to dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
