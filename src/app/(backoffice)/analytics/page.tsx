import { AnalyticsView } from "./_components/AnalyticsView";
import { getBackofficeAnalytics } from "@/features/backoffice/analytics/service";

type AnalyticsPageProps = {
  searchParams?: Promise<{
    companyId?: string;
    branchId?: string;
    from?: string;
    to?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const params = (await searchParams) ?? {};

  const data = await getBackofficeAnalytics({
    companyId: params.companyId,
    branchId: params.branchId,
    from: params.from,
    to: params.to,
  });

  return <AnalyticsView data={data} />;
}