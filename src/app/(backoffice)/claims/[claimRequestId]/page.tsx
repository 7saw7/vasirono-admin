import { requireBackofficePage } from "@/lib/auth/page-guard";
import { notFound } from "next/navigation";
import { ClaimDetailView } from "./_components/ClaimDetailView";
import { getClaimDetail } from "@/features/backoffice/claims/service";

type ClaimDetailPageProps = {
  params: Promise<{
    claimRequestId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ClaimDetailPage({
  params,
}: ClaimDetailPageProps) {
  const context = await requireBackofficePage("claims.read");
  const resolvedParams = await params;
  const claimRequestId = Number(resolvedParams.claimRequestId);

  if (!Number.isInteger(claimRequestId) || claimRequestId <= 0) {
    notFound();
  }

  const data = await getClaimDetail(claimRequestId);

  if (!data) {
    notFound();
  }

  return (
    <ClaimDetailView
      data={data}
      canReview={context.hasPermission("claims.review")}
    />
  );
}