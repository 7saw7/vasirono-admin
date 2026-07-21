import { randomUUID } from "crypto";
import { headers as requestHeaders } from "next/headers";
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

export class BackofficeServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "BACKOFFICE_SERVICE_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "BackofficeServiceError";
  }
}

function getEdgeBaseUrl(): string {
  const value = process.env.EDGE_API_URL?.trim();

  if (!value) {
    throw new BackofficeServiceError(
      "Falta configurar EDGE_API_URL en el panel Admin.",
      500,
      "EDGE_API_URL_MISSING",
    );
  }

  const normalized = value.replace(/\/+$/, "");
  const parsed = new URL(normalized);

  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new BackofficeServiceError(
      "EDGE_API_URL debe usar HTTPS en producción.",
      500,
      "EDGE_API_URL_INSECURE",
    );
  }

  return normalized;
}

function buildUrl(path: string, query?: Record<string, unknown>): string {
  const baseUrl = getEdgeBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(
    baseUrl.endsWith("/api") && normalizedPath.startsWith("/api/")
      ? `${baseUrl}${normalizedPath.slice(4)}`
      : `${baseUrl}${normalizedPath}`,
  );

  for (const [key, rawValue] of Object.entries(query ?? {})) {
    if (rawValue === undefined || rawValue === null || rawValue === "")
      continue;
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

async function resolveRequestId(): Promise<string> {
  try {
    const incoming = (await requestHeaders()).get("x-request-id")?.trim();
    if (incoming && /^[A-Za-z0-9._:-]{8,128}$/.test(incoming)) return incoming;
  } catch {
    // The client can also be invoked outside a request context in tests/build tooling.
  }

  return randomUUID();
}

export async function callBackofficeService<T>(
  service: BackofficeServiceName,
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    query?: Record<string, unknown>;
    body?: unknown;
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const token = await getRawSessionTokenFromCookie();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 15_000,
  );
  const requestUrl = buildUrl(path, options.query);
  const requestId = await resolveRequestId();

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      "x-request-id": requestId,
    };

    if (token) headers.authorization = `Bearer ${token}`;

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
      redirect: "manual",
    });

    const payload = await response.json().catch(() => null);

    if (
      !response.ok ||
      (payload &&
        typeof payload === "object" &&
        (payload as { success?: boolean }).success === false)
    ) {
      const envelope = payload as {
        error?: { code?: string; message?: string };
        message?: string;
      } | null;
      const message =
        envelope?.error?.message ||
        envelope?.message ||
        response.statusText ||
        "Error consultando el Gateway.";
      const code = envelope?.error?.code || "BACKOFFICE_SERVICE_REQUEST_FAILED";

      console.error("backoffice.gateway.request_failed", {
        service,
        path: path.split("?", 1)[0],
        requestId,
        status: response.status,
        code,
      });

      throw new BackofficeServiceError(message, response.status, code);
    }

    return unwrapEnvelope<T>(payload);
  } catch (error) {
    if (error instanceof BackofficeServiceError) throw error;

    const aborted = error instanceof Error && error.name === "AbortError";
    throw new BackofficeServiceError(
      aborted
        ? "El Gateway agotó el tiempo de respuesta."
        : "El Gateway no está disponible.",
      aborted ? 504 : 502,
      aborted ? "EDGE_GATEWAY_TIMEOUT" : "EDGE_GATEWAY_UNAVAILABLE",
    );
  } finally {
    clearTimeout(timeout);
  }
}
