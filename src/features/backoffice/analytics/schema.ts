import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD");

export const analyticsFiltersSchema = z
  .object({
    companyId: z.coerce.number().int().positive().optional(),
    branchId: z.coerce.number().int().positive().optional(),
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
  })
  .refine(
    (input) => {
      if (!input.from || !input.to) return true;
      return input.from <= input.to;
    },
    {
      message: "El rango de fechas no es válido.",
      path: ["to"],
    }
  );

export const analyticsKpiSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const analyticsSeriesPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const analyticsTopBranchItemSchema = z.object({
  branchId: z.number().int(),
  branchName: z.string(),
  companyName: z.string(),
  finalScore: z.number(),
  visits30d: z.number().int(),
  reviews90d: z.number().int(),
});

export const backofficeAnalyticsDataSchema = z.object({
  overview: z.object({
    totalEvents: z.number().int(),
    totalSearches: z.number().int(),
    totalProfileViews: z.number().int(),
    totalContactClicks: z.number().int(),
  }),
  funnel: z.array(analyticsKpiSchema),
  branchScoreTrend: z.array(analyticsSeriesPointSchema),
  companyScoreTrend: z.array(analyticsSeriesPointSchema),
  topBranches: z.array(analyticsTopBranchItemSchema),
});