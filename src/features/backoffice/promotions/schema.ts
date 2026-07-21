import { z } from "zod";

export const promotionStatusSchema = z.enum([
  "draft",
  "pending_review",
  "approved",
  "paused",
  "rejected",
  "expired",
  "deleted",
]);

export const promotionListFiltersSchema = z.object({
  search: z.string().trim().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  districtId: z.coerce.number().int().positive().optional(),
  status: promotionStatusSchema.optional(),
  active: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const promotionIdParamSchema = z.object({
  promotionId: z.coerce.number().int().positive(),
});

export const updatePromotionStatusSchema = z.object({
  status: z.enum(["approved", "paused"]),
  reason: z.string().trim().max(1000).optional(),
});

export const moderatePromotionSchema = z
  .object({
    decision: z.enum(["approved", "rejected", "requires_changes"]),
    reason: z.string().trim().max(1000).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      (value.decision === "rejected" ||
        value.decision === "requires_changes") &&
      !value.reason
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "Debes indicar el motivo de la decisión.",
      });
    }
  });
