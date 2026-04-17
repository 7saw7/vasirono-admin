import { NotificationsFilters } from "./NotificationsFilters";
import { NotificationsTable } from "./NotificationsTable";
import type { NotificationsDashboardData } from "@/features/backoffice/notifications/types";

type NotificationsViewProps = {
  data: NotificationsDashboardData;
};

export function NotificationsView({ data }: NotificationsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Notificaciones
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Seguimiento de notificaciones emitidas, estado de lectura y entrega.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total"
          value={String(data.summary.totalNotifications)}
        />
        <SummaryCard
          label="Leídas"
          value={String(data.summary.readNotifications)}
        />
        <SummaryCard
          label="No leídas"
          value={String(data.summary.unreadNotifications)}
        />
        <SummaryCard
          label="Entregadas"
          value={String(data.summary.deliveredNotifications)}
        />
      </div>

      <NotificationsFilters meta={data.meta} />

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>
          Mostrando {data.notifications.items.length} de {data.notifications.total} notificaciones
        </span>
        <span>
          Página {data.notifications.page} · {data.notifications.pageSize} por página
        </span>
      </div>

      <NotificationsTable data={data.notifications} />
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