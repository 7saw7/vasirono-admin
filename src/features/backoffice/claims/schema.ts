import { z } from "zod";

export const claimListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const claimPublicContactSchema = z.object({
  publicContactVerificationId: z.number().int(),
  contactSource: z.string(),
  contactLabel: z.string().nullable(),
  contactValue: z.string(),
  normalizedContactValue: z.string().nullable(),
  matchedWithBranchContact: z.boolean(),
  evidenceUrl: z.string().nullable(),
  verifiedAt: z.string().nullable(),
  verifiedByName: z.string().nullable(),
  createdAt: z.string(),
});

export const claimWhatsappVerificationSchema = z.object({
  whatsappVerificationId: z.number().int(),
  publicPhone: z.string(),
  normalizedPhone: z.string(),
  attemptsCount: z.number().int(),
  maxAttempts: z.number().int(),
  status: z.string(),
  sentAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  verifiedAt: z.string().nullable(),
  providerName: z.string().nullable(),
  failureReason: z.string().nullable(),
});

export const claimListItemSchema = z.object({
  claimRequestId: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  branchId: z.number().int().nullable(),
  branchName: z.string().nullable(),
  branchAddress: z.string().nullable(),
  userId: z.string().nullable(),
  claimantName: z.string(),
  claimantEmail: z.string(),
  claimantPhone: z.string().nullable(),
  applicantRole: z.string().nullable(),
  source: z.string(),
  declaredChannelType: z.string().nullable(),
  declaredChannelValue: z.string().nullable(),
  preferredVerificationRoute: z.string().nullable(),
  statusName: z.string(),
  statusCode: z.string(),
  submittedAt: z.string(),
  reviewedAt: z.string().nullable(),
  reviewedByName: z.string().nullable(),
  notes: z.string().nullable(),
  evidenceUrl: z.string().nullable(),
  hasVerificationRequest: z.boolean(),
  professionalFlowMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
  invitationId: z.number().int().nullable().optional(),
  invitationStatus: z.string().nullable().optional(),
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

export const officialChannelSchema = z
  .object({
    channelType: z.enum([
      "email",
      "whatsapp",
      "phone",
      "website",
      "instagram",
      "facebook",
      "tiktok",
      "manual",
    ]),
    channelValue: z.string().trim().min(3).max(300),
    evidenceUrl: z.string().trim().max(1000).nullable().optional(),
    reviewerNotes: z.string().trim().max(2000).nullable().optional(),
    matchedWithBranchContact: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (!["email", "whatsapp"].includes(value.channelType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["channelType"],
        message:
          "Para enviar código semi profesional el canal debe ser email o WhatsApp. Si no existe, coordina visita presencial.",
      });
    }
  });

export const onsiteRequiredSchema = z.object({
  scheduledAt: z.string().trim().nullable().optional(),
  visitAddress: z.string().trim().max(500).nullable().optional(),
  contactPerson: z.string().trim().max(180).nullable().optional(),
  contactPhone: z.string().trim().max(60).nullable().optional(),
  notes: z.string().trim().max(3000).nullable().optional(),
});

export const onsiteApprovalSchema = z.object({
  notes: z.string().trim().min(5).max(4000),
  documentsReviewed: z.boolean().optional(),
  addressVerified: z.boolean().optional(),
});

export const claimFlowActionResultSchema = z.object({
  claimRequestId: z.number().int(),
  statusName: z.string(),
  statusCode: z.string(),
  verificationRequestId: z.number().int().nullable(),
});

export const officialChannelChallengeResultSchema = z.object({
  claimRequestId: z.number().int(),
  verificationRequestId: z.number().int(),
  verificationCheckId: z.number().int(),
  channel: z.enum(["email", "whatsapp"]),
  to: z.string(),
  codeExpiresAt: z.string(),
  notification: z.object({
    sent: z.boolean(),
    prepared: z.boolean(),
    manualActionRequired: z.boolean(),
    provider: z.string().nullable().optional(),
    deliveryMode: z.string().nullable().optional(),
    manualSendUrl: z.string().nullable().optional(),
    messageText: z.string().nullable().optional(),
    error: z.string().nullable().optional(),
  }),
});

export type ClaimListFiltersSchema = z.infer<typeof claimListFiltersSchema>;
export type ClaimDecisionSchema = z.infer<typeof claimDecisionSchema>;

export const claimDetailSchema = z.object({
  claimRequestId: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  branchId: z.number().int().nullable(),
  branchName: z.string().nullable(),
  branchAddress: z.string().nullable(),
  branchPhone: z.string().nullable(),
  branchEmail: z.string().nullable(),
  userId: z.string().nullable(),
  claimantName: z.string(),
  claimantEmail: z.string(),
  claimantPhone: z.string().nullable(),
  applicantRole: z.string().nullable(),
  source: z.string(),
  declaredChannelType: z.string().nullable(),
  declaredChannelValue: z.string().nullable(),
  preferredVerificationRoute: z.string().nullable(),
  onsiteVisitScheduledAt: z.string().nullable(),
  onsiteVisitAddress: z.string().nullable(),
  onsiteContactPerson: z.string().nullable(),
  onsiteContactPhone: z.string().nullable(),
  onsiteVisitNotes: z.string().nullable(),
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
  verificationStatusCode: z.string().nullable(),
  verificationLevel: z.string().nullable(),
  publicContacts: z.array(claimPublicContactSchema),
  whatsappVerifications: z.array(claimWhatsappVerificationSchema),
  professionalFlowMetadata: z.record(z.string(), z.unknown()).nullable(),
  invitationId: z.number().int().nullable().optional(),
  invitationStatus: z.string().nullable().optional(),
  invitationExpiresAt: z.string().nullable().optional(),
  invitationAcceptedAt: z.string().nullable().optional(),
});

export const claimDecisionResultSchema = z.object({
  claimRequestId: z.number().int(),
  statusName: z.string(),
  verificationRequestId: z.number().int().nullable(),
});
