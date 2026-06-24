import { getRawSessionTokenFromCookie } from "@/lib/auth/session";

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
    };

    if (token) headers.authorization = `Bearer ${token}`;
    if (options.actorUserId) headers["x-user-id"] = options.actorUserId;

    let body: string | undefined;
    if (typeof options.body !== "undefined") {
      headers["content-type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    const response = await fetch(buildUrl(baseUrl, path, options.query), {
      method: options.method ?? "GET",
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || (payload && typeof payload === "object" && (payload as { success?: boolean }).success === false)) {
      const envelope = payload as { error?: { code?: string; message?: string }; message?: string } | null;
      throw new BackofficeServiceError(
        envelope?.error?.message || envelope?.message || response.statusText || "Error consultando microservicio.",
        response.status,
        envelope?.error?.code || "BACKOFFICE_SERVICE_REQUEST_FAILED",
        payload
      );
    }

    return unwrapEnvelope<T>(payload);
  } finally {
    clearTimeout(timeout);
  }
}
