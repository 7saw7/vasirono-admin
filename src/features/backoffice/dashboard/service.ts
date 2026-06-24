import { backofficeDashboardSchema } from "./schema";
import type { BackofficeDashboardData } from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

const zeroQueue = {
  total: 0,
  pending: 0,
  inReview: 0,
  approved: 0,
  rejected: 0,
};

function emptyDashboard(): BackofficeDashboardData {
  return {
    kpis: {
      companies: { label: "Empresas", value: 0, subtitle: "Desde companies-service" },
      branches: { label: "Sucursales", value: 0, subtitle: "Desde branch-service" },
      users: { label: "Usuarios", value: 0, subtitle: "Desde users-service" },
      events7d: { label: "Eventos 7 días", value: 0, subtitle: "Desde analytics-service" },
    },
    platformHealth: [
      {
        label: "Backoffice",
        value: "Operativo",
        status: "healthy",
        helpText: "Autenticación delegada a auth-service.",
      },
      {
        label: "Datos",
        value: "Microservicios",
        status: "warning",
        helpText: "El dashboard ya no consulta Supabase directo; depende de los endpoints backoffice de los micros.",
      },
    ],
    verificationQueue: zeroQueue,
    moderationQueue: zeroQueue,
    claimsQueue: zeroQueue,
    revenueSummary: {
      totalPayments: 0,
      paidCount: 0,
      pendingCount: 0,
      failedCount: 0,
    },
    recentActivity: [],
  };
}

function asNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeQueue(value: unknown) {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    total: asNumber(row.total),
    pending: asNumber(row.pending ?? row.pendingCount),
    inReview: asNumber(row.inReview ?? row.in_review ?? row.inReviewCount),
    approved: asNumber(row.approved ?? row.approvedCount),
    rejected: asNumber(row.rejected ?? row.rejectedCount),
  };
}

function normalizeDashboard(raw: unknown): BackofficeDashboardData {
  const base = emptyDashboard();
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const kpis = data.kpis && typeof data.kpis === "object" ? (data.kpis as Record<string, unknown>) : {};

  return backofficeDashboardSchema.parse({
    ...base,
    kpis: {
      companies: {
        ...base.kpis.companies,
        value: asNumber((kpis.companies as any)?.value ?? data.companiesCount ?? data.companies),
      },
      branches: {
        ...base.kpis.branches,
        value: asNumber((kpis.branches as any)?.value ?? data.branchesCount ?? data.branches),
      },
      users: {
        ...base.kpis.users,
        value: asNumber((kpis.users as any)?.value ?? data.usersCount ?? data.users),
      },
      events7d: {
        ...base.kpis.events7d,
        value: asNumber((kpis.events7d as any)?.value ?? data.events7d ?? data.eventsLast7Days),
      },
    },
    platformHealth: Array.isArray(data.platformHealth) ? data.platformHealth : base.platformHealth,
    verificationQueue: normalizeQueue(data.verificationQueue ?? data.verifications),
    moderationQueue: normalizeQueue(data.moderationQueue ?? data.moderation),
    claimsQueue: normalizeQueue(data.claimsQueue ?? data.claims),
    revenueSummary:
      data.revenueSummary && typeof data.revenueSummary === "object"
        ? {
            totalPayments: asNumber((data.revenueSummary as any).totalPayments),
            paidCount: asNumber((data.revenueSummary as any).paidCount),
            pendingCount: asNumber((data.revenueSummary as any).pendingCount),
            failedCount: asNumber((data.revenueSummary as any).failedCount),
          }
        : base.revenueSummary,
    recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : base.recentActivity,
  });
}

export async function getBackofficeDashboardData() {
  const raw = await callBackofficeService<unknown>(
    "analytics",
    "/api/backoffice/analytics/dashboard"
  );

  return normalizeDashboard(raw);
}
