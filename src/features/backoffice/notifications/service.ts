import {
  notificationListFiltersSchema,
  notificationsDashboardDataSchema,
  notificationsListResultSchema,
} from "./schema";
import {
  mapNotificationFilterOptionRow,
  mapNotificationListRow,
} from "./mapper";
import type { NotificationListFilters } from "./types";
import {
  getNotificationsSummaryQuery,
  listNotificationsQuery,
  listNotificationTypesQuery,
} from "@/lib/db/queries/backoffice/notifications";

export async function getNotificationsList(
  input: NotificationListFilters = {}
) {
  const filters = notificationListFiltersSchema.parse(input);
  const result = await listNotificationsQuery(filters);

  return notificationsListResultSchema.parse({
    items: result.rows.map(mapNotificationListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getNotificationsDashboard(
  input: NotificationListFilters = {}
) {
  const filters = notificationListFiltersSchema.parse(input);

  const [notificationsResult, typesRows, summaryRow] = await Promise.all([
    listNotificationsQuery(filters),
    listNotificationTypesQuery(),
    getNotificationsSummaryQuery(filters),
  ]);

  return notificationsDashboardDataSchema.parse({
    notifications: {
      items: notificationsResult.rows.map(mapNotificationListRow),
      page: notificationsResult.page,
      pageSize: notificationsResult.pageSize,
      total: notificationsResult.total,
    },
    meta: {
      types: typesRows.map(mapNotificationFilterOptionRow),
    },
    summary: {
      totalNotifications: Number(summaryRow.total_notifications ?? 0),
      readNotifications: Number(summaryRow.read_notifications ?? 0),
      unreadNotifications: Number(summaryRow.unread_notifications ?? 0),
      deliveredNotifications: Number(summaryRow.delivered_notifications ?? 0),
    },
  });
}