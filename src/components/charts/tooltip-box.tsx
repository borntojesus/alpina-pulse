import * as React from "react";

export function ChartTooltipBox({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-[140px] rounded-md border border-border/80 bg-popover/95 p-2.5 text-xs shadow-xs backdrop-blur">
      {title ? (
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
      ) : null}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}
