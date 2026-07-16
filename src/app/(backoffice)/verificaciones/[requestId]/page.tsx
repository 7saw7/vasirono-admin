import { requireBackofficePage } from "@/lib/auth/page-guard";
import { notFound } from "next/navigation";
import { VerificationRequestDetailView } from "./_components/VerificationRequestDetailView";
import { getVerificationDetail } from "@/features/backoffice/verifications/service";

type VerificationDetailPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function VerificationDetailPage({
  params,
}: VerificationDetailPageProps) {
  const context = await requireBackofficePage("verifications.read");
  const resolvedParams = await params;
  const requestId = Number(resolvedParams.requestId);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    notFound();
  }

  const data = await getVerificationDetail(requestId);

  if (!data) {
    notFound();
  }

  return (
    <VerificationRequestDetailView
      data={data}
      currentUserId={context.user.id}
      canAssign={context.hasPermission("verifications.assign")}
      canReviewDocuments={context.hasPermission(
        "verifications.documents.review"
      )}
      canDecide={context.hasPermission("verifications.decide")}
    />
  );
}