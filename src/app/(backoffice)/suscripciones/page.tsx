import { SubscriptionsView } from "./_components/SubscriptionsView";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getSubscriptionsDashboard } from "@/features/backoffice/billing/subscriptions.service";

type SubscriptionsPageProps = {
  searchParams?: Promise<{
    search?: string;
    statusId?: string;
    planId?: string;
    companyId?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  await getBackofficeContext("subscriptions.read");

  const params = (await searchParams) ?? {};

  const data = await getSubscriptionsDashboard({
    search: params.search,
    statusId: params.statusId,
    planId: params.planId,
    companyId: params.companyId,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <SubscriptionsView data={data} />;
}