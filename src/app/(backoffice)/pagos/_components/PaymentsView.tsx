import { PaymentFilters } from "./PaymentFilters";
import { PaymentsTable } from "./PaymentsTable";
import type { PaymentsDashboardData } from "@/features/backoffice/billing/types";

type PaymentsViewProps = {
  data: PaymentsDashboardData;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(value);
}

export function PaymentsView({ data }: PaymentsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Pagos
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Seguimiento de pagos registrados por empresa, método y estado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total pagos"
          value={String(data.summary.totalPayments)}
        />
        <SummaryCard
          label="Monto total"
          value={formatAmount(data.summary.totalAmount)}
        />
        <SummaryCard
          label="Pendientes"
          value={String(data.summary.pendingPayments)}
        />
        <SummaryCard
          label="Completados"
          value={String(data.summary.completedPayments)}
        />
      </div>

      <PaymentFilters meta={data.meta} />

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>
          Mostrando {data.payments.items.length} de {data.payments.total} pagos
        </span>
        <span>
          Página {data.payments.page} · {data.payments.pageSize} por página
        </span>
      </div>

      <PaymentsTable data={data.payments} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}