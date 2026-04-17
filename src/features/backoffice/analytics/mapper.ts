import type {
  AnalyticsKpi,
  AnalyticsSeriesPoint,
  AnalyticsTopBranchItem,
  BackofficeAnalyticsData,
} from "./types";

export type AnalyticsOverviewRow = {
  total_events: number | string | null;
  total_searches: number | string | null;
  total_profile_views: number | string | null;
  total_contact_clicks: number | string | null;
};

export type AnalyticsSeriesRow = {
  label: string;
  value: number | string | null;
};

export type AnalyticsTopBranchRow = {
  branch_id: number | string;
  branch_name: string;
  company_name: string;
  final_score: number | string | null;
  visits_30d: number | string | null;
  reviews_90d: number | string | null;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function mapAnalyticsKpi(row: AnalyticsSeriesRow): AnalyticsKpi {
  return {
    label: row.label,
    value: toNumber(row.value),
  };
}

export function mapAnalyticsSeriesPoint(
  row: AnalyticsSeriesRow
): AnalyticsSeriesPoint {
  return {
    label: row.label,
    value: toNumber(row.value),
  };
}

export function mapAnalyticsTopBranchRow(
  row: AnalyticsTopBranchRow
): AnalyticsTopBranchItem {
  return {
    branchId: toNumber(row.branch_id),
    branchName: row.branch_name,
    companyName: row.company_name,
    finalScore: toNumber(row.final_score),
    visits30d: toNumber(row.visits_30d),
    reviews90d: toNumber(row.reviews_90d),
  };
}

export function mapAnalyticsData(input: {
  overview: AnalyticsOverviewRow | undefined;
  funnel: AnalyticsSeriesRow[];
  branchScoreTrend: AnalyticsSeriesRow[];
  companyScoreTrend: AnalyticsSeriesRow[];
  topBranches: AnalyticsTopBranchRow[];
}): BackofficeAnalyticsData {
  return {
    overview: {
      totalEvents: toNumber(input.overview?.total_events),
      totalSearches: toNumber(input.overview?.total_searches),
      totalProfileViews: toNumber(input.overview?.total_profile_views),
      totalContactClicks: toNumber(input.overview?.total_contact_clicks),
    },
    funnel: input.funnel.map(mapAnalyticsKpi),
    branchScoreTrend: input.branchScoreTrend.map(mapAnalyticsSeriesPoint),
    companyScoreTrend: input.companyScoreTrend.map(mapAnalyticsSeriesPoint),
    topBranches: input.topBranches.map(mapAnalyticsTopBranchRow),
  };
}