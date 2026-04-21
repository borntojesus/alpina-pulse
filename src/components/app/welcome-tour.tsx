"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Crown,
  Headset,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  Sparkles,
  Briefcase,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import type { Role } from "@/lib/types";

type Step = {
  title: string;
  description: React.ReactNode;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STEPS: Step[] = [
  {
    badge: "Welcome",
    title: "This is Alpina Pulse",
    description:
      "A demo by Alpina Tech showing what we build for B2B sales teams — inbox, scoring, pipeline, and dashboards. Nothing is simulated; you'll use it like your team would.",
    icon: Sparkles,
  },
  {
    badge: "Lenses",
    title: "One product, three lenses",
    description:
      "Switch between SDR, Manager, and Exec in the top bar. The same data re-lenses for who's looking — no separate product per role.",
    icon: LayoutDashboard,
  },
  {
    badge: "Workflow",
    title: "Leads land, score, close",
    description:
      "Drop a test lead via /contact — it lands in your inbox with a score and activity timeline. Drag deals across stages in Pipeline. Every move is logged.",
    icon: Inbox,
  },
  {
    badge: "Ready",
    title: "Pick a role to start",
    description:
      "Choose how you want to see the workspace. You can switch anytime from the top bar or Settings.",
    icon: KanbanSquare,
  },
];

const ROLE_OPTIONS: { role: Role; icon: typeof Headset; blurb: string }[] = [
  {
    role: "SDR",
    icon: Headset,
    blurb: "New leads, response time, daily activity.",
  },
  {
    role: "Manager",
    icon: Briefcase,
    blurb: "Pipeline health, team performance, bottlenecks.",
  },
  {
    role: "Exec",
    icon: Crown,
    blurb: "Revenue, forecast vs target, source attribution.",
  },
];

export function WelcomeTour() {
  const hydrated = useHydrated();
  const hasSeenWelcome = usePulseStore((s) => s.hasSeenWelcome);
  const markWelcomeSeen = usePulseStore((s) => s.markWelcomeSeen);
  const setRole = usePulseStore((s) => s.setRole);

  const [dismissed, setDismissed] = React.useState(false);
  const [step, setStep] = React.useState(0);

  if (!hydrated || hasSeenWelcome) return null;
  const open = !dismissed;
  const setOpen = (o: boolean) => setDismissed(!o);

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  function finish(role: Role) {
    setRole(role);
    markWelcomeSeen();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) markWelcomeSeen();
      }}
    >
      <DialogContent
        className="sm:max-w-xl overflow-hidden border-border/60 p-0"
        showCloseButton={false}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent"
          aria-hidden
        />
        <div className="flex items-center gap-2 border-b border-border/60 bg-card/80 px-6 py-3 text-xs font-medium text-muted-foreground">
          <span className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-6 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </span>
          <span className="ml-auto tabular-nums">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="relative px-6 pb-5 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant="accent" className="mb-4 w-fit">
                {current.badge}
              </Badge>
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <current.icon className="size-5" />
              </div>
              <DialogTitle className="text-2xl">{current.title}</DialogTitle>
              <DialogDescription className="mt-2 text-base leading-relaxed">
                {current.description}
              </DialogDescription>

              {last ? (
                <div className="mt-5 grid gap-2">
                  {ROLE_OPTIONS.map((o) => (
                    <button
                      key={o.role}
                      onClick={() => finish(o.role)}
                      className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3 text-left transition-all hover:border-primary/60 hover:bg-primary/5"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <o.icon className="size-4" />
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{o.role}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.blurb}
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 bg-card/50 px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="size-3.5" />
            Back
          </Button>
          {last ? (
            <Button variant="outline" size="sm" onClick={() => finish("SDR")}>
              <CheckCircle2 className="size-3.5" />
              Skip — start as SDR
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep(step + 1)}>
              Next
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
