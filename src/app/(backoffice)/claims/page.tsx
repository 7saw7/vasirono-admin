import { requireBackofficePage } from "@/lib/auth/page-guard";
import { ClaimRequestsView } from "./_components/ClaimRequestsView";
import { getClaimsList } from "@/features/backoffice/claims/service";

type ClaimsPageProps = {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    companyId?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ClaimsPage({
  searchParams,
}: ClaimsPageProps) {
  const context = await requireBackofficePage("claims.read");
  const params = (await searchParams) ?? {};

  const data = await getClaimsList({
    search: params.search,
    status: params.status,
    companyId: params.companyId,
    page: params.page,
    pageSize: params.pageSize,
  });

  return (
    <ClaimRequestsView
      data={data}
      canReview={context.hasPermission("claims.review")}
    />
  );
}