import { PaymentStatusBadge } from "./PaymentStatusBadge";
import type { BillingListResult } from "@/features/backoffice/billing/types";

type PaymentsTableProps = {
  data: BillingListResult;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function PaymentsTable({ data }: PaymentsTableProps) {
  if (data.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
        No se encontraron pagos con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Pago
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Empresa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Monto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Método
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Fecha
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 bg-white">
            {data.items.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-4 py-4 text-sm font-medium text-neutral-900">
                  #{item.id}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {item.companyName}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-neutral-900">
                  {formatAmount(item.amount)}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {item.paymentMethodName}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  <PaymentStatusBadge statusName={item.statusName} />
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}