import { DealDetailClient } from "@/components/app/pipeline/deal-detail-client";

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DealDetailClient id={id} />;
}
