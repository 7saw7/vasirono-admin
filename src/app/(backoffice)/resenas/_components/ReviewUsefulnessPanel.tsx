import { SectionCard } from "@/components/ui/SectionCard";
import { formatNumber } from "@/lib/utils/numbers";
import type { ReviewUsefulness } from "@/features/backoffice/reviews/types";

type ReviewUsefulnessPanelProps = {
  usefulness: ReviewUsefulness | null;
};

export function ReviewUsefulnessPanel({
  usefulness,
}: ReviewUsefulnessPanelProps) {
  return (
    <SectionCard
      title="Usefulness"
      description="Señales calculadas para priorización y calidad."
    >
      {!usefulness ? (
        <p className="text-sm text-neutral-500">
          No hay score de usefulness disponible.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Likes" value={formatNumber(usefulness.likesCount)} />
          <Metric
            label="Dislikes"
            value={formatNumber(usefulness.dislikesCount)}
          />
          <Metric
            label="Reports"
            value={formatNumber(usefulness.reportsCount)}
          />
          <Metric label="Media" value={formatNumber(usefulness.mediaCount)} />
          <Metric
            label="Usefulness"
            value={formatNumber(usefulness.usefulnessScore)}
          />
          <Metric label="Final" value={formatNumber(usefulness.finalScore)} />
        </div>
      )}
    </SectionCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}