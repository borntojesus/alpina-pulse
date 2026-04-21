import { cn } from "@/lib/utils";

export function AlpinaTechMark({
  className,
  height = 16,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center align-middle opacity-90 transition-opacity hover:opacity-100",
        className,
      )}
      aria-label="Alpina Tech"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/alpina-tech.svg"
        alt="Alpina Tech"
        height={height}
        style={{ height, width: "auto" }}
        className="block [filter:brightness(0)] dark:[filter:none]"
      />
    </span>
  );
}
