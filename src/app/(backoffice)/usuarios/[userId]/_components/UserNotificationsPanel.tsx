import { SectionCard } from "@/components/ui/SectionCard";
import { formatDateTime } from "@/lib/utils/dates";
import type { UserNotificationItem } from "@/features/backoffice/users/types";

type UserNotificationsPanelProps = {
  notifications: UserNotificationItem[];
};

export function UserNotificationsPanel({
  notifications,
}: UserNotificationsPanelProps) {
  return (
    <SectionCard
      title="Notificaciones"
      description="Últimas notificaciones enviadas al usuario."
    >
      {notifications.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay notificaciones registradas.
        </p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-neutral-100 p-4"
            >
              <p className="text-sm font-medium text-neutral-900">
                {notification.title ?? "Sin título"}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {notification.message ?? "Sin mensaje"}
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                {formatDateTime(notification.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}