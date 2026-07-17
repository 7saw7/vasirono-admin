import { PromotionsView } from "./_components/PromotionsView";
import { requireBackofficePage } from "@/lib/auth/page-guard";
import { getAdminPromotionsDashboard } from "@/features/backoffice/promotions/service";

type PromotionsPageProps = {
  searchParams?: Promise<{
    search?: string;
    companyId?: string;
    branchId?: string;
    districtId?: string;
    status?: string;
    active?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PromotionsPage({
  searchParams,
}: PromotionsPageProps) {
  const context = await requireBackofficePage("promotions.read");
  const params = (await searchParams) ?? {};
  const data = await getAdminPromotionsDashboard(params);

  return (
    <PromotionsView
      data={data}
      canModerate={context.hasPermission("promotions.moderate")}
      canUpdateStatus={context.hasPermission("promotions.updateStatus")}
    />
  );
}
