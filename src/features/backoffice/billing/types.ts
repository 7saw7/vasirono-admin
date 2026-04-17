import type { Option, PaginatedResult } from "@/features/backoffice/shared/types";

export type BillingListFilters = {
  search?: string;
  statusId?: string | number;
  paymentMethodId?: string | number;
  companyId?: string | number;
  planId?: string | number;
  active?: string | boolean;
  page?: string | number;
  pageSize?: string | number;
};

export type PaymentListItem = {
  id: number;
  companyId: number;
  companyName: string;
  amount: number;
  paymentMethodName: string;
  statusName: string | null;
  createdAt: string;
};

export type BillingListResult = PaginatedResult<PaymentListItem>;

export type SubscriptionListItem = {
  id: number;
  companyId: number;
  companyName: string;
  planId: number;
  planName: string;
  statusId: number | null;
  statusName: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type SubscriptionsListResult = PaginatedResult<SubscriptionListItem>;

export type PlanListItem = {
  id: number;
  name: string;
  subscriptionsCount: number;
  activeSubscriptionsCount: number;
  companiesCount: number;
};

export type PlansListResult = PaginatedResult<PlanListItem>;

export type PromotionListItem = {
  id: number;
  title: string;
  description: string | null;
  discountPercent: number | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  branchId: number;
  branchName: string;
  companyId: number;
  companyName: string;
  assignedUsers: number;
  redeemedUsers: number;
};

export type PromotionsListResult = PaginatedResult<PromotionListItem>;

export type BillingOverview = {
  payments: BillingListResult;
  subscriptions: SubscriptionsListResult;
};

export type PaymentFilterOption = Option<number>;

export type PaymentsMeta = {
  statuses: PaymentFilterOption[];
  paymentMethods: PaymentFilterOption[];
};

export type PaymentsPageData = {
  payments: BillingListResult;
  meta: PaymentsMeta;
};

export type PaymentSummary = {
  totalAmount: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
};

export type PaymentsDashboardData = {
  payments: BillingListResult;
  meta: PaymentsMeta;
  summary: PaymentSummary;
};

export type SubscriptionFilterOption = Option<number>;

export type SubscriptionsMeta = {
  statuses: SubscriptionFilterOption[];
  plans: SubscriptionFilterOption[];
};

export type SubscriptionSummary = {
  totalSubscriptions: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  expiringSoonSubscriptions: number;
};

export type SubscriptionsDashboardData = {
  subscriptions: SubscriptionsListResult;
  meta: SubscriptionsMeta;
  summary: SubscriptionSummary;
};

export type PlanSummary = {
  totalPlans: number;
  plansWithSubscriptions: number;
  totalSubscriptionsLinked: number;
  activeSubscriptionsLinked: number;
};

export type PlansDashboardData = {
  plans: PlansListResult;
  summary: PlanSummary;
};

export type PromotionSummary = {
  totalPromotions: number;
  activePromotions: number;
  assignedUsers: number;
  redeemedUsers: number;
};

export type PromotionsDashboardData = {
  promotions: PromotionsListResult;
  summary: PromotionSummary;
};

export type PromotionBranchOption = Option<number>;

export type CreatePromotionInput = {
  title: string;
  description?: string | null;
  discountPercent?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  active?: boolean;
  branchId: number;
};

export type UpdatePromotionInput = Partial<CreatePromotionInput>;