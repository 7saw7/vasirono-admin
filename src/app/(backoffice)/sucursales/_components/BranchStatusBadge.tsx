import { StatusBadge } from "@/components/ui/StatusBadge";

type BranchStatusBadgeProps = {
  isActive: boolean;
  isMain?: boolean;
};

export function BranchStatusBadge({
  isActive,
  isMain = false,
}: BranchStatusBadgeProps) {
  if (!isActive) {
    return <StatusBadge label="Inactiva" tone="danger" />;
  }

  if (isMain) {
    return <StatusBadge label="Principal" tone="info" />;
  }

  return <StatusBadge label="Activa" tone="success" />;
}