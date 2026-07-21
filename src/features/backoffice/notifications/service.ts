import { callBackofficeService } from "@/lib/microservices/backoffice-client";
import {
  notificationListFiltersSchema,
  notificationsDashboardDataSchema,
  notificationsListResultSchema,
} from "./schema";
import type {
  NotificationFilterOption,
  NotificationListFilters,
  NotificationListItem,
  NotificationSummary,
} from "./types";

const NOTIFICATIONS_ADMIN_PATH = "/api/backoffice/notifications";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && "data" in value) return value.data;
  return value;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || typeof value === "undefined" || value === "")
    return null;
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || typeof value === "undefined") return null;
  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
}

function normalizeNotificationItem(value: unknown): NotificationListItem {
  const item = isRecord(value) ? value : {};
  const user = isRecord(item.user) ? item.user : {};
  const type = isRecord(item.type) ? item.type : {};

  return {
    id: toNumber(item.id ?? item.notificationId ?? item.notification_id),
    userId: toStringOrNull(item.userId ?? item.user_id ?? user.id),
    userName: toStringOrNull(item.userName ?? item.user_name ?? user.name),
    userEmail: toStringOrNull(item.userEmail ?? item.user_email ?? user.email),
    typeId: toNullableNumber(item.typeId ?? item.type_id ?? type.id),
    typeName: toStringOrNull(item.typeName ?? item.type_name ?? type.name),
    title: toStringOrNull(item.title),
    message: toStringOrNull(item.message),
    read: toBoolean(item.read ?? item.isRead ?? item.is_read),
    createdAt: toStringOrNull(item.createdAt ?? item.created_at),
    deliveredAt: toStringOrNull(item.deliveredAt ?? item.delivered_at),
  };
}

function normalizeNotificationsList(raw: unknown) {
  const payload = unwrapData(raw);
  const source = isRecord(payload) ? payload : {};
  const pagination = isRecord(source.pagination)
    ? source.pagination
    : isRecord(source.meta)
      ? source.meta
      : {};
  const items = asArray(
    source.items ?? source.rows ?? source.notifications,
  ).map(normalizeNotificationItem);

  return notificationsListResultSchema.parse({
    items,
    page: toNumber(source.page ?? pagination.page, 1),
    pageSize: toNumber(
      source.pageSize ??
        source.page_size ??
        pagination.pageSize ??
        pagination.page_size,
      10,
    ),
    total: toNumber(
      source.total ?? pagination.total ?? items.length,
      items.length,
    ),
  });
}

function normalizeTypeOption(value: unknown): NotificationFilterOption {
  const item = isRecord(value) ? value : {};
  return {
    label: String(
      item.label ??
        item.name ??
        item.nameEs ??
        item.name_es ??
        item.code ??
        "Sin tipo",
    ),
    value: toNumber(item.value ?? item.id ?? item.typeId ?? item.type_id),
  };
}

function normalizeTypes(raw: unknown): NotificationFilterOption[] {
  const payload = unwrapData(raw);
  const source = isRecord(payload) ? payload : {};
  const values = Array.isArray(payload)
    ? payload
    : asArray(source.items ?? source.types ?? source.rows ?? source.data);

  return values.map(normalizeTypeOption).filter((item) => item.value > 0);
}

function normalizeSummary(raw: unknown): NotificationSummary {
  const payload = unwrapData(raw);
  const source = isRecord(payload) ? payload : {};
  const summary = isRecord(source.summary) ? source.summary : source;

  return {
    totalNotifications: toNumber(
      summary.totalNotifications ??
        summary.total_notifications ??
        summary.total,
      0,
    ),
    readNotifications: toNumber(
      summary.readNotifications ?? summary.read_notifications ?? summary.read,
      0,
    ),
    unreadNotifications: toNumber(
      summary.unreadNotifications ??
        summary.unread_notifications ??
        summary.unread,
      0,
    ),
    deliveredNotifications: toNumber(
      summary.deliveredNotifications ??
        summary.delivered_notifications ??
        summary.delivered,
      0,
    ),
  };
}

export async function getNotificationsList(
  input: NotificationListFilters = {},
) {
  const filters = notificationListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "notifications",
    NOTIFICATIONS_ADMIN_PATH,
    {
      query: filters,
    },
  );

  return normalizeNotificationsList(raw);
}

export async function getNotificationsDashboard(
  input: NotificationListFilters = {},
) {
  const filters = notificationListFiltersSchema.parse(input);

  const [notifications, typesRaw, summaryRaw] = await Promise.all([
    getNotificationsList(filters),
    callBackofficeService<unknown>(
      "notifications",
      `${NOTIFICATIONS_ADMIN_PATH}/types`,
    ),
    callBackofficeService<unknown>(
      "notifications",
      `${NOTIFICATIONS_ADMIN_PATH}/dashboard`,
      {
        query: filters,
      },
    ),
  ]);

  return notificationsDashboardDataSchema.parse({
    notifications,
    meta: {
      types: normalizeTypes(typesRaw),
    },
    summary: normalizeSummary(summaryRaw),
  });
}

export async function markAdminNotificationRead(notificationId: number) {
  return callBackofficeService<unknown>(
    "notifications",
    `${NOTIFICATIONS_ADMIN_PATH}/${notificationId}/read`,
    { method: "PATCH" },
  );
}
