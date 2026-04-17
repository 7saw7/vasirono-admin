import { z } from "zod";

export const settingsListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const simpleSettingItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const verificationLevelItemSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
});

export const verificationMethodItemSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  requiresDocument: z.boolean(),
  requiresManualReview: z.boolean(),
  isActive: z.boolean(),
});

export const verificationStatusItemSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
  isTerminal: z.boolean(),
});

const paginatedSimpleSchema = z.object({
  items: z.array(simpleSettingItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

const paginatedVerificationLevelsSchema = z.object({
  items: z.array(verificationLevelItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

const paginatedVerificationMethodsSchema = z.object({
  items: z.array(verificationMethodItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

const paginatedVerificationStatusesSchema = z.object({
  items: z.array(verificationStatusItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const settingsSummarySchema = z.object({
  totalRoles: z.number().int(),
  totalVerificationStatuses: z.number().int(),
  totalClaimStatuses: z.number().int(),
  totalPaymentStatuses: z.number().int(),
  totalSubscriptionStatuses: z.number().int(),
  totalNotificationTypes: z.number().int(),
  totalVerificationLevels: z.number().int(),
  totalVerificationMethods: z.number().int(),
  totalVerificationRequestStatuses: z.number().int(),
  totalVerificationCheckStatuses: z.number().int(),
  totalVerificationDocumentTypes: z.number().int(),
  totalVerificationDocumentReviewStatuses: z.number().int(),
});

export const settingsDashboardDataSchema = z.object({
  summary: settingsSummarySchema,
  roles: paginatedSimpleSchema,
  verificationStatuses: paginatedSimpleSchema,
  claimStatuses: paginatedSimpleSchema,
  paymentStatuses: paginatedSimpleSchema,
  subscriptionStatuses: paginatedSimpleSchema,
  notificationTypes: paginatedSimpleSchema,
  verificationLevels: paginatedVerificationLevelsSchema,
  verificationMethods: paginatedVerificationMethodsSchema,
  verificationRequestStatuses: paginatedVerificationStatusesSchema,
  verificationCheckStatuses: paginatedVerificationStatusesSchema,
  verificationDocumentTypes: paginatedVerificationLevelsSchema,
  verificationDocumentReviewStatuses: paginatedVerificationStatusesSchema,
});