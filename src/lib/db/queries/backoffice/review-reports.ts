import { query, withTransaction } from "@/lib/db/server";
import type { ReviewReportListFilters } from "@/features/backoffice/review-reports/types";
import type {
  ReviewReportDetailRow,
  ReviewReportRow,
} from "@/features/backoffice/review-reports/mapper";

type CountRow = { total: number | string };

function buildWhere(filters: ReviewReportListFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const i = params.length;
    clauses.push(`
      (
        coalesce(c.name, '') ilike $${i}
        or coalesce(cb.name, '') ilike $${i}
        or coalesce(u.name, '') ilike $${i}
        or coalesce(rr.reason, '') ilike $${i}
        or coalesce(rr.details, '') ilike $${i}
      )
    `);
  }

  if (filters.status?.trim()) {
    params.push(filters.status.trim().toLowerCase());
    clauses.push(`lower(coalesce(rrs.code, rrs.name, '')) = $${params.length}`);
  }

  if (typeof filters.companyId === "number") {
    params.push(filters.companyId);
    clauses.push(`c.company_id = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

const BASE_FROM = `
  from review_reports rr
  inner join reviews r
    on r.id = rr.review_id
  inner join company_branches cb
    on cb.branch_id = r.branch_id
  inner join companies c
    on c.company_id = cb.company_id
  inner join users u
    on u.id = rr.user_id
  left join review_report_statuses rrs
    on rrs.id = rr.status_id
  left join users reviewer
    on reviewer.id = rr.reviewed_by
`;

export async function listReviewReportsQuery(filters: ReviewReportListFilters) {
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
    `select count(*)::int as total ${BASE_FROM} ${whereSql}`,
    params
  );

  const listResult = await query<ReviewReportRow>(
    `
      select
        rr.report_id,
        rr.review_id,
        c.company_id,
        c.name as company_name,
        cb.name as branch_name,
        u.id as reporter_user_id,
        u.name as reporter_name,
        coalesce(rrs.name, 'Sin estado') as status_name,
        lower(coalesce(rrs.code, rrs.name, 'unknown')) as status_code,
        rr.reason,
        rr.details,
        rr.created_at,
        rr.reviewed_at,
        reviewer.name as reviewed_by_name
      ${BASE_FROM}
      ${whereSql}
      order by rr.created_at desc, rr.report_id desc
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

export async function getReviewReportDetailQuery(reportId: number) {
  const result = await query<ReviewReportDetailRow>(
    `
      select
        rr.report_id,
        rr.review_id,
        c.company_id,
        c.name as company_name,
        cb.name as branch_name,
        u.id as reporter_user_id,
        u.name as reporter_name,
        coalesce(rrs.name, 'Sin estado') as status_name,
        lower(coalesce(rrs.code, rrs.name, 'unknown')) as status_code,
        rr.reason,
        rr.details,
        rr.created_at,
        rr.reviewed_at,
        reviewer.name as reviewed_by_name,
        r.comment as review_comment,
        r.rating as review_rating,
        r.created_at as review_created_at
      ${BASE_FROM}
      where rr.report_id = $1
      limit 1
    `,
    [reportId]
  );

  return result.rows[0] ?? null;
}

export async function resolveReviewReportQuery(input: {
  reportId: number;
  actorUserId: string;
  status: "resolved" | "hidden";
  resolutionNotes?: string;
}) {
  return withTransaction(async (client) => {
    const report = await client.query<{ report_id: number }>(
      `select report_id from review_reports where report_id = $1 limit 1`,
      [input.reportId]
    );

    if (!report.rows[0]) {
      throw new Error("REVIEW_REPORT_NOT_FOUND");
    }

    const statusQuery = await client.query<{ id: number; name: string }>(
      `
        select id, name
        from review_report_statuses
        where lower(coalesce(code, name, '')) in (
          ${input.status === "hidden" ? "'hidden','resolved_hidden'" : "'resolved','approved','visible'"}
        )
        order by id asc
        limit 1
      `
    );

    if (!statusQuery.rows[0]) {
      throw new Error("REVIEW_REPORT_STATUS_NOT_FOUND");
    }

    await client.query(
      `
        update review_reports
        set
          status_id = $2,
          reviewed_at = now(),
          reviewed_by = $3,
          resolution_notes = nullif($4::text, '')
        where report_id = $1
      `,
      [
        input.reportId,
        statusQuery.rows[0].id,
        input.actorUserId,
        input.resolutionNotes ?? "",
      ]
    );

    return {
      reportId: input.reportId,
      statusName: statusQuery.rows[0].name,
    };
  });
}