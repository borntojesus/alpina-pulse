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
  avatar: string;
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

export type Channel = "email" | "linkedin" | "whatsapp" | "telegram" | "sms";

export type MessageStatus = "sent" | "delivered" | "read" | "replied";

export type Message = {
  id: string;
  channel: Channel;
  direction: "inbound" | "outbound";
  timestamp: string;
  body: string;
  repId?: string;
  status?: MessageStatus;
  sentiment?: "positive" | "neutral" | "negative";
};

export type Conversation = {
  id: string;
  leadId: string;
  channel: Channel;
  subject?: string;
  messages: Message[];
  lastMessageAt: string;
  unread: number;
  preview: string;
};

export type CallTranscriptLine = {
  speaker: "rep" | "prospect";
  timestamp: number;
  text: string;
};

export type CallMomentType =
  | "commitment"
  | "objection"
  | "question"
  | "pricing"
  | "competitor"
  | "next_steps";

export type CallMoment = {
  type: CallMomentType;
  timestamp: number;
  speaker: "rep" | "prospect";
  text: string;
};

export type CallRecording = {
  id: string;
  leadId: string;
  dealId?: string;
  repId: string;
  startedAt: string;
  duration: number;
  talkRatio: number;
  sentiment: number;
  summary: string;
  transcript: CallTranscriptLine[];
  keyMoments: CallMoment[];
  waveform: number[];
};

export type SignalType =
  | "website_visit"
  | "pricing_page"
  | "content_download"
  | "email_open"
  | "email_click"
  | "linkedin_view"
  | "linkedin_engage"
  | "competitor_research"
  | "webinar_attend"
  | "form_fill"
  | "demo_request";

export type Signal = {
  id: string;
  leadId: string;
  timestamp: string;
  type: SignalType;
  detail: string;
  intent: "low" | "medium" | "high";
};

export type SequenceStepType = "email" | "call" | "linkedin" | "task";

export type SequenceStep = {
  id: string;
  day: number;
  type: SequenceStepType;
  subject?: string;
  body?: string;
  replyRate: number;
  openRate: number;
  bounceRate?: number;
};

export type Sequence = {
  id: string;
  name: string;
  ownerId: string;
  audience: string;
  status: "active" | "paused" | "draft";
  enrolled: number;
  delivered: number;
  opened: number;
  replied: number;
  booked: number;
  steps: SequenceStep[];
  createdAt: string;
};
