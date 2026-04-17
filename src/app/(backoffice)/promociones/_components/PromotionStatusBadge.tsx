type PromotionStatusBadgeProps = {
  active: boolean;
};

export function PromotionStatusBadge({
  active,
}: PromotionStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-neutral-100 text-neutral-700 ring-neutral-200"
      }`}
    >
      {active ? "Activa" : "Inactiva"}
    </span>
  );
}