import type { PoolClient, QueryResultRow } from "pg";

import { query } from "@/lib/db/server";
import type { ReviewsListFilters } from "@/features/backoffice/reviews/types";
import type {
  ReviewDetailRow,
  ReviewListRow,
  ReviewMediaRow,
  ReviewResponseRow,
  ReviewUsefulnessRow,
} from "@/features/backoffice/reviews/mapper";

type CountRow = { total: number | string };

function buildWhere(filters: ReviewsListFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const i = params.length;
    clauses.push(`
      (
        coalesce(u.name, '') ilike $${i}
        or coalesce(u.email, '') ilike $${i}
        or coalesce(c.name, '') ilike $${i}
        or coalesce(cb.name, '') ilike $${i}
        or coalesce(r.comment, '') ilike $${i}
      )
    `);
  }

  if (typeof filters.validated === "boolean") {
    params.push(filters.validated);
    clauses.push(`r.validated = $${params.length}`);
  }

  if (typeof filters.hidden === "boolean") {
    params.push(filters.hidden);
    clauses.push(`coalesce(r.is_hidden, false) = $${params.length}`);
  }

  if (typeof filters.branchId === "number") {
    params.push(filters.branchId);
    clauses.push(`r.branch_id = $${params.length}`);
  }

  if (typeof filters.companyId === "number") {
    params.push(filters.companyId);
    clauses.push(`cb.company_id = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

const FROM_SQL = `
  from reviews r
  inner join users u
    on u.id = r.user_id
  inner join company_branches cb
    on cb.branch_id = r.branch_id
  inner join companies c
    on c.company_id = cb.company_id
  left join lateral (
    select
      rr.id,
      rrs.name as status_name
    from review_responses rr
    left join review_response_statuses rrs
      on rrs.id = rr.status_id
    where rr.review_id = r.id
    limit 1
  ) response_state on true
  left join lateral (
    select
      rus.usefulness_score
    from review_usefulness_scores rus
    where rus.review_id = r.id
    limit 1
  ) usefulness on true
  left join lateral (
    select
      count(*)::int as reports_count
    from review_reports rep
    where rep.review_id = r.id
  ) reports on true
`;

export async function listReviewsQuery(filters: ReviewsListFilters) {
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
    `select count(*)::int as total ${FROM_SQL} ${whereSql}`,
    params
  );

  const listResult = await query<ReviewListRow>(
    `
      select
        r.id as review_id,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        c.company_id,
        c.name as company_name,
        cb.branch_id,
        cb.name as branch_name,
        r.rating,
        r.comment,
        r.validated,
        coalesce(r.is_hidden, false) as is_hidden,
        coalesce(reports.reports_count, 0) as reports_count,
        response_state.status_name as response_status,
        coalesce(usefulness.usefulness_score, 0) as usefulness_score,
        r.created_at
      ${FROM_SQL}
      ${whereSql}
      order by r.created_at desc, r.id desc
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

export async function getReviewDetailQuery(reviewId: number) {
  const result = await query<ReviewDetailRow>(
    `
      select
        r.id as review_id,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        c.company_id,
        c.name as company_name,
        cb.branch_id,
        cb.name as branch_name,
        r.rating,
        r.comment,
        r.validated,
        coalesce(r.is_hidden, false) as is_hidden,
        coalesce(reports.reports_count, 0) as reports_count,
        response_state.status_name as response_status,
        coalesce(usefulness.usefulness_score, 0) as usefulness_score,
        r.created_at
      ${FROM_SQL}
      where r.id = $1
      limit 1
    `,
    [reviewId]
  );

  return result.rows[0] ?? null;
}

export async function getReviewMediaQuery(reviewId: number) {
  const result = await query<ReviewMediaRow>(
    `
      select
        rm.id,
        rmt.name as media_type,
        rm.url,
        rm.is_cover,
        rm.sort_order
      from review_media rm
      left join review_media_types rmt
        on rmt.id = rm.media_type_id
      where rm.review_id = $1
      order by rm.sort_order asc, rm.id asc
    `,
    [reviewId]
  );

  return result.rows;
}

export async function getReviewResponseQuery(reviewId: number) {
  const result = await query<ReviewResponseRow>(
    `
      select
        rr.id,
        rr.company_id,
        rr.responder_user_id,
        u.name as responder_name,
        rrs.name as status_name,
        rr.response_text,
        rr.responded_at
      from review_responses rr
      left join users u
        on u.id = rr.responder_user_id
      left join review_response_statuses rrs
        on rrs.id = rr.status_id
      where rr.review_id = $1
      limit 1
    `,
    [reviewId]
  );

  return result.rows[0] ?? null;
}

export async function getReviewUsefulnessQuery(reviewId: number) {
  const result = await query<ReviewUsefulnessRow>(
    `
      select
        likes_count,
        dislikes_count,
        reports_count,
        media_count,
        response_count,
        comment_length,
        has_comment,
        is_validated,
        usefulness_score,
        confidence_score,
        final_score,
        calculated_at
      from review_usefulness_scores
      where review_id = $1
      limit 1
    `,
    [reviewId]
  );

  return result.rows[0] ?? null;
}

type ReviewBaseRow = {
  id: number | string;
  is_hidden: boolean | null;
  hidden_at: Date | string | null;
  hidden_by: string | null;
  hidden_reason: string | null;
  moderation_updated_at: Date | string | null;
};

type ReviewReportBaseRow = {
  report_id: number | string;
  review_id: number | string;
  status_id: number | string;
};

type ReviewReportStatusRow = {
  id: number | string;
  code: string;
  name: string;
};

type ReviewReportResolutionRow = {
  report_id: number | string;
  review_id: number | string;
  status_id: number | string;
  status_code: string;
  status_name: string;
  reviewed_at: Date | string | null;
  reviewed_by: string | null;
  resolution_notes: string | null;
};

function getExecutor(client?: PoolClient) {
  return {
    query: <T extends QueryResultRow>(
      text: string,
      params: unknown[] = []
    ) => (client ? client.query<T>(text, params) : query<T>(text, params)),
  };
}

export async function getReviewByIdQuery(
  reviewId: number,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<ReviewBaseRow>(
    `
    select
      r.id,
      coalesce(r.is_hidden, false) as is_hidden,
      r.hidden_at,
      r.hidden_by,
      r.hidden_reason,
      r.moderation_updated_at
    from reviews r
    where r.id = $1
    limit 1
    `,
    [reviewId]
  );

  return result.rows[0] ?? null;
}

export async function hideReviewQuery(
  input: {
    reviewId: number;
    actorUserId: string;
    reason: string;
  },
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<ReviewBaseRow>(
    `
      update reviews
      set
        is_hidden = true,
        hidden_at = now(),
        hidden_by = $2,
        hidden_reason = $3,
        moderation_updated_at = now()
      where id = $1
      returning
        id,
        is_hidden,
        hidden_at,
        hidden_by,
        hidden_reason,
        moderation_updated_at
    `,
    [input.reviewId, input.actorUserId, input.reason]
  );

  return result.rows[0] ?? null;
}

export async function restoreReviewQuery(
  input: {
    reviewId: number;
  },
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<ReviewBaseRow>(
    `
      update reviews
      set
        is_hidden = false,
        hidden_at = null,
        hidden_by = null,
        hidden_reason = null,
        moderation_updated_at = now()
      where id = $1
      returning
        id,
        is_hidden,
        hidden_at,
        hidden_by,
        hidden_reason,
        moderation_updated_at
    `,
    [input.reviewId]
  );

  return result.rows[0] ?? null;
}

export async function getReviewReportByIdQuery(
  reportId: number,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<ReviewReportBaseRow>(
    `
      select
        rr.report_id,
        rr.review_id,
        rr.status_id
      from review_reports rr
      where rr.report_id = $1
      limit 1
    `,
    [reportId]
  );

  return result.rows[0] ?? null;
}

export async function getReviewReportStatusByCodeQuery(
  code: string,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<ReviewReportStatusRow>(
    `
      select
        rrs.id,
        rrs.code,
        rrs.name
      from review_report_statuses rrs
      where lower(rrs.code) = lower($1)
      limit 1
    `,
    [code]
  );

  return result.rows[0] ?? null;
}

export async function resolveReviewReportQuery(
  input: {
    reportId: number;
    statusId: number;
    actorUserId: string;
    resolutionNotes?: string | null;
  },
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<ReviewReportResolutionRow>(
    `
      update review_reports rr
      set
        status_id = $2,
        reviewed_at = now(),
        reviewed_by = $3,
        resolution_notes = $4
      from review_report_statuses rrs
      where rr.report_id = $1
        and rrs.id = $2
      returning
        rr.report_id,
        rr.review_id,
        rr.status_id,
        rrs.code as status_code,
        rrs.name as status_name,
        rr.reviewed_at,
        rr.reviewed_by,
        rr.resolution_notes
    `,
    [
      input.reportId,
      input.statusId,
      input.actorUserId,
      input.resolutionNotes ?? null,
    ]
  );

  return result.rows[0] ?? null;
}

export async function resolveOpenReportsForReviewQuery(
  input: {
    reviewId: number;
    actorUserId: string;
    statusId: number;
    resolutionNotes?: string | null;
  },
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<{ affected_rows: number | string }>(
    `
      with updated as (
        update review_reports rr
        set
          status_id = $2,
          reviewed_at = now(),
          reviewed_by = $3,
          resolution_notes = coalesce(rr.resolution_notes, $4)
        where rr.review_id = $1
          and rr.reviewed_at is null
        returning rr.report_id
      )
      select count(*)::int as affected_rows
      from updated
    `,
    [
      input.reviewId,
      input.statusId,
      input.actorUserId,
      input.resolutionNotes ?? "Reporte resuelto automáticamente por ocultamiento de reseña.",
    ]
  );

  return Number(result.rows[0]?.affected_rows ?? 0);
}