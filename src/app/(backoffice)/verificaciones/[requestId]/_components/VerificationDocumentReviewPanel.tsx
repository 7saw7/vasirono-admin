import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type { VerificationDocument } from "@/features/backoffice/verifications/types";

type VerificationDocumentReviewPanelProps = {
  documents: VerificationDocument[];
};

function mapTone(status: string | null) {
  const code = (status ?? "").toLowerCase();

  if (["approved", "accepted", "verified"].includes(code)) {
    return "success" as const;
  }

  if (["pending", "submitted", "in_review"].includes(code)) {
    return "warning" as const;
  }

  if (["rejected", "failed"].includes(code)) {
    return "danger" as const;
  }

  return "neutral" as const;
}

function normalizeMimeLabel(value: string | null) {
  if (!value) return "Sin MIME";
  return value;
}

export function VerificationDocumentReviewPanel({
  documents,
}: VerificationDocumentReviewPanelProps) {
  const total = documents.length;
  const approved = documents.filter((item) =>
    ["approved", "accepted", "verified"].includes(
      (item.reviewStatus ?? "").toLowerCase()
    )
  ).length;
  const pending = documents.filter((item) =>
    ["pending", "submitted", "in_review"].includes(
      (item.reviewStatus ?? "").toLowerCase()
    )
  ).length;
  const rejected = documents.filter((item) =>
    ["rejected", "failed"].includes((item.reviewStatus ?? "").toLowerCase())
  ).length;

  return (
    <SectionCard
      title="Revisión documental"
      description="Resumen operativo del estado de revisión de documentos del request."
    >
      {documents.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Este request todavía no tiene documentos cargados.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total documentos" value={String(total)} />
            <MetricCard label="Aprobados" value={String(approved)} />
            <MetricCard label="Pendientes" value={String(pending)} />
            <MetricCard label="Observados / rechazados" value={String(rejected)} />
          </div>

          <div className="space-y-4">
            {documents.map((document) => (
              <article
                key={document.verificationDocumentId}
                className="rounded-2xl border border-neutral-100 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {document.fileName}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <MetaPill
                        label="Tipo"
                        value={document.documentType ?? "Sin tipo"}
                      />
                      <MetaPill
                        label="MIME"
                        value={normalizeMimeLabel(document.mimeType)}
                      />
                      <MetaPill
                        label="Subido"
                        value={formatDateTime(document.uploadedAt)}
                      />
                      <MetaPill
                        label="Revisado"
                        value={formatDateTime(document.reviewedAt)}
                      />
                    </div>

                    <p className="mt-3 break-all text-xs text-neutral-400">
                      {document.fileBucket}/{document.filePath}
                    </p>

                    {document.reviewedByName ? (
                      <p className="mt-2 text-sm text-neutral-500">
                        Revisado por: {document.reviewedByName}
                      </p>
                    ) : null}
                  </div>

                  <StatusBadge
                    label={document.reviewStatus ?? "Sin review"}
                    tone={mapTone(document.reviewStatus)}
                  />
                </div>

                {document.reviewNotes ? (
                  <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      Notas de revisión
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      {document.reviewNotes}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 p-3">
                    <p className="text-sm text-neutral-500">
                      Este documento aún no tiene observaciones registradas.
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function MetaPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
      <span className="mr-1 font-medium text-neutral-800">{label}:</span>
      {value}
    </span>
  );
}