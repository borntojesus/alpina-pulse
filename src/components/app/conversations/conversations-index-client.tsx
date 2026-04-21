"use client";

import Link from "next/link";
import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  Mail,
  MessageCircle,
  MessageSquare,
  SearchIcon,
  Send,
  Smartphone,
} from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { PersonAvatar } from "@/components/app/person-avatar";
import { KpiCard } from "@/components/app/kpi-card";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Channel, Conversation, Lead } from "@/lib/types";

const CHANNELS: { value: Channel | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "sms", label: "SMS" },
];

export function ChannelIcon({
  channel,
  className,
}: {
  channel: Channel;
  className?: string;
}) {
  const cls = cn("size-3.5", className);
  if (channel === "email") return <Mail className={cls} />;
  if (channel === "linkedin") return <Briefcase className={cls} />;
  if (channel === "whatsapp") return <MessageCircle className={cls} />;
  if (channel === "telegram") return <Send className={cls} />;
  return <Smartphone className={cls} />;
}

export const CHANNEL_LABEL: Record<Channel, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  sms: "SMS",
};

export const CHANNEL_ACCENT: Record<Channel, string> = {
  email: "text-muted-foreground",
  linkedin: "text-[color:var(--info,#3b82f6)]",
  whatsapp: "text-[color:var(--success)]",
  telegram: "text-sky-500",
  sms: "text-muted-foreground",
};

