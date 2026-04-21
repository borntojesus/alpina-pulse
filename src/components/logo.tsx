import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-primary via-primary/80 to-accent text-[10px] font-bold text-primary-foreground shadow-[0_8px_24px_-12px_oklch(0.5_0.22_265/0.6)]",
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-0 rounded-md bg-background/10" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="relative size-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M3 13.5 7 8.5l3 4 3-6 3.5 7.5L21 10.5"
          stroke="currentColor"
          strokeWidth="2.2"
        />
      </svg>
    </span>
  );
}
