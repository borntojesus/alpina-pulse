import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  hint,
  tone = "neutral",
  sparkline,
  className,
}: {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  hint?: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
  sparkline?: React.ReactNode;
  className?: string;
}) {
  const toneMap = {
    neutral: "from-primary/15 to-transparent",
    positive: "from-[color:var(--success)]/15 to-transparent",
    warning: "from-[color:var(--warning)]/15 to-transparent",
    danger: "from-[color:var(--danger)]/15 to-transparent",
  } as const;

  return (
    <div
      data-tour="kpi-card"
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/60 bg-card p-5",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-60",
          toneMap[tone],
        )}
        aria-hidden
      />
      <div className="relative flex flex-col gap-2">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-semibold tracking-tight">{value}</div>
            {delta ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 text-xs font-medium",
                  delta.direction === "up" &&
                    "bg-[color:var(--success)]/15 text-[color:var(--success)]",
                  delta.direction === "down" &&
                    "bg-[color:var(--danger)]/15 text-[color:var(--danger)]",
                  delta.direction === "flat" &&
                    "bg-muted text-muted-foreground",
                )}
              >
                {delta.direction === "up" ? (
                  <ArrowUpRight className="size-3" />
                ) : delta.direction === "down" ? (
                  <ArrowDownRight className="size-3" />
                ) : (
                  <Minus className="size-3" />
                )}
                {delta.value}
              </span>
            ) : null}
          </div>
          {sparkline ? (
            <div className="h-10 w-24 shrink-0">{sparkline}</div>
          ) : null}
        </div>
        {hint ? (
          <div className="text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </div>
    </div>
  );
}
