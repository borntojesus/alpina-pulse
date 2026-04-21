import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReportShell({
  eyebrow,
  title,
  question,
  answer,
  audience,
  cadence,
  banner = "/marketing/report-banner.png",
  children,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  question: string;
  answer: string;
  audience: ("SDR" | "Manager" | "Exec")[];
  cadence: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  banner?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative isolate overflow-hidden border-b border-border/60">
        <Image
          src={banner}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="pointer-events-none absolute inset-0 -z-10 object-cover opacity-30 [mask-image:linear-gradient(to_bottom,black_20%,transparent_95%)]"
        />
        <div className="relative flex flex-col gap-4 px-4 py-7 md:flex-row md:items-end md:justify-between md:px-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {eyebrow}
              </Badge>
              {audience.map((a) => (
                <Badge key={a} variant="secondary" className="text-[10px]">
                  {a}
                </Badge>
              ))}
              <Badge variant="accent" className="text-[10px]">
                {cadence}
              </Badge>
            </div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h1>
            <div className="flex flex-col gap-1.5 md:max-w-2xl">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <HelpCircle className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <span>
                  <span className="font-medium text-foreground">
                    This report answers:
                  </span>{" "}
                  {question}
                </span>
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground md:pl-5">
                <span className="font-medium text-foreground">So what:</span>{" "}
                {answer}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/reports">
                <ArrowLeft className="size-3.5" />
                All reports
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="px-4 py-6 md:px-8">{children}</div>
    </div>
  );
}

export function ChartFrame({
  hypothesis,
  soWhat,
  children,
  right,
  className,
}: {
  hypothesis: string;
  soWhat?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-medium tracking-tight">{hypothesis}</h2>
          {soWhat ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {soWhat}
            </p>
          ) : null}
        </div>
        {right}
      </header>
      <div>{children}</div>
    </section>
  );
}
