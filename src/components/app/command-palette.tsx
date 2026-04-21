"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart3,
  CalendarCheck,
  ChartNoAxesCombined,
  Crown,
  DollarSign,
  FolderKanban,
  Headset,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  MessageSquare,
  PaintRoller,
  PhoneCall,
  Plus,
  Radar,
  RefreshCw,
  Repeat,
  Settings2,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { usePulseStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const NAV: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}[] = [
  {
    label: "Dashboard",
    href: "/app/dashboard",
    icon: LayoutDashboard,
    hint: "G → D",
  },
  { label: "Leads", href: "/app/leads", icon: Inbox, hint: "G → L" },
  {
    label: "Pipeline",
    href: "/app/pipeline",
    icon: KanbanSquare,
    hint: "G → P",
  },
  {
    label: "Conversations",
    href: "/app/conversations",
    icon: MessageSquare,
    hint: "G → C",
  },
  { label: "Call library", href: "/app/calls", icon: PhoneCall },
  { label: "Signals", href: "/app/signals", icon: Radar },
  { label: "Sequences", href: "/app/sequences", icon: Repeat },
  { label: "Market intel", href: "/app/market", icon: Swords },
  { label: "Settings", href: "/app/settings", icon: Settings2 },
];

const REPORTS: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: "Reports hub", href: "/app/reports", icon: FolderKanban },
  {
    label: "Pipeline health",
    href: "/app/reports/pipeline-health",
    icon: TrendingUp,
  },
  {
    label: "Team activity",
    href: "/app/reports/activity",
    icon: CalendarCheck,
  },
  {
    label: "Revenue scorecard",
    href: "/app/reports/revenue-scorecard",
    icon: DollarSign,
  },
  {
    label: "Forecast",
    href: "/app/reports/forecast",
    icon: ChartNoAxesCombined,
  },
  { label: "Source attribution", href: "/app/reports/sources", icon: Target },
  { label: "Rep performance", href: "/app/reports/team", icon: Users },
  { label: "Lead quality", href: "/app/reports/quality", icon: BarChart3 },
];

const ROLES: {
  value: Role;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "SDR", label: "SDR view", icon: Headset },
  { value: "Manager", label: "Manager view", icon: TrendingUp },
  { value: "Exec", label: "Exec view", icon: Crown },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const setRole = usePulseStore((s) => s.setRole);
  const resetDemo = usePulseStore((s) => s.resetDemo);
  const leads = usePulseStore((s) => s.leads);
  const deals = usePulseStore((s) => s.deals);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  const topLeads = React.useMemo(
    () => [...leads].sort((a, b) => b.score - a.score).slice(0, 5),
    [leads],
  );
  const topDeals = React.useMemo(
    () =>
      [...deals]
        .filter((d) => d.stage !== "closed-won" && d.stage !== "closed-lost")
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [deals],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Jump anywhere, do anything. ⌘K to reopen."
    >
      <CommandInput placeholder="Search routes, leads, deals, or actions…" />
      <CommandList>
        <CommandEmpty>Nothing matches. Try a shorter query.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV.map((n) => (
            <CommandItem
              key={n.href}
              onSelect={() => run(() => router.push(n.href))}
              value={`nav ${n.label}`}
            >
              <n.icon className="size-4 text-muted-foreground" />
              {n.label}
              {n.hint ? <CommandShortcut>{n.hint}</CommandShortcut> : null}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Reports">
          {REPORTS.map((r) => (
            <CommandItem
              key={r.href}
              onSelect={() => run(() => router.push(r.href))}
              value={`report ${r.label}`}
            >
              <r.icon className="size-4 text-muted-foreground" />
              {r.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Switch role">
          {ROLES.map((r) => (
            <CommandItem
              key={r.value}
              onSelect={() =>
                run(() => {
                  setRole(r.value);
                  toast.success(`Role → ${r.label}`);
                })
              }
              value={`role ${r.label}`}
            >
              <r.icon className="size-4 text-muted-foreground" />
              {r.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              run(() => window.open("/contact", "_blank", "noopener"))
            }
            value="action submit lead"
          >
            <Plus className="size-4 text-muted-foreground" />
            Submit a test lead
            <CommandShortcut>↗</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                resetDemo();
                toast.success("Demo reset — seed reloaded");
              })
            }
            value="action reset demo"
          >
            <RefreshCw className="size-4 text-muted-foreground" />
            Reset demo data
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => router.push("/app/settings"))}
            value="action open settings"
          >
            <PaintRoller className="size-4 text-muted-foreground" />
            Open settings & theme
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Top-scoring leads">
          {topLeads.map((l) => (
            <CommandItem
              key={l.id}
              onSelect={() => run(() => router.push(`/app/leads/${l.id}`))}
              value={`lead ${l.firstName} ${l.lastName} ${l.company}`}
            >
              <Sparkles className="size-4 text-accent" />
              {l.firstName} {l.lastName}
              <span className="ml-auto text-xs text-muted-foreground">
                {l.company} · {l.score}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Open deals by value">
          {topDeals.map((d) => (
            <CommandItem
              key={d.id}
              onSelect={() => run(() => router.push(`/app/pipeline/${d.id}`))}
              value={`deal ${d.name}`}
            >
              <DollarSign className="size-4 text-[color:var(--success)]" />
              {d.name}
              <span className="ml-auto text-xs text-muted-foreground">
                ${d.value.toLocaleString("en-US")}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function CommandTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group hidden h-8 items-center gap-2 rounded-md border border-border/60 bg-card/50 px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-card md:inline-flex"
    >
      <span>Search…</span>
      <kbd className="inline-flex items-center gap-0.5 rounded-sm border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px]">
        <span>⌘</span>K
      </kbd>
    </button>
  );
}
