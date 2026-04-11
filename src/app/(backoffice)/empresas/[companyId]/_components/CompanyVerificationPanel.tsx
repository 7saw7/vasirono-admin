import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type { CompanyDetailVerification } from "@/features/backoffice/companies/types";

type CompanyVerificationPanelProps = {
  verification: CompanyDetailVerification;
};

export function CompanyVerificationPanel({
  verification,
}: CompanyVerificationPanelProps) {
  return (
    <SectionCard
      title="Perfil de verificación"
      description="Estado consolidado del proceso verificatorio."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Estado actual" value={verification.statusLabel} />
        <Field label="Nivel" value={verification.profileLevel ?? "—"} />
        <Field label="Score" value={String(verification.verificationScore)} />
        <Field
          label="Último request"
          value={
            verification.latestRequestId
              ? `#${verification.latestRequestId}`
              : "—"
          }
        />
        <Field
          label="Estado último request"
          value={verification.latestRequestStatus ?? "—"}
        />
        <Field
          label="Enviado"
          value={formatDateTime(verification.latestRequestSubmittedAt)}
        />
        <Field label="Verified at" value={formatDateTime(verification.verifiedAt)} />
        <Field label="Expires at" value={formatDateTime(verification.expiresAt)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge
          label={`Identidad: ${verification.isIdentityVerified ? "Sí" : "No"}`}
          tone={verification.isIdentityVerified ? "success" : "neutral"}
        />
        <StatusBadge
          label={`WhatsApp: ${verification.isWhatsappVerified ? "Sí" : "No"}`}
          tone={verification.isWhatsappVerified ? "success" : "neutral"}
        />
        <StatusBadge
          label={`Dirección: ${verification.isAddressVerified ? "Sí" : "No"}`}
          tone={verification.isAddressVerified ? "success" : "neutral"}
        />
        <StatusBadge
          label={`Documentos: ${verification.isDocumentVerified ? "Sí" : "No"}`}
          tone={verification.isDocumentVerified ? "success" : "neutral"}
        />
        <StatusBadge
          label={`Manual review: ${
            verification.isManualReviewCompleted ? "Sí" : "No"
          }`}
          tone={verification.isManualReviewCompleted ? "success" : "neutral"}
        />
      </div>
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}