import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/formatters";
import type { CompanyDetailPayment } from "@/features/backoffice/companies/types";

type CompanyPaymentsPanelProps = {
  payments: CompanyDetailPayment[];
};

export function CompanyPaymentsPanel({ payments }: CompanyPaymentsPanelProps) {
  return (
    <SectionCard
      title="Pagos recientes"
      description="Últimos pagos asociados a la empresa."
    >
      {payments.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay pagos registrados.</p>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <article
              key={payment.paymentId}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-100 p-4"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Pago #{payment.paymentId}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {payment.paymentMethodName ?? "Método no especificado"} ·{" "}
                  {payment.statusName ?? "Sin estado"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-950">
                  {formatCurrency(payment.amount)}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {formatDateTime(payment.createdAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}