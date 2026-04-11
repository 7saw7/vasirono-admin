import type {
  BackofficeDashboardData,
  PlatformHealthItem,
  QueueMetric,
  RecentActivityItem,
  RevenueSummary,
} from "./types";

export type DashboardCountsRow = {
  companies_count: number | string;
  active_branches_count: number | string;
  users_count: number | string;
  events_7d_count: number | string;
};

export type DashboardVerificationRow = {
  total_count: number | string;
  pending_count: number | string;
  in_review_count: number | string;
  approved_count: number | string;
  rejected_count: number | string;
};

export type DashboardClaimsRow = {
  total_count: number | string;
  pending_count: number | string;
  in_review_count: number | string;
  approved_count: number | string;
  rejected_count: number | string;
};

export type DashboardModerationRow = {
  total_count: number | string;
  pending_count: number | string;
  in_review_count: number | string;
  resolved_count: number | string;
  rejected_count: number | string;
};

export type DashboardRevenueRow = {
  total_amount: number | string | null;
  paid_count: number | string;
  pending_count: number | string;
  failed_count: number | string;
};

export type DashboardActivityRow = {
  id: string;
  type: string;
  title: string;
  description: string;
  occurred_at: Date | string;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function mapQueueMetric(
  row:
    | DashboardVerificationRow
    | DashboardClaimsRow
    | DashboardModerationRow
    | undefined
): QueueMetric {
  return {
    total: toNumber(row?.total_count),
    pending: toNumber(row?.pending_count),
    inReview: toNumber(row?.in_review_count),
    approved:
      "approved_count" in (row ?? {})
        ? toNumber((row as DashboardVerificationRow | DashboardClaimsRow).approved_count)
        : undefined,
    rejected:
      "rejected_count" in (row ?? {})
        ? toNumber((row as DashboardVerificationRow | DashboardClaimsRow | DashboardModerationRow).rejected_count)
        : undefined,
  };
}

export function mapRevenueSummary(
  row: DashboardRevenueRow | undefined
): RevenueSummary {
  return {
    totalPayments: toNumber(row?.total_amount),
    paidCount: toNumber(row?.paid_count),
    pendingCount: toNumber(row?.pending_count),
    failedCount: toNumber(row?.failed_count),
  };
}

export function mapRecentActivity(
  rows: DashboardActivityRow[]
): RecentActivityItem[] {
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    occurredAt:
      row.occurred_at instanceof Date
        ? row.occurred_at.toISOString()
        : new Date(row.occurred_at).toISOString(),
  }));
}

export function buildPlatformHealth(input: {
  verificationsPending: number;
  reviewReportsPending: number;
  claimsPending: number;
  events7d: number;
}): PlatformHealthItem[] {
  const verificationStatus =
    input.verificationsPending > 50
      ? "critical"
      : input.verificationsPending > 15
      ? "warning"
      : "healthy";

  const moderationStatus =
    input.reviewReportsPending > 50
      ? "critical"
      : input.reviewReportsPending > 15
      ? "warning"
      : "healthy";

  const claimsStatus =
    input.claimsPending > 25
      ? "critical"
      : input.claimsPending > 10
      ? "warning"
      : "healthy";

  const trafficStatus =
    input.events7d === 0
      ? "critical"
      : input.events7d < 100
      ? "warning"
      : "healthy";

  return [
    {
      label: "Cola de verificaciones",
      value: String(input.verificationsPending),
      status: verificationStatus,
      helpText: "Solicitudes pendientes de decisión o revisión.",
    },
    {
      label: "Moderación de reseñas",
      value: String(input.reviewReportsPending),
      status: moderationStatus,
      helpText: "Reportes de reseñas pendientes o en proceso.",
    },
    {
      label: "Claims empresariales",
      value: String(input.claimsPending),
      status: claimsStatus,
      helpText: "Solicitudes de claim aún no resueltas.",
    },
    {
      label: "Eventos últimos 7 días",
      value: String(input.events7d),
      status: trafficStatus,
      helpText: "Actividad reciente registrada en analytics_events.",
    },
  ];
}

export function mapDashboardData(input: {
  counts: DashboardCountsRow | undefined;
  verificationQueue: DashboardVerificationRow | undefined;
  moderationQueue: DashboardModerationRow | undefined;
  claimsQueue: DashboardClaimsRow | undefined;
  revenueSummary: DashboardRevenueRow | undefined;
  recentActivity: DashboardActivityRow[];
}): BackofficeDashboardData {
  const companies = toNumber(input.counts?.companies_count);
  const branches = toNumber(input.counts?.active_branches_count);
  const users = toNumber(input.counts?.users_count);
  const events7d = toNumber(input.counts?.events_7d_count);

  const verificationQueue = mapQueueMetric(input.verificationQueue);
  const moderationQueue = mapQueueMetric(input.moderationQueue);
  const claimsQueue = mapQueueMetric(input.claimsQueue);

  return {
    kpis: {
      companies: {
        label: "Empresas",
        value: companies,
        subtitle: "Empresas registradas en la plataforma",
      },
      branches: {
        label: "Sucursales activas",
        value: branches,
        subtitle: "Locales activos publicados",
      },
      users: {
        label: "Usuarios",
        value: users,
        subtitle: "Cuentas registradas",
      },
      events7d: {
        label: "Eventos 7d",
        value: events7d,
        subtitle: "Actividad reciente del ecosistema",
      },
    },
    platformHealth: buildPlatformHealth({
      verificationsPending: verificationQueue.pending,
      reviewReportsPending: moderationQueue.pending,
      claimsPending: claimsQueue.pending,
      events7d,
    }),
    verificationQueue,
    moderationQueue,
    claimsQueue,
    revenueSummary: mapRevenueSummary(input.revenueSummary),
    recentActivity: mapRecentActivity(input.recentActivity),
  };
}