export type CompanySize = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";

export type Industry =
  | "SaaS"
  | "eCommerce"
  | "Fintech"
  | "Healthcare"
  | "Manufacturing"
  | "Media";

export type Source =
  | "Website"
  | "LinkedIn Ads"
  | "Google Ads"
  | "Referral"
  | "Outbound"
  | "Event"
  | "Content";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "converted";

export type DealStage =
  | "discovery"
  | "proposal"
  | "negotiation"
  | "closed-won"
  | "closed-lost";

export type RepRole = "SDR" | "AE" | "Manager";

export type Role = "SDR" | "Manager" | "Exec";

export type ScoreCategory = "fit" | "intent" | "engagement";

export type ScoreComponent = {
  label: string;
  points: number;
  category: ScoreCategory;
};

export type ActivityType =
  | "email"
  | "call"
  | "meeting"
  | "note"
  | "stage_change"
  | "score_change"
  | "status_change"
  | "created";

export type Activity = {
  id: string;
  type: ActivityType;
  timestamp: string;
  repId?: string;
  description: string;
};

export type Lead = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  companySize: CompanySize;
  industry: Industry;
  country: string;
  source: Source;
  utm: { source?: string; medium?: string; campaign?: string };
  message?: string;
  score: number;
  scoreBreakdown: ScoreComponent[];
  status: LeadStatus;
  assignedTo?: string;
  tags: string[];
  activities: Activity[];
};

export type Deal = {
  id: string;
  leadId: string;
  name: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  lostReason?: string;
};

export type Rep = {
  id: string;
  name: string;
  avatar: string;
  role: RepRole;
  quotaQuarter: number;
  achievedQuarter: number;
};
