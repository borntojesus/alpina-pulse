import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AlpinaTechMark } from "@/components/alpina-tech-mark";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="size-7" />
            <span className="text-sm font-semibold tracking-tight">
              Alpina CRM
            </span>
          </Link>
          <a
            href="https://alpina-tech.com/shadcn-development/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 border-l border-border/60 pl-2.5 text-xs text-muted-foreground transition-opacity hover:opacity-100 sm:inline-flex"
          >
            by <AlpinaTechMark height={14} />
          </a>
        </div>
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
