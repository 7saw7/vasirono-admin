import { SubscriptionsView } from "./_components/SubscriptionsView";
import { requireBackofficePage } from "@/lib/auth/page-guard";
import { getSubscriptionsDashboard } from "@/features/backoffice/billing/subscriptions.service";
import { getPlansList } from "@/features/backoffice/billing/plans.service";
import { getSettingsDashboard } from "@/features/backoffice/settings/service";
import { getCompaniesList } from "@/features/backoffice/companies/service";

type Props = { searchParams?: Promise<{ search?: string; statusId?: string; planId?: string; companyId?: string; page?: string; pageSize?: string }> };
export const dynamic = "force-dynamic";

export default async function SubscriptionsPage({ searchParams }: Props) {
  const context = await requireBackofficePage("subscriptions.read");
  const params = (await searchParams) ?? {};
  const canManage = context.hasPermission("subscriptions.manage");
  const [data, plansResult, settingsResult, companiesResult] = await Promise.all([
    getSubscriptionsDashboard(params),
    getPlansList({ page: 1, pageSize: 100 }),
    getSettingsDashboard({ page: 1, pageSize: 100 }),
    canManage ? getCompaniesList({ page: 1, pageSize: 100 }) : Promise.resolve({ items: [] }),
  ]);
  const canonicalPlans = new Set(["free", "pro", "premium"]);
  const plans = plansResult.items
    .filter((item) => canonicalPlans.has(item.name.trim().toLowerCase()))
    .map((item) => ({ value: item.id, label: item.name }));
  const statuses = settingsResult.subscriptionStatuses.items.map(item => ({ value: item.id, label: item.name }));
  const companies = companiesResult.items.map(item => ({ value: item.companyId, label: `${item.name} (#${item.companyId})` }));
  return <SubscriptionsView data={data} canManage={canManage} plans={plans} statuses={statuses} companies={companies}/>;
}
