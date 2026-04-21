"use client";

import * as React from "react";
import { toast } from "sonner";
import { CircleStop, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePulseStore } from "@/lib/store";
import { DEAL_STAGES, STAGE_LABEL } from "@/lib/selectors";
import type {
  DealStage,
  Industry,
  Source,
  CompanySize,
  Lead,
} from "@/lib/types";
import { avatarUrl } from "@/lib/utils";

const INDUSTRIES: Industry[] = [
  "SaaS",
  "eCommerce",
  "Fintech",
  "Healthcare",
  "Manufacturing",
  "Media",
];
const SOURCES: Source[] = [
  "Website",
  "LinkedIn Ads",
  "Google Ads",
  "Referral",
  "Outbound",
  "Content",
];
const COMPANY_SIZES: CompanySize[] = ["11-50", "51-200", "201-1000", "1000+"];
const FIRST = [
  "Morgan",
  "Alex",
  "Riley",
  "Taylor",
  "Jordan",
  "Sage",
  "Rowan",
  "Finley",
  "Quinn",
  "Casey",
  "Emerson",
  "Harper",
];
const LAST = [
  "Okafor",
  "Becker",
  "Novak",
  "Ivanov",
  "Chen",
  "Santos",
  "Dupont",
  "Reyes",
  "Nishida",
  "Olsen",
  "Al-Khatib",
  "Abbadi",
];
const COMPANY_ROOTS = [
  "Stellar",
  "Northwind",
  "Aster",
  "Quantum",
  "Meridian",
  "Helix",
  "Forge",
  "Bluefin",
  "Redshift",
];
const COMPANY_TAILS = [
  "Labs",
  "Cloud",
  "Systems",
  "Analytics",
  "Works",
  "Networks",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeCompany(): string {
  return `${pick(COMPANY_ROOTS)} ${pick(COMPANY_TAILS)}`;
}

export function useAutoPlay() {
  const [enabled, setEnabled] = React.useState(false);
  const addLead = usePulseStore((s) => s.addLead);
  const deals = usePulseStore((s) => s.deals);
  const leads = usePulseStore((s) => s.leads);
  const moveDealStage = usePulseStore((s) => s.moveDealStage);
  const updateLeadStatus = usePulseStore((s) => s.updateLeadStatus);

  const dealsRef = React.useRef(deals);
  const leadsRef = React.useRef(leads);
  React.useEffect(() => {
    dealsRef.current = deals;
  }, [deals]);
  React.useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);

  React.useEffect(() => {
    if (!enabled) return;

    const leadTick = setInterval(() => {
      const firstName = pick(FIRST);
      const lastName = pick(LAST);
      const company = makeCompany();
      const l = addLead({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, "")}.com`,
        company,
        companySize: pick(COMPANY_SIZES),
        industry: pick(INDUSTRIES),
        country: pick([
          "United States",
          "Germany",
          "United Kingdom",
          "Canada",
          "Australia",
        ]),
        source: pick(SOURCES),
      });
      // Seed-generated avatar is already set via addLead → avatarUrl; nothing more to do.
      void l;
      toast.success("New lead landed", {
        description: `${firstName} ${lastName} from ${company}`,
        icon: (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl(`${firstName} ${lastName}`, "lead")}
            alt=""
            className="size-5 rounded-full"
          />
        ),
      });
    }, 9000);

    const stageTick = setInterval(() => {
      const open = dealsRef.current.filter(
        (d) => d.stage !== "closed-won" && d.stage !== "closed-lost",
      );
      if (open.length === 0) return;
      const d = pick(open);
      const idx = DEAL_STAGES.indexOf(d.stage);
      const next = DEAL_STAGES[Math.min(idx + 1, 3)] as DealStage;
      if (next === d.stage) return;
      moveDealStage(d.id, next);
      toast("Deal advanced", {
        description: `${d.name} → ${STAGE_LABEL[next]}`,
      });
    }, 13500);

    const statusTick = setInterval(() => {
      const candidates = leadsRef.current.filter(
        (l: Lead) => l.status === "new" || l.status === "contacted",
      );
      if (candidates.length === 0) return;
      const l = pick(candidates);
      const nextStatus =
        l.status === "new"
          ? "contacted"
          : Math.random() > 0.5
            ? "qualified"
            : "unqualified";
      updateLeadStatus(l.id, nextStatus);
      toast("Lead status updated", {
        description: `${l.firstName} ${l.lastName} → ${nextStatus}`,
      });
    }, 17000);

    return () => {
      clearInterval(leadTick);
      clearInterval(stageTick);
      clearInterval(statusTick);
    };
  }, [enabled, addLead, moveDealStage, updateLeadStatus]);

  return { enabled, setEnabled };
}

export function AutoPlayToggle() {
  const { enabled, setEnabled } = useAutoPlay();

  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size="sm"
      onClick={() => {
        setEnabled(!enabled);
        if (!enabled) {
          toast.success("Auto-play ON", {
            description: "Synthetic leads & stage changes every 10-17s.",
          });
        } else {
          toast("Auto-play OFF");
        }
      }}
      className="relative gap-2"
    >
      {enabled ? (
        <>
          <CircleStop className="size-3.5" />
          <span className="hidden sm:inline">Stop demo</span>
          <span
            className="absolute -right-1 -top-1 size-2 animate-ping rounded-full bg-[color:var(--success)]"
            aria-hidden
          />
          <span
            className="absolute -right-1 -top-1 size-2 rounded-full bg-[color:var(--success)]"
            aria-hidden
          />
        </>
      ) : (
        <>
          <Play className="size-3.5" />
          <span className="hidden sm:inline">Play demo</span>
        </>
      )}
    </Button>
  );
}
