import { StatusBadge } from "@/components/ui/StatusBadge";

type CompanyStatusBadgeProps = {
  status: string;
  code?: string;
};

function mapTone(codeOrStatus: string | undefined) {
  const normalized = (codeOrStatus ?? "").toLowerCase();

  if (
    ["verified", "approved", "active", "validado"].includes(normalized)
  ) {
    return "success" as const;
  }

  if (
    ["pending", "submitted", "in_review", "reviewing", "pendiente"].includes(
      normalized
    )
  ) {
    return "warning" as const;
  }

  if (
    ["rejected", "suspended", "failed", "blocked"].includes(normalized)
  ) {
    return "danger" as const;
  }

  return "neutral" as const;
}

export function CompanyStatusBadge({
  status,
  code,
}: CompanyStatusBadgeProps) {
  return <StatusBadge label={status} tone={mapTone(code ?? status)} />;
}