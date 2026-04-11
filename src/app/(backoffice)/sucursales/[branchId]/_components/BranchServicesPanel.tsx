import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BranchDetailService } from "@/features/backoffice/branches/types";

type BranchServicesPanelProps = {
  services: BranchDetailService[];
};

export function BranchServicesPanel({ services }: BranchServicesPanelProps) {
  return (
    <SectionCard
      title="Servicios"
      description="Servicios asociados y disponibilidad por sucursal."
    >
      {services.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay servicios asociados.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.serviceId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {service.name}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">{service.code}</p>
                  {service.description ? (
                    <p className="mt-2 text-sm text-neutral-600">
                      {service.description}
                    </p>
                  ) : null}
                </div>

                <StatusBadge
                  label={service.isAvailable ? "Disponible" : "No disponible"}
                  tone={service.isAvailable ? "success" : "neutral"}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}