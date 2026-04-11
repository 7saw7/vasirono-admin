import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { CompanyDetailAuditItem } from "@/features/backoffice/companies/types";

type CompanyAuditPanelProps = {
  audit: CompanyDetailAuditItem[];
};

export function CompanyAuditPanel({ audit }: CompanyAuditPanelProps) {
  return (
    <SectionCard
      title="Auditoría de verificación"
      description="Eventos de auditoría ligados al proceso de verificación."
    >
      {audit.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay eventos de auditoría registrados.
        </p>
      ) : (
        <div className="space-y-3">
          {audit.map((item) => (
            <article
              key={item.auditLogId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {item.action}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {item.oldStatusName ?? "—"} → {item.newStatusName ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Actor: {item.actorName ?? "Sistema"}
                  </p>
                </div>

                <span className="text-xs text-neutral-500">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}