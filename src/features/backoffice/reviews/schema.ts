import { z } from "zod";

const optionalBooleanLike = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "si", "sí", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return value;
}, z.boolean().optional());

export const reviewsListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  validated: optionalBooleanLike,
  hidden: optionalBooleanLike,
  branchId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const reviewListItemSchema = z.object({
  reviewId: z.number().int(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  companyId: z.number().int(),
  companyName: z.string(),
  branchId: z.number().int(),
  branchName: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  validated: z.boolean(),
  isHidden: z.boolean(),
  reportsCount: z.number().int(),
  responseStatus: z.string().nullable(),
  usefulnessScore: z.number(),
  createdAt: z.string(),
});

export const reviewsListResultSchema = z.object({
  items: z.array(reviewListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const reviewMediaItemSchema = z.object({
  id: z.number().int(),
  mediaType: z.string().nullable(),
  url: z.string(),
  isCover: z.boolean(),
  sortOrder: z.number().int(),
});

export const reviewResponseItemSchema = z.object({
  id: z.number().int(),
  companyId: z.number().int(),
  responderUserId: z.string(),
  responderName: z.string().nullable(),
  statusName: z.string().nullable(),
  responseText: z.string(),
  respondedAt: z.string(),
});

export const reviewUsefulnessSchema = z.object({
  likesCount: z.number().int(),
  dislikesCount: z.number().int(),
  reportsCount: z.number().int(),
  mediaCount: z.number().int(),
  responseCount: z.number().int(),
  commentLength: z.number().int(),
  hasComment: z.boolean(),
  isValidated: z.boolean(),
  usefulnessScore: z.number(),
  confidenceScore: z.number(),
  finalScore: z.number(),
  calculatedAt: z.string().nullable(),
});

export const reviewDetailSchema = z.object({
  reviewId: z.number().int(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  companyId: z.number().int(),
  companyName: z.string(),
  branchId: z.number().int(),
  branchName: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  validated: z.boolean(),
  isHidden: z.boolean(),
  reportsCount: z.number().int(),
  createdAt: z.string(),
  media: z.array(reviewMediaItemSchema),
  response: reviewResponseItemSchema.nullable(),
  usefulness: reviewUsefulnessSchema.nullable(),
});

export const reviewModerationMetaSchema = z.object({
  isHidden: z.boolean(),
  hiddenAt: z.string().nullable(),
  hiddenBy: z.string().nullable(),
  hiddenReason: z.string().nullable(),
  moderationUpdatedAt: z.string().nullable(),
});

export const hideReviewInputSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Debes indicar el motivo del ocultamiento.")
    .max(2000, "El motivo no puede superar los 2000 caracteres."),
});

export const restoreReviewInputSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(2000, "La observación no puede superar los 2000 caracteres.")
    .nullable()
    .optional(),
});

export const hideReviewResultSchema = z.object({
  reviewId: z.number().int().positive(),
  isHidden: z.boolean(),
  hiddenAt: z.string().nullable(),
  hiddenBy: z.string().nullable(),
  hiddenReason: z.string().nullable(),
  moderationUpdatedAt: z.string().nullable(),
});

export const restoreReviewResultSchema = z.object({
  reviewId: z.number().int().positive(),
  isHidden: z.boolean(),
  hiddenAt: z.string().nullable(),
  hiddenBy: z.string().nullable(),
  hiddenReason: z.string().nullable(),
  moderationUpdatedAt: z.string().nullable(),
});

export const resolveReviewReportInputSchema = z.object({
  resolution: z.enum(["resolved", "dismissed"]),
  resolutionNotes: z
    .string()
    .trim()
    .max(2000, "La nota de resolución no puede superar los 2000 caracteres.")
    .nullable()
    .optional(),
});

export const resolveReviewReportResultSchema = z.object({
  reportId: z.number().int().positive(),
  reviewId: z.number().int().positive(),
  statusId: z.number().int().positive(),
  statusCode: z.string(),
  statusName: z.string(),
  reviewedAt: z.string().nullable(),
  reviewedBy: z.string().nullable(),
  resolutionNotes: z.string().nullable(),
});

export const reviewIdParamSchema = z.object({
  reviewId: z.coerce.number().int().positive(),
});

export const reviewReportIdParamSchema = z.object({
  reportId: z.coerce.number().int().positive(),
});
