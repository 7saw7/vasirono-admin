import { ReviewsView } from "./_components/ReviewsView";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getReviewsList } from "@/features/backoffice/reviews/service";

type ReviewsPageProps = {
  searchParams?: Promise<{
    search?: string;
    validated?: string;
    hidden?: string;
    branchId?: string;
    companyId?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const context = await getBackofficeContext("reviews.read");
  const params = (await searchParams) ?? {};

  const data = await getReviewsList({
    search: params.search,
    validated: params.validated,
    hidden: params.hidden,
    branchId: params.branchId,
    companyId: params.companyId,
    page: params.page,
    pageSize: params.pageSize,
  });

  return (
    <ReviewsView
      data={data}
      canModerate={context.hasPermission("reviews.moderate")}
    />
  );
}