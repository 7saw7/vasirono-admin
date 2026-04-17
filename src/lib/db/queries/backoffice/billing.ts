import { query } from "@/lib/db/server";
import type { BillingListFilters } from "@/features/backoffice/billing/types";
import type {
  PaymentFilterOptionRow,
  PaymentListRow,
  PlanListRow,
  PromotionListRow,
  PromotionBranchOptionRow,
  SubscriptionFilterOptionRow,
  SubscriptionListRow,
} from "@/features/backoffice/billing/mapper";

import type { PoolClient, QueryResultRow } from "pg";
import type {
  CreatePromotionInput,
  UpdatePromotionInput,
} from "@/features/backoffice/billing/types";

type CountRow = {
  total: number | string;
};

type PaymentSummaryRow = {
  total_amount: number | string | null;
  total_payments: number | string | null;
  pending_payments: number | string | null;
  completed_payments: number | string | null;
};

type SubscriptionSummaryRow = {
  total_subscriptions: number | string | null;
  active_subscriptions: number | string | null;
  inactive_subscriptions: number | string | null;
  expiring_soon_subscriptions: number | string | null;
};

type PlanSummaryRow = {
  total_plans: number | string | null;
  plans_with_subscriptions: number | string | null;
  total_subscriptions_linked: number | string | null;
  active_subscriptions_linked: number | string | null;
};

