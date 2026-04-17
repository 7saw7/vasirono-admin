import { PromotionsManagementClient } from "./PromotionsManagementClient";
import type {
  PromotionBranchOption,
  PromotionsDashboardData,
} from "@/features/backoffice/billing/types";

type PromotionsViewProps = {
  data: PromotionsDashboardData;
  canManage: boolean;
  branchOptions: PromotionBranchOption[];
};

export function PromotionsView({
  data,
  canManage,
  branchOptions,
}: PromotionsViewProps) {
  return (
    <PromotionsManagementClient
      data={data}
      canManage={canManage}
      branchOptions={branchOptions}
    />
  );
}