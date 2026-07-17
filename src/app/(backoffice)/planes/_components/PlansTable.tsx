import type { PlansListResult } from "@/features/backoffice/billing/types";
import { PlanForm } from "./PlanForm";

type PlansTableProps = {
  data: PlansListResult;
  canManage: boolean;
};

export function PlansTable({ data, canManage }: PlansTableProps) {
  if (data.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
        No se encontraron planes con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Suscripciones</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Suscripciones activas</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Empresas</th>
              {canManage ? <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Administrar</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {data.items.map((item) => (
              <tr key={item.id} className="align-top hover:bg-neutral-50">
                <td className="px-4 py-4 text-sm font-medium text-neutral-900">{item.name}</td>
                <td className="px-4 py-4 text-sm text-neutral-700">{item.subscriptionsCount}</td>
                <td className="px-4 py-4 text-sm text-neutral-700">{item.activeSubscriptionsCount}</td>
                <td className="px-4 py-4 text-sm text-neutral-700">{item.companiesCount}</td>
                {canManage ? (
                  <td className="px-4 py-3">
                    {["Free", "Pro", "Premium"].includes(item.name) ? (
                      <PlanForm compact plan={{ id: item.id, name: item.name }} />
                    ) : (
                      <span className="text-xs text-amber-600">Plan legado en solo lectura</span>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
