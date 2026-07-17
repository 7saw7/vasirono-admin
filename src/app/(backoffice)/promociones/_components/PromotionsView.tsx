import { PromotionsManagementClient } from "./PromotionsManagementClient";
import type { PromotionsDashboardData } from "@/features/backoffice/promotions/types";

type PromotionsViewProps = {
  data: PromotionsDashboardData;
  canModerate: boolean;
  canUpdateStatus: boolean;
};

export function PromotionsView({
  data,
  canModerate,
  canUpdateStatus,
}: PromotionsViewProps) {
  return (
    <PromotionsManagementClient
      data={data}
      canModerate={canModerate}
      canUpdateStatus={canUpdateStatus}
    />
  );
}
