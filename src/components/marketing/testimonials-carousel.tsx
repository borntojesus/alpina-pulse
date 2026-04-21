"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Quote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { avatarUrl, initials } from "@/lib/utils";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  seed: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We replaced three dashboards with Alpina in week one. The inbox ordering alone clawed back four hours per SDR every week — the pipeline view is what finally got the team off spreadsheets.",
    name: "Priya R.",
    role: "VP Sales, Series B SaaS",
    seed: "priya-vp-sales",
  },
  {
    quote:
      "Scoring that reps can actually explain to the buyer is the unlock. Forecasts stopped being a monthly argument because every stage move is logged and attributable.",
    name: "Marcus L.",
    role: "Head of Revenue Ops, Logistics platform",
    seed: "marcus-revops",
  },
  {
    quote:
      "Three role views, one product. Our SDRs, managers, and I all open the same app and see what we need — no more exports to slide decks the night before the board.",
    name: "Dana T.",
    role: "CEO, B2B marketplace",
    seed: "dana-ceo",
  },
  {
    quote:
      "The pilot shipped in a week and fit our ICP calibration on day three. It feels like Salesforce if someone finally cared about the reps using it.",
    name: "Owen K.",
    role: "CRO, Fintech",
    seed: "owen-cro",
  },
];

export function TestimonialsCarousel() {
  const autoplay = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  return (
    <section className="border-b border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col items-start gap-3">
          <Badge variant="outline" className="text-xs">
            Pilot signal
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Teams that ran our pilot saw value in week one.
          </h2>
          <p className="max-w-2xl text-balance text-sm leading-relaxed text-muted-foreground md:text-base">
            Revenue leaders across SaaS, logistics, marketplaces, and fintech
            shipped Alpina into their weekly cadence without a migration
            project.
          </p>
        </div>

        <Carousel
          opts={{ loop: true, align: "start" }}
          plugins={[autoplay.current]}
          className="mx-auto w-full"
        >
          <CarouselContent className="-ml-4">
            {TESTIMONIALS.map((t) => (
              <CarouselItem key={t.seed} className="pl-4 md:basis-1/2">
                <figure className="flex h-full flex-col gap-5 rounded-xl border border-border/60 bg-card p-6">
                  <Quote className="size-6 text-primary/70" aria-hidden />
                  <blockquote className="text-sm leading-relaxed text-foreground md:text-base">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-auto flex items-center gap-3 border-t border-border/50 pt-5">
                    <div className="relative size-10 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
                      <Image
                        src={avatarUrl(t.seed, "rep")}
                        alt=""
                        aria-hidden
                        fill
                        sizes="40px"
                        unoptimized
                      />
                      <span className="sr-only">{initials(t.name)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium tracking-tight">
                        {t.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.role}
                      </span>
                    </div>
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
