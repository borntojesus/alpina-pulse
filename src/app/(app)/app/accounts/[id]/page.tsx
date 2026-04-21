import { AccountDetailClient } from "@/components/app/accounts/account-detail-client";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = decodeURIComponent(id);
  return <AccountDetailClient company={company} />;
}
