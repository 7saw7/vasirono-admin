import { query } from "@/lib/db/server";
import type { NotificationListFilters } from "@/features/backoffice/notifications/types";
import type {
  NotificationFilterOptionRow,
  NotificationListRow,
} from "@/features/backoffice/notifications/mapper";

type CountRow = {
  total: number | string;
};

type NotificationSummaryRow = {
  total_notifications: number | string | null;
  read_notifications: number | string | null;
  unread_notifications: number | string | null;
  delivered_notifications: number | string | null;
};

function normalizePage(value: string | number | undefined, fallback = 1) {
  const parsed = typeof value === "number" ? value : Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNumericId(value: string | number | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBooleanOrNull(
  value: string | boolean | undefined
): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function buildNotificationsWhere(filters: NotificationListFilters) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const i = params.length;
    clauses.push(
      `(n.title ilike $${i} or n.message ilike $${i} or u.name ilike $${i} or u.email ilike $${i})`
    );
  }

  const typeId = toNumericId(filters.typeId);
  if (typeId) {
    params.push(typeId);
    clauses.push(`n.type_id = $${params.length}`);
  }

  const read = toBooleanOrNull(filters.read);
  if (read !== null) {
    params.push(read);
    clauses.push(`n.read = $${params.length}`);
  }

  if (filters.userId?.trim()) {
    params.push(filters.userId.trim());
    clauses.push(`n.user_id = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

export async function listNotificationsQuery(filters: NotificationListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;

  const { params, whereSql } = buildNotificationsWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from notifications n
      left join users u
        on u.id = n.user_id
      left join notification_types nt
        on nt.id = n.type_id
      ${whereSql}
    `,
    params
  );

  const listResult = await query<NotificationListRow>(
    `
      select
        n.id,
        n.user_id,
        u.name as user_name,
        u.email as user_email,
        n.type_id,
        nt.name as type_name,
        n.title,
        n.message,
        n.read,
        n.created_at,
        n.delivered_at
      from notifications n
      left join users u
        on u.id = n.user_id
      left join notification_types nt
        on nt.id = n.type_id
      ${whereSql}
      order by n.created_at desc, n.id desc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page,
    pageSize,
  };
}

export async function getNotificationsSummaryQuery(
  filters: NotificationListFilters
) {
  const { params, whereSql } = buildNotificationsWhere(filters);

  const result = await query<NotificationSummaryRow>(
    `
      select
        count(*)::int as total_notifications,
        count(*) filter (where n.read = true)::int as read_notifications,
        count(*) filter (where n.read = false)::int as unread_notifications,
        count(*) filter (where n.delivered_at is not null)::int as delivered_notifications
      from notifications n
      left join users u
        on u.id = n.user_id
      left join notification_types nt
        on nt.id = n.type_id
      ${whereSql}
    `,
    params
  );

  return result.rows[0] ?? {
    total_notifications: 0,
    read_notifications: 0,
    unread_notifications: 0,
    delivered_notifications: 0,
  };
}

export async function listNotificationTypesQuery() {
  const result = await query<NotificationFilterOptionRow>(
    `
      select id, name
      from notification_types
      order by name asc
    `
  );

  return result.rows;
}