export function ConversationsIndexClient() {
  const hydrated = useHydrated();
  const conversations = usePulseStore((s) => s.conversations);
  const leads = usePulseStore((s) => s.leads);

  const [channel, setChannel] = React.useState<Channel | "all">("all");
  const [search, setSearch] = React.useState("");

  const leadMap = React.useMemo(
    () => new Map(leads.map((l) => [l.id, l])),
    [leads],
  );

  const sorted = React.useMemo(
    () =>
      [...conversations].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime(),
      ),
    [conversations],
  );

  const unreadByChannel = React.useMemo(() => {
    const map: Record<Channel | "all", number> = {
      all: 0,
      email: 0,
      linkedin: 0,
      whatsapp: 0,
      telegram: 0,
      sms: 0,
    };
    for (const c of conversations) {
      map[c.channel] += c.unread;
      map.all += c.unread;
    }
    return map;
  }, [conversations]);

  const filtered = React.useMemo(() => {
    let arr = sorted;
    if (channel !== "all") arr = arr.filter((c) => c.channel === channel);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((c) => {
        const lead = leadMap.get(c.leadId);
        const hay = `${lead?.firstName ?? ""} ${lead?.lastName ?? ""} ${
          lead?.company ?? ""
        } ${c.preview} ${c.subject ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return arr;
  }, [sorted, channel, search, leadMap]);

  // KPI computations
  const totalConversations = conversations.length;
  const totalUnread = unreadByChannel.all;

  const avgResponseMin = React.useMemo(() => {
    const deltas: number[] = [];
    for (const c of conversations) {
      const msgs = [...c.messages].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      for (let i = 1; i < msgs.length; i++) {
        if (
          msgs[i - 1].direction === "inbound" &&
          msgs[i].direction === "outbound"
        ) {
          const delta =
            new Date(msgs[i].timestamp).getTime() -
            new Date(msgs[i - 1].timestamp).getTime();
          if (delta >= 0) deltas.push(delta / 1000 / 60);
        }
      }
    }
    if (!deltas.length) return 17;
    const avg = deltas.reduce((s, v) => s + v, 0) / deltas.length;
    return Math.round(avg);
  }, [conversations]);

  const replyRate = React.useMemo(() => {
    let outbound = 0;
    let replied = 0;
    for (const c of conversations) {
      const msgs = [...c.messages].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      for (let i = 0; i < msgs.length; i++) {
        if (msgs[i].direction === "outbound") {
          outbound++;
          for (let j = i + 1; j < msgs.length; j++) {
            if (msgs[j].direction === "inbound") {
              replied++;
              break;
            }
          }
        }
      }
    }
    if (!outbound) return 31;
    return Math.round((replied / outbound) * 100);
  }, [conversations]);

  if (!hydrated) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Workspace"
        title="Conversations"
        description="Every thread across email, LinkedIn, WhatsApp, Telegram, and SMS — unified. Zero tabs, zero copy-paste between tools."
      />

      <div className="grid gap-4 px-4 py-6 md:grid-cols-4 md:px-8">
        <KpiCard
          label="Total conversations"
          value={totalConversations.toLocaleString()}
          hint="Across every channel"
        />
        <KpiCard
          label="Unread"
          value={totalUnread.toLocaleString()}
          tone={totalUnread > 0 ? "warning" : "neutral"}
          hint="Needs attention"
        />
        <KpiCard
          label="Avg response"
          value={`${avgResponseMin} min`}
          tone="positive"
          hint="Inbound → outbound"
        />
        <KpiCard
          label="Reply rate"
          value={`${replyRate}%`}
          tone="positive"
          hint="Outbound that got a reply"
        />
      </div>

      <div className="grid gap-4 px-4 pb-8 md:px-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Left pane: list */}
        <div className="flex flex-col gap-4">
          <Tabs
            value={channel}
            onValueChange={(v) => setChannel(v as Channel | "all")}
          >
            <TabsList className="flex-wrap">
              {CHANNELS.map((c) => (
                <TabsTrigger key={c.value} value={c.value} className="gap-1.5">
                  {c.value !== "all" ? (
                    <ChannelIcon channel={c.value as Channel} />
                  ) : null}
                  {c.label}
                  {unreadByChannel[c.value] > 0 ? (
                    <Badge
                      variant="accent"
                      className="h-4 min-w-4 px-1 text-[10px]"
                    >
                      {unreadByChannel[c.value]}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, or message"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 overflow-hidden rounded-xl border border-border/60 bg-card">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <MessageSquare className="size-8 text-muted-foreground" />
                <div className="text-sm font-medium">No conversations</div>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Try switching channels or clearing the search.
                </p>
              </div>
            ) : (
              filtered.slice(0, 80).map((c) => {
                const lead = leadMap.get(c.leadId);
                if (!lead) return null;
                return (
                  <ConversationRow key={c.id} conversation={c} lead={lead} />
                );
              })
            )}
          </div>
        </div>

        {/* Right pane: empty state */}
        <div className="hidden rounded-xl border border-border/60 bg-card lg:flex lg:min-h-[520px] lg:flex-col lg:items-center lg:justify-center lg:gap-4 lg:p-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marketing/empty-state.png"
            alt=""
            aria-hidden
            className="size-40 rounded-xl object-cover opacity-80"
          />
          <div className="text-center">
            <div className="text-base font-medium">Select a conversation</div>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Open any thread on the left to see the full history, sentiment,
              and reply inline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationRow({
  conversation,
  lead,
}: {
  conversation: Conversation;
  lead: Lead;
}) {
  const preview =
    conversation.preview.length > 80
      ? `${conversation.preview.slice(0, 80)}…`
      : conversation.preview;
  const subjectOrPreview =
    conversation.channel === "email" && conversation.subject
      ? conversation.subject
      : preview;

  return (
    <Link
      href={`/app/conversations/${conversation.id}`}
      className="group flex items-start gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-b-0 hover:border-primary/40 hover:bg-muted/30"
    >
      <PersonAvatar
        name={`${lead.firstName} ${lead.lastName}`}
        src={lead.avatar}
        size={36}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {lead.firstName} {lead.lastName}
          </span>
          <Badge variant="outline" className="gap-1 text-[10px]">
            <ChannelIcon
              channel={conversation.channel}
              className={CHANNEL_ACCENT[conversation.channel]}
            />
            {CHANNEL_LABEL[conversation.channel]}
          </Badge>
          {conversation.unread > 0 ? (
            <Badge variant="accent" className="h-4 text-[10px]">
              {conversation.unread} new
            </Badge>
          ) : null}
          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(conversation.lastMessageAt))} ago
          </span>
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {lead.company}
        </div>
        <div className="mt-1 line-clamp-1 text-sm text-muted-foreground group-hover:text-foreground">
          {subjectOrPreview}
        </div>
      </div>
    </Link>
  );
}
