import {
  billingListFiltersSchema,
  subscriptionsDashboardDataSchema,
  subscriptionsListResultSchema,
} from "./schema";
import {
  mapSubscriptionFilterOptionRow,
  mapSubscriptionListRow,
} from "./mapper";
import type { BillingListFilters } from "./types";
import {
  getSubscriptionsSummaryQuery,
  listPlansQuery,
  listSubscriptionStatusesQuery,
  listSubscriptionsQuery,
} from "@/lib/db/queries/backoffice/billing";

export async function getSubscriptionsList(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const result = await listSubscriptionsQuery(filters);

  return subscriptionsListResultSchema.parse({
    items: result.rows.map(mapSubscriptionListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getSubscriptionsDashboard(
  input: BillingListFilters = {}
) {
  const filters = billingListFiltersSchema.parse(input);

  const [subscriptionsResult, statusesRows, plansRows, summaryRow] =
    await Promise.all([
      listSubscriptionsQuery(filters),
      listSubscriptionStatusesQuery(),
      listPlansQuery(),
      getSubscriptionsSummaryQuery(filters),
    ]);

  return subscriptionsDashboardDataSchema.parse({
    subscriptions: {
      items: subscriptionsResult.rows.map(mapSubscriptionListRow),
      page: subscriptionsResult.page,
      pageSize: subscriptionsResult.pageSize,
      total: subscriptionsResult.total,
    },
    meta: {
      statuses: statusesRows.map(mapSubscriptionFilterOptionRow),
      plans: plansRows.map(mapSubscriptionFilterOptionRow),
    },
    summary: {
      totalSubscriptions: Number(summaryRow.total_subscriptions ?? 0),
      activeSubscriptions: Number(summaryRow.active_subscriptions ?? 0),
      inactiveSubscriptions: Number(summaryRow.inactive_subscriptions ?? 0),
      expiringSoonSubscriptions: Number(
        summaryRow.expiring_soon_subscriptions ?? 0
      ),
    },
  });
}