import { StatCard } from "@/components/ui/StatCard";
import type { VerificationQueueSummary as Summary } from "@/features/backoffice/verifications/types";

type VerificationQueueSummaryProps = {
  summary: Summary;
};

export function VerificationQueueSummary({
  summary,
}: VerificationQueueSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard title="Total" value={summary.total} />
      <StatCard title="Pendientes" value={summary.pending} />
      <StatCard title="En revisión" value={summary.inReview} />
      <StatCard title="Aprobadas" value={summary.approved} />
      <StatCard title="Rechazadas" value={summary.rejected} />
    </div>
  );
}