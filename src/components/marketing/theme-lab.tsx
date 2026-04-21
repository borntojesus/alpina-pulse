"use client";

import * as React from "react";
import { Moon, Palette, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";

type Swatch = {
  name: string;
  value: string;
  preview: string;
};

// oklch values tuned for dark-first look but readable on both themes.
const SWATCHES: Swatch[] = [
  {
    name: "Deep Blue",
    value: "oklch(0.7 0.18 260)",
    preview: "oklch(0.7 0.18 260)",
  },
  {
    name: "Teal",
    value: "oklch(0.72 0.14 195)",
    preview: "oklch(0.72 0.14 195)",
  },
  {
    name: "Violet",
    value: "oklch(0.7 0.2 300)",
    preview: "oklch(0.7 0.2 300)",
  },
  {
    name: "Rose",
    value: "oklch(0.7 0.2 10)",
    preview: "oklch(0.7 0.2 10)",
  },
  {
    name: "Orange",
    value: "oklch(0.74 0.17 55)",
    preview: "oklch(0.74 0.17 55)",
  },
  {
    name: "Green",
    value: "oklch(0.72 0.16 150)",
    preview: "oklch(0.72 0.16 150)",
  },
];

export function ThemeLab() {
  const hydrated = useHydrated();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const current = hydrated ? (theme ?? resolvedTheme) : "dark";

  const [activeSwatch, setActiveSwatch] = React.useState<string | null>(null);
  const [radius, setRadius] = React.useState<number>(0.75);

  const applyColor = React.useCallback((value: string) => {
    document.documentElement.style.setProperty("--primary", value);
    document.documentElement.style.setProperty("--ring", value);
    setActiveSwatch(value);
  }, []);

  const applyRadius = React.useCallback((value: number) => {
    document.documentElement.style.setProperty("--radius", `${value}rem`);
    setRadius(value);
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label="Open Theme Lab"
          className="fixed bottom-5 right-5 z-40 size-12 rounded-full shadow-lg shadow-primary/30 ring-1 ring-primary/30"
        >
          <Palette className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="gap-2 border-b border-border/60 px-6 py-6">
          <Badge variant="outline" className="gap-1.5 text-[11px]">
            <Sparkles className="size-3 text-accent" />
            Theme Lab
          </Badge>
          <SheetTitle className="text-xl leading-tight tracking-tight">
            shadcn&apos;s promise in one place.
          </SheetTitle>
          <SheetDescription>
            Change a token, the whole app follows.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-8 px-6 py-6">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium tracking-tight">Base color</h3>
              <span className="text-[11px] text-muted-foreground">
                updates --primary + --ring
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {SWATCHES.map((s) => {
                const isActive = activeSwatch === s.value;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => applyColor(s.value)}
                    aria-label={`Apply ${s.name} as primary color`}
                    className={cn(
                      "group relative flex aspect-square items-center justify-center rounded-lg border border-border/60 bg-card transition-all hover:border-primary/50 hover:scale-105",
                      isActive && "border-primary ring-2 ring-primary/40",
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-6 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: s.preview }}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium tracking-tight">Radius</h3>
              <span className="font-mono text-[11px] text-muted-foreground">
                {radius.toFixed(2)}rem
              </span>
            </div>
            <Slider
              value={[radius]}
              onValueChange={(v) => applyRadius(v[0] ?? 0)}
              min={0}
              max={1.5}
              step={0.05}
              aria-label="Adjust corner radius"
            />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium tracking-tight">Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={current === "dark" ? "default" : "outline"}
                className="h-12 justify-start gap-2"
                onClick={() => setTheme("dark")}
              >
                <Moon className="size-4" />
                Dark
              </Button>
              <Button
                variant={current === "light" ? "default" : "outline"}
                className="h-12 justify-start gap-2"
                onClick={() => setTheme("light")}
              >
                <Sun className="size-4" />
                Light
              </Button>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium tracking-tight">Live preview</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Tokens flowing through primitives
                </CardTitle>
                <CardDescription>
                  Button, badge, and card all react to your edits.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button size="sm">Button primary</Button>
                <Badge>Badge</Badge>
                <Badge variant="outline">Outline</Badge>
              </CardContent>
            </Card>
          </section>
        </div>

        <SheetFooter className="gap-1 border-t border-border/60 px-6 py-5 text-xs text-muted-foreground">
          <p>
            In production we ship this as part of our design-system deliverable.
          </p>
          <a
            href="https://alpina-tech.com/shadcn-development/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-foreground underline-offset-4 hover:underline"
          >
            Built by Alpina Tech
          </a>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
