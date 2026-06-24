import { getRawSessionTokenFromCookie, getCurrentSessionUser } from "@/lib/auth/session";
import { getRolePermissions } from "@/lib/auth/permissions";

export type BackofficeServiceName =
  | "analytics"
  | "companies"
  | "branches"
  | "verifications"
  | "users"
  | "reviews"
  | "reviewReports"
  | "promotions"
  | "billing"
  | "notifications";

const SERVICE_ENV: Record<BackofficeServiceName, string[]> = {
  analytics: ["ANALYTICS_SERVICE_URL"],
  companies: ["COMPANIES_SERVICE_URL"],
  branches: ["BRANCH_SERVICE_URL", "BRANCHES_SERVICE_URL"],
  verifications: ["VERIFICATIONS_SERVICE_URL"],
  users: ["USERS_SERVICE_URL"],
  reviews: ["REVIEWS_SERVICE_URL"],
  reviewReports: ["REVIEWS_SERVICE_URL"],
  promotions: ["PROMOTIONS_SERVICE_URL"],
  billing: ["BILLING_SERVICE_URL"],
  notifications: ["NOTIFICATIONS_SERVICE_URL"],
};

export class BackofficeServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "BACKOFFICE_SERVICE_ERROR",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "BackofficeServiceError";
  }
}

function getBaseUrl(service: BackofficeServiceName): string {
  const candidates = SERVICE_ENV[service];

  for (const key of candidates) {
    const value = process.env[key]?.trim();
    if (value) return value.replace(/\/+$/, "");
  }

  throw new BackofficeServiceError(
    `Falta configurar ${candidates.join(" o ")} en el panel admin.`,
    500,
    "BACKOFFICE_SERVICE_URL_MISSING",
    { service, env: candidates }
  );
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, unknown>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(
    baseUrl.endsWith("/api") && normalizedPath.startsWith("/api/")
      ? `${baseUrl}${normalizedPath.slice(4)}`
      : `${baseUrl}${normalizedPath}`
  );

  for (const [key, rawValue] of Object.entries(query ?? {})) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    url.searchParams.set(key, String(rawValue));
  }

  return url.toString();
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function toBase64Json(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

export async function callBackofficeService<T>(
  service: BackofficeServiceName,
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    query?: Record<string, unknown>;
    body?: unknown;
    actorUserId?: string | null;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const baseUrl = getBaseUrl(service);
  const token = await getRawSessionTokenFromCookie();
  const session = await getCurrentSessionUser().catch(() => ({
    user: null,
    sessionId: null,
  }));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);
  const requestUrl = buildUrl(baseUrl, path, options.query);

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
    };

    if (token) headers.authorization = `Bearer ${token}`;

    const user = session.user;
    const actorUserId = options.actorUserId ?? user?.id ?? null;

    if (actorUserId) headers["x-user-id"] = actorUserId;

    if (user) {
      const permissions = Array.from(getRolePermissions(user.role));

      headers["x-user-role"] = user.role;
      headers["x-role-name"] = user.role;
      headers["x-user-email"] = user.email;
      headers["x-portal"] = "backoffice";
      headers["x-user-permissions"] = permissions.join(",");
      headers["x-user-claims"] = toBase64Json({
        userId: actorUserId,
        portal: "backoffice",
        activeRole: user.role,
        role: user.role,
        permissions,
        user: {
          id: actorUserId,
          name: user.name,
          email: user.email,
          globalRole: user.role,
          verified: user.verified,
        },
        sessionId: session.sessionId,
      });
    }

    const internalSecret =
      process.env.INTERNAL_SERVICE_TOKEN?.trim() ||
      process.env.INTERNAL_SERVICE_SECRET?.trim();

    if (internalSecret) {
      headers["x-internal-service-secret"] = internalSecret;
    }

    const edgeToken =
      process.env.EDGE_AUTH_TOKEN?.trim() ||
      process.env.EDGE_INTERNAL_TOKEN?.trim();

    if (edgeToken) {
      headers["x-edge-auth"] = edgeToken;
    }

    let body: string | undefined;
    if (typeof options.body !== "undefined") {
      headers["content-type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    const response = await fetch(requestUrl, {
      method: options.method ?? "GET",
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || (payload && typeof payload === "object" && (payload as { success?: boolean }).success === false)) {
      const envelope = payload as { error?: { code?: string; message?: string }; message?: string } | null;
      const message =
        envelope?.error?.message ||
        envelope?.message ||
        response.statusText ||
        "Error consultando microservicio.";
      const code = envelope?.error?.code || "BACKOFFICE_SERVICE_REQUEST_FAILED";

      console.error("backoffice.service.request_failed", {
        service,
        path,
        status: response.status,
        code,
        message,
        details: payload,
      });

      throw new BackofficeServiceError(
        message,
        response.status,
        code,
        payload
      );
    }

    return unwrapEnvelope<T>(payload);
  } finally {
    clearTimeout(timeout);
  }
}
