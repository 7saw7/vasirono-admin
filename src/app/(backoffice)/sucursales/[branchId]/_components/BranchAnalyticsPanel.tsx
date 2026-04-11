import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import { formatNumber } from "@/lib/utils/numbers";
import type { BranchDetailAnalytics } from "@/features/backoffice/branches/types";

type BranchAnalyticsPanelProps = {
  analytics: BranchDetailAnalytics;
};

export function BranchAnalyticsPanel({ analytics }: BranchAnalyticsPanelProps) {
  return (
    <SectionCard
      title="Analytics y score"
      description="Resumen agregado de métricas y score de ranking."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Metric label="Visitas" value={formatNumber(analytics.visitsCount)} />
        <Metric label="Reseñas" value={formatNumber(analytics.reviewsCount)} />
        <Metric label="Rating promedio" value={formatNumber(analytics.averageRating)} />
        <Metric label="Reportes aforo" value={formatNumber(analytics.aforoReportCount)} />
        <Metric label="Estado aforo promedio" value={formatNumber(analytics.averageWeightedStatus)} />
        <Metric label="Score final" value={formatNumber(analytics.finalScore)} />
        <Metric label="Popularidad" value={formatNumber(analytics.popularityScore)} />
        <Metric label="Engagement" value={formatNumber(analytics.engagementScore)} />
        <Metric label="Conversión" value={formatNumber(analytics.conversionScore)} />
        <Metric label="Trust" value={formatNumber(analytics.trustScore)} />
        <Metric label="Freshness" value={formatNumber(analytics.freshnessScore)} />
        <Metric label="Calculado" value={formatDateTime(analytics.calculatedAt)} />
      </div>
    </SectionCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}