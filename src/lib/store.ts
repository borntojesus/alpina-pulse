"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateSeed } from "./seed";
import { calculateScore } from "./scoring";
import { avatarUrl } from "./utils";
import type {
  Activity,
  Deal,
  DealStage,
  Lead,
  LeadStatus,
  Rep,
  Role,
} from "./types";

const SEED_VERSION = 2;

type State = {
  seedVersion: number;
  role: Role;
  hasSeenWelcome: boolean;
  leads: Lead[];
  deals: Deal[];
  reps: Rep[];
  lastSubmittedLeadId: string | null;
};

type Actions = {
  setRole: (role: Role) => void;
  markWelcomeSeen: () => void;
  resetDemo: () => void;
  addLead: (input: NewLeadInput) => Lead;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  assignLead: (leadId: string, repId: string | undefined) => void;
  addActivity: (
    leadId: string,
    activity: Omit<Activity, "id" | "timestamp"> & { timestamp?: string },
  ) => void;
  moveDealStage: (dealId: string, stage: DealStage) => void;
  convertLeadToDeal: (leadId: string, value: number) => Deal | null;
};

export type NewLeadInput = Pick<
  Lead,
  | "firstName"
  | "lastName"
  | "email"
  | "company"
  | "companySize"
  | "industry"
  | "country"
  | "source"
  | "message"
> & { utm?: Lead["utm"] };

function freshState(): Omit<State, "role" | "hasSeenWelcome"> {
  const seed = generateSeed();
  return {
    seedVersion: SEED_VERSION,
    leads: seed.leads,
    deals: seed.deals,
    reps: seed.reps,
    lastSubmittedLeadId: null,
  };
}

function initialState(): State {
  return {
    role: "SDR",
    hasSeenWelcome: false,
    ...freshState(),
  };
}

export const usePulseStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState(),

      setRole: (role) => set({ role }),
      markWelcomeSeen: () => set({ hasSeenWelcome: true }),

      resetDemo: () =>
        set(() => ({
          ...freshState(),
          hasSeenWelcome: false,
        })),

      addLead: (input) => {
        const createdAt = new Date().toISOString();
        const id = `lead-user-${Date.now()}`;
        const activities: Activity[] = [
          {
            id: `${id}-created`,
            type: "created",
            timestamp: createdAt,
            description: "Lead captured via public form",
          },
        ];
        const { score, breakdown } = calculateScore({
          companySize: input.companySize,
          industry: input.industry,
          source: input.source,
          country: input.country,
          message: input.message,
          activities,
        });
        const lead: Lead = {
          id,
          createdAt,
          firstName: input.firstName,
          lastName: input.lastName,
          avatar: avatarUrl(`${input.firstName} ${input.lastName}`, "lead"),
          email: input.email,
          company: input.company,
          companySize: input.companySize,
          industry: input.industry,
          country: input.country,
          source: input.source,
          utm: input.utm ?? {},
          message: input.message,
          score,
          scoreBreakdown: breakdown,
          status: "new",
          tags: ["highlight"],
          activities,
        };
        set((s) => ({
          leads: [lead, ...s.leads],
          lastSubmittedLeadId: id,
        }));
        return lead;
      },

      updateLeadStatus: (leadId, status) => {
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  status,
                  activities: [
                    ...l.activities,
                    {
                      id: `${leadId}-status-${Date.now()}`,
                      type: "status_change",
                      timestamp: new Date().toISOString(),
                      description: `Status changed to ${status}`,
                    },
                  ],
                }
              : l,
          ),
        }));
      },

      assignLead: (leadId, repId) => {
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  assignedTo: repId,
                  activities: [
                    ...l.activities,
                    {
                      id: `${leadId}-assign-${Date.now()}`,
                      type: "note",
                      timestamp: new Date().toISOString(),
                      repId,
                      description: repId
                        ? `Assigned to ${s.reps.find((r) => r.id === repId)?.name ?? "rep"}`
                        : "Unassigned",
                    },
                  ],
                }
              : l,
          ),
        }));
      },

      addActivity: (leadId, a) => {
        const entry: Activity = {
          id: `${leadId}-act-${Date.now()}`,
          timestamp: a.timestamp ?? new Date().toISOString(),
          type: a.type,
          description: a.description,
          repId: a.repId,
        };
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === leadId
              ? { ...l, activities: [...l.activities, entry] }
              : l,
          ),
        }));
      },

      moveDealStage: (dealId, stage) => {
        const now = new Date().toISOString();
        set((s) => {
          const deal = s.deals.find((d) => d.id === dealId);
          if (!deal) return s;
          const updatedDeal: Deal = {
            ...deal,
            stage,
            probability:
              stage === "closed-won"
                ? 100
                : stage === "closed-lost"
                  ? 0
                  : stage === "discovery"
                    ? 25
                    : stage === "proposal"
                      ? 50
                      : 70,
            updatedAt: now,
          };
          const updatedLeads = s.leads.map((l) =>
            l.id === deal.leadId
              ? {
                  ...l,
                  activities: [
                    ...l.activities,
                    {
                      id: `${l.id}-stage-${Date.now()}`,
                      type: "stage_change" as const,
                      timestamp: now,
                      description: `Deal moved to ${stage}`,
                    },
                  ],
                }
              : l,
          );
          return {
            deals: s.deals.map((d) => (d.id === dealId ? updatedDeal : d)),
            leads: updatedLeads,
          };
        });
      },

      convertLeadToDeal: (leadId, value) => {
        const state = get();
        const lead = state.leads.find((l) => l.id === leadId);
        if (!lead) return null;
        const now = new Date().toISOString();
        const close = new Date();
        close.setDate(close.getDate() + 45);
        const deal: Deal = {
          id: `deal-user-${Date.now()}`,
          leadId,
          name: `${lead.company} — ${lead.industry} expansion`,
          value,
          stage: "discovery",
          probability: 25,
          expectedCloseDate: close.toISOString(),
          ownerId: lead.assignedTo ?? state.reps[2].id,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          deals: [deal, ...s.deals],
          leads: s.leads.map((l) =>
            l.id === leadId ? { ...l, status: "qualified" } : l,
          ),
        }));
        return deal;
      },
    }),
    {
      name: "alpina-pulse-store",
      version: SEED_VERSION,
      partialize: (s) => ({
        seedVersion: s.seedVersion,
        role: s.role,
        hasSeenWelcome: s.hasSeenWelcome,
        leads: s.leads,
        deals: s.deals,
        reps: s.reps,
        lastSubmittedLeadId: s.lastSubmittedLeadId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.seedVersion !== SEED_VERSION) {
          Object.assign(state, freshState(), { hasSeenWelcome: false });
        }
      },
    },
  ),
);
