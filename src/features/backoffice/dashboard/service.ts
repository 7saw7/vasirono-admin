import { backofficeDashboardSchema } from "./schema";
import { mapDashboardData } from "./mapper";
import {
  getDashboardClaimsQueueQuery,
  getDashboardCountsQuery,
  getDashboardModerationQueueQuery,
  getDashboardRecentActivityQuery,
  getDashboardRevenueSummaryQuery,
  getDashboardVerificationQueueQuery,
} from "@/lib/db/queries/backoffice/dashboard";

export async function getBackofficeDashboardData() {
  const [
    counts,
    verificationQueue,
    moderationQueue,
    claimsQueue,
    revenueSummary,
    recentActivity,
  ] = await Promise.all([
    getDashboardCountsQuery(),
    getDashboardVerificationQueueQuery(),
    getDashboardModerationQueueQuery(),
    getDashboardClaimsQueueQuery(),
    getDashboardRevenueSummaryQuery(),
    getDashboardRecentActivityQuery(),
  ]);

  const mapped = mapDashboardData({
    counts,
    verificationQueue,
    moderationQueue,
    claimsQueue,
    revenueSummary,
    recentActivity,
  });

  return backofficeDashboardSchema.parse(mapped);
}