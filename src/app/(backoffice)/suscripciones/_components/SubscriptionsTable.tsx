import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";
import type { SubscriptionsListResult } from "@/features/backoffice/billing/types";

type SubscriptionsTableProps = {
  data: SubscriptionsListResult;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
  }).format(date);
}

export function SubscriptionsTable({ data }: SubscriptionsTableProps) {
  if (data.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
        No se encontraron suscripciones con los filtros aplicados.
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
                Suscripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Empresa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Inicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Fin
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
                  {item.planName}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  <SubscriptionStatusBadge statusName={item.statusName} />
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {formatDate(item.startDate)}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {formatDate(item.endDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}