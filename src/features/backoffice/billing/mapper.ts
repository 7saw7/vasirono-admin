import type {
  PaymentFilterOption,
  PaymentListItem,
  PlanListItem,
  PromotionListItem,
  SubscriptionFilterOption,
  SubscriptionListItem,
} from "./types";

export type PaymentListRow = {
  id: number | string;
  company_id: number | string;
  company_name: string;
  amount: number | string;
  payment_method_name: string;
  status_name: string | null;
  created_at: Date | string;
};

export type SubscriptionListRow = {
  id: number | string;
  company_id: number | string;
  company_name: string;
  plan_id: number | string;
  plan_name: string;
  status_id: number | string | null;
  status_name: string | null;
  start_date: Date | string | null;
  end_date: Date | string | null;
};

export type PlanListRow = {
  id: number | string;
  name: string;
  subscriptions_count: number | string | null;
  active_subscriptions_count: number | string | null;
  companies_count: number | string | null;
};

export type PromotionListRow = {
  id: number | string;
  title: string;
  description: string | null;
  discount_percent: number | string | null;
  start_date: Date | string | null;
  end_date: Date | string | null;
  active: boolean;
  branch_id: number | string;
  branch_name: string;
  company_id: number | string;
  company_name: string;
  assigned_users: number | string | null;
  redeemed_users: number | string | null;
};

export type PaymentFilterOptionRow = {
  id: number | string;
  name: string;
};

export type SubscriptionFilterOptionRow = {
  id: number | string;
  name: string;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toNullableNumber(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapPaymentListRow(row: PaymentListRow): PaymentListItem {
  return {
    id: toNumber(row.id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    amount: toNumber(row.amount),
    paymentMethodName: row.payment_method_name,
    statusName: row.status_name,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

export function mapSubscriptionListRow(
  row: SubscriptionListRow
): SubscriptionListItem {
  return {
    id: toNumber(row.id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    planId: toNumber(row.plan_id),
    planName: row.plan_name,
    statusId: toNullableNumber(row.status_id),
    statusName: row.status_name,
    startDate: toIsoString(row.start_date),
    endDate: toIsoString(row.end_date),
  };
}

export function mapPlanListRow(row: PlanListRow): PlanListItem {
  return {
    id: toNumber(row.id),
    name: row.name,
    subscriptionsCount: toNumber(row.subscriptions_count),
    activeSubscriptionsCount: toNumber(row.active_subscriptions_count),
    companiesCount: toNumber(row.companies_count),
  };
}

export function mapPromotionListRow(row: PromotionListRow): PromotionListItem {
  return {
    id: toNumber(row.id),
    title: row.title,
    description: row.description,
    discountPercent: toNullableNumber(row.discount_percent),
    startDate: toIsoString(row.start_date),
    endDate: toIsoString(row.end_date),
    active: row.active,
    branchId: toNumber(row.branch_id),
    branchName: row.branch_name,
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    assignedUsers: toNumber(row.assigned_users),
    redeemedUsers: toNumber(row.redeemed_users),
  };
}

export function mapPaymentFilterOptionRow(
  row: PaymentFilterOptionRow
): PaymentFilterOption {
  return {
    label: row.name,
    value: toNumber(row.id),
  };
}

export function mapSubscriptionFilterOptionRow(
  row: SubscriptionFilterOptionRow
): SubscriptionFilterOption {
  return {
    label: row.name,
    value: toNumber(row.id),
  };
}

import type { PromotionBranchOption } from "./types";

export type PromotionBranchOptionRow = {
  branch_id: number | string;
  company_name: string;
  branch_name: string;
};

export function mapPromotionBranchOptionRow(
  row: PromotionBranchOptionRow
): PromotionBranchOption {
  return {
    value: toNumber(row.branch_id),
    label: `${row.company_name} · ${row.branch_name}`,
  };
}