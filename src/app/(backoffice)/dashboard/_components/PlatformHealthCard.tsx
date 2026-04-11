import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BackofficeDashboardData } from "@/features/backoffice/dashboard/types";

type PlatformHealthCardProps = {
  items: BackofficeDashboardData["platformHealth"];
};

function mapTone(status: "healthy" | "warning" | "critical") {
  if (status === "healthy") return "success";
  if (status === "warning") return "warning";
  return "danger";
}

export function PlatformHealthCard({ items }: PlatformHealthCardProps) {
  return (
    <SectionCard
      title="Salud operativa"
      description="Resumen rápido del estado general de colas y actividad."
    >
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-100 p-4"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">{item.label}</p>
              {item.helpText ? (
                <p className="mt-1 text-sm text-neutral-500">{item.helpText}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold text-neutral-950">{item.value}</p>
              <StatusBadge
                label={
                  item.status === "healthy"
                    ? "Saludable"
                    : item.status === "warning"
                    ? "Atención"
                    : "Crítico"
                }
                tone={mapTone(item.status)}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}