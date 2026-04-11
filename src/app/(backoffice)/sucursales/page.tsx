import { BranchesView } from "./_components/BranchesView";
import { getBranchesList } from "@/features/backoffice/branches/service";

type BranchesPageProps = {
  searchParams?: Promise<{
    search?: string;
    companyId?: string;
    districtId?: string;
    isActive?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function BranchesPage({
  searchParams,
}: BranchesPageProps) {
  const params = (await searchParams) ?? {};

  const data = await getBranchesList({
    search: params.search,
    companyId: params.companyId,
    districtId: params.districtId,
    isActive: params.isActive,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <BranchesView data={data} />;
}