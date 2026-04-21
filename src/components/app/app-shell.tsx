"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  ChartNoAxesCombined,
  DollarSign,
  FolderKanban,
  Globe2,
  HelpCircle,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  MessageSquare,
  Menu,
  PanelRightOpen,
  PhoneCall,
  Plus,
  Radar,
  Repeat,
  Scale,
  Settings2,
  Swords,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "@/components/logo";
import { RoleSwitcher } from "@/components/app/role-switcher";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { ScreenHelp } from "@/components/app/screen-help";
import { WelcomeTour } from "@/components/app/welcome-tour";
import { HudBar } from "@/components/app/hud-bar";
import { AutoPlayToggle } from "@/components/app/autoplay-demo";
import { CommandPalette } from "@/components/app/command-palette";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matches?: (pathname: string) => boolean;
};

const NAV_MAIN: NavItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/app/leads",
    label: "Leads",
    icon: Inbox,
    matches: (p) => p.startsWith("/app/leads"),
  },
  {
    href: "/app/pipeline",
    label: "Pipeline",
    icon: KanbanSquare,
    matches: (p) => p.startsWith("/app/pipeline"),
  },
  {
    href: "/app/accounts",
    label: "Accounts",
    icon: Building2,
    matches: (p) => p.startsWith("/app/accounts"),
  },
];

const NAV_INTEL: NavItem[] = [
  {
    href: "/app/conversations",
    label: "Conversations",
    icon: MessageSquare,
    matches: (p) => p.startsWith("/app/conversations"),
  },
  {
    href: "/app/calls",
    label: "Call library",
    icon: PhoneCall,
    matches: (p) => p.startsWith("/app/calls"),
  },
  {
    href: "/app/signals",
    label: "Signals",
    icon: Radar,
  },
  {
    href: "/app/sequences",
    label: "Sequences",
    icon: Repeat,
  },
  {
    href: "/app/market",
    label: "Market intel",
    icon: Swords,
  },
];

const NAV_REPORTS: NavItem[] = [
  {
    href: "/app/reports",
    label: "All reports",
    icon: FolderKanban,
    matches: (p) => p === "/app/reports",
  },
  {
    href: "/app/reports/pipeline-health",
    label: "Pipeline health",
    icon: TrendingUp,
  },
  {
    href: "/app/reports/activity",
    label: "Team activity",
    icon: CalendarCheck,
  },
  {
    href: "/app/reports/revenue-scorecard",
    label: "Revenue scorecard",
    icon: DollarSign,
  },
  {
    href: "/app/reports/forecast",
    label: "Forecast",
    icon: ChartNoAxesCombined,
  },
  {
    href: "/app/reports/sources",
    label: "Source attribution",
    icon: Target,
  },
  {
    href: "/app/reports/team",
    label: "Rep performance",
    icon: Users,
  },
  {
    href: "/app/reports/quality",
    label: "Lead quality",
    icon: BarChart3,
  },
  {
    href: "/app/reports/win-loss",
    label: "Win / Loss",
    icon: Scale,
  },
];

const NAV_SETTINGS: NavItem[] = [
  { href: "/app/settings", label: "Settings", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <HudBar />
      <TopBar />
      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="sticky top-14 hidden h-[calc(100svh-56px)] w-60 shrink-0 border-r border-border/60 bg-sidebar md:block">
          <SidebarInner />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <WelcomeTour />
      <CommandPalette />
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarInner />
        </SheetContent>
      </Sheet>

      <Link href="/app/dashboard" className="flex items-center gap-2">
        <Logo className="size-6" />
        <span className="text-sm font-semibold tracking-tight">Alpina CRM</span>
      </Link>

      <div
        className="ml-4 hidden items-center gap-2 md:flex"
        data-tour="role-switcher"
      >
        <RoleSwitcher />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <AutoPlayToggle />
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 md:inline-flex"
          data-tour="submit-lead"
          asChild
        >
          <Link href="/contact" target="_blank" rel="noopener noreferrer">
            <Plus className="size-4" />
            Submit a test lead
          </Link>
        </Button>
        <ScreenHelp />
        <ThemeToggle />
      </div>
    </header>
  );
}

function SidebarInner() {
  const pathname = usePathname();
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 px-3 py-5" data-tour="sidebar">
        <NavSection title="Workspace" items={NAV_MAIN} pathname={pathname} />
        <NavSection
          title="Intelligence"
          items={NAV_INTEL}
          pathname={pathname}
        />
        <NavSection title="Reports" items={NAV_REPORTS} pathname={pathname} />
        <NavSection title="" items={NAV_SETTINGS} pathname={pathname} />
        <div className="mt-auto rounded-lg border border-border/60 bg-card p-3 text-xs text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <HelpCircle className="size-3.5" />
            Need orientation?
          </div>
          <p className="leading-relaxed">
            Hit the <PanelRightOpen className="inline size-3" /> button in the
            top bar to reopen the tour for this screen.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {title ? (
        <div className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
      ) : null}
      {items.map((item) => {
        const active = item.matches
          ? item.matches(pathname)
          : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <item.icon
              className={cn(
                "size-4",
                active ? "text-primary" : "text-muted-foreground",
              )}
            />
            {item.label}
            {active ? (
              <span className="ml-auto size-1.5 rounded-full bg-primary" />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
