import {
  billingListFiltersSchema,
  plansDashboardDataSchema,
  plansListResultSchema,
} from "./schema";
import { mapPlanListRow } from "./mapper";
import type { BillingListFilters } from "./types";
import {
  getPlansSummaryQuery,
  listPlansCatalogQuery,
} from "@/lib/db/queries/backoffice/billing";

export async function getPlansList(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const result = await listPlansCatalogQuery(filters);

  return plansListResultSchema.parse({
    items: result.rows.map(mapPlanListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getPlansDashboard(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);

  const [plansResult, summaryRow] = await Promise.all([
    listPlansCatalogQuery(filters),
    getPlansSummaryQuery(filters),
  ]);

  return plansDashboardDataSchema.parse({
    plans: {
      items: plansResult.rows.map(mapPlanListRow),
      page: plansResult.page,
      pageSize: plansResult.pageSize,
      total: plansResult.total,
    },
    summary: {
      totalPlans: Number(summaryRow.total_plans ?? 0),
      plansWithSubscriptions: Number(summaryRow.plans_with_subscriptions ?? 0),
      totalSubscriptionsLinked: Number(
        summaryRow.total_subscriptions_linked ?? 0
      ),
      activeSubscriptionsLinked: Number(
        summaryRow.active_subscriptions_linked ?? 0
      ),
    },
  });
}