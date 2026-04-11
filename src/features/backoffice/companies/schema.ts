export const companyDetailBranchSchema = z.object({
  branchId: z.number().int(),
  name: z.string(),
  address: z.string(),
  districtName: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  isMain: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const companyDetailMediaItemSchema = z.object({
  mediaId: z.number().int(),
  mediaType: z.string().nullable(),
  url: z.string(),
  createdAt: z.string().nullable(),
});

export const companyDetailVerificationSchema = z.object({
  statusLabel: z.string(),
  profileLevel: z.string().nullable(),
  verificationScore: z.number(),
  isIdentityVerified: z.boolean(),
  isWhatsappVerified: z.boolean(),
  isAddressVerified: z.boolean(),
  isDocumentVerified: z.boolean(),
  isManualReviewCompleted: z.boolean(),
  verifiedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  latestRequestId: z.number().int().nullable(),
  latestRequestStatus: z.string().nullable(),
  latestRequestSubmittedAt: z.string().nullable(),
});

export const companyDetailSubscriptionSchema = z.object({
  subscriptionId: z.number().int().nullable(),
  planName: z.string().nullable(),
  statusName: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const companyDetailPaymentSchema = z.object({
  paymentId: z.number().int(),
  amount: z.number(),
  statusName: z.string().nullable(),
  paymentMethodName: z.string().nullable(),
  createdAt: z.string(),
});

export const companyDetailClaimSchema = z.object({
  claimRequestId: z.number().int(),
  statusName: z.string().nullable(),
  submittedAt: z.string(),
  reviewedAt: z.string().nullable(),
  notes: z.string().nullable(),
  evidenceUrl: z.string().nullable(),
});

export const companyDetailAuditItemSchema = z.object({
  auditLogId: z.number().int(),
  action: z.string(),
  oldStatusName: z.string().nullable(),
  newStatusName: z.string().nullable(),
  actorName: z.string().nullable(),
  createdAt: z.string(),
});

export const companyDetailSchema = z.object({
  companyId: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  verificationStatus: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  branches: z.array(companyDetailBranchSchema),
  media: z.array(companyDetailMediaItemSchema),
  verification: companyDetailVerificationSchema,
  subscription: companyDetailSubscriptionSchema,
  payments: z.array(companyDetailPaymentSchema),
  claims: z.array(companyDetailClaimSchema),
  audit: z.array(companyDetailAuditItemSchema),
});