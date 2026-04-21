"use client";

import * as React from "react";
import { BriefcaseBusiness, Crown, Headset } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import type { Role } from "@/lib/types";

const OPTIONS: {
  value: Role;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "SDR", label: "SDR", icon: Headset },
  { value: "Manager", label: "Manager", icon: BriefcaseBusiness },
  { value: "Exec", label: "Exec", icon: Crown },
];

export function RoleSwitcher() {
  const hydrated = useHydrated();
  const role = usePulseStore((s) => s.role);
  const setRole = usePulseStore((s) => s.setRole);

  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={hydrated ? role : "SDR"}
      onValueChange={(v) => {
        if (v) setRole(v as Role);
      }}
      className="rounded-md border border-border/60 bg-card p-0.5"
    >
      {OPTIONS.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          aria-label={`Switch to ${o.label} view`}
          className="gap-1.5 rounded-sm px-2.5 text-xs data-[state=on]:bg-primary/15 data-[state=on]:text-foreground"
        >
          <o.icon className="size-3.5" />
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
