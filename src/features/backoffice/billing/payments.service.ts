import {
  billingListFiltersSchema,
  billingListResultSchema,
  paymentsDashboardDataSchema,
} from "./schema";
import {
  mapPaymentFilterOptionRow,
  mapPaymentListRow,
} from "./mapper";
import type { BillingListFilters } from "./types";
import {
  getPaymentsSummaryQuery,
  listPaymentMethodsQuery,
  listPaymentsQuery,
  listPaymentStatusesQuery,
} from "@/lib/db/queries/backoffice/billing";

export async function getPaymentsList(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);
  const result = await listPaymentsQuery(filters);

  return billingListResultSchema.parse({
    items: result.rows.map(mapPaymentListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
}

export async function getPaymentsDashboard(input: BillingListFilters = {}) {
  const filters = billingListFiltersSchema.parse(input);

  const [paymentsResult, statusesRows, methodsRows, summaryRow] =
    await Promise.all([
      listPaymentsQuery(filters),
      listPaymentStatusesQuery(),
      listPaymentMethodsQuery(),
      getPaymentsSummaryQuery(filters),
    ]);

  return paymentsDashboardDataSchema.parse({
    payments: {
      items: paymentsResult.rows.map(mapPaymentListRow),
      page: paymentsResult.page,
      pageSize: paymentsResult.pageSize,
      total: paymentsResult.total,
    },
    meta: {
      statuses: statusesRows.map(mapPaymentFilterOptionRow),
      paymentMethods: methodsRows.map(mapPaymentFilterOptionRow),
    },
    summary: {
      totalAmount: Number(summaryRow.total_amount ?? 0),
      totalPayments: Number(summaryRow.total_payments ?? 0),
      pendingPayments: Number(summaryRow.pending_payments ?? 0),
      completedPayments: Number(summaryRow.completed_payments ?? 0),
    },
  });
}