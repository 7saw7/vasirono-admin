import { PromotionsView } from "./_components/PromotionsView";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import {
  getPromotionBranchOptions,
  getPromotionsDashboard,
} from "@/features/backoffice/billing/promotions.service";

type PromotionsPageProps = {
  searchParams?: Promise<{
    search?: string;
    companyId?: string;
    active?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PromotionsPage({
  searchParams,
}: PromotionsPageProps) {
  const context = await getBackofficeContext("promotions.read");
  const params = (await searchParams) ?? {};

  const [data, branchOptions] = await Promise.all([
    getPromotionsDashboard({
      search: params.search,
      companyId: params.companyId,
      active: params.active,
      page: params.page,
      pageSize: params.pageSize,
    }),
    context.hasPermission("promotions.manage")
      ? getPromotionBranchOptions()
      : Promise.resolve([]),
  ]);

  return (
    <PromotionsView
      data={data}
      canManage={context.hasPermission("promotions.manage")}
      branchOptions={branchOptions}
    />
  );
}