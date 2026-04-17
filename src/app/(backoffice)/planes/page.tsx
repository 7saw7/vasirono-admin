import { PlansView } from "./_components/PlansView";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
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
  await getBackofficeContext("plans.read");

  const params = (await searchParams) ?? {};

  const data = await getPlansDashboard({
    search: params.search,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <PlansView data={data} />;
}