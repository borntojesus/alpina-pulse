import { CallDetailClient } from "@/components/app/calls/call-detail-client";

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CallDetailClient id={id} />;
}
