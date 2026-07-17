import { PlansView } from "./_components/PlansView";
import { requireBackofficePage } from "@/lib/auth/page-guard";
import { getPlansDashboard } from "@/features/backoffice/billing/plans.service";

type PlansPageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const context = await requireBackofficePage("plans.read");
  const params = (await searchParams) ?? {};
  const data = await getPlansDashboard({
    search: params.search,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <PlansView data={data} canManage={context.hasPermission("plans.manage")} />;
}
