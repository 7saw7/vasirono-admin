import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type { VerificationDocument } from "@/features/backoffice/verifications/types";

type VerificationDocumentsTableProps = {
  documents: VerificationDocument[];
};

function mapTone(status: string | null) {
  const code = (status ?? "").toLowerCase();
  if (["approved", "accepted", "verified"].includes(code)) return "success" as const;
  if (["pending", "submitted", "in_review"].includes(code)) return "warning" as const;
  if (["rejected", "failed"].includes(code)) return "danger" as const;
  return "neutral" as const;
}

export function VerificationDocumentsTable({
  documents,
}: VerificationDocumentsTableProps) {
  return (
    <SectionCard
      title="Documentos"
      description="Archivos subidos para la verificación."
    >
      {documents.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay documentos registrados para este request.
        </p>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <article
              key={document.verificationDocumentId}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {document.fileName}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Tipo: {document.documentType ?? "—"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Subido: {formatDateTime(document.uploadedAt)}
                  </p>
                  <p className="mt-1 break-all text-xs text-neutral-400">
                    {document.fileBucket}/{document.filePath}
                  </p>
                </div>

                <StatusBadge
                  label={document.reviewStatus ?? "Sin review"}
                  tone={mapTone(document.reviewStatus)}
                />
              </div>

              {document.reviewNotes ? (
                <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm text-neutral-600">
                  {document.reviewNotes}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}