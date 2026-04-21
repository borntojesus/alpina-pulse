import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-7" />
          <span className="text-sm font-semibold tracking-tight">
            Alpina Pulse
          </span>
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
            / by Alpina Tech
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#product" className="hover:text-foreground">
            Product
          </a>
          <a href="#personas" className="hover:text-foreground">
            Personas
          </a>
          <a href="#how" className="hover:text-foreground">
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/contact">Submit a lead</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/app">Open demo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
