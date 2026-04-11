import { VerificationRequestsView } from "./_components/VerificationRequestsView";
import { getVerificationRequestsList } from "@/features/backoffice/verifications/service";

type VerificationsPageProps = {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    level?: string;
    assignedReviewerId?: string;
    companyId?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function VerificationsPage({
  searchParams,
}: VerificationsPageProps) {
  const params = (await searchParams) ?? {};

  const data = await getVerificationRequestsList({
    search: params.search,
    status: params.status,
    level: params.level,
    assignedReviewerId: params.assignedReviewerId,
    companyId: params.companyId,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <VerificationRequestsView data={data} />;
}