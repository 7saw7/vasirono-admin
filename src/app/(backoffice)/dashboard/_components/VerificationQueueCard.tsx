import { SectionCard } from "@/components/ui/SectionCard";
import { formatNumber } from "@/lib/utils/numbers";
import type { QueueMetric } from "@/features/backoffice/dashboard/types";

type VerificationQueueCardProps = {
  data: QueueMetric;
};

export function VerificationQueueCard({
  data,
}: VerificationQueueCardProps) {
  return (
    <SectionCard
      title="Cola de verificaciones"
      description="Solicitudes empresariales y su estado de revisión."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric label="Total" value={data.total} />
        <Metric label="Pendientes" value={data.pending} />
        <Metric label="En revisión" value={data.inReview} />
        <Metric label="Aprobadas" value={data.approved ?? 0} />
      </div>
    </SectionCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">
        {formatNumber(value)}
      </p>
    </div>
  );
}