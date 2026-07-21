import {
  billingListFiltersSchema,
  subscriptionsDashboardDataSchema,
  subscriptionsListResultSchema,
} from "./schema";
import type {
  BillingListFilters,
  SubscriptionFilterOption,
  SubscriptionListItem,
  SubscriptionSummary,
  CreateSubscriptionInput,
  ChangeSubscriptionPlanInput,
  UpdateSubscriptionStatusInput,
  CancelSubscriptionInput,
} from "./types";
import {
  callBilling,
  filtersQuery,
  optionFromName,
  paginatedPayload,
  unwrapPayload,
} from "./service-helpers";

function mapSubscriptionItem(raw: unknown): SubscriptionListItem {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    id: Number(item.id ?? item.subscriptionId ?? 0),
    companyId: Number(item.companyId ?? item.company_id ?? 0),
    companyName: String(item.companyName ?? item.company_name ?? "Sin empresa"),
    planId: Number(item.planId ?? item.plan_id ?? 0),
    planName: String(item.planName ?? item.plan_name ?? "Sin plan"),
    statusId:
      item.statusId === undefined && item.status_id === undefined
        ? null
        : item.statusId === null || item.status_id === null
          ? null
          : Number(item.statusId ?? item.status_id),
    statusName:
      item.statusName === undefined && item.status_name === undefined
        ? null
        : item.statusName === null || item.status_name === null
          ? null
          : String(item.statusName ?? item.status_name),
    startDate:
      item.startDate === undefined && item.start_date === undefined
        ? null
        : item.startDate === null || item.start_date === null
          ? null
          : String(item.startDate ?? item.start_date),
    endDate:
      item.endDate === undefined && item.end_date === undefined
        ? null
        : item.endDate === null || item.end_date === null
          ? null
          : String(item.endDate ?? item.end_date),
  };
}

function uniqueOptions(
  items: unknown[],
  idKey: string,
  nameKey: string,
): SubscriptionFilterOption[] {
  const map = new Map<number, string>();
  for (const raw of items) {
    const item = (raw && typeof raw === "object" ? raw : {}) as Record<
      string,
      unknown
    >;
    const option = optionFromName(item[idKey], item[nameKey]);
    if (option) map.set(option.value, option.label);
  }
  return Array.from(map, ([value, label]) => ({ value, label }));
}

function mapSubscriptionSummary(
  raw: unknown,
  items: SubscriptionListItem[],
  total: number,
): SubscriptionSummary {
  const payload = unwrapPayload<Record<string, unknown>>(raw) ?? {};
  const summary =
    typeof payload.summary === "object" && payload.summary !== null
      ? (payload.summary as Record<string, unknown>)
      : payload;
  return {
    totalSubscriptions: Number(
      summary.totalSubscriptions ??
        summary.total_subscriptions ??
        summary.total ??
        total ??
        0,
    ),
    activeSubscriptions: Number(
      summary.activeSubscriptions ??
        summary.active_subscriptions ??
        summary.active ??
        items.filter((item) =>
          (item.statusName ?? "").toLowerCase().includes("activ"),
        ).length,
    ),
    inactiveSubscriptions: Number(
      summary.inactiveSubscriptions ??
        summary.inactive_subscriptions ??
        summary.inactive ??
        0,
    ),
    expiringSoonSubscriptions: Number(
      summary.expiringSoonSubscriptions ??
        summary.expiring_soon_subscriptions ??
        summary.expiringSoon ??
        summary.expiring_soon ??
        0,
    ),
  };
}

export async function getSubscriptionsList(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const raw = await callBilling<unknown>("/subscriptions", {
    query: filtersQuery(filters),
  });
  const pageData = paginatedPayload(raw);
  return subscriptionsListResultSchema.parse({
    items: pageData.items.map(mapSubscriptionItem),
    page: pageData.page,
    pageSize: pageData.pageSize,
    total: pageData.total,
  });
}

export async function getSubscriptionsDashboard(
  input: BillingListFilters = {},
) {
  const filters = billingListFiltersSchema.parse(input);
  const [subscriptionsRaw, summaryRaw] = await Promise.all([
    callBilling<unknown>("/subscriptions", { query: filtersQuery(filters) }),
    callBilling<unknown>("/subscriptions/dashboard").catch(() => null),
  ]);
  const pageData = paginatedPayload(subscriptionsRaw);
  const subscriptions = subscriptionsListResultSchema.parse({
    items: pageData.items.map(mapSubscriptionItem),
    page: pageData.page,
    pageSize: pageData.pageSize,
    total: pageData.total,
  });
  const meta = {
    statuses: uniqueOptions(pageData.items, "statusId", "statusName"),
    plans: uniqueOptions(pageData.items, "planId", "planName"),
  };
  const summary = mapSubscriptionSummary(
    summaryRaw,
    subscriptions.items,
    subscriptions.total,
  );
  return subscriptionsDashboardDataSchema.parse({
    subscriptions,
    meta,
    summary,
  });
}

export async function createSubscription(input: CreateSubscriptionInput) {
  return callBilling<unknown>("/subscriptions", {
    method: "POST",
    body: input,
  });
}

export async function changeSubscriptionPlan(
  subscriptionId: number,
  input: ChangeSubscriptionPlanInput,
) {
  return callBilling<unknown>(`/subscriptions/${subscriptionId}/plan`, {
    method: "PATCH",
    body: input,
  });
}

export async function updateSubscriptionStatus(
  subscriptionId: number,
  input: UpdateSubscriptionStatusInput,
) {
  return callBilling<unknown>(`/subscriptions/${subscriptionId}/status`, {
    method: "PATCH",
    body: input,
  });
}

export async function cancelSubscription(
  subscriptionId: number,
  input: CancelSubscriptionInput,
) {
  return callBilling<unknown>(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: input,
  });
}
