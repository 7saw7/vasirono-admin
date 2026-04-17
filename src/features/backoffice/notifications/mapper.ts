import type {
  NotificationFilterOption,
  NotificationListItem,
} from "./types";

export type NotificationListRow = {
  id: number | string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  type_id: number | string | null;
  type_name: string | null;
  title: string | null;
  message: string | null;
  read: boolean;
  created_at: Date | string | null;
  delivered_at: Date | string | null;
};

export type NotificationFilterOptionRow = {
  id: number | string;
  name: string;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toNullableNumber(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapNotificationListRow(
  row: NotificationListRow
): NotificationListItem {
  return {
    id: toNumber(row.id),
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    typeId: toNullableNumber(row.type_id),
    typeName: row.type_name,
    title: row.title,
    message: row.message,
    read: row.read,
    createdAt: toIsoString(row.created_at),
    deliveredAt: toIsoString(row.delivered_at),
  };
}

export function mapNotificationFilterOptionRow(
  row: NotificationFilterOptionRow
): NotificationFilterOption {
  return {
    label: row.name,
    value: toNumber(row.id),
  };
}