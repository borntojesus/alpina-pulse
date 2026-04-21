"use client";

import * as React from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const REGIONS = ["iad1", "fra1", "sfo1"];
const BUILD_HASH = (Math.random().toString(36).slice(2, 10) + "deadbeef").slice(
  0,
  7,
);

export function HudBar({ className }: { className?: string }) {
  const [rtt, setRtt] = React.useState(42);
  const [region] = React.useState(
    () => REGIONS[Math.floor(Math.random() * REGIONS.length)],
  );

  React.useEffect(() => {
    const id = setInterval(() => {
      setRtt((prev) => {
        const drift = Math.round((Math.random() - 0.5) * 12);
        return Math.max(18, Math.min(120, prev + drift));
      });
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "flex h-6 items-center gap-4 border-b border-border/40 bg-card/40 px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm md:px-6",
        className,
      )}
      aria-label="System status"
    >
      <span className="inline-flex items-center gap-1.5 text-[color:var(--success)]">
        <span className="relative flex size-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--success)] opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-[color:var(--success)]" />
        </span>
        Live
      </span>
      <HudCell label="region" value={region} />
      <HudCell label="rtt" value={`${rtt}ms`} />
      <HudCell label="build" value={BUILD_HASH} />
      <HudCell label="store" value="localStorage" className="hidden sm:flex" />
      <div className="ml-auto hidden items-center gap-1.5 md:inline-flex">
        <Radio className="size-3" />
        <span>alpina-tech · sales-intelligence.v1</span>
      </div>
    </div>
  );
}

function HudCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="text-muted-foreground/60">{label}</span>
      <span className="text-foreground/80">{value}</span>
    </span>
  );
}
