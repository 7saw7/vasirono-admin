import { query } from "@/lib/db/server";
import type { UsersListFilters } from "@/features/backoffice/users/types";
import type {
  UserBadgeRow,
  UserDetailRow,
  UserFavoriteRow,
  UserListRow,
  UserNotificationRow,
  UserRecentViewRow,
  UserReviewRow,
  UserSessionRow,
} from "@/features/backoffice/users/mapper";

type CountRow = { total: number | string };

function buildWhere(filters: UsersListFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const i = params.length;
    clauses.push(`
      (
        coalesce(u.name, '') ilike $${i}
        or coalesce(u.email, '') ilike $${i}
        or coalesce(u.phone, '') ilike $${i}
      )
    `);
  }

  if (typeof filters.roleId === "number") {
    params.push(filters.roleId);
    clauses.push(`u.role_id = $${params.length}`);
  }

  if (typeof filters.verified === "boolean") {
    params.push(filters.verified);
    clauses.push(`u.verified = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

export async function listUsersQuery(filters: UsersListFilters) {
  const page =
    typeof filters.page === "number" ? filters.page : Number(filters.page ?? 1);
  const pageSize =
    typeof filters.pageSize === "number"
      ? filters.pageSize
      : Number(filters.pageSize ?? 10);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 10;
  const offset = (safePage - 1) * safePageSize;

  const { params, whereSql } = buildWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from users u
      ${whereSql}
    `,
    params
  );

  const listResult = await query<UserListRow>(
    `
      select
        u.id,
        u.name,
        u.email,
        u.phone,
        r.name as role_name,
        u.verified,
        coalesce(reviews_count.reviews_count, 0) as reviews_count,
        coalesce(sessions_count.sessions_count, 0) as sessions_count,
        latest_session.last_session_at,
        u.created_at
      from users u
      inner join roles r
        on r.id = u.role_id
      left join lateral (
        select count(*)::int as reviews_count
        from reviews rev
        where rev.user_id = u.id
      ) reviews_count on true
      left join lateral (
        select count(*)::int as sessions_count
        from user_sessions us
        where us.user_id = u.id
      ) sessions_count on true
      left join lateral (
        select max(us.created_at) as last_session_at
        from user_sessions us
        where us.user_id = u.id
      ) latest_session on true
      ${whereSql}
      order by u.created_at desc, u.id desc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, safePageSize, offset]
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function getUserDetailQuery(userId: string) {
  const result = await query<UserDetailRow>(
    `
      select
        u.id,
        u.name,
        u.email,
        u.phone,
        r.name as role_name,
        u.verified,
        u.created_at,
        u.updated_at
      from users u
      inner join roles r
        on r.id = u.role_id
      where u.id = $1
      limit 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function getUserSessionsQuery(userId: string) {
  const result = await query<UserSessionRow>(
    `
      select id, revoked, created_at, updated_at, expires_at
      from user_sessions
      where user_id = $1
      order by created_at desc, id desc
      limit 20
    `,
    [userId]
  );
  return result.rows;
}

export async function getUserNotificationsQuery(userId: string) {
  const result = await query<UserNotificationRow>(
    `
      select id, title, message, read, created_at
      from notifications
      where user_id = $1
      order by created_at desc, id desc
      limit 20
    `,
    [userId]
  );
  return result.rows;
}

export async function getUserFavoritesQuery(userId: string) {
  const result = await query<UserFavoriteRow>(
    `
      select
        fb.branch_id,
        cb.name as branch_name,
        c.name as company_name,
        fb.created_at
      from favorites_branches fb
      inner join company_branches cb
        on cb.branch_id = fb.branch_id
      inner join companies c
        on c.company_id = cb.company_id
      where fb.user_id = $1
      order by fb.created_at desc
      limit 20
    `,
    [userId]
  );
  return result.rows;
}

export async function getUserRecentViewsQuery(userId: string) {
  const result = await query<UserRecentViewRow>(
    `
      select
        urv.view_id,
        c.name as company_name,
        cb.name as branch_name,
        urv.viewed_at
      from user_recent_views urv
      left join companies c
        on c.company_id = urv.company_id
      left join company_branches cb
        on cb.branch_id = urv.branch_id
      where urv.user_id = $1
      order by urv.viewed_at desc, urv.view_id desc
      limit 20
    `,
    [userId]
  );
  return result.rows;
}

export async function getUserBadgesQuery(userId: string) {
  const result = await query<UserBadgeRow>(
    `
      select
        ub.id,
        b.name as badge_name,
        ub.points,
        ub.earned_at
      from user_badges ub
      inner join badges b
        on b.id = ub.badge_id
      where ub.user_id = $1
      order by ub.earned_at desc nulls last, ub.id desc
      limit 20
    `,
    [userId]
  );
  return result.rows;
}

export async function getUserReviewsQuery(userId: string) {
  const result = await query<UserReviewRow>(
    `
      select
        r.id as review_id,
        cb.name as branch_name,
        r.rating,
        r.comment,
        r.created_at
      from reviews r
      inner join company_branches cb
        on cb.branch_id = r.branch_id
      where r.user_id = $1
      order by r.created_at desc, r.id desc
      limit 20
    `,
    [userId]
  );
  return result.rows;
}