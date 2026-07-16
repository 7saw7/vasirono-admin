import { backofficeDashboardSchema } from "./schema";
import type {
  BackofficeDashboardData,
  PlatformHealthItem,
  QueueMetric,
  RecentActivityItem,
} from "./types";
import {
  BackofficeServiceError,
  callBackofficeService,
  type BackofficeServiceName,
} from "@/lib/microservices/backoffice-client";

type RecordLike = Record<string, unknown>;
type ProbeResult =
  | { ok: true; data: unknown }
  | { ok: false; message: string; status: number };

function asRecord(value: unknown): RecordLike {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : {};
}

function unwrap(value: unknown): unknown {
  const row = asRecord(value);
  return "data" in row ? row.data : value;
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function listTotal(value: unknown): number {
  const row = asRecord(unwrap(value));
  const pagination = asRecord(row.pagination ?? row.meta);
  const items = Array.isArray(row.items) ? row.items : [];
  return asNumber(row.total ?? pagination.total, items.length);
}

function summaryOf(value: unknown): RecordLike {
  const row = asRecord(unwrap(value));
  return asRecord(row.summary);
}

function queueFromSummary(
  result: ProbeResult,
  aliases: {
    approved?: string[];
    rejected?: string[];
  } = {},
): QueueMetric {
  if (!result.ok) {
    return {
      total: 0,
      pending: 0,
      inReview: 0,
      approved: 0,
      rejected: 0,
      available: false,
      unavailableReason: result.message,
    };
  }

  const summary = summaryOf(result.data);
  const pick = (keys: string[]) => {
    for (const key of keys) {
      if (summary[key] !== undefined) return asNumber(summary[key]);
    }
    return 0;
  };

  return {
    total: pick(["total", "totalCount", "total_count"]),
    pending: pick(["pending", "pendingCount", "pending_count"]),
    inReview: pick(["inReview", "in_review", "inReviewCount", "in_review_count"]),
    approved: pick(aliases.approved ?? ["approved", "approvedCount", "approved_count", "resolved"]),
    rejected: pick(aliases.rejected ?? ["rejected", "rejectedCount", "rejected_count", "dismissed"]),
    available: true,
  };
}

async function probe(
  service: BackofficeServiceName,
  path: string,
  query?: Record<string, unknown>,
): Promise<ProbeResult> {
  try {
    return {
      ok: true,
      data: await callBackofficeService<unknown>(service, path, { query }),
    };
  } catch (error) {
    if (error instanceof BackofficeServiceError) {
      return { ok: false, message: error.message, status: error.status };
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Servicio no disponible.",
      status: 500,
    };
  }
}

function health(label: string, result: ProbeResult): PlatformHealthItem {
  if (result.ok) {
    return {
      label,
      value: "Operativo",
      status: "healthy",
      helpText: "Respuesta válida recibida desde el microservicio.",
    };
  }

  const restricted = result.status === 401 || result.status === 403;
  return {
    label,
    value: restricted ? "Acceso restringido" : "No disponible",
    status: restricted ? "warning" : "critical",
    helpText: result.message,
  };
}

function recentActivity(value: unknown): RecentActivityItem[] {
  const row = asRecord(unwrap(value));
  const items = Array.isArray(row.recentActivity) ? row.recentActivity : [];
  return items.flatMap((raw, index) => {
    const item = asRecord(raw);
    const occurredAt = String(item.occurredAt ?? item.occurred_at ?? "");
    if (!occurredAt) return [];
    return [{
      id: String(item.id ?? index),
      type: String(item.type ?? "analytics"),
      title: String(item.title ?? "Actividad registrada"),
      description: String(item.description ?? "Evento registrado en la plataforma."),
      occurredAt,
    }];
  });
}

function revenueFrom(result: ProbeResult): BackofficeDashboardData["revenueSummary"] {
  if (!result.ok) {
    return {
      totalPayments: 0,
      paidCount: 0,
      pendingCount: 0,
      failedCount: 0,
      available: false,
      unavailableReason: result.message,
    };
  }

  const summary = summaryOf(result.data);
  const totalCount = asNumber(summary.totalPayments ?? summary.total_payments ?? summary.total);
  const paidCount = asNumber(
    summary.completedPayments ?? summary.completed_payments ?? summary.paidPayments ?? summary.paid_payments,
  );
  const pendingCount = asNumber(summary.pendingPayments ?? summary.pending_payments);
  const failedCount = asNumber(
    summary.failedPayments ?? summary.failed_payments,
    Math.max(0, totalCount - paidCount - pendingCount),
  );

  return {
    totalPayments: asNumber(summary.totalAmount ?? summary.total_amount),
    paidCount,
    pendingCount,
    failedCount,
    available: true,
  };
}

function sevenDaysAgo(): string {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() - 6);
  return value.toISOString().slice(0, 10);
}

export async function getBackofficeDashboardData(): Promise<BackofficeDashboardData> {
  const [companies, branches, users, analytics, verifications, claims, reports, billing] =
    await Promise.all([
      probe("companies", "/api/backoffice/companies", { page: 1, pageSize: 1 }),
      probe("branches", "/api/backoffice/branches", { page: 1, pageSize: 1 }),
      probe("users", "/api/users/admin/users", { page: 1, pageSize: 1 }),
      probe("analytics", "/api/analytics/backoffice/analytics/dashboard", {
        from: sevenDaysAgo(),
        to: new Date().toISOString().slice(0, 10),
      }),
      probe("verifications", "/api/verifications/admin/verifications", { page: 1, pageSize: 1 }),
      probe("verifications", "/api/verifications/admin/claims", { page: 1, pageSize: 1 }),
      probe("reviewReports", "/api/reviews/admin/review-reports", { page: 1, pageSize: 1 }),
      probe("billing", "/api/billing/admin/billing/payments/dashboard"),
    ]);

  const analyticsRecord = analytics.ok ? asRecord(unwrap(analytics.data)) : {};
  const overview = asRecord(analyticsRecord.overview);

  const data: BackofficeDashboardData = {
    kpis: {
      companies: {
        label: "Empresas",
        value: companies.ok ? listTotal(companies.data) : null,
        subtitle: companies.ok ? "Registro empresarial total" : companies.message,
        available: companies.ok,
      },
      branches: {
        label: "Sucursales",
        value: branches.ok ? listTotal(branches.data) : null,
        subtitle: branches.ok ? "Locales registrados" : branches.message,
        available: branches.ok,
      },
      users: {
        label: "Usuarios",
        value: users.ok ? listTotal(users.data) : null,
        subtitle: users.ok ? "Cuentas de plataforma" : users.message,
        available: users.ok,
      },
      events7d: {
        label: "Eventos 7 días",
        value: analytics.ok ? asNumber(overview.totalEvents ?? overview.total_events) : null,
        subtitle: analytics.ok ? "Actividad analítica registrada" : analytics.message,
        available: analytics.ok,
      },
    },
    platformHealth: [
      health("Companies", companies),
      health("Branches", branches),
      health("Users", users),
      health("Analytics", analytics),
      health("Verifications", verifications),
      health("Claims", claims),
      health("Reviews", reports),
      health("Billing", billing),
    ],
    verificationQueue: queueFromSummary(verifications),
    moderationQueue: queueFromSummary(reports, {
      approved: ["resolved", "resolvedCount", "resolved_count"],
      rejected: ["dismissed", "dismissedCount", "dismissed_count"],
    }),
    claimsQueue: queueFromSummary(claims),
    revenueSummary: revenueFrom(billing),
    recentActivity: analytics.ok ? recentActivity(analytics.data) : [],
  };

  return backofficeDashboardSchema.parse(data);
}
