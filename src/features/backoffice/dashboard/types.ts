export type DashboardKpi = {
  label: string;
  value: number;
  subtitle?: string;
};

export type PlatformHealthStatus = "healthy" | "warning" | "critical";

export type PlatformHealthItem = {
  label: string;
  value: string;
  status: PlatformHealthStatus;
  helpText?: string;
};

export type QueueMetric = {
  total: number;
  pending: number;
  inReview: number;
  approved?: number;
  rejected?: number;
};

export type RevenueSummary = {
  totalPayments: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
};

export type RecentActivityItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  occurredAt: string;
};

export type BackofficeDashboardData = {
  kpis: {
    companies: DashboardKpi;
    branches: DashboardKpi;
    users: DashboardKpi;
    events7d: DashboardKpi;
  };
  platformHealth: PlatformHealthItem[];
  verificationQueue: QueueMetric;
  moderationQueue: QueueMetric;
  claimsQueue: QueueMetric;
  revenueSummary: RevenueSummary;
  recentActivity: RecentActivityItem[];
};