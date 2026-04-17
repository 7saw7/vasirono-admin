export type AnalyticsFilters = {
  companyId?: string | number;
  branchId?: string | number;
  from?: string;
  to?: string;
};

export type AnalyticsKpi = {
  label: string;
  value: number;
};

export type AnalyticsSeriesPoint = {
  label: string;
  value: number;
};

export type AnalyticsTopBranchItem = {
  branchId: number;
  branchName: string;
  companyName: string;
  finalScore: number;
  visits30d: number;
  reviews90d: number;
};

export type BackofficeAnalyticsData = {
  overview: {
    totalEvents: number;
    totalSearches: number;
    totalProfileViews: number;
    totalContactClicks: number;
  };
  funnel: AnalyticsKpi[];
  branchScoreTrend: AnalyticsSeriesPoint[];
  companyScoreTrend: AnalyticsSeriesPoint[];
  topBranches: AnalyticsTopBranchItem[];
};