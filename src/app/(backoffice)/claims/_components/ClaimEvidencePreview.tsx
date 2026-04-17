type ClaimEvidencePreviewProps = {
  evidenceUrl: string | null;
};

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(url);
}

export function ClaimEvidencePreview({
  evidenceUrl,
}: ClaimEvidencePreviewProps) {
  if (!evidenceUrl) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
        No se adjuntó evidencia en esta solicitud.
      </div>
    );
  }

  if (isImageUrl(evidenceUrl)) {
    return (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={evidenceUrl}
            alt="Evidencia del claim"
            className="h-auto max-h-[420px] w-full object-contain"
          />
        </div>

        <a
          href={evidenceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-neutral-900 underline"
        >
          Abrir evidencia en una nueva pestaña
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
        <p className="text-sm font-medium text-neutral-900">
          La evidencia parece ser un archivo o enlace externo.
        </p>
        <p className="mt-2 text-sm text-neutral-500 break-all">{evidenceUrl}</p>
      </div>

      <a
        href={evidenceUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium text-neutral-900 underline"
      >
        Abrir evidencia
      </a>
    </div>
  );
}