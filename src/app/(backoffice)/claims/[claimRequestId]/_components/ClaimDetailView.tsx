import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import { ClaimDecisionForm } from "../../_components/ClaimDecisionForm";
import { ClaimEvidencePreview } from "../../_components/ClaimEvidencePreview";
import type { ClaimDetail } from "@/features/backoffice/claims/types";

type ClaimDetailViewProps = {
  data: ClaimDetail;
};

function mapTone(statusCode: string) {
  if (["approved", "accepted"].includes(statusCode)) return "success" as const;
  if (["pending", "submitted", "in_review", "reviewing"].includes(statusCode)) {
    return "warning" as const;
  }
  if (["rejected", "denied"].includes(statusCode)) return "danger" as const;
  return "neutral" as const;
}

export function ClaimDetailView({ data }: ClaimDetailViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Claims</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Claim #{data.claimRequestId}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Revisión completa de la solicitud de claim empresarial.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Resumen" description="Datos principales del claim.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Empresa"
              value={
                <Link
                  href={`/empresas/${data.companyId}`}
                  className="underline"
                >
                  {data.companyName}
                </Link>
              }
            />
            <Field
              label="Estado"
              value={
                <StatusBadge
                  label={data.statusName}
                  tone={mapTone(data.statusCode)}
                />
              }
            />
            <Field label="Solicitante" value={data.claimantName} />
            <Field label="Correo" value={data.claimantEmail} />
            <Field label="Enviado" value={formatDateTime(data.submittedAt)} />
            <Field label="Revisado" value={formatDateTime(data.reviewedAt)} />
            <Field label="Revisado por" value={data.reviewedByName ?? "—"} />
            <Field
              label="Verification request"
              value={
                data.verificationRequestId ? (
                  <span>
                    #{data.verificationRequestId} ·{" "}
                    {data.verificationStatusName ?? "—"}
                  </span>
                ) : (
                  "No generado"
                )
              }
            />
          </div>

          {data.notes ? (
            <div className="mt-5 rounded-2xl border border-neutral-100 p-4">
              <p className="text-sm font-medium text-neutral-900">Notas</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">
                {data.notes}
              </p>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Evidencia" description="Archivo o imagen aportada por el solicitante.">
          <ClaimEvidencePreview evidenceUrl={data.evidenceUrl} />
        </SectionCard>
      </div>

      <ClaimDecisionForm claimId={data.claimRequestId} />
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <div className="mt-2 text-sm font-medium text-neutral-900">{value}</div>
    </div>
  );
}