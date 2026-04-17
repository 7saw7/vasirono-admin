type ServicesStatusBadgeProps = {
  isActive: boolean;
};

export function ServicesStatusBadge({
  isActive,
}: ServicesStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-neutral-100 text-neutral-700 ring-neutral-200"
      }`}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}