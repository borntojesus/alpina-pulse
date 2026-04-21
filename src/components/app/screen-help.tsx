"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

type Help = {
  title: string;
  description: string;
  whoItsFor: string[];
  dataSources: string[];
  whyItMatters: string;
};

const HELP: Record<string, Help> = {
  "/app/dashboard": {
    title: "Dashboard",
    description:
      "One-glance snapshot of your demo workspace. KPI cards change with the selected role.",
    whoItsFor: ["SDR", "Manager", "Exec"],
    dataSources: ["CRM deals", "Lead form submissions", "Activity logs"],
    whyItMatters:
      "Your executive team checks this first thing on Monday. If it isn't trustworthy, they stop opening it.",
  },
  "/app/leads": {
    title: "Leads inbox",
    description:
      "Every new lead, scored and tagged. Use filters to triage hot inbound first.",
    whoItsFor: ["SDR", "Manager"],
    dataSources: ["Form submissions", "CRM", "Scoring engine"],
    whyItMatters:
      "Response time is the single biggest predictor of B2B conversion. This view optimises it.",
  },
  "/app/pipeline": {
    title: "Pipeline",
    description:
      "Drag deals across stages. Stage totals update instantly. Activity log captures every move.",
    whoItsFor: ["SDR", "Manager"],
    dataSources: ["Deals", "Activities"],
    whyItMatters:
      "Your pipeline is only as real as the latest stage change. Keeping it fresh is what makes forecasts honest.",
  },
  "/app/analytics/sources": {
    title: "Source attribution",
    description:
      "Where leads come from, what they cost, and what they convert to.",
    whoItsFor: ["Manager", "Exec"],
    dataSources: ["UTM parameters", "Ad-platform spend", "Closed-won revenue"],
    whyItMatters:
      "Marketing should spend where ROI is best. This tells you which channels to double down on and which to cut.",
  },
  "/app/analytics/team": {
    title: "Team performance",
    description:
      "Leaderboard + individual quota progress. Spot coaching opportunities.",
    whoItsFor: ["Manager"],
    dataSources: ["Rep quotas", "Closed-won deals", "Activity counts"],
    whyItMatters:
      "You can't coach what you can't see. This view surfaces who's thriving and who needs help.",
  },
  "/app/analytics/forecast": {
    title: "Forecast",
    description: "Weighted pipeline with best / commit / worst scenarios.",
    whoItsFor: ["Manager", "Exec"],
    dataSources: ["Deals × probability", "Historical win rates"],
    whyItMatters:
      "Quarter close is won or lost on forecast honesty. This is the view to bring to board meetings.",
  },
  "/app/analytics/quality": {
    title: "Lead quality",
    description:
      "Score distribution and conversion by bucket. Is our scoring calibrated?",
    whoItsFor: ["Manager", "Exec"],
    dataSources: ["Scoring engine", "Conversion outcomes"],
    whyItMatters:
      "Scoring decays. Reviewing quality monthly keeps SDRs focused on leads that actually close.",
  },
  "/app/settings": {
    title: "Settings",
    description: "Switch roles, reset the demo, replay tours, toggle theme.",
    whoItsFor: ["Everyone (demo only)"],
    dataSources: ["Local browser storage"],
    whyItMatters:
      "Showing the demo to a new audience? Reset it first so they see fresh data.",
  },
};

function helpFor(pathname: string): Help | undefined {
  if (HELP[pathname]) return HELP[pathname];
  const match = Object.keys(HELP).find((k) => pathname.startsWith(k));
  return match ? HELP[match] : undefined;
}

export function ScreenHelp() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const help = helpFor(pathname);
  if (!help) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="About this screen">
          <HelpCircle className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <Badge variant="outline" className="w-fit text-[10px]">
            About this screen
          </Badge>
          <SheetTitle className="text-xl">{help.title}</SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {help.description}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-6 pb-6">
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Who it&apos;s for
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {help.whoItsFor.map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Data sources (in production)
            </h3>
            <ul className="flex flex-col gap-1.5 text-sm">
              {help.dataSources.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-accent" />
                  {d}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Why it matters
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {help.whyItMatters}
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
