import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { ReviewResponseItem } from "@/features/backoffice/reviews/types";

type ReviewResponsePreviewProps = {
  response: ReviewResponseItem | null;
};

export function ReviewResponsePreview({
  response,
}: ReviewResponsePreviewProps) {
  return (
    <SectionCard
      title="Respuesta empresarial"
      description="Respuesta pública emitida por la empresa."
    >
      {!response ? (
        <p className="text-sm text-neutral-500">
          Esta reseña todavía no tiene respuesta.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-500">
            Estado: {response.statusName ?? "—"}
          </p>
          <p className="text-sm text-neutral-500">
            Respondido por: {response.responderName ?? "—"}
          </p>
          <p className="text-sm text-neutral-500">
            Fecha: {formatDateTime(response.respondedAt)}
          </p>
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-700 whitespace-pre-wrap">
            {response.responseText}
          </div>
        </div>
      )}
    </SectionCard>
  );
}