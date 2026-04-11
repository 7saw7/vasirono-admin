import { query } from "@/lib/db/server";
import type {
  DashboardActivityRow,
  DashboardClaimsRow,
  DashboardCountsRow,
  DashboardModerationRow,
  DashboardRevenueRow,
  DashboardVerificationRow,
} from "@/features/backoffice/dashboard/mapper";

export async function getDashboardCountsQuery() {
  const { rows } = await query<DashboardCountsRow>(
    `
      select
        (select count(*) from companies) as companies_count,
        (select count(*) from company_branches where is_active = true) as active_branches_count,
        (select count(*) from users) as users_count,
        (
          select count(*)
          from analytics_events
          where occurred_at >= now() - interval '7 days'
        ) as events_7d_count
    `
  );

  return rows[0];
}

export async function getDashboardVerificationQueueQuery() {
  const { rows } = await query<DashboardVerificationRow>(
    `
      select
        count(*) as total_count,
        count(*) filter (
          where lower(statuses.code) in ('pending', 'submitted')
        ) as pending_count,
        count(*) filter (
          where lower(statuses.code) in ('in_review', 'under_review', 'assigned')
        ) as in_review_count,
        count(*) filter (
          where lower(statuses.code) in ('approved', 'verified', 'completed')
        ) as approved_count,
        count(*) filter (
          where lower(statuses.code) in ('rejected', 'failed', 'cancelled')
        ) as rejected_count
      from company_verification_requests requests
      inner join business_verification_request_statuses statuses
        on statuses.id = requests.current_status_id
    `
  );

  return rows[0];
}

export async function getDashboardClaimsQueueQuery() {
  const { rows } = await query<DashboardClaimsRow>(
    `
      select
        count(*) as total_count,
        count(*) filter (
          where lower(statuses.code) in ('pending', 'submitted')
        ) as pending_count,
        count(*) filter (
          where lower(statuses.code) in ('in_review', 'reviewing')
        ) as in_review_count,
        count(*) filter (
          where lower(statuses.code) in ('approved', 'accepted')
        ) as approved_count,
        count(*) filter (
          where lower(statuses.code) in ('rejected', 'denied')
        ) as rejected_count
      from company_claim_requests claims
      inner join claim_request_statuses statuses
        on statuses.id = claims.status_id
    `
  );

  return rows[0];
}

export async function getDashboardModerationQueueQuery() {
  const { rows } = await query<DashboardModerationRow>(
    `
      select
        count(*) as total_count,
        count(*) filter (
          where lower(statuses.code) in ('pending', 'submitted')
        ) as pending_count,
        count(*) filter (
          where lower(statuses.code) in ('in_review', 'reviewing')
        ) as in_review_count,
        count(*) filter (
          where lower(statuses.code) in ('resolved', 'approved')
        ) as resolved_count,
        count(*) filter (
          where lower(statuses.code) in ('rejected', 'dismissed')
        ) as rejected_count
      from review_reports reports
      inner join review_report_statuses statuses
        on statuses.id = reports.status_id
    `
  );

  return rows[0];
}

export async function getDashboardRevenueSummaryQuery() {
  const { rows } = await query<DashboardRevenueRow>(
    `
      select
        coalesce(sum(case when lower(statuses.name) = 'paid' then payments.amount else 0 end), 0) as total_amount,
        count(*) filter (where lower(statuses.name) = 'paid') as paid_count,
        count(*) filter (where lower(statuses.name) in ('pending', 'processing')) as pending_count,
        count(*) filter (where lower(statuses.name) in ('failed', 'rejected', 'cancelled')) as failed_count
      from payments
      left join payment_statuses statuses
        on statuses.id = payments.status_id
    `
  );

  return rows[0];
}

export async function getDashboardRecentActivityQuery(limit = 12) {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 20)) : 12;

  const { rows } = await query<DashboardActivityRow>(
    `
      with activity as (
        select
          concat('verification-', audit_log_id) as id,
          'verification' as type,
          'Movimiento en verificación' as title,
          coalesce(action, 'actualización') as description,
          created_at as occurred_at
        from company_verification_audit_log

        union all

        select
          concat('claim-', claim_request_id) as id,
          'claim' as type,
          'Nuevo claim empresarial' as title,
          coalesce(notes, 'Solicitud registrada') as description,
          submitted_at as occurred_at
        from company_claim_requests

        union all

        select
          concat('review-report-', report_id) as id,
          'review_report' as type,
          'Reporte de reseña' as title,
          coalesce(reason, 'Nuevo reporte ingresado') as description,
          created_at as occurred_at
        from review_reports

        union all

        select
          concat('payment-', id) as id,
          'payment' as type,
          'Pago registrado' as title,
          concat('Pago por empresa #', company_id) as description,
          created_at as occurred_at
        from payments
      )
      select id, type, title, description, occurred_at
      from activity
      where occurred_at is not null
      order by occurred_at desc
      limit $1
    `,
    [safeLimit]
  );

  return rows;
}