type PromotionSummaryRow = {
  total_promotions: number | string | null;
  active_promotions: number | string | null;
  assigned_users: number | string | null;
  redeemed_users: number | string | null;
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

function buildPaymentsWhere(filters: BillingListFilters) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const i = params.length;
    clauses.push(`(c.name ilike $${i})`);
  }

  const companyId = toNumericId(filters.companyId);
  if (companyId) {
    params.push(companyId);
    clauses.push(`p.company_id = $${params.length}`);
  }

  const statusId = toNumericId(filters.statusId);
  if (statusId) {
    params.push(statusId);
    clauses.push(`p.status_id = $${params.length}`);
  }

  const paymentMethodId = toNumericId(filters.paymentMethodId);
  if (paymentMethodId) {
    params.push(paymentMethodId);
    clauses.push(`p.payment_method_id = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

function buildSubscriptionsWhere(filters: BillingListFilters) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const i = params.length;
    clauses.push(`(c.name ilike $${i} or pl.name ilike $${i})`);
  }

  const companyId = toNumericId(filters.companyId);
  if (companyId) {
    params.push(companyId);
    clauses.push(`s.company_id = $${params.length}`);
  }

  const statusId = toNumericId(filters.statusId);
  if (statusId) {
    params.push(statusId);
    clauses.push(`s.status_id = $${params.length}`);
  }

  const planId = toNumericId(filters.planId);
  if (planId) {
    params.push(planId);
    clauses.push(`s.plan_id = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

function buildPlansWhere(filters: BillingListFilters) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    clauses.push(`pl.name ilike $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

function buildPromotionsWhere(filters: BillingListFilters) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const i = params.length;
    clauses.push(
      `(p.title ilike $${i} or cb.name ilike $${i} or c.name ilike $${i})`
    );
  }

  const companyId = toNumericId(filters.companyId);
  if (companyId) {
    params.push(companyId);
    clauses.push(`c.company_id = $${params.length}`);
  }

  const active = toBooleanOrNull(filters.active);
  if (active !== null) {
    params.push(active);
    clauses.push(`p.active = $${params.length}`);
  }

  return {
    params,
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
  };
}

export async function listPaymentsQuery(filters: BillingListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;

  const { params, whereSql } = buildPaymentsWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from payments p
      inner join companies c
        on c.company_id = p.company_id
      ${whereSql}
    `,
    params
  );

  const listResult = await query<PaymentListRow>(
    `
      select
        p.id,
        p.company_id,
        c.name as company_name,
        p.amount,
        pm.name as payment_method_name,
        ps.name as status_name,
        p.created_at
      from payments p
      inner join companies c
        on c.company_id = p.company_id
      inner join payment_methods pm
        on pm.id = p.payment_method_id
      left join payment_statuses ps
        on ps.id = p.status_id
      ${whereSql}
      order by p.created_at desc, p.id desc
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

export async function getPaymentsSummaryQuery(filters: BillingListFilters) {
  const { params, whereSql } = buildPaymentsWhere(filters);

  const result = await query<PaymentSummaryRow>(
    `
      select
        coalesce(sum(p.amount), 0)::numeric as total_amount,
        count(*)::int as total_payments,
        count(*) filter (
          where lower(coalesce(ps.name, '')) in ('pending', 'pendiente')
        )::int as pending_payments,
        count(*) filter (
          where lower(coalesce(ps.name, '')) in ('paid', 'completed', 'pagado', 'completado')
        )::int as completed_payments
      from payments p
      inner join companies c
        on c.company_id = p.company_id
      left join payment_statuses ps
        on ps.id = p.status_id
      ${whereSql}
    `,
    params
  );

  return result.rows[0] ?? {
    total_amount: 0,
    total_payments: 0,
    pending_payments: 0,
    completed_payments: 0,
  };
}

export async function listPaymentStatusesQuery() {
  const result = await query<PaymentFilterOptionRow>(
    `
      select id, name
      from payment_statuses
      order by name asc
    `
  );

  return result.rows;
}

export async function listPaymentMethodsQuery() {
  const result = await query<PaymentFilterOptionRow>(
    `
      select id, name
      from payment_methods
      order by name asc
    `
  );

  return result.rows;
}

export async function listSubscriptionsQuery(filters: BillingListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;

  const { params, whereSql } = buildSubscriptionsWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from subscriptions s
      inner join companies c
        on c.company_id = s.company_id
      inner join plans pl
        on pl.id = s.plan_id
      ${whereSql}
    `,
    params
  );

  const listResult = await query<SubscriptionListRow>(
    `
      select
        s.id,
        s.company_id,
        c.name as company_name,
        pl.id as plan_id,
        pl.name as plan_name,
        ss.id as status_id,
        ss.name as status_name,
        s.start_date,
        s.end_date
      from subscriptions s
      inner join companies c
        on c.company_id = s.company_id
      inner join plans pl
        on pl.id = s.plan_id
      left join subscription_statuses ss
        on ss.id = s.status_id
      ${whereSql}
      order by s.id desc
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

export async function getSubscriptionsSummaryQuery(
  filters: BillingListFilters
) {
  const { params, whereSql } = buildSubscriptionsWhere(filters);

  const result = await query<SubscriptionSummaryRow>(
    `
      select
        count(*)::int as total_subscriptions,
        count(*) filter (
          where lower(coalesce(ss.name, '')) in ('active', 'activo', 'activa')
        )::int as active_subscriptions,
        count(*) filter (
          where lower(coalesce(ss.name, '')) not in ('active', 'activo', 'activa')
        )::int as inactive_subscriptions,
        count(*) filter (
          where s.end_date is not null
            and s.end_date >= current_date
            and s.end_date <= current_date + interval '15 days'
        )::int as expiring_soon_subscriptions
      from subscriptions s
      inner join companies c
        on c.company_id = s.company_id
      inner join plans pl
        on pl.id = s.plan_id
      left join subscription_statuses ss
        on ss.id = s.status_id
      ${whereSql}
    `,
    params
  );

  return result.rows[0] ?? {
    total_subscriptions: 0,
    active_subscriptions: 0,
    inactive_subscriptions: 0,
    expiring_soon_subscriptions: 0,
  };
}

export async function listSubscriptionStatusesQuery() {
  const result = await query<SubscriptionFilterOptionRow>(
    `
      select id, name
      from subscription_statuses
      order by name asc
    `
  );

  return result.rows;
}

export async function listPlansQuery() {
  const result = await query<SubscriptionFilterOptionRow>(
    `
      select id, name
      from plans
      order by name asc
    `
  );

  return result.rows;
}

export async function listPlansCatalogQuery(filters: BillingListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;

  const { params, whereSql } = buildPlansWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from plans pl
      ${whereSql}
    `,
    params
  );

  const listResult = await query<PlanListRow>(
    `
      select
        pl.id,
        pl.name,
        count(s.id)::int as subscriptions_count,
        count(*) filter (
          where lower(coalesce(ss.name, '')) in ('active', 'activo', 'activa')
        )::int as active_subscriptions_count,
        count(distinct s.company_id)::int as companies_count
      from plans pl
      left join subscriptions s
        on s.plan_id = pl.id
      left join subscription_statuses ss
        on ss.id = s.status_id
      ${whereSql}
      group by pl.id, pl.name
      order by pl.name asc
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

export async function getPlansSummaryQuery(filters: BillingListFilters) {
  const { params, whereSql } = buildPlansWhere(filters);

  const result = await query<PlanSummaryRow>(
    `
      select
        count(distinct pl.id)::int as total_plans,
        count(distinct case when s.id is not null then pl.id end)::int as plans_with_subscriptions,
        count(s.id)::int as total_subscriptions_linked,
        count(*) filter (
          where lower(coalesce(ss.name, '')) in ('active', 'activo', 'activa')
        )::int as active_subscriptions_linked
      from plans pl
      left join subscriptions s
        on s.plan_id = pl.id
      left join subscription_statuses ss
        on ss.id = s.status_id
      ${whereSql}
    `,
    params
  );

  return result.rows[0] ?? {
    total_plans: 0,
    plans_with_subscriptions: 0,
    total_subscriptions_linked: 0,
    active_subscriptions_linked: 0,
  };
}

export async function listPromotionsQuery(filters: BillingListFilters) {
  const page = normalizePage(filters.page, 1);
  const pageSize = Math.min(normalizePage(filters.pageSize, 10), 100);
  const offset = (page - 1) * pageSize;

  const { params, whereSql } = buildPromotionsWhere(filters);

  const countResult = await query<CountRow>(
    `
      select count(*)::int as total
      from promotions p
      inner join company_branches cb
        on cb.branch_id = p.branch_id
      inner join companies c
        on c.company_id = cb.company_id
      ${whereSql}
    `,
    params
  );

  const listResult = await query<PromotionListRow>(
    `
      select
        p.id,
        p.title,
        p.description,
        p.discount_percent,
        p.start_date,
        p.end_date,
        p.active,
        cb.branch_id,
        cb.name as branch_name,
        c.company_id,
        c.name as company_name,
        count(pu.user_id)::int as assigned_users,
        count(*) filter (where pu.redeemed = true)::int as redeemed_users
      from promotions p
      inner join company_branches cb
        on cb.branch_id = p.branch_id
      inner join companies c
        on c.company_id = cb.company_id
      left join promotion_users pu
        on pu.promotion_id = p.id
      ${whereSql}
      group by
        p.id,
        p.title,
        p.description,
        p.discount_percent,
        p.start_date,
        p.end_date,
        p.active,
        cb.branch_id,
        cb.name,
        c.company_id,
        c.name
      order by p.start_date desc nulls last, p.id desc
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

export async function getPromotionsSummaryQuery(filters: BillingListFilters) {
  const { params, whereSql } = buildPromotionsWhere(filters);

  const result = await query<PromotionSummaryRow>(
    `
      select
        count(distinct p.id)::int as total_promotions,
        count(distinct case when p.active = true then p.id end)::int as active_promotions,
        count(pu.user_id)::int as assigned_users,
        count(*) filter (where pu.redeemed = true)::int as redeemed_users
      from promotions p
      inner join company_branches cb
        on cb.branch_id = p.branch_id
      inner join companies c
        on c.company_id = cb.company_id
      left join promotion_users pu
        on pu.promotion_id = p.id
      ${whereSql}
    `,
    params
  );

  return result.rows[0] ?? {
    total_promotions: 0,
    active_promotions: 0,
    assigned_users: 0,
    redeemed_users: 0,
  };
}


function getExecutor(client?: PoolClient) {
  return {
    query: <T extends QueryResultRow>(
      text: string,
      params: unknown[] = []
    ) => (client ? client.query<T>(text, params) : query<T>(text, params)),
  };
}

export async function listPromotionBranchOptionsQuery() {
  const result = await query<PromotionBranchOptionRow>(
    `
      select
        cb.branch_id,
        c.name as company_name,
        cb.name as branch_name
      from company_branches cb
      inner join companies c
        on c.company_id = cb.company_id
      where cb.is_active = true
      order by c.name asc, cb.name asc
    `
  );

  return result.rows;
}

export async function getPromotionByIdQuery(
  promotionId: number,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<PromotionListRow>(
    `
      select
        p.id,
        p.title,
        p.description,
        p.discount_percent,
        p.start_date,
        p.end_date,
        p.active,
        cb.branch_id,
        cb.name as branch_name,
        c.company_id,
        c.name as company_name,
        count(pu.user_id)::int as assigned_users,
        count(*) filter (where pu.redeemed = true)::int as redeemed_users
      from promotions p
      inner join company_branches cb
        on cb.branch_id = p.branch_id
      inner join companies c
        on c.company_id = cb.company_id
      left join promotion_users pu
        on pu.promotion_id = p.id
      where p.id = $1
      group by
        p.id,
        p.title,
        p.description,
        p.discount_percent,
        p.start_date,
        p.end_date,
        p.active,
        cb.branch_id,
        cb.name,
        c.company_id,
        c.name
    `,
    [promotionId]
  );

  return result.rows[0] ?? null;
}

export async function createPromotionQuery(
  input: CreatePromotionInput,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const result = await db.query<{ id: number | string }>(
    `
      insert into promotions (
        title,
        description,
        discount_percent,
        start_date,
        end_date,
        active,
        branch_id
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning id
    `,
    [
      input.title,
      input.description ?? null,
      input.discountPercent ?? null,
      input.startDate ?? null,
      input.endDate ?? null,
      input.active ?? true,
      input.branchId,
    ]
  );

  return Number(result.rows[0]?.id ?? 0);
}

export async function updatePromotionQuery(
  promotionId: number,
  input: UpdatePromotionInput,
  client?: PoolClient
) {
  const db = getExecutor(client);

  const assignments: string[] = [];
  const params: unknown[] = [];

  if (input.title !== undefined) {
    params.push(input.title);
    assignments.push(`title = $${params.length}`);
  }

  if (input.description !== undefined) {
    params.push(input.description ?? null);
    assignments.push(`description = $${params.length}`);
  }

  if (input.discountPercent !== undefined) {
    params.push(input.discountPercent ?? null);
    assignments.push(`discount_percent = $${params.length}`);
  }

  if (input.startDate !== undefined) {
    params.push(input.startDate ?? null);
    assignments.push(`start_date = $${params.length}`);
  }

  if (input.endDate !== undefined) {
    params.push(input.endDate ?? null);
    assignments.push(`end_date = $${params.length}`);
  }

  if (input.active !== undefined) {
    params.push(input.active);
    assignments.push(`active = $${params.length}`);
  }

  if (input.branchId !== undefined) {
    params.push(input.branchId);
    assignments.push(`branch_id = $${params.length}`);
  }

  if (assignments.length === 0) {
    return promotionId;
  }

  params.push(promotionId);

  const result = await db.query<{ id: number | string }>(
    `
      update promotions
      set
        ${assignments.join(", ")}
      where id = $${params.length}
      returning id
    `,
    params
  );

  return Number(result.rows[0]?.id ?? 0);
}