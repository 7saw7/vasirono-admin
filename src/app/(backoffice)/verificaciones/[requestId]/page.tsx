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
  const resolvedParams = await params;
  const requestId = Number(resolvedParams.requestId);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    notFound();
  }

  const data = await getVerificationDetail(requestId);

  if (!data) {
    notFound();
  }

  return <VerificationRequestDetailView data={data} />;
}