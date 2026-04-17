import { Button } from "@/components/ui/Button";
import { PromotionStatusBadge } from "./PromotionStatusBadge";
import type {
  PromotionListItem,
  PromotionsListResult,
} from "@/features/backoffice/billing/types";

type PromotionsTableProps = {
  data: PromotionsListResult;
  canManage?: boolean;
  onEdit?: (item: PromotionListItem) => void;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
  }).format(date);
}

function formatDiscount(value: number | null) {
  if (value === null) return "—";
  return `${value}%`;
}

export function PromotionsTable({
  data,
  canManage = false,
  onEdit,
}: PromotionsTableProps) {
  if (data.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
        No se encontraron promociones con los filtros aplicados.
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
                Promoción
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Empresa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Sucursal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Descuento
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Asignados
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Redimidos
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Vigencia
              </th>
              {canManage ? (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Acciones
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 bg-white">
            {data.items.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-4 py-4 text-sm text-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {item.companyName}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {item.branchName}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-neutral-900">
                  {formatDiscount(item.discountPercent)}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  <PromotionStatusBadge active={item.active} />
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {item.assignedUsers}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {item.redeemedUsers}
                </td>
                <td className="px-4 py-4 text-sm text-neutral-700">
                  {formatDate(item.startDate)} — {formatDate(item.endDate)}
                </td>
                {canManage ? (
                  <td className="px-4 py-4 text-right">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit?.(item)}
                    >
                      Editar
                    </Button>
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