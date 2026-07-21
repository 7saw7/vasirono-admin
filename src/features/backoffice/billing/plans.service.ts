import {
  billingListFiltersSchema,
  plansDashboardDataSchema,
  plansListResultSchema,
} from "./schema";
import type {
  BillingListFilters,
  PlanListItem,
  PlanSummary,
  UpsertPlanInput,
} from "./types";
import {
  callBilling,
  filtersQuery,
  paginatedPayload,
  unwrapPayload,
} from "./service-helpers";

function mapPlanItem(raw: unknown): PlanListItem {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    id: Number(item.id ?? item.planId ?? 0),
    name: String(item.name ?? item.planName ?? "Sin nombre"),
    subscriptionsCount: Number(
      item.subscriptionsCount ?? item.subscriptions_count ?? 0,
    ),
    activeSubscriptionsCount: Number(
      item.activeSubscriptionsCount ?? item.active_subscriptions_count ?? 0,
    ),
    companiesCount: Number(item.companiesCount ?? item.companies_count ?? 0),
  };
}

function mapPlanSummary(
  raw: unknown,
  items: PlanListItem[],
  total: number,
): PlanSummary {
  const payload = unwrapPayload<Record<string, unknown>>(raw) ?? {};
  const summary =
    typeof payload.summary === "object" && payload.summary !== null
      ? (payload.summary as Record<string, unknown>)
      : payload;
  return {
    totalPlans: Number(
      summary.totalPlans ?? summary.total_plans ?? summary.total ?? total ?? 0,
    ),
    plansWithSubscriptions: Number(
      summary.plansWithSubscriptions ??
        summary.plans_with_subscriptions ??
        items.filter((item) => item.subscriptionsCount > 0).length,
    ),
    totalSubscriptionsLinked: Number(
      summary.totalSubscriptionsLinked ??
        summary.total_subscriptions_linked ??
        items.reduce((acc, item) => acc + item.subscriptionsCount, 0),
    ),
    activeSubscriptionsLinked: Number(
      summary.activeSubscriptionsLinked ??
        summary.active_subscriptions_linked ??
        items.reduce((acc, item) => acc + item.activeSubscriptionsCount, 0),
    ),
  };
}

export async function getPlansList(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const raw = await callBilling<unknown>("/plans", {
    query: filtersQuery(filters),
  });
  const pageData = paginatedPayload(raw);
  return plansListResultSchema.parse({
    items: pageData.items.map(mapPlanItem),
    page: pageData.page,
    pageSize: pageData.pageSize,
    total: pageData.total,
  });
}

export async function getPlansDashboard(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const [plansRaw, summaryRaw] = await Promise.all([
    callBilling<unknown>("/plans", { query: filtersQuery(filters) }),
    callBilling<unknown>("/plans/dashboard").catch(() => null),
  ]);
  const pageData = paginatedPayload(plansRaw);
  const plans = plansListResultSchema.parse({
    items: pageData.items.map(mapPlanItem),
    page: pageData.page,
    pageSize: pageData.pageSize,
    total: pageData.total,
  });
  const summary = mapPlanSummary(summaryRaw, plans.items, plans.total);
  return plansDashboardDataSchema.parse({ plans, summary });
}

export async function createPlan(input: UpsertPlanInput) {
  return callBilling<unknown>("/plans", { method: "POST", body: input });
}

export async function updatePlan(planId: number, input: UpsertPlanInput) {
  return callBilling<unknown>(`/plans/${planId}`, {
    method: "PATCH",
    body: input,
  });
}
