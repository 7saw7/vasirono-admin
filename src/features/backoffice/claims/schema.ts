import { z } from "zod";

export const claimListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const claimListItemSchema = z.object({
  claimRequestId: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  userId: z.string(),
  claimantName: z.string(),
  claimantEmail: z.string(),
  statusName: z.string(),
  statusCode: z.string(),
  submittedAt: z.string(),
  reviewedAt: z.string().nullable(),
  reviewedByName: z.string().nullable(),
  notes: z.string().nullable(),
  evidenceUrl: z.string().nullable(),
  hasVerificationRequest: z.boolean(),
});

export const claimListResultSchema = z.object({
  items: z.array(claimListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const claimDecisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  notes: z.string().trim().max(2000).optional(),
});

export type ClaimListFiltersSchema = z.infer<typeof claimListFiltersSchema>;
export type ClaimDecisionSchema = z.infer<typeof claimDecisionSchema>;

export const claimDetailSchema = z.object({
  claimRequestId: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  userId: z.string(),
  claimantName: z.string(),
  claimantEmail: z.string(),
  statusId: z.number().int().nullable(),
  statusName: z.string(),
  statusCode: z.string(),
  submittedAt: z.string(),
  reviewedAt: z.string().nullable(),
  reviewedById: z.string().nullable(),
  reviewedByName: z.string().nullable(),
  notes: z.string().nullable(),
  evidenceUrl: z.string().nullable(),
  verificationRequestId: z.number().int().nullable(),
  verificationStatusName: z.string().nullable(),
});

export const claimDecisionResultSchema = z.object({
  claimRequestId: z.number().int(),
  statusName: z.string(),
  verificationRequestId: z.number().int().nullable(),
});