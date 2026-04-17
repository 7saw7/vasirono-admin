"use client";

import { Button } from "@/components/ui/Button";
import type {
  ReviewListItem,
  ReviewsListResult,
} from "@/features/backoffice/reviews/types";

type ReviewsTableProps = {
  data: ReviewsListResult;
  canModerate?: boolean;
  onHide?: (item: ReviewListItem) => void;
  onRestore?: (item: ReviewListItem) => void;
  onOpenDetail?: (reviewId: number) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ReviewsTable({
  data,
  canModerate = false,
  onHide,
  onRestore,
  onOpenDetail,
}: ReviewsTableProps) {
  if (data.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
        No se encontraron reseñas con los filtros aplicados.
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
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Empresa / sucursal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Rating
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Reportes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Fecha
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 bg-white">
            {data.items.map((item) => (
              <tr key={item.reviewId} className="hover:bg-neutral-50">
                <td className="px-4 py-4 text-sm text-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900">{item.userName}</p>
                    <p className="text-xs text-neutral-500">{item.userEmail}</p>
                  </div>
                </td>

                <td className="px-4 py-4 text-sm text-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900">{item.companyName}</p>
                    <p className="text-xs text-neutral-500">{item.branchName}</p>
                  </div>
                </td>

                <td className="px-4 py-4 text-sm font-medium text-neutral-900">
                  {item.rating}/5
                </td>

                <td className="px-4 py-4 text-sm text-neutral-700">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={
                        item.validated
                          ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : "inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
                      }
                    >
                      {item.validated ? "Validada" : "No validada"}
                    </span>

                    <span
                      className={
                        item.isHidden
                          ? "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                          : "inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700"
                      }
                    >
                      {item.isHidden ? "Oculta" : "Visible"}
                    </span>
                  </div>

                  {item.comment ? (
                    <p className="mt-2 line-clamp-2 text-xs text-neutral-500">
                      {item.comment}
                    </p>
                  ) : null}
                </td>

                <td className="px-4 py-4 text-sm text-neutral-700">
                  {item.reportsCount}
                </td>

                <td className="px-4 py-4 text-sm text-neutral-700">
                  {formatDate(item.createdAt)}
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onOpenDetail?.(item.reviewId)}
                    >
                      Ver detalle
                    </Button>

                    {canModerate ? (
                      item.isHidden ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => onRestore?.(item)}
                        >
                          Restaurar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onHide?.(item)}
                        >
                          Ocultar
                        </Button>
                      )
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}