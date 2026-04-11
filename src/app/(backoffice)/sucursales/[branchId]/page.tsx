import { notFound } from "next/navigation";
import { BranchDetailView } from "./_components/BranchDetailView";
import { getBranchDetail } from "@/features/backoffice/branches/service";

type BranchDetailPageProps = {
  params: Promise<{
    branchId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function BranchDetailPage({
  params,
}: BranchDetailPageProps) {
  const resolvedParams = await params;
  const branchId = Number(resolvedParams.branchId);

  if (!Number.isInteger(branchId) || branchId <= 0) {
    notFound();
  }

  const data = await getBranchDetail(branchId);

  if (!data) {
    notFound();
  }

  return <BranchDetailView data={data} />;
}