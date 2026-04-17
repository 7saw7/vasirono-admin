import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import { formatNumber } from "@/lib/utils/numbers";
import type { VerificationCheck } from "@/features/backoffice/verifications/types";

type VerificationChecksTableProps = {
  checks: VerificationCheck[];
};

function mapTone(status: string | null) {
  const code = (status ?? "").toLowerCase();
  if (["approved", "accepted", "verified", "completed"].includes(code)) {
    return "success" as const;
  }
  if (["pending", "submitted", "in_review", "assigned"].includes(code)) {
    return "warning" as const;
  }
  if (["rejected", "failed", "cancelled"].includes(code)) {
    return "danger" as const;
  }
  return "neutral" as const;
}

export function VerificationChecksTable({
  checks,
}: VerificationChecksTableProps) {
  return (
    <SectionCard
      title="Checks"
      description="Métodos y validaciones aplicadas al request."
    >
      {checks.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay checks registrados aún.
        </p>
      ) : (
        <div className="space-y-4">
          {checks.map((check) => (
            <article
              key={check.verificationCheckId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {check.methodName ?? "Método desconocido"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Reviewer: {check.reviewedByName ?? "—"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Verificado: {formatDateTime(check.verifiedAt)}
                  </p>
                </div>

                <StatusBadge
                  label={check.statusName ?? "Sin estado"}
                  tone={mapTone(check.statusName)}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Metric label="Score" value={formatNumber(check.score)} />
                <Metric
                  label="Confianza"
                  value={formatNumber(check.confidenceScore)}
                />
              </div>

              {check.notes ? (
                <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm text-neutral-600">
                  {check.notes}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}