import type { CompanyListFilters } from "@/features/backoffice/companies/types";
import type {
  CompanyDetailAuditRow,
  CompanyDetailBranchRow,
  CompanyDetailClaimRow,
  CompanyDetailMediaRow,
  CompanyDetailPaymentRow,
  CompanyDetailRow,
  CompanyDetailSubscriptionRow,
  CompanyDetailVerificationRow,
  CompanyListRow,
} from "@/features/backoffice/companies/mapper";
import { query } from "@/lib/db/server";

type ListCompaniesQueryResult = {
  rows: CompanyListRow[];
  total: number;
  page: number;
  pageSize: number;
};

function buildListCompaniesWhere(filters: CompanyListFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    const index = params.length;
    clauses.push(
      `(c.name ilike $${index} or c.email ilike $${index} or c.phone ilike $${index})`
    );
  }

  if (filters.verificationStatus) {
    params.push(filters.verificationStatus);
    const index = params.length;
    clauses.push(`vs.name = $${index}`);
  }

  if (filters.subscriptionStatus) {
    params.push(filters.subscriptionStatus);
    const index = params.length;
    clauses.push(`latest_subscription.status_name = $${index}`);
  }

  const whereSql = clauses.length > 0 ? `where ${clauses.join(" and ")}` : "";
  return { whereSql, params };
}

export async function listCompaniesQuery(
  filters: CompanyListFilters
): Promise<ListCompaniesQueryResult> {
  const page = typeof filters.page === "number" ? filters.page : 1;
  const pageSize = typeof filters.pageSize === "number" ? filters.pageSize : 20;
  const offset = (page - 1) * pageSize;

  const { whereSql, params } = buildListCompaniesWhere(filters);

  const countResult = await query<{ total: number | string }>(
    `
      select count(*)::int as total
      from companies c
      left join verification_statuses vs
        on vs.id = c.verification_status_id
      left join lateral (
        select
          s.company_id,
          ss.name as status_name
        from subscriptions s
        left join subscription_statuses ss
          on ss.id = s.status_id
        where s.company_id = c.company_id
        order by coalesce(s.end_date, s.start_date, current_date) desc, s.id desc
        limit 1
      ) latest_subscription
        on true
      ${whereSql}
    `,
    params
  );

  const listParams = [...params, pageSize, offset];
  const limitParam = listParams.length - 1;
  const offsetParam = listParams.length;

  const listResult = await query<CompanyListRow>(
    `
      select
        c.company_id,
        c.name,
        c.email,
        c.phone,
        vs.name as verification_status,
        bvl.name as verification_level,
        coalesce(cvp.verification_score, 0) as verification_score,
        latest_subscription.plan_name,
        latest_subscription.status_name as subscription_status,
        coalesce(branch_counts.branches_count, 0) as branches_count,
        main_branch.district_label,
        coalesce(claim_counts.pending_claims_count, 0) as pending_claims_count,
        c.updated_at
      from companies c
      left join verification_statuses vs
        on vs.id = c.verification_status_id
      left join company_verification_profiles cvp
        on cvp.company_id = c.company_id
      left join business_verification_levels bvl
        on bvl.id = cvp.verification_level_id
      left join lateral (
        select
          s.company_id,
          p.name as plan_name,
          ss.name as status_name
        from subscriptions s
        left join plans p
          on p.id = s.plan_id
        left join subscription_statuses ss
          on ss.id = s.status_id
        where s.company_id = c.company_id
        order by coalesce(s.end_date, s.start_date, current_date) desc, s.id desc
        limit 1
      ) latest_subscription
        on true
      left join lateral (
        select count(*)::int as branches_count
        from company_branches cb
        where cb.company_id = c.company_id
      ) branch_counts
        on true
      left join lateral (
        select d.name as district_label
        from company_branches cb
        left join districts d
          on d.district_id = cb.district_id
        where cb.company_id = c.company_id
        order by cb.is_main desc, cb.branch_id asc
        limit 1
      ) main_branch
        on true
      left join lateral (
        select count(*)::int as pending_claims_count
        from company_claim_requests ccr
        where ccr.company_id = c.company_id
          and ccr.reviewed_at is null
      ) claim_counts
        on true
      ${whereSql}
      order by c.updated_at desc, c.company_id desc
      limit $${limitParam} offset $${offsetParam}
    `,
    listParams
  );

  return {
    rows: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
    page,
    pageSize,
  };
}

export async function getCompanyDetailQuery(companyId: number) {
  const companyResult = await query<CompanyDetailRow>(
    `
      select
        c.company_id,
        c.name,
        c.description,
        c.address,
        c.phone,
        c.email,
        c.website,
        c.lat,
        c.lon,
        vs.name as verification_status,
        c.created_at,
        c.updated_at
      from companies c
      left join verification_statuses vs
        on vs.id = c.verification_status_id
      where c.company_id = $1
      limit 1
    `,
    [companyId]
  );

  const company = companyResult.rows[0] ?? null;

  if (!company) {
    return null;
  }

  const [
    branchesResult,
    mediaResult,
    verificationResult,
    subscriptionResult,
    paymentsResult,
    claimsResult,
    auditResult,
  ] = await Promise.all([
    query<CompanyDetailBranchRow>(
      `
        select
          cb.branch_id,
          cb.name,
          cb.address,
          d.name as district_name,
          cb.phone,
          cb.email,
          cb.is_main,
          cb.is_active,
          cb.created_at,
          cb.updated_at
        from company_branches cb
        left join districts d
          on d.district_id = cb.district_id
        where cb.company_id = $1
        order by cb.is_main desc, cb.name asc
      `,
      [companyId]
    ),
    query<CompanyDetailMediaRow>(
      `
        select
          cm.media_id,
          mt.name as media_type,
          cm.url,
          cm.created_at
        from company_media cm
        left join media_types mt
          on mt.media_type_id = cm.media_type_id
        where cm.company_id = $1
        order by cm.media_id desc
      `,
      [companyId]
    ),
    query<CompanyDetailVerificationRow>(
      `
        select
          vs.name as status_label,
          bvl.name as profile_level,
          coalesce(cvp.verification_score, 0) as verification_score,
          coalesce(cvp.is_identity_verified, false) as is_identity_verified,
          coalesce(cvp.is_whatsapp_verified, false) as is_whatsapp_verified,
          coalesce(cvp.is_address_verified, false) as is_address_verified,
          coalesce(cvp.is_document_verified, false) as is_document_verified,
          coalesce(cvp.is_manual_review_completed, false) as is_manual_review_completed,
          cvp.verified_at,
          cvp.expires_at,
          cvr.verification_request_id as latest_request_id,
          bvrs.name as latest_request_status,
          cvr.submitted_at as latest_request_submitted_at
        from companies c
        left join verification_statuses vs
          on vs.id = c.verification_status_id
        left join company_verification_profiles cvp
          on cvp.company_id = c.company_id
        left join business_verification_levels bvl
          on bvl.id = cvp.verification_level_id
        left join company_verification_requests cvr
          on cvr.verification_request_id = cvp.latest_verification_request_id
        left join business_verification_request_statuses bvrs
          on bvrs.id = cvr.current_status_id
        where c.company_id = $1
        limit 1
      `,
      [companyId]
    ),
    query<CompanyDetailSubscriptionRow>(
      `
        select
          s.id as subscription_id,
          p.name as plan_name,
          ss.name as status_name,
          s.start_date,
          s.end_date
        from subscriptions s
        left join plans p
          on p.id = s.plan_id
        left join subscription_statuses ss
          on ss.id = s.status_id
        where s.company_id = $1
        order by coalesce(s.end_date, s.start_date, current_date) desc, s.id desc
        limit 1
      `,
      [companyId]
    ),
    query<CompanyDetailPaymentRow>(
      `
        select
          p.id as payment_id,
          p.amount,
          ps.name as status_name,
          pm.name as payment_method_name,
          p.created_at
        from payments p
        left join payment_statuses ps
          on ps.id = p.status_id
        left join payment_methods pm
          on pm.id = p.payment_method_id
        where p.company_id = $1
        order by p.created_at desc, p.id desc
        limit 10
      `,
      [companyId]
    ),
    query<CompanyDetailClaimRow>(
      `
        select
          ccr.claim_request_id,
          crs.name as status_name,
          ccr.submitted_at,
          ccr.reviewed_at,
          ccr.notes,
          ccr.evidence_url
        from company_claim_requests ccr
        left join claim_request_statuses crs
          on crs.id = ccr.status_id
        where ccr.company_id = $1
        order by ccr.submitted_at desc, ccr.claim_request_id desc
        limit 10
      `,
      [companyId]
    ),
    query<CompanyDetailAuditRow>(
      `
        select
          cval.audit_log_id,
          cval.action,
          old_status.name as old_status_name,
          new_status.name as new_status_name,
          u.name as actor_name,
          cval.created_at
        from company_verification_audit_log cval
        left join business_verification_request_statuses old_status
          on old_status.id = cval.old_status_id
        left join business_verification_request_statuses new_status
          on new_status.id = cval.new_status_id
        left join users u
          on u.id = cval.actor_user_id
        inner join company_verification_requests cvr
          on cvr.verification_request_id = cval.verification_request_id
        where cvr.company_id = $1
        order by cval.created_at desc, cval.audit_log_id desc
        limit 20
      `,
      [companyId]
    ),
  ]);

  return {
    company,
    branches: branchesResult.rows,
    media: mediaResult.rows,
    verification: verificationResult.rows[0],
    subscription: subscriptionResult.rows[0],
    payments: paymentsResult.rows,
    claims: claimsResult.rows,
    audit: auditResult.rows,
  };
}