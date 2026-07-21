import { z } from "zod";

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}, z.string().optional());

const positiveIntFromUnknown = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
}, z.number().int().positive().optional());

export const companyListFiltersSchema = z.object({
  search: optionalTrimmedString,
  verificationStatus: optionalTrimmedString,
  subscriptionStatus: optionalTrimmedString,
  page: positiveIntFromUnknown.default(1),
  pageSize: positiveIntFromUnknown.default(20),
});

export const companyListItemSchema = z.object({
  companyId: z.number().int(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  verificationStatus: z.string(),
  verificationStatusCode: z.string(),
  verificationLevel: z.string().nullable(),
  verificationScore: z.number(),
  planName: z.string().nullable(),
  subscriptionStatus: z.string().nullable(),
  branchesCount: z.number().int(),
  activeBranchesCount: z.number().int(),
  districtLabel: z.string().nullable(),
  pendingClaimsCount: z.number().int(),
  updatedAt: z.string(),
});

export const companyListResultSchema = z.object({
  items: z.array(companyListItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative().optional(),
});

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

export const companyBusinessTypeSchema = z.object({
  typeId: z.number().int().positive(),
  name: z.string().nullable(),
});

export const companySubcategorySchema = z.object({
  subcategoryId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  categoryName: z.string(),
  name: z.string(),
  priceId: z.number().int().positive().nullable(),
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
  isActive: z.boolean(),
  priceId: z.number().int().positive().nullable(),
  verificationStatus: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  businessTypes: z.array(companyBusinessTypeSchema),
  subcategories: z.array(companySubcategorySchema),
  branches: z.array(companyDetailBranchSchema),
  media: z.array(companyDetailMediaItemSchema),
  verification: companyDetailVerificationSchema,
  subscription: companyDetailSubscriptionSchema,
  payments: z.array(companyDetailPaymentSchema),
  claims: z.array(companyDetailClaimSchema),
  audit: z.array(companyDetailAuditItemSchema),
});

const nullableTrimmed = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional();

export const companyUpdateProfileSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  description: nullableTrimmed(1500),
  address: nullableTrimmed(220),
  phone: nullableTrimmed(40),
  email: z.union([z.string().trim().email().max(160), z.null()]).optional(),
  website: nullableTrimmed(220),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lon: z.number().min(-180).max(180).nullable().optional(),
  priceId: z.number().int().positive().nullable().optional(),
});

export const companyUpdateTaxonomySchema = z.object({
  businessTypeIds: z.array(z.number().int().positive()).max(50),
  subcategories: z
    .array(
      z.object({
        subcategoryId: z.number().int().positive(),
        priceId: z.number().int().positive().nullable().optional(),
      }),
    )
    .max(100),
});

export const companyUpdateStatusSchema = z.object({
  isActive: z.boolean(),
});
