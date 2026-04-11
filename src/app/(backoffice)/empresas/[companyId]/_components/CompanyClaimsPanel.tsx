import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { CompanyDetailClaim } from "@/features/backoffice/companies/types";

type CompanyClaimsPanelProps = {
  claims: CompanyDetailClaim[];
};

export function CompanyClaimsPanel({ claims }: CompanyClaimsPanelProps) {
  return (
    <SectionCard
      title="Claims recientes"
      description="Últimas solicitudes de claim de esta empresa."
    >
      {claims.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay claims registrados.</p>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <article
              key={claim.claimRequestId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Claim #{claim.claimRequestId}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Estado: {claim.statusName ?? "—"}
                  </p>
                  {claim.notes ? (
                    <p className="mt-2 text-sm text-neutral-600">{claim.notes}</p>
                  ) : null}
                </div>

                <div className="text-right text-xs text-neutral-500">
                  <p>Enviado: {formatDateTime(claim.submittedAt)}</p>
                  <p>Revisado: {formatDateTime(claim.reviewedAt)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}