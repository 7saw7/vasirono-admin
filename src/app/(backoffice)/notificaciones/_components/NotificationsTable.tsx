import { NotificationReadBadge } from "./NotificationReadBadge";
import type { NotificationsListResult } from "@/features/backoffice/notifications/types";

type NotificationsTableProps = {
  data: NotificationsListResult;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function NotificationsTable({ data }: NotificationsTableProps) {
  if (data.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
        No se encontraron notificaciones con los filtros aplicados.
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
                Notificación
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Creada
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Entregada
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 bg-white">
            {data.items.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-4 py-4 text-sm text-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {item.title ?? "Sin título"}
                    </p>
                    {item.message ? (
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                        {item.message}
                      </p>
                    ) : null}
                  </div>
                </td>

                <td className="px-4 py-4 text-sm text-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {item.userName ?? "Sistema / sin usuario"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {item.userEmail ?? "—"}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4 text-sm text-neutral-700">
                  {item.typeName ?? "Sin tipo"}
                </td>

                <td className="px-4 py-4 text-sm text-neutral-700">
                  <NotificationReadBadge read={item.read} />
                </td>

                <td className="px-4 py-4 text-sm text-neutral-700">
                  {formatDate(item.createdAt)}
                </td>

                <td className="px-4 py-4 text-sm text-neutral-700">
                  {formatDate(item.deliveredAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}