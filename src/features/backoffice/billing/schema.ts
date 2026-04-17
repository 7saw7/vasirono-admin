import { z } from "zod";

export const billingListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  statusId: z.coerce.number().int().positive().optional(),
  paymentMethodId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  planId: z.coerce.number().int().positive().optional(),
  active: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const paymentListItemSchema = z.object({
  id: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  amount: z.number(),
  paymentMethodName: z.string(),
  statusName: z.string().nullable(),
  createdAt: z.string(),
});

export const billingListResultSchema = z.object({
  items: z.array(paymentListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const subscriptionListItemSchema = z.object({
  id: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  planId: z.number().int(),
  planName: z.string(),
  statusId: z.number().int().nullable(),
  statusName: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const subscriptionsListResultSchema = z.object({
  items: z.array(subscriptionListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const planListItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  subscriptionsCount: z.number().int(),
  activeSubscriptionsCount: z.number().int(),
  companiesCount: z.number().int(),
});

export const plansListResultSchema = z.object({
  items: z.array(planListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const promotionListItemSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  discountPercent: z.number().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  active: z.boolean(),
  branchId: z.number().int(),
  branchName: z.string(),
  companyId: z.number().int(),
  companyName: z.string(),
  assignedUsers: z.number().int(),
  redeemedUsers: z.number().int(),
});

export const promotionsListResultSchema = z.object({
  items: z.array(promotionListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const billingOverviewSchema = z.object({
  payments: billingListResultSchema,
  subscriptions: subscriptionsListResultSchema,
});

export const paymentFilterOptionSchema = z.object({
  label: z.string(),
  value: z.number().int(),
});

export const paymentsMetaSchema = z.object({
  statuses: z.array(paymentFilterOptionSchema),
  paymentMethods: z.array(paymentFilterOptionSchema),
});

export const subscriptionFilterOptionSchema = z.object({
  label: z.string(),
  value: z.number().int(),
});

export const subscriptionsMetaSchema = z.object({
  statuses: z.array(subscriptionFilterOptionSchema),
  plans: z.array(subscriptionFilterOptionSchema),
});

export const paymentSummarySchema = z.object({
  totalAmount: z.number(),
  totalPayments: z.number().int(),
  pendingPayments: z.number().int(),
  completedPayments: z.number().int(),
});

export const subscriptionSummarySchema = z.object({
  totalSubscriptions: z.number().int(),
  activeSubscriptions: z.number().int(),
  inactiveSubscriptions: z.number().int(),
  expiringSoonSubscriptions: z.number().int(),
});

export const planSummarySchema = z.object({
  totalPlans: z.number().int(),
  plansWithSubscriptions: z.number().int(),
  totalSubscriptionsLinked: z.number().int(),
  activeSubscriptionsLinked: z.number().int(),
});

export const promotionSummarySchema = z.object({
  totalPromotions: z.number().int(),
  activePromotions: z.number().int(),
  assignedUsers: z.number().int(),
  redeemedUsers: z.number().int(),
});

export const paymentsDashboardDataSchema = z.object({
  payments: billingListResultSchema,
  meta: paymentsMetaSchema,
  summary: paymentSummarySchema,
});

export const subscriptionsDashboardDataSchema = z.object({
  subscriptions: subscriptionsListResultSchema,
  meta: subscriptionsMetaSchema,
  summary: subscriptionSummarySchema,
});

export const plansDashboardDataSchema = z.object({
  plans: plansListResultSchema,
  summary: planSummarySchema,
});

export const promotionsDashboardDataSchema = z.object({
  promotions: promotionsListResultSchema,
  summary: promotionSummarySchema,
});

export const promotionBranchOptionSchema = z.object({
  label: z.string(),
  value: z.number().int(),
});

const promotionBaseSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(1000).nullable().optional(),
  discountPercent: z.number().min(0).max(100).nullable().optional(),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
  active: z.boolean().default(true),
  branchId: z.number().int().positive(),
});

function validateDates(
  value: { startDate?: string | null; endDate?: string | null },
  ctx: z.RefinementCtx
) {
  if (value.startDate && value.endDate) {
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);

    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end < start
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "La fecha de fin no puede ser menor que la fecha de inicio.",
      });
    }
  }
}

export const createPromotionSchema =
  promotionBaseSchema.superRefine(validateDates);

export const updatePromotionSchema = promotionBaseSchema
  .partial()
  .superRefine(validateDates);

export const promotionIdParamSchema = z.object({
  promotionId: z.coerce.number().int().positive(),
});