import { z } from "zod";

const dashboardKpiSchema = z.object({
  label: z.string(),
  value: z.number(),
  subtitle: z.string().optional(),
});

const platformHealthItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  status: z.enum(["healthy", "warning", "critical"]),
  helpText: z.string().optional(),
});

const queueMetricSchema = z.object({
  total: z.number(),
  pending: z.number(),
  inReview: z.number(),
  approved: z.number().optional(),
  rejected: z.number().optional(),
});

const revenueSummarySchema = z.object({
  totalPayments: z.number(),
  paidCount: z.number(),
  pendingCount: z.number(),
  failedCount: z.number(),
});

const recentActivityItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  occurredAt: z.string(),
});

export const backofficeDashboardSchema = z.object({
  kpis: z.object({
    companies: dashboardKpiSchema,
    branches: dashboardKpiSchema,
    users: dashboardKpiSchema,
    events7d: dashboardKpiSchema,
  }),
  platformHealth: z.array(platformHealthItemSchema),
  verificationQueue: queueMetricSchema,
  moderationQueue: queueMetricSchema,
  claimsQueue: queueMetricSchema,
  revenueSummary: revenueSummarySchema,
  recentActivity: z.array(recentActivityItemSchema),
});

export type BackofficeDashboardSchema = z.infer<
  typeof backofficeDashboardSchema
>;