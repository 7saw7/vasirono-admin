import { z } from "zod";

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}, z.string().optional());

const optionalPositiveInt = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
}, z.number().int().positive().optional());

const optionalBooleanLike = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "si", "sí", "activo", "activa"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "inactivo", "inactiva"].includes(normalized)) {
      return false;
    }
  }
  return value;
}, z.boolean().optional());

export const branchListFiltersSchema = z.object({
  search: optionalTrimmedString,
  companyId: optionalPositiveInt,
  districtId: optionalPositiveInt,
  isActive: optionalBooleanLike,
  page: optionalPositiveInt.default(1),
  pageSize: optionalPositiveInt.default(20),
});

export const branchListItemSchema = z.object({
  branchId: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  name: z.string(),
  address: z.string(),
  districtName: z.string().nullable(),
  isMain: z.boolean(),
  isActive: z.boolean(),
  visitsCount: z.number().int(),
  reviewsCount: z.number().int(),
  finalScore: z.number(),
  contactsCount: z.number().int(),
  schedulesCount: z.number().int(),
  servicesCount: z.number().int(),
  mediaCount: z.number().int(),
  updatedAt: z.string(),
});

export const branchListResultSchema = z.object({
  items: z.array(branchListItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const branchDetailContactSchema = z.object({
  contactId: z.number().int(),
  contactTypeName: z.string(),
  value: z.string(),
  label: z.string().nullable(),
  isPrimary: z.boolean(),
  isPublic: z.boolean(),
  updatedAt: z.string().nullable(),
});

export const branchDetailScheduleSchema = z.object({
  scheduleId: z.number().int(),
  dayName: z.string(),
  isoNumber: z.number().int(),
  opening: z.string().nullable(),
  closing: z.string().nullable(),
  shiftNumber: z.number().int(),
});

export const branchDetailServiceSchema = z.object({
  serviceId: z.number().int(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  isAvailable: z.boolean(),
});

export const branchDetailMediaSchema = z.object({
  mediaId: z.number().int(),
  mediaType: z.string().nullable(),
  url: z.string(),
  updatedAt: z.string().nullable(),
});

export const branchDetailAnalyticsSchema = z.object({
  visitsCount: z.number().int(),
  reviewsCount: z.number().int(),
  averageRating: z.number(),
  aforoReportCount: z.number().int(),
  averageWeightedStatus: z.number(),
  popularityScore: z.number(),
  engagementScore: z.number(),
  conversionScore: z.number(),
  trustScore: z.number(),
  freshnessScore: z.number(),
  finalScore: z.number(),
  calculatedAt: z.string().nullable(),
});

export const branchDetailAforoReportSchema = z.object({
  reportId: z.number().int(),
  statusLabel: z.string().nullable(),
  statusCode: z.string().nullable(),
  weight: z.number().nullable(),
  gpsValidated: z.boolean(),
  createdAt: z.string(),
});

export const branchDetailSchema = z.object({
  branchId: z.number().int(),
  companyId: z.number().int(),
  companyName: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  address: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  districtName: z.string().nullable(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  isMain: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  contacts: z.array(branchDetailContactSchema),
  schedules: z.array(branchDetailScheduleSchema),
  services: z.array(branchDetailServiceSchema),
  media: z.array(branchDetailMediaSchema),
  analytics: branchDetailAnalyticsSchema,
  aforo: z.array(branchDetailAforoReportSchema),
});