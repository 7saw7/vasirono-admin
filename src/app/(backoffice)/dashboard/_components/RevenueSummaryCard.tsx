import { SectionCard } from "@/components/ui/SectionCard";
import { formatCurrency } from "@/lib/utils/formatters";
import { formatNumber } from "@/lib/utils/numbers";
import type { RevenueSummary } from "@/features/backoffice/dashboard/types";

type RevenueSummaryCardProps = {
  data: RevenueSummary;
};

export function RevenueSummaryCard({
  data,
}: RevenueSummaryCardProps) {
  return (
    <SectionCard
      title="Resumen de pagos"
      description="Estado agregado de pagos registrados en la plataforma."
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-neutral-100 p-4">
          <p className="text-sm text-neutral-500">Monto total pagado</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {formatCurrency(data.totalPayments)}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Pagados" value={data.paidCount} />
          <Metric label="Pendientes" value={data.pendingCount} />
          <Metric label="Fallidos" value={data.failedCount} />
        </div>
      </div>
    </SectionCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-neutral-950">
        {formatNumber(value)}
      </p>
    </div>
  );
}