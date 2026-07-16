"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils/dates";
import type { VerificationDocument } from "@/features/backoffice/verifications/types";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type UploadUrlResult = {
  bucket: string;
  path: string;
  uploadUrl: string;
  method: "PUT";
  expiresIn: number;
  headers: Record<string, string>;
  fileName: string;
  fileExtension: string | null;
  mimeType: string;
  fileSizeBytes: number;
};

type VerificationDocumentActionsPanelProps = {
  requestId: number;
  documents: VerificationDocument[];
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const DOCUMENT_TYPES = [
  { code: "ruc", label: "RUC / ficha tributaria" },
  { code: "business_license", label: "Licencia municipal" },
  { code: "utility_bill", label: "Recibo de servicio / dirección" },
  { code: "official_channel", label: "Evidencia de canal oficial" },
  { code: "onsite_visit", label: "Evidencia de visita presencial" },
  { code: "other", label: "Otro documento" },
];

function statusTone(status: string | null) {
  const code = (status ?? "").toLowerCase();

  if (["approved", "accepted", "verified", "aprobado"].includes(code)) return "success" as const;
  if (["pending", "submitted", "in_review", "pendiente"].includes(code)) return "warning" as const;
  if (["rejected", "failed", "needs_reupload", "rechazado"].includes(code)) return "danger" as const;
  return "neutral" as const;
}

async function readApi<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error ?? `HTTP ${response.status}`);
  }

  return payload.data as T;
}

export function VerificationDocumentActionsPanel({
  requestId,
  documents,
}: VerificationDocumentActionsPanelProps) {
  const router = useRouter();
  const [documentTypeCode, setDocumentTypeCode] = useState("ruc");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = documents.length;
    const approved = documents.filter((item) =>
      ["approved", "accepted", "verified", "aprobado"].includes(
        (item.reviewStatus ?? "").toLowerCase()
      )
    ).length;
    const pending = documents.filter((item) =>
      ["pending", "submitted", "in_review", "pendiente"].includes(
        (item.reviewStatus ?? "").toLowerCase()
      )
    ).length;
    const rejected = documents.filter((item) =>
      ["rejected", "failed", "needs_reupload", "rechazado"].includes(
        (item.reviewStatus ?? "").toLowerCase()
      )
    ).length;

    return { total, approved, pending, rejected };
  }, [documents]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!file) {
      setError("Selecciona un archivo PDF o imagen.");
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      setError("Formato no permitido. Usa PDF, JPG, PNG o WEBP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("El archivo supera el límite de 10 MB.");
      return;
    }

    setLoading(true);

    try {
      const upload = await readApi<UploadUrlResult>(
        await fetch(`/api/backoffice/verifications/${requestId}/documents/upload-url`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            documentTypeCode,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            fileSizeBytes: file.size,
            notes: notes || null,
          }),
        })
      );

      const uploadResponse = await fetch(upload.uploadUrl, {
        method: upload.method,
        headers: {
          ...upload.headers,
          "content-type":
            upload.headers["content-type"] ??
            upload.headers["Content-Type"] ??
            upload.mimeType,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`R2 rechazó la carga: ${uploadResponse.status}`);
      }

      await readApi(
        await fetch(`/api/backoffice/verifications/${requestId}/documents/confirm`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            documentTypeCode,
            fileName: upload.fileName,
            fileBucket: upload.bucket,
            filePath: upload.path,
            mimeType: upload.mimeType,
            fileExtension: upload.fileExtension,
            fileSizeBytes: upload.fileSizeBytes,
            notes: notes || null,
          }),
        })
      );

      setFile(null);
      setNotes("");
      setMessage("Documento cargado y registrado correctamente.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el documento.");
    } finally {
      setLoading(false);
    }
  }

  async function viewDocument(document: VerificationDocument) {
    setError(null);
    setMessage(null);

    try {
      const result = await readApi<{ url: string }>(
        await fetch(
          `/api/backoffice/verifications/${requestId}/documents/${document.verificationDocumentId}/view-url`,
          { cache: "no-store" }
        )
      );

      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo abrir el documento.");
    }
  }

  async function reviewDocument(
    document: VerificationDocument,
    statusCode: "approved" | "rejected" | "needs_reupload"
  ) {
    setError(null);
    setMessage(null);

    const defaultMessage =
      statusCode === "approved"
        ? "Documento aprobado."
        : statusCode === "needs_reupload"
          ? "Documento observado. Solicitar nueva carga."
          : "Documento rechazado.";

    const reviewNotes = window.prompt("Notas de revisión", defaultMessage);
    if (reviewNotes === null) return;

    try {
      await readApi(
        await fetch(
          `/api/backoffice/verifications/${requestId}/documents/${document.verificationDocumentId}/review`,
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ statusCode, reviewNotes }),
          }
        )
      );

      setMessage("Estado del documento actualizado.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo revisar el documento.");
    }
  }

  return (
    <SectionCard
      title="Gestión documental"
      description="Sube, visualiza y revisa documentos privados de verificación. Los archivos se cargan con URL firmada y acceso temporal."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total" value={String(stats.total)} />
          <MetricCard label="Aprobados" value={String(stats.approved)} />
          <MetricCard label="Pendientes" value={String(stats.pending)} />
          <MetricCard label="Observados" value={String(stats.rejected)} />
        </div>

        <form onSubmit={onUpload} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-neutral-800">Tipo de documento</span>
              <select
                value={documentTypeCode}
                onChange={(event) => setDocumentTypeCode(event.target.value)}
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-400"
              >
                {DOCUMENT_TYPES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-neutral-800">Archivo</span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={onFileChange}
                className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-1 text-sm">
            <span className="font-medium text-neutral-800">Notas internas</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
              placeholder="Ej. documento recibido durante visita presencial, coincide con dirección declarada..."
            />
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500">
              Formatos permitidos: PDF, JPG, PNG o WEBP. Tamaño máximo definido por el micro de verificación.
            </p>
            <Button type="submit" loading={loading} disabled={!file || loading}>
              Subir documento
            </Button>
          </div>
        </form>

        {message ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {documents.length === 0 ? (
          <p className="text-sm text-neutral-500">Todavía no hay documentos registrados.</p>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <article key={document.verificationDocumentId} className="rounded-2xl border border-neutral-100 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">{document.fileName}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <MetaPill label="Tipo" value={document.documentType ?? "Sin tipo"} />
                      <MetaPill label="MIME" value={document.mimeType ?? "Sin MIME"} />
                      <MetaPill label="Subido" value={formatDateTime(document.uploadedAt)} />
                      <MetaPill label="Revisado" value={formatDateTime(document.reviewedAt)} />
                    </div>
                    <p className="mt-3 break-all text-xs text-neutral-400">
                      {document.fileBucket}/{document.filePath}
                    </p>
                    {document.reviewNotes ? (
                      <p className="mt-2 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">
                        {document.reviewNotes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                    <StatusBadge label={document.reviewStatus ?? "Sin revisión"} tone={statusTone(document.reviewStatus)} />
                    <Button type="button" variant="secondary" size="sm" onClick={() => viewDocument(document)}>
                      Ver documento
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => reviewDocument(document, "approved")}>
                      Aprobar
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => reviewDocument(document, "needs_reupload")}>
                      Observar
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => reviewDocument(document, "rejected")}>
                      Rechazar
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
      <span className="mr-1 font-medium text-neutral-800">{label}:</span>
      {value}
    </span>
  );
}
