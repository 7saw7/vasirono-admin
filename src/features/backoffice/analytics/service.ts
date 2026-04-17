import { analyticsFiltersSchema, backofficeAnalyticsDataSchema } from "./schema";
import { mapAnalyticsData } from "./mapper";
import type { AnalyticsFilters } from "./types";
import {
  getAnalyticsFunnelQuery,
  getAnalyticsOverviewQuery,
  getBranchScoreTrendQuery,
  getCompanyScoreTrendQuery,
  getTopBranchesAnalyticsQuery,
} from "@/lib/db/queries/backoffice/analytics";

export async function getBackofficeAnalytics(input: AnalyticsFilters = {}) {
  const filters = analyticsFiltersSchema.parse(input);

  const [overview, funnel, branchScoreTrend, companyScoreTrend, topBranches] =
    await Promise.all([
      getAnalyticsOverviewQuery(filters),
      getAnalyticsFunnelQuery(filters),
      getBranchScoreTrendQuery(filters),
      getCompanyScoreTrendQuery(filters),
      getTopBranchesAnalyticsQuery(filters),
    ]);

  return backofficeAnalyticsDataSchema.parse(
    mapAnalyticsData({
      overview,
      funnel,
      branchScoreTrend,
      companyScoreTrend,
      topBranches,
    })
  );
}