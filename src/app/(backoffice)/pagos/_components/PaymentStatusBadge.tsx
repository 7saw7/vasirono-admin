type PaymentStatusBadgeProps = {
  statusName: string | null;
};

function getStatusTone(statusName: string | null) {
  const normalized = (statusName ?? "").trim().toLowerCase();

  if (["paid", "completed", "pagado", "completado"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (["pending", "pendiente"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (["failed", "rechazado", "fallido", "cancelled", "cancelado"].includes(normalized)) {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-neutral-100 text-neutral-700 ring-neutral-200";
}

export function PaymentStatusBadge({
  statusName,
}: PaymentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusTone(
        statusName
      )}`}
    >
      {statusName ?? "Sin estado"}
    </span>
  );
}