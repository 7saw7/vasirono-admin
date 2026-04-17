import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { VerificationTimelineItem } from "@/features/backoffice/verifications/types";

type VerificationTimelineProps = {
  timeline: VerificationTimelineItem[];
};

export function VerificationTimeline({ timeline }: VerificationTimelineProps) {
  return (
    <SectionCard
      title="Timeline"
      description="Historial operativo del request."
    >
      {timeline.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay movimientos registrados.
        </p>
      ) : (
        <div className="space-y-4">
          {timeline.map((item) => (
            <article
              key={item.auditLogId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.action}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Actor: {item.actorName ?? "Sistema"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Cambio: {item.oldStatusName ?? "—"} →{" "}
                    {item.newStatusName ?? "—"}
                  </p>
                </div>

                <span className="whitespace-nowrap text-xs text-neutral-400">
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