import type { ReactNode } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import { ClaimEvidencePreview } from "../../_components/ClaimEvidencePreview";
import type { ClaimDetail } from "@/features/backoffice/claims/types";
import { ClaimWorkflowCommandPanel } from "./ClaimWorkflowCommandPanel";

type ClaimDetailViewProps = {
  data: ClaimDetail;
  canReview: boolean;
};

function mapTone(statusCode: string) {
  if (["approved", "accepted", "approved_basic_access", "official_channel_verified", "onsite_review_passed"].includes(statusCode)) return "success" as const;
  if (["pending", "submitted", "in_review", "reviewing", "received", "pending_public_contact_review", "otp_pending", "visit_required", "visit_scheduled", "needs_more_evidence"].includes(statusCode)) {
    return "warning" as const;
  }
  if (["rejected", "denied"].includes(statusCode)) return "danger" as const;
  return "neutral" as const;
}

const TERMINAL_CLAIM_STATUSES = new Set([
  "approved",
  "accepted",
  "aprobado",
  "aceptado",
  "rejected",
  "denied",
  "rechazado",
  "denegado",
  "cancelled",
]);

export function ClaimDetailView({ data, canReview }: ClaimDetailViewProps) {
  const isTerminal = TERMINAL_CLAIM_STATUSES.has(data.workflowState);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Reclamos</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Reclamo #{data.claimRequestId}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Revisión profesional de solicitud: canal oficial, WhatsApp/correo, visita presencial y evidencias.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Resumen" description="Datos principales del reclamo.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Empresa"
              value={
                <Link href={`/empresas/${data.companyId}`} className="underline">
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
            <Field label="Correo solicitante" value={data.claimantEmail} />
            <Field label="Teléfono solicitante" value={data.claimantPhone ?? "—"} />
            <Field label="Rol declarado" value={data.applicantRole ?? "—"} />
            <Field label="Origen" value={data.source} />
            <Field label="Enviado" value={formatDateTime(data.submittedAt)} />
            <Field label="Revisado" value={formatDateTime(data.reviewedAt)} />
            <Field label="Revisado por" value={data.reviewedByName ?? "—"} />
            <Field
              label="Solicitud de verificación"
              value={
                data.verificationRequestId ? (
                  <Link href={`/verificaciones/${data.verificationRequestId}`} className="underline">
                    #{data.verificationRequestId} · {data.verificationStatusName ?? "—"}
                  </Link>
                ) : (
                  "No generado"
                )
              }
            />
            <Field label="Nivel" value={data.verificationLevel ?? "—"} />
            <Field
              label="Invitación"
              value={
                data.invitationId
                  ? `#${data.invitationId} · ${data.invitationStatus ?? "sin estado"}`
                  : "No generada"
              }
            />
            <Field
              label="Vencimiento invitación"
              value={formatDateTime(data.invitationExpiresAt ?? null)}
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

        <SectionCard
          title="Local y canal declarado"
          description="Información necesaria para decidir canal oficial o visita presencial."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Sucursal" value={data.branchName ?? "—"} />
            <Field label="Dirección" value={data.branchAddress ?? "—"} />
            <Field label="Teléfono local" value={data.branchPhone ?? "—"} />
            <Field label="Correo local" value={data.branchEmail ?? "—"} />
            <Field label="Canal declarado" value={data.declaredChannelType ?? "—"} />
            <Field label="Valor declarado" value={data.declaredChannelValue ?? "—"} />
            <Field label="Ruta preferida" value={data.preferredVerificationRoute ?? "—"} />
            <Field label="Visita programada" value={formatDateTime(data.onsiteVisitScheduledAt)} />
          </div>
        </SectionCard>
      </div>

      {isTerminal ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          Este reclamo ya tiene una decisión final. Las acciones quedaron
          bloqueadas para evitar decisiones duplicadas.
        </div>
      ) : canReview ? (
        <ClaimWorkflowCommandPanel claim={data} />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Tienes acceso de consulta. Las decisiones y cambios del reclamo requieren el permiso de revisión.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Evidencia enviada"
          description="URL o evidencia inicial aportada por el solicitante."
        >
          <ClaimEvidencePreview evidenceUrl={data.evidenceUrl} />
        </SectionCard>

        <SectionCard
          title="Desafío de canal"
          description="Solo se conserva en la interfaz el destino enmascarado y la vigencia."
        >
          <div className="grid gap-3 text-sm text-neutral-700">
            <Field label="Destino" value={data.otpDestinationMasked ?? "—"} />
            <Field label="Vencimiento" value={formatDateTime(data.otpExpiresAt)} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <div className="mt-2 break-words text-sm font-medium text-neutral-900">{value}</div>
    </div>
  );
}
