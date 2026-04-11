import { query } from "@/lib/db/server";
import type { VerificationListFilters } from "@/features/backoffice/verifications/types";
import type {
  VerificationListRow,
  VerificationSummaryRow,
} from "@/features/backoffice/verifications/mapper";

type CountRow = {
  total: number | string;
};

function buildWhereClause(filters: VerificationListFilters) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search?.trim()) {
    values.push(`%${filters.search.trim()}%`);
    const index = values.length;

    conditions.push(`
      (
        c.name ilike $${index}
        or requester.name ilike $${index}
        or requester.email ilike $${index}
        or reviewer.name ilike $${index}
      )
    `);
  }

  if (filters.status?.trim()) {
    values.push(filters.status.trim().toLowerCase());
    const index = values.length;

    conditions.push(`
      lower(coalesce(bvrs.code, bvrs.name, '')) = $${index}
      or lower(coalesce(bvrs.name, '')) = $${index}
    `);
  }

  if (filters.level?.trim()) {
    values.push(filters.level.trim().toLowerCase());
    const index = values.length;

    conditions.push(`
      lower(coalesce(bvl.code, bvl.name, '')) = $${index}
      or lower(coalesce(bvl.name, '')) = $${index}
    `);
  }

  if (filters.assignedReviewerId?.trim()) {
    values.push(filters.assignedReviewerId.trim());
    conditions.push(`cvr.assigned_reviewer = $${values.length}`);
  }

  if (filters.companyId) {
    values.push(Number(filters.companyId));
    conditions.push(`cvr.company_id = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

  return { whereClause, values };
}

const BASE_FROM = `
  from company_verification_requests cvr
  inner join companies c
    on c.company_id = cvr.company_id
  inner join users requester
    on requester.id = cvr.requested_by
  left join users reviewer
    on reviewer.id = cvr.assigned_reviewer
  left join business_verification_request_statuses bvrs
    on bvrs.id = cvr.current_status_id
  left join business_verification_levels bvl
    on bvl.id = cvr.verification_level_id
`;

export async function listVerificationsQuery(filters: VerificationListFilters) {
  const page = Number(filters.page ?? 1);
  const pageSize = Number(filters.pageSize ?? 10);
  const offset = (page - 1) * pageSize;

  const { whereClause, values } = buildWhereClause(filters);

  const countSql = `
    select count(*) as total
    ${BASE_FROM}
    ${whereClause}
  `;

  const listSql = `
    select
      cvr.verification_request_id,
      cvr.company_id,
      c.name as company_name,
      cvr.claim_request_id,
      requester.id as requested_by_id,
      requester.name as requested_by_name,
      requester.email as requested_by_email,
      bvrs.id as status_id,
      coalesce(bvrs.name, 'Sin estado') as status_name,
      lower(coalesce(bvrs.code, bvrs.name, 'unknown')) as status_code,
      bvl.name as verification_level,
      reviewer.id as assigned_reviewer_id,
      reviewer.name as assigned_reviewer_name,
      cvr.started_at,
      cvr.submitted_at,
      cvr.reviewed_at,
      cvr.expires_at,
      cvr.completed_at
    ${BASE_FROM}
    ${whereClause}
    order by cvr.updated_at desc, cvr.verification_request_id desc
    limit $${values.length + 1}
    offset $${values.length + 2}
  `;

  const summarySql = `
    select
      count(*) as total_count,
      count(*) filter (
        where lower(coalesce(bvrs.code, bvrs.name, '')) in ('pending', 'submitted')
      ) as pending_count,
      count(*) filter (
        where lower(coalesce(bvrs.code, bvrs.name, '')) in ('in_review', 'under_review', 'assigned')
      ) as in_review_count,
      count(*) filter (
        where lower(coalesce(bvrs.code, bvrs.name, '')) in ('approved', 'verified', 'completed')
      ) as approved_count,
      count(*) filter (
        where lower(coalesce(bvrs.code, bvrs.name, '')) in ('rejected', 'failed', 'cancelled')
      ) as rejected_count
    ${BASE_FROM}
    ${whereClause}
  `;

  const [countResult, listResult, summaryResult] = await Promise.all([
    query<CountRow>(countSql, values),
    query<VerificationListRow>(listSql, [...values, pageSize, offset]),
    query<VerificationSummaryRow>(summarySql, values),
  ]);

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page,
    pageSize,
    summary: summaryResult.rows[0],
  };
}

export async function getVerificationDetailQuery(requestId: number) {
  const { rows } = await query<any>(
    `
    select
      cvr.verification_request_id,
      cvr.company_id,
      c.name as company_name,
      bvrs.name as status_name,
      lower(coalesce(bvrs.code, bvrs.name)) as status_code,
      bvl.name as verification_level,
      requester.name as requested_by_name,
      reviewer.name as assigned_reviewer_name,
      cvr.started_at,
      cvr.submitted_at,
      cvr.reviewed_at,
      cvr.completed_at
    from company_verification_requests cvr
    inner join companies c on c.company_id = cvr.company_id
    inner join users requester on requester.id = cvr.requested_by
    left join users reviewer on reviewer.id = cvr.assigned_reviewer
    left join business_verification_request_statuses bvrs
      on bvrs.id = cvr.current_status_id
    left join business_verification_levels bvl
      on bvl.id = cvr.verification_level_id
    where cvr.verification_request_id = $1
    limit 1
    `,
    [requestId]
  );

  return rows[0] ?? null;
}

export async function getVerificationDocumentsQuery(requestId: number) {
  const { rows } = await query<any>(
    `
    select
      id,
      document_type,
      file_url,
      status
    from company_verification_documents
    where verification_request_id = $1
    order by id desc
    `,
    [requestId]
  );

  return rows;
}

export async function getVerificationChecksQuery(requestId: number) {
  const { rows } = await query<any>(
    `
    select
      id,
      check_type,
      status,
      notes
    from company_verification_checks
    where verification_request_id = $1
    `,
    [requestId]
  );

  return rows;
}

export async function getVerificationTimelineQuery(requestId: number) {
  const { rows } = await query<any>(
    `
    select
      id,
      event_type,
      created_at,
      actor_id,
      metadata,
      u.name as actor_name
    from company_verification_audit_log log
    left join users u on u.id = log.actor_id
    where verification_request_id = $1
    order by created_at desc
    `,
    [requestId]
  );

  return rows;
}