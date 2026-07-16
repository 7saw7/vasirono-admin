import { requireBackofficePage } from "@/lib/auth/page-guard";
import { ReviewReportsView } from "./_components/ReviewReportsView";
import { getReviewReportsList } from "@/features/backoffice/review-reports/service";

type ReviewReportsPageProps = {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    companyId?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ReviewReportsPage({
  searchParams,
}: ReviewReportsPageProps) {
  const context = await requireBackofficePage("reviewReports.read");
  const params = (await searchParams) ?? {};

  const data = await getReviewReportsList({
    search: params.search,
    status: params.status,
    companyId: params.companyId,
    page: params.page,
    pageSize: params.pageSize,
  });

  return (
    <ReviewReportsView
      data={data}
      canResolve={context.hasPermission("reviewReports.resolve")}
    />
  );
}