import { cn } from "@/lib/utils";

/**
 * Rendered logo mark for a company. Uses the Freepik logo-template JPGs
 * under /public/logos/ and crops to the top-left quadrant so the
 * placeholder "BRAND NAME" text below the mark stays out of frame.
 */
export function CompanyLogo({
  src,
  company,
  size = 28,
  className,
}: {
  src?: string;
  company: string;
  size?: number;
  className?: string;
}) {
  const initials = company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (!src) {
    return (
      <span
        aria-label={company}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border border-border/60 bg-gradient-to-br from-primary/20 to-accent/20 text-[10px] font-semibold uppercase tracking-tight text-foreground",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      aria-label={company}
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-md border border-border/60 bg-white dark:bg-muted",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute top-0 left-0 max-w-none object-cover"
        style={{
          width: size * 3,
          height: size * 2.2,
          left: `-${size * 0.45}px`,
          top: `-${size * 0.15}px`,
        }}
      />
    </span>
  );
}
