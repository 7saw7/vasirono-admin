import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import { formatNumber } from "@/lib/utils/numbers";
import type { BranchDetailAforoReport } from "@/features/backoffice/branches/types";

type BranchAforoPanelProps = {
  reports: BranchDetailAforoReport[];
};

function getTone(code: string | null) {
  const normalized = (code ?? "").toLowerCase();

  if (["alto", "high", "full", "busy"].includes(normalized)) return "danger" as const;
  if (["medio", "medium", "normal"].includes(normalized)) return "warning" as const;
  if (["bajo", "low", "empty"].includes(normalized)) return "success" as const;
  return "neutral" as const;
}

export function BranchAforoPanel({ reports }: BranchAforoPanelProps) {
  return (
    <SectionCard
      title="Aforo reciente"
      description="Últimos reportes de aforo asociados a la sucursal."
    >
      {reports.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay reportes de aforo registrados.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <article
              key={report.reportId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-900">
                    Reporte #{report.reportId}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={report.statusLabel ?? "Sin estado"}
                      tone={getTone(report.statusCode)}
                    />
                    <StatusBadge
                      label={report.gpsValidated ? "GPS validado" : "Sin validar GPS"}
                      tone={report.gpsValidated ? "success" : "neutral"}
                    />
                  </div>
                </div>

                <div className="text-right text-sm text-neutral-600">
                  <p>Peso: {report.weight === null ? "—" : formatNumber(report.weight)}</p>
                  <p>{formatDateTime(report.createdAt)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}