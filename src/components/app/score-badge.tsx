import { cn } from "@/lib/utils";
import { scoreTier } from "@/lib/scoring";

export function ScoreBadge({
  score,
  size = "sm",
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tier = scoreTier(score);
  const color =
    tier === "hot"
      ? "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/40"
      : tier === "warm"
        ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/40"
        : "bg-[color:var(--danger)]/10 text-[color:var(--danger)] border-[color:var(--danger)]/30";

  const sizes = {
    sm: "size-8 text-xs",
    md: "size-12 text-sm",
    lg: "size-16 text-base",
  } as const;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border font-semibold tabular-nums",
        color,
        sizes[size],
        className,
      )}
      title={`Score ${score} (${tier})`}
    >
      {score}
    </div>
  );
}
