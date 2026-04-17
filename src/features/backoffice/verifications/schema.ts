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

export const verificationDocumentSchema = z.object({
  verificationDocumentId: z.number().int(),
  documentType: z.string().nullable(),
  reviewStatus: z.string().nullable(),
  fileName: z.string(),
  filePath: z.string(),
  fileBucket: z.string(),
  mimeType: z.string().nullable(),
  uploadedAt: z.string(),
  reviewedAt: z.string().nullable(),
  reviewedByName: z.string().nullable(),
  reviewNotes: z.string().nullable(),
});

export const verificationCheckSchema = z.object({
  verificationCheckId: z.number().int(),
  methodName: z.string().nullable(),
  statusName: z.string().nullable(),
  score: z.number(),
  confidenceScore: z.number(),
  verifiedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  reviewedByName: z.string().nullable(),
  notes: z.string().nullable(),
});

export const verificationTimelineItemSchema = z.object({
  auditLogId: z.number().int(),
  action: z.string(),
  oldStatusName: z.string().nullable(),
  newStatusName: z.string().nullable(),
  actorName: z.string().nullable(),
  createdAt: z.string(),
});

export const verificationPublicContactSchema = z.object({
  publicContactVerificationId: z.number().int(),
  contactSource: z.string(),
  contactLabel: z.string().nullable(),
  contactValue: z.string(),
  normalizedContactValue: z.string().nullable(),
  isPrimary: z.boolean(),
  matchedWithBranchContact: z.boolean(),
  evidenceUrl: z.string().nullable(),
  createdAt: z.string(),
  verifiedAt: z.string().nullable(),
});

export const verificationWhatsappSchema = z.object({
  whatsappVerificationId: z.number().int(),
  publicPhone: z.string(),
  normalizedPhone: z.string(),
  attemptsCount: z.number().int(),
  maxAttempts: z.number().int(),
  status: z.string(),
  sentAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  verifiedAt: z.string().nullable(),
  failureReason: z.string().nullable(),
  providerName: z.string().nullable(),
});

export const verificationAddressMatchSchema = z.object({
  addressVerificationId: z.number().int(),
  sourceType: z.string(),
  declaredAddress: z.string().nullable(),
  branchAddress: z.string().nullable(),
  extractedAddress: z.string().nullable(),
  distanceMeters: z.number().nullable(),
  matched: z.boolean(),
  confidenceScore: z.number(),
  manualOverride: z.boolean(),
  verifiedAt: z.string().nullable(),
  notes: z.string().nullable(),
});

export const verificationDetailSchema = z.object({
  verificationRequestId: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  claimRequestId: z.number().int().nullable(),
  statusId: z.number().int().nullable(),
  statusName: z.string(),
  statusCode: z.string(),
  verificationLevel: z.string().nullable(),
  requestedById: z.string(),
  requestedByName: z.string(),
  requestedByEmail: z.string(),
  assignedReviewerId: z.string().nullable(),
  assignedReviewerName: z.string().nullable(),
  startedAt: z.string(),
  submittedAt: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  approvalNotes: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  internalNotes: z.string().nullable(),
  publicSummary: z.string().nullable(),
  documents: z.array(verificationDocumentSchema),
  checks: z.array(verificationCheckSchema),
  timeline: z.array(verificationTimelineItemSchema),
  publicContacts: z.array(verificationPublicContactSchema),
  whatsappVerifications: z.array(verificationWhatsappSchema),
  addressMatches: z.array(verificationAddressMatchSchema),
});

export const verificationDecisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  notes: z.string().trim().max(4000).optional(),
});

export const verificationDecisionResultSchema = z.object({
  verificationRequestId: z.number().int(),
  statusName: z.string(),
});

export const verificationAssignSchema = z.object({
  reviewerUserId: z.string().uuid(),
});

export const verificationAssignResultSchema = z.object({
  verificationRequestId: z.number().int(),
  assignedReviewerId: z.string().uuid(),
});

export const verificationDecisionInputSchema = z
  .object({
    decision: z.enum(["approved", "rejected"]),
    approvalNotes: z.string().trim().max(2000).nullable().optional(),
    rejectionReason: z.string().trim().max(2000).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "approved") {
      const notes = value.approvalNotes?.trim() ?? "";
      if (!notes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["approvalNotes"],
          message: "Debes registrar notas de aprobación.",
        });
      }
    }

    if (value.decision === "rejected") {
      const reason = value.rejectionReason?.trim() ?? "";
      if (!reason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rejectionReason"],
          message: "Debes registrar el motivo del rechazo.",
        });
      }
    }
  });

export const verificationRequestIdParamSchema = z.object({
  requestId: z.coerce.number().int().positive(),
});