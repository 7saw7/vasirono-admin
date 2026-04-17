import { z } from "zod";

export const reviewReportListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const reviewReportListItemSchema = z.object({
  reportId: z.number().int(),
  reviewId: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  branchName: z.string(),
  reporterUserId: z.string(),
  reporterName: z.string(),
  statusName: z.string(),
  statusCode: z.string(),
  reason: z.string().nullable(),
  details: z.string().nullable(),
  createdAt: z.string(),
  reviewedAt: z.string().nullable(),
  reviewedByName: z.string().nullable(),
});

export const reviewReportListResultSchema = z.object({
  items: z.array(reviewReportListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const reviewReportDecisionSchema = z.object({
  status: z.enum(["resolved", "hidden"]),
  resolutionNotes: z.string().trim().max(4000).optional(),
});

export const reviewReportDecisionResultSchema = z.object({
  reportId: z.number().int(),
  statusName: z.string(),
});

export const reviewReportDetailSchema = reviewReportListItemSchema.extend({
  reviewComment: z.string().nullable(),
  reviewRating: z.number(),
  reviewCreatedAt: z.string(),
});