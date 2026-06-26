import {
  billingListFiltersSchema,
  billingListResultSchema,
  paymentsDashboardDataSchema,
} from "./schema";
import type { BillingListFilters, PaymentFilterOption, PaymentListItem, PaymentSummary } from "./types";
import { callBilling, filtersQuery, optionFromName, paginatedPayload, unwrapPayload } from "./service-helpers";

function mapPaymentItem(raw: unknown): PaymentListItem {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: Number(item.id ?? item.paymentId ?? 0),
    companyId: Number(item.companyId ?? item.company_id ?? 0),
    companyName: String(item.companyName ?? item.company_name ?? "Sin empresa"),
    amount: Number(item.amount ?? 0),
    paymentMethodName: String(item.paymentMethodName ?? item.payment_method_name ?? "Sin método"),
    statusName: item.statusName === undefined && item.status_name === undefined ? null : item.statusName === null || item.status_name === null ? null : String(item.statusName ?? item.status_name),
    createdAt: String(item.createdAt ?? item.created_at ?? new Date(0).toISOString()),
  };
}

function uniqueOptions(items: unknown[], idKey: string, nameKey: string): PaymentFilterOption[] {
  const map = new Map<number, string>();
  for (const raw of items) {
    const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const option = optionFromName(item[idKey], item[nameKey]);
    if (option) map.set(option.value, option.label);
  }
  return Array.from(map, ([value, label]) => ({ value, label }));
}

function mapPaymentSummary(raw: unknown, items: PaymentListItem[], total: number): PaymentSummary {
  const payload = unwrapPayload<Record<string, unknown>>(raw) ?? {};
  const summary =
    typeof payload.summary === "object" && payload.summary !== null
      ? (payload.summary as Record<string, unknown>)
      : payload;
  const money = typeof summary.money === "object" && summary.money !== null ? (summary.money as Record<string, unknown>) : {};
  return {
    totalAmount: Number(summary.totalAmount ?? summary.total_amount ?? money.totalAmount ?? money.total_amount ?? items.reduce((acc, item) => acc + item.amount, 0)),
    totalPayments: Number(summary.totalPayments ?? summary.total_payments ?? summary.total ?? total ?? 0),
    pendingPayments: Number(summary.pendingPayments ?? summary.pending_payments ?? 0),
    completedPayments: Number(summary.completedPayments ?? summary.completed_payments ?? summary.paidPayments ?? summary.paid_payments ?? 0),
  };
}

export async function getPaymentsList(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const raw = await callBilling<unknown>("/payments", { query: filtersQuery(filters) });
  const pageData = paginatedPayload(raw);
  return billingListResultSchema.parse({
    items: pageData.items.map(mapPaymentItem),
    page: pageData.page,
    pageSize: pageData.pageSize,
    total: pageData.total,
  });
}

export async function getPaymentsDashboard(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const [paymentsRaw, summaryRaw] = await Promise.all([
    callBilling<unknown>("/payments", { query: filtersQuery(filters) }),
    callBilling<unknown>("/payments/dashboard").catch(() => null),
  ]);
  const pageData = paginatedPayload(paymentsRaw);
  const payments = billingListResultSchema.parse({
    items: pageData.items.map(mapPaymentItem),
    page: pageData.page,
    pageSize: pageData.pageSize,
    total: pageData.total,
  });
  const meta = {
    statuses: uniqueOptions(pageData.items, "statusId", "statusName"),
    paymentMethods: uniqueOptions(pageData.items, "paymentMethodId", "paymentMethodName"),
  };
  const summary = mapPaymentSummary(summaryRaw, payments.items, payments.total);
  return paymentsDashboardDataSchema.parse({ payments, meta, summary });
}
