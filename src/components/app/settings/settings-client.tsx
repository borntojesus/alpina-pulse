"use client";

import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Moon, RefreshCw, Sun, PlayCircle } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/app/role-switcher";
import { LeadSplitterCard } from "@/components/app/settings/lead-splitter-card";
import { useTheme } from "next-themes";

export function SettingsClient() {
  const hydrated = useHydrated();
  const resetDemo = usePulseStore((s) => s.resetDemo);
  const leads = usePulseStore((s) => s.leads);
  const deals = usePulseStore((s) => s.deals);
  const { theme, setTheme } = useTheme();

  function handleReset() {
    resetDemo();
    toast.success("Demo reset", {
      description: "Seeded with fresh data. Tour will play again.",
    });
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Demo"
        title="Settings"
        description="Switch roles, reset the demo, replay the tour, toggle theme."
      />
      <div className="grid gap-6 px-4 py-6 md:grid-cols-2 md:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Role &amp; theme
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Active role
              </div>
              <RoleSwitcher />
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Theme
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="size-3.5" />
                  Dark
                </Button>
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="size-3.5" />
                  Light
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Demo workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Leads</span>
                <span className="tabular-nums">
                  {hydrated ? leads.length : "…"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deals</span>
                <span className="tabular-nums">
                  {hydrated ? deals.length : "…"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Persistence</span>
                <span>localStorage (browser only)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="size-3.5" />
                Reset demo data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  usePulseStore.setState({ hasSeenWelcome: false });
                  toast.success("Tour reset — refresh to replay");
                }}
              >
                <PlayCircle className="size-3.5" />
                Replay welcome tour
              </Button>
            </div>
          </CardContent>
        </Card>

        <LeadSplitterCard />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              About this demo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              Alpina Pulse is a client-facing showcase of what Alpina Tech
              builds for B2B sales teams — inbox, scoring, pipeline, and
              dashboards. No backend, no sign-up, no data leaves your browser.
            </p>
            <p>
              Your version would include: real CRM integration, custom scoring
              calibrated to your ICP, SSO, role-based permissions, and data
              retention policies your legal team signs off on.
            </p>
            <div>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href="https://alpina.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit alpina.tech
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
