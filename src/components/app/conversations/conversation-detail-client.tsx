"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { usePulseStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/app/page-header";
import { PersonAvatar } from "@/components/app/person-avatar";
import { DashboardSkeleton } from "@/components/app/dashboard/dashboard-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Channel, Message } from "@/lib/types";
import {
  CHANNEL_ACCENT,
  CHANNEL_LABEL,
  ChannelIcon,
} from "./conversations-index-client";

const CHANNEL_BUBBLE_STYLE: Record<
  Channel,
  { inbound: string; outbound: string; rounded: string }
> = {
  email: {
    inbound: "bg-muted/60",
    outbound: "bg-primary/15 text-foreground",
    rounded: "rounded-lg",
  },
  linkedin: {
    inbound: "bg-blue-500/10",
    outbound: "bg-blue-500/25",
    rounded: "rounded-lg",
  },
  whatsapp: {
    inbound: "bg-[color:var(--success)]/10",
    outbound: "bg-[color:var(--success)]/25",
    rounded: "rounded-2xl",
  },
  telegram: {
    inbound: "bg-sky-500/10",
    outbound: "bg-sky-500/25",
    rounded: "rounded-2xl",
  },
  sms: {
    inbound: "bg-muted",
    outbound: "bg-muted-foreground/20",
    rounded: "rounded-full px-4",
  },
};

export function ConversationDetailClient({ id }: { id: string }) {
  const hydrated = useHydrated();
  const conversations = usePulseStore((s) => s.conversations);
  const leads = usePulseStore((s) => s.leads);
  const reps = usePulseStore((s) => s.reps);

  if (!hydrated) return <DashboardSkeleton />;

  const conversation = conversations.find((c) => c.id === id);
  if (!conversation) return notFound();

  const lead = leads.find((l) => l.id === conversation.leadId);
  if (!lead) return notFound();

  const repMap = new Map(reps.map((r) => [r.id, r]));
  const sortedMessages = [...conversation.messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const style = CHANNEL_BUBBLE_STYLE[conversation.channel];

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        eyebrow={`${CHANNEL_LABEL[conversation.channel]} · ${conversation.id}`}
        title={conversation.subject ?? `${lead.firstName} ${lead.lastName}`}
        description={`${lead.company} · ${lead.industry} · ${lead.country}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ChannelIcon
                channel={conversation.channel}
                className={CHANNEL_ACCENT[conversation.channel]}
              />
              {CHANNEL_LABEL[conversation.channel]}
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/conversations">
                <ArrowLeft className="size-3.5" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 px-4 py-6 md:px-8">
        {/* Lead summary */}
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
          <PersonAvatar
            name={`${lead.firstName} ${lead.lastName}`}
            src={lead.avatar}
            size={44}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">
              {lead.firstName} {lead.lastName}
            </div>
            <div className="text-xs text-muted-foreground">
              {lead.company} · {lead.email}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Score {lead.score}
          </Badge>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/app/leads/${lead.id}`}>View lead</Link>
          </Button>
        </div>

        {/* Thread */}
        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 md:p-6">
          {conversation.channel === "email" && conversation.subject ? (
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 font-mono text-xs text-muted-foreground">
              From: {lead.email} · Subject: {conversation.subject}
            </div>
          ) : null}

          {sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <MessageSquare className="size-6" />
              <div className="text-sm">No messages yet.</div>
            </div>
          ) : (
            sortedMessages.map((m) => {
              const rep = m.repId ? repMap.get(m.repId) : undefined;
              return (
                <MessageBubble
                  key={m.id}
                  message={m}
                  channel={conversation.channel}
                  style={style}
                  leadName={`${lead.firstName} ${lead.lastName}`}
                  leadAvatar={lead.avatar}
                  repName={rep?.name ?? "Rep"}
                  repAvatar={rep?.avatar}
                />
              );
            })
          )}
        </div>

        {/* Composer */}
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4">
          {/* read-only demo */}
          <Textarea
            disabled
            placeholder={`Reply on ${CHANNEL_LABEL[conversation.channel]}… (disabled in demo)`}
            className="min-h-[88px] resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Composer is read-only in this demo.
            </span>
            <Button disabled size="sm">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  channel,
  style,
  leadName,
  leadAvatar,
  repName,
  repAvatar,
}: {
  message: Message;
  channel: Channel;
  style: { inbound: string; outbound: string; rounded: string };
  leadName: string;
  leadAvatar: string;
  repName: string;
  repAvatar?: string;
}) {
  const isOutbound = message.direction === "outbound";
  const bubbleTone = isOutbound ? style.outbound : style.inbound;
  const sentimentBadge =
    !isOutbound && message.sentiment && message.sentiment !== "neutral" ? (
      <Badge
        variant={message.sentiment === "positive" ? "success" : "warning"}
        className="text-[10px]"
      >
        {message.sentiment}
      </Badge>
    ) : null;

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOutbound ? "justify-end" : "justify-start",
      )}
    >
      {!isOutbound ? (
        <PersonAvatar name={leadName} src={leadAvatar} size={28} />
      ) : null}
      <div
        className={cn(
          "flex max-w-[72%] flex-col gap-1",
          isOutbound ? "items-end" : "items-start",
        )}
      >
        {channel === "email" ? (
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            From: {isOutbound ? repName : leadName}
          </div>
        ) : null}
        <div
          className={cn(
            "relative px-3 py-2 text-sm shadow-sm",
            style.rounded,
            bubbleTone,
          )}
        >
          {sentimentBadge ? (
            <div className="absolute -top-2 right-2">{sentimentBadge}</div>
          ) : null}
          <div className="whitespace-pre-wrap">{message.body}</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{format(new Date(message.timestamp), "PPp")}</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(message.timestamp))} ago</span>
          {message.status ? (
            <>
              <span>·</span>
              <span className="capitalize">{message.status}</span>
            </>
          ) : null}
        </div>
      </div>
      {isOutbound ? (
        <PersonAvatar name={repName} src={repAvatar} size={28} />
      ) : null}
    </div>
  );
}
