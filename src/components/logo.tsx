import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-primary via-primary/85 to-accent text-primary-foreground shadow-[0_10px_30px_-12px_oklch(0.5_0.22_265/0.7)]",
        className,
      )}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-md bg-gradient-to-tr from-transparent via-white/0 to-white/15"
        aria-hidden
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="relative size-4"
        aria-hidden
      >
        {/* Alpine peak — angular "A" */}
        <path
          d="M3 20 L10 6 L14 14 L17 10 L21 20 Z"
          fill="currentColor"
          opacity="0.95"
        />
        {/* Front ridge */}
        <path
          d="M10 6 L14 14 L12.5 14 L10 10 L7.5 14 L6 14 Z"
          fill="black"
          opacity="0.18"
        />
        {/* Summit beacon */}
        <circle cx="10" cy="5" r="1.6" fill="currentColor" />
        <circle cx="10" cy="5" r="2.6" fill="currentColor" opacity="0.25" />
      </svg>
    </span>
  );
}
