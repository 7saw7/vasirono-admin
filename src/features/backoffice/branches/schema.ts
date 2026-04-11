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