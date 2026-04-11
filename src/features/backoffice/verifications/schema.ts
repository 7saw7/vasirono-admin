import { z } from "zod";

export const verificationListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  level: z.string().trim().optional(),
  assignedReviewerId: z.string().trim().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const verificationListItemSchema = z.object({
  verificationRequestId: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  claimRequestId: z.number().int().nullable(),
  requestedById: z.string(),
  requestedByName: z.string(),
  requestedByEmail: z.string(),
  statusId: z.number().int().nullable(),
  statusName: z.string(),
  statusCode: z.string(),
  verificationLevel: z.string().nullable(),
  assignedReviewerId: z.string().nullable(),
  assignedReviewerName: z.string().nullable(),
  startedAt: z.string(),
  submittedAt: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export const verificationQueueSummarySchema = z.object({
  total: z.number().int(),
  pending: z.number().int(),
  inReview: z.number().int(),
  approved: z.number().int(),
  rejected: z.number().int(),
});

export const verificationListResultSchema = z.object({
  items: z.array(verificationListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  summary: verificationQueueSummarySchema,
});

export type VerificationListFiltersSchema = z.infer<
  typeof verificationListFiltersSchema
>;