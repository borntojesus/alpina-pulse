import { ConversationDetailClient } from "@/components/app/conversations/conversation-detail-client";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConversationDetailClient id={id} />;
}
