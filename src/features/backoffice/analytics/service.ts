import { analyticsFiltersSchema, backofficeAnalyticsDataSchema } from "./schema";
import type { AnalyticsFilters } from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function normalizeDashboard(raw: unknown) {
  const data =
    raw && typeof raw === "object" && "data" in raw
      ? (raw as { data: unknown }).data
      : raw;

  const row = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  return {
    overview:
      row.overview && typeof row.overview === "object"
        ? row.overview
        : {
            totalEvents: 0,
            totalSearches: 0,
            totalProfileViews: 0,
            totalContactClicks: 0,
          },
    funnel: Array.isArray(row.funnel) ? row.funnel : [],
    branchScoreTrend: Array.isArray(row.branchScoreTrend)
      ? row.branchScoreTrend
      : [],
    companyScoreTrend: Array.isArray(row.companyScoreTrend)
      ? row.companyScoreTrend
      : [],
    topBranches: Array.isArray(row.topBranches) ? row.topBranches : [],
  };
}

export async function getBackofficeAnalytics(input: AnalyticsFilters = {}) {
  const filters = analyticsFiltersSchema.parse(input);

  const raw = await callBackofficeService<unknown>(
    "analytics",
    "/api/analytics/backoffice/analytics/dashboard",
    { query: filters }
  );

  return backofficeAnalyticsDataSchema.parse(normalizeDashboard(raw));
}
