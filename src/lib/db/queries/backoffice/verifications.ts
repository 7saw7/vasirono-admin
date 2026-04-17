import type { PoolClient, QueryResultRow } from "pg";
import { query, withTransaction } from "@/lib/db/server";
import type { VerificationListFilters } from "@/features/backoffice/verifications/types";
import type {
  VerificationAddressMatchRow,
  VerificationCheckRow,
  VerificationDetailRow,
  VerificationDocumentRow,
  VerificationListRow,
  VerificationPublicContactRow,
  VerificationSummaryRow,
  VerificationTimelineRow,
  VerificationWhatsappRow,
} from "@/features/backoffice/verifications/mapper";

type CountRow = {
  total: number | string;
};

type StatusLookupRow = {
  id: number;
  name: string;
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
      (
        lower(coalesce(bvrs.code, '')) = $${index}
        or lower(coalesce(bvrs.name, '')) = $${index}
      )
    `);
  }

  if (filters.level?.trim()) {
    values.push(filters.level.trim().toLowerCase());
    const index = values.length;
    conditions.push(`
      (
        lower(coalesce(bvl.code, '')) = $${index}
        or lower(coalesce(bvl.name, '')) = $${index}
      )
    `);
  }

  if (filters.assignedReviewerId?.trim()) {
    values.push(filters.assignedReviewerId.trim());
    conditions.push(`cvr.assigned_reviewer = $${values.length}`);
  }

  if (filters.companyId !== undefined && filters.companyId !== null) {
    values.push(Number(filters.companyId));
    conditions.push(`cvr.company_id = $${values.length}`);
  }

  return {
    whereClause: conditions.length > 0 ? `where ${conditions.join(" and ")}` : "",
    values,
  };
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
  const page = typeof filters.page === "number" ? filters.page : Number(filters.page ?? 1);
  const pageSize =
    typeof filters.pageSize === "number"
      ? filters.pageSize
      : Number(filters.pageSize ?? 10);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 10;
  const offset = (safePage - 1) * safePageSize;

  const { whereClause, values } = buildWhereClause(filters);

  const countSql = `
    select count(*)::int as total
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
      count(*)::int as total_count,
      count(*) filter (
        where lower(coalesce(bvrs.code, bvrs.name, '')) in ('pending', 'submitted')
      )::int as pending_count,
      count(*) filter (
        where lower(coalesce(bvrs.code, bvrs.name, '')) in ('in_review', 'under_review', 'assigned')
      )::int as in_review_count,
      count(*) filter (
        where lower(coalesce(bvrs.code, bvrs.name, '')) in ('approved', 'verified', 'completed')
      )::int as approved_count,
      count(*) filter (
        where lower(coalesce(bvrs.code, bvrs.name, '')) in ('rejected', 'failed', 'cancelled')
      )::int as rejected_count
    ${BASE_FROM}
    ${whereClause}
  `;

  const [countResult, listResult, summaryResult] = await Promise.all([
    query<CountRow>(countSql, values),
    query<VerificationListRow>(listSql, [...values, safePageSize, offset]),
    query<VerificationSummaryRow>(summarySql, values),
  ]);

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page: safePage,
    pageSize: safePageSize,
    summary: summaryResult.rows[0],
  };
}

export async function getVerificationDetailQuery(requestId: number) {
  const { rows } = await query<VerificationDetailRow>(
    `
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
        cvr.completed_at,
        cvr.approval_notes,
        cvr.rejection_reason,
        cvr.internal_notes,
        cvr.public_summary
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
      where cvr.verification_request_id = $1
      limit 1
    `,
    [requestId]
  );

  return rows[0] ?? null;
}

export async function getVerificationDocumentsQuery(requestId: number) {
  const { rows } = await query<VerificationDocumentRow>(
    `
      select
        cvd.verification_document_id,
        bvdt.name as document_type,
        bvdrs.name as review_status,
        cvd.file_name,
        cvd.file_path,
        cvd.file_bucket,
        cvd.mime_type,
        cvd.uploaded_at,
        cvd.reviewed_at,
        reviewer.name as reviewed_by_name,
        cvd.review_notes
      from company_verification_documents cvd
      left join business_verification_document_types bvdt
        on bvdt.id = cvd.document_type_id
      left join business_verification_document_review_statuses bvdrs
        on bvdrs.id = cvd.review_status_id
      left join users reviewer
        on reviewer.id = cvd.reviewed_by
      where cvd.verification_request_id = $1
        and cvd.is_deleted = false
      order by cvd.uploaded_at desc, cvd.verification_document_id desc
    `,
    [requestId]
  );

  return rows;
}

export async function getVerificationChecksQuery(requestId: number) {
  const { rows } = await query<VerificationCheckRow>(
    `
      select
        cvc.verification_check_id,
        bvm.name as method_name,
        bvcs.name as status_name,
        cvc.score,
        cvc.confidence_score,
        cvc.verified_at,
        cvc.expires_at,
        reviewer.name as reviewed_by_name,
        cvc.notes
      from company_verification_checks cvc
      left join business_verification_methods bvm
        on bvm.id = cvc.method_id
      left join business_verification_check_statuses bvcs
        on bvcs.id = cvc.status_id
      left join users reviewer
        on reviewer.id = cvc.reviewed_by
      where cvc.verification_request_id = $1
      order by cvc.created_at desc, cvc.verification_check_id desc
    `,
    [requestId]
  );

  return rows;
}

export async function getVerificationTimelineQuery(requestId: number) {
  const { rows } = await query<VerificationTimelineRow>(
    `
      select
        cval.audit_log_id,
        cval.action,
        old_status.name as old_status_name,
        new_status.name as new_status_name,
        actor.name as actor_name,
        cval.created_at
      from company_verification_audit_log cval
      left join business_verification_request_statuses old_status
        on old_status.id = cval.old_status_id
      left join business_verification_request_statuses new_status
        on new_status.id = cval.new_status_id
      left join users actor
        on actor.id = cval.actor_user_id
      where cval.verification_request_id = $1
      order by cval.created_at desc, cval.audit_log_id desc
    `,
    [requestId]
  );

  return rows;
}

export async function getVerificationPublicContactsQuery(requestId: number) {
  const { rows } = await query<VerificationPublicContactRow>(
    `
      select
        cpcv.public_contact_verification_id,
        cpcv.contact_source,
        cpcv.contact_label,
        cpcv.contact_value,
        cpcv.normalized_contact_value,
        cpcv.is_primary,
        cpcv.matched_with_branch_contact,
        cpcv.evidence_url,
        cpcv.created_at,
        cpcv.verified_at
      from company_public_contact_verifications cpcv
      where cpcv.verification_request_id = $1
      order by cpcv.created_at desc, cpcv.public_contact_verification_id desc
    `,
    [requestId]
  );

  return rows;
}

export async function getVerificationWhatsappQuery(requestId: number) {
  const { rows } = await query<VerificationWhatsappRow>(
    `
      select
        cwv.whatsapp_verification_id,
        cwv.public_phone,
        cwv.normalized_phone,
        cwv.attempts_count,
        cwv.max_attempts,
        cwv.status,
        cwv.sent_at,
        cwv.expires_at,
        cwv.verified_at,
        cwv.failure_reason,
        cwv.provider_name
      from company_whatsapp_verifications cwv
      where cwv.verification_request_id = $1
      order by cwv.created_at desc, cwv.whatsapp_verification_id desc
    `,
    [requestId]
  );

  return rows;
}

export async function getVerificationAddressMatchesQuery(requestId: number) {
  const { rows } = await query<VerificationAddressMatchRow>(
    `
      select
        cav.address_verification_id,
        cav.source_type,
        cav.declared_address,
        cav.branch_address,
        cav.extracted_address,
        cav.distance_meters,
        cav.matched,
        cav.confidence_score,
        cav.manual_override,
        cav.verified_at,
        cav.notes
      from company_address_verifications cav
      where cav.verification_request_id = $1
      order by cav.created_at desc, cav.address_verification_id desc
    `,
    [requestId]
  );

  return rows;
}

async function findVerificationStatusByCodes(
  client: PoolClient,
  codes: string[]
): Promise<StatusLookupRow | null> {
  const lowered = codes.map((code) => code.toLowerCase());

  const { rows } = await client.query<StatusLookupRow>(
    `
      select id, name
      from business_verification_request_statuses
      where lower(code) = any($1::text[])
         or lower(name) = any($1::text[])
      order by sort_order asc, id asc
      limit 1
    `,
    [lowered]
  );

  return rows[0] ?? null;
}

export async function assignVerificationReviewerQuery(input: {
  requestId: number;
  reviewerUserId: string;
}) {
  return withTransaction(async (client) => {
    const exists = await client.query<{ verification_request_id: number }>(
      `
        select verification_request_id
        from company_verification_requests
        where verification_request_id = $1
        limit 1
      `,
      [input.requestId]
    );

    if (!exists.rows[0]) {
      throw new Error("VERIFICATION_NOT_FOUND");
    }

    const assignedStatus =
      (await findVerificationStatusByCodes(client, ["assigned", "in_review"])) ??
      null;

    await client.query(
      `
        update company_verification_requests
        set
          assigned_reviewer = $2,
          current_status_id = coalesce($3, current_status_id),
          updated_at = now()
        where verification_request_id = $1
      `,
      [input.requestId, input.reviewerUserId, assignedStatus?.id ?? null]
    );

    return {
      verificationRequestId: input.requestId,
      assignedReviewerId: input.reviewerUserId,
    };
  });
}

export async function decideVerificationRequestQuery(input: {
  requestId: number;
  actorUserId: string;
  decision: "approve" | "reject";
  notes?: string;
}) {
  return withTransaction(async (client) => {
    const exists = await client.query<{
      verification_request_id: number;
      current_status_id: number | null;
    }>(
      `
        select verification_request_id, current_status_id
        from company_verification_requests
        where verification_request_id = $1
        limit 1
      `,
      [input.requestId]
    );

    const current = exists.rows[0];
    if (!current) {
      throw new Error("VERIFICATION_NOT_FOUND");
    }

    const targetStatus = await findVerificationStatusByCodes(client, [
      input.decision === "approve" ? "approved" : "rejected",
      input.decision === "approve" ? "verified" : "failed",
      input.decision === "approve" ? "completed" : "cancelled",
    ]);

    if (!targetStatus) {
      throw new Error("MISSING_VERIFICATION_STATUS");
    }

    await client.query(
      `
        update company_verification_requests
        set
          current_status_id = $2,
          reviewed_at = now(),
          completed_at = case when $3 = 'approve' then now() else completed_at end,
          assigned_reviewer = coalesce(assigned_reviewer, $4),
          approval_notes = case
            when $3 = 'approve' then nullif($5::text, '')
            else approval_notes
          end,
          rejection_reason = case
            when $3 = 'reject' then nullif($5::text, '')
            else rejection_reason
          end,
          updated_at = now()
        where verification_request_id = $1
      `,
      [
        input.requestId,
        targetStatus.id,
        input.decision,
        input.actorUserId,
        input.notes ?? "",
      ]
    );

    await client.query(
      `
        insert into company_verification_audit_log (
          verification_request_id,
          actor_user_id,
          action,
          old_status_id,
          new_status_id,
          created_at
        )
        values ($1, $2, $3, $4, $5, now())
      `,
      [
        input.requestId,
        input.actorUserId,
        input.decision === "approve"
          ? "verification_approved"
          : "verification_rejected",
        current.current_status_id,
        targetStatus.id,
      ]
    );

    return {
      verificationRequestId: input.requestId,
      statusName: targetStatus.name,
    };
  });
}

type VerificationRequestDecisionRow = {
  verification_request_id: number | string;
  company_id: number | string;
  current_status_id: number | string;
  current_status_code: string;
  current_status_name: string;
  verification_level_id: number | string | null;
  reviewed_at: string | null;
  completed_at: string | null;
};

type VerificationRequestBaseRow = {
  verification_request_id: number | string;
  company_id: number | string;
  current_status_id: number | string;
  verification_level_id: number | string | null;
};

type VerificationRequestStatusRow = {
  id: number | string;
  code: string;
  name: string;
};

type CompanyVerificationSyncRow = {
  company_id: number | string;
  verification_status_id: number | string | null;
};

function getExecutor(client?: PoolClient) {
  return {
    query: <T extends QueryResultRow>(
      text: string,
      params: unknown[] = []
    ) => (client ? client.query<T>(text, params) : query<T>(text, params)),
  };
}

export async function getVerificationRequestForDecisionQuery(
  requestId: number,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<VerificationRequestBaseRow>(
    `
      select
        vr.verification_request_id,
        vr.company_id,
        vr.current_status_id,
        vr.verification_level_id
      from company_verification_requests vr
      where vr.verification_request_id = $1
      limit 1
    `,
    [requestId]
  );

  return result.rows[0] ?? null;
}

export async function getVerificationRequestStatusByCodeQuery(
  code: string,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<VerificationRequestStatusRow>(
    `
      select
        id,
        code,
        name
      from business_verification_request_statuses
      where lower(code) = lower($1)
      limit 1
    `,
    [code]
  );

  return result.rows[0] ?? null;
}

export async function updateVerificationDecisionQuery(
  requestId: number,
  statusId: number,
  input: {
    approvalNotes?: string | null;
    rejectionReason?: string | null;
  },
  reviewerUserId: string,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<VerificationRequestDecisionRow>(
    `
      update company_verification_requests vr
      set
        current_status_id = $2,
        assigned_reviewer = coalesce(vr.assigned_reviewer, $3),
        reviewed_at = now(),
        completed_at = now(),
        approval_notes = $4,
        rejection_reason = $5,
        updated_at = now()
      from business_verification_request_statuses s
      where vr.verification_request_id = $1
        and s.id = $2
      returning
        vr.verification_request_id,
        vr.company_id,
        vr.current_status_id,
        s.code as current_status_code,
        s.name as current_status_name,
        vr.verification_level_id,
        vr.reviewed_at,
        vr.completed_at
    `,
    [
      requestId,
      statusId,
      reviewerUserId,
      input.approvalNotes ?? null,
      input.rejectionReason ?? null,
    ]
  );

  return result.rows[0] ?? null;
}

export async function insertVerificationAuditLogQuery(
  input: {
    verificationRequestId: number;
    actorUserId: string;
    oldStatusId: number;
    newStatusId: number;
    action: string;
    details?: Record<string, unknown> | null;
  },
  client?: PoolClient
) {
  const db = getExecutor(client);

  await db.query(
    `
      insert into company_verification_audit_log (
        verification_request_id,
        actor_user_id,
        action,
        old_status_id,
        new_status_id,
        details
      )
      values ($1, $2, $3, $4, $5, $6::jsonb)
    `,
    [
      input.verificationRequestId,
      input.actorUserId,
      input.action,
      input.oldStatusId,
      input.newStatusId,
      input.details ? JSON.stringify(input.details) : null,
    ]
  );
}

export async function upsertCompanyVerificationProfileFromRequestQuery(
  input: {
    companyId: number;
    requestId: number;
    verificationLevelId?: number | null;
    approved: boolean;
    notes?: string | null;
  },
  client?: PoolClient
) {
  const db = getExecutor(client);

  await db.query(
    `
      insert into company_verification_profiles (
        company_id,
        latest_verification_request_id,
        verification_level_id,
        verification_score,
        is_identity_verified,
        is_whatsapp_verified,
        is_address_verified,
        is_document_verified,
        is_manual_review_completed,
        verified_at,
        notes,
        updated_at
      )
      values (
        $1,
        $2,
        $3,
        case when $4 = true then 100 else 0 end,
        $4,
        $4,
        $4,
        $4,
        true,
        case when $4 = true then now() else null end,
        $5,
        now()
      )
      on conflict (company_id)
      do update set
        latest_verification_request_id = excluded.latest_verification_request_id,
        verification_level_id = excluded.verification_level_id,
        verification_score = excluded.verification_score,
        is_identity_verified = excluded.is_identity_verified,
        is_whatsapp_verified = excluded.is_whatsapp_verified,
        is_address_verified = excluded.is_address_verified,
        is_document_verified = excluded.is_document_verified,
        is_manual_review_completed = excluded.is_manual_review_completed,
        verified_at = excluded.verified_at,
        notes = excluded.notes,
        updated_at = now()
    `,
    [
      input.companyId,
      input.requestId,
      input.verificationLevelId ?? null,
      input.approved,
      input.notes ?? null,
    ]
  );
}

export async function syncCompanyVerificationStatusFromProfileQuery(
  companyId: number,
  approved: boolean,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const targetName = approved ? "verified" : "pending";

  const statusResult = await db.query<{ id: number | string; name: string }>(
    `
      select id, name
      from verification_statuses
      where lower(name) = lower($1)
      limit 1
    `,
    [targetName]
  );

  const statusId = statusResult.rows[0]?.id
    ? Number(statusResult.rows[0].id)
    : null;

  if (statusId === null) {
    return {
      companyId,
      verificationStatusId: null,
    };
  }

  const result = await db.query<CompanyVerificationSyncRow>(
    `
      update companies
      set
        verification_status_id = $2,
        updated_at = now()
      where company_id = $1
      returning company_id, verification_status_id
    `,
    [companyId, statusId]
  );

  const row = result.rows[0];

  return {
    companyId: Number(row?.company_id ?? companyId),
    verificationStatusId:
      row?.verification_status_id !== null &&
      row?.verification_status_id !== undefined
        ? Number(row.verification_status_id)
        : null,
  };
}