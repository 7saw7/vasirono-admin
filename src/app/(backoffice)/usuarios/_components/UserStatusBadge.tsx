import { StatusBadge } from "@/components/ui/StatusBadge";

type UserStatusBadgeProps = {
  verified: boolean;
};

export function UserStatusBadge({ verified }: UserStatusBadgeProps) {
  return (
    <StatusBadge
      label={verified ? "Verificado" : "No verificado"}
      tone={verified ? "success" : "warning"}
    />
  );
}