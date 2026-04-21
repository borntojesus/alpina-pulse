"use client";

import { useMemo } from "react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { SdrDashboard } from "./sdr-dashboard";
import { ManagerDashboard } from "./manager-dashboard";
import { ExecDashboard } from "./exec-dashboard";
import { repFocus } from "@/lib/selectors";
import { Badge } from "@/components/ui/badge";

export function DashboardClient() {
  const hydrated = useHydrated();
  const role = usePulseStore((s) => s.role);
  const leads = usePulseStore((s) => s.leads);
  const deals = usePulseStore((s) => s.deals);
  const reps = usePulseStore((s) => s.reps);

  const focus = useMemo(() => repFocus(role), [role]);

  if (!hydrated) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow={`${role} view`}
        title={`Good ${greeting()}, ${role === "Exec" ? "team" : "rep"}.`}
        description={focus.subtitle}
        actions={<Badge variant="outline">Live demo data</Badge>}
      />
      <div className="px-4 py-6 md:px-8">
        {role === "SDR" && (
          <SdrDashboard leads={leads} deals={deals} reps={reps} />
        )}
        {role === "Manager" && (
          <ManagerDashboard leads={leads} deals={deals} reps={reps} />
        )}
        {role === "Exec" && (
          <ExecDashboard leads={leads} deals={deals} reps={reps} />
        )}
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
