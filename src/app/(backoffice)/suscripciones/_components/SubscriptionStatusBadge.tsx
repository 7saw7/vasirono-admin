type SubscriptionStatusBadgeProps = {
  statusName: string | null;
};

function getTone(statusName: string | null) {
  const normalized = (statusName ?? "").trim().toLowerCase();

  if (["active", "activo", "activa"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (["paused", "pausado", "suspended", "suspendido"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (
    ["expired", "expirado", "cancelled", "cancelado", "inactive", "inactivo"].includes(
      normalized
    )
  ) {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-neutral-100 text-neutral-700 ring-neutral-200";
}

export function SubscriptionStatusBadge({
  statusName,
}: SubscriptionStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getTone(
        statusName
      )}`}
    >
      {statusName ?? "Sin estado"}
    </span>
  );
}