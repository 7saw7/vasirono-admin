import type { AuthUser } from "@/features/auth/types";
import { randomUUID } from "crypto";
import { headers as nextHeaders } from "next/headers";
import { normalizeRoleName } from "@/lib/constants/roles";
const EDGE_API_URL = process.env.EDGE_API_URL?.trim() || "";

const AUTH_SERVICE_TIMEOUT_MS = Number(
  process.env.AUTH_SERVICE_TIMEOUT_MS ?? 10_000,
);

type AuthServiceEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

type AuthServicePrincipal = {
  user: {
    id: string;
    name: string;
    email: string;
    verified?: boolean | null;
    globalRole?: string | null;
  };
  portal: string;
  activeRole: string;
  activeCompanyId: number | null;
  memberships?: unknown[];
  branchScopes?: unknown[];
  permissions?: string[];
};

type AuthServiceLoginData = {
  principal: AuthServicePrincipal;
  session: {
    sessionId: number;
    token: string;
    expiresAt: string;
  };
  refreshToken?: string;
};

type AuthServiceMeData = {
  principal: AuthServicePrincipal | null;
  session: {
    sessionId: number | null;
    expiresAt: string | null;
  };
};

type AuthServiceRequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  rawToken?: string | null;
  headers?: Record<string, string>;
};

function buildPublicRequestHeaders(source?: Headers): Record<string, string> {
  if (!source) return {};
  const headers: Record<string, string> = {};
  const userAgent = source.get("user-agent");
  const requestId = source.get("x-request-id");
  // The Edge Worker is the only component allowed to construct trusted IP
  // forwarding headers. The Admin BFF forwards only ordinary client metadata.
  if (userAgent) headers["user-agent"] = userAgent;
  if (requestId) headers["x-request-id"] = requestId;
  return headers;
}

function getAuthServiceBaseUrl(): string {
  if (!EDGE_API_URL) {
    throw new Error("Missing EDGE_API_URL environment variable.");
  }

  const normalized = EDGE_API_URL.replace(/\/+$/, "");
  const parsed = new URL(normalized);
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("EDGE_API_URL must use HTTPS in production.");
  }
  return normalized;
}

function buildAuthServiceUrl(path: string): string {
  const baseUrl = getAuthServiceBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (baseUrl.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${baseUrl}${normalizedPath.slice(4)}`;
  }

  return `${baseUrl}${normalizedPath}`;
}

async function authServiceFetch<T>(
  path: string,
  options: AuthServiceRequestOptions = {},
): Promise<AuthServiceEnvelope<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_SERVICE_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      ...options.headers,
    };

    if (!headers["x-request-id"]) {
      try {
        const incoming = (await nextHeaders()).get("x-request-id")?.trim();
        headers["x-request-id"] =
          incoming && /^[A-Za-z0-9._:-]{8,128}$/.test(incoming)
            ? incoming
            : randomUUID();
      } catch {
        headers["x-request-id"] = randomUUID();
      }
    }

    let body: string | undefined;

    if (typeof options.body !== "undefined") {
      headers["content-type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    if (options.rawToken) {
      headers.authorization = `Bearer ${options.rawToken}`;
    }

    const response = await fetch(buildAuthServiceUrl(path), {
      method: options.method ?? "GET",
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
      redirect: "manual",
    });

    const payload = (await response
      .json()
      .catch(() => ({}))) as AuthServiceEnvelope<T>;

    if (!response.ok || payload.success === false) {
      const code = payload.error?.code;
      const message =
        payload.error?.message || payload.message || response.statusText;
      const error = new Error(code || message || "AUTH_SERVICE_ERROR");
      Object.assign(error, {
        status: response.status,
        code,
        authServiceMessage: message,
      });
      throw error;
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function mapPrincipalToAuthUser(principal: AuthServicePrincipal): AuthUser {
  const role = normalizeRoleName(
    principal.activeRole || principal.user.globalRole,
  );

  if (!role) {
    throw new Error("FORBIDDEN");
  }

  if (principal.portal !== "backoffice") {
    const error = new Error("AUTH_PORTAL_MISMATCH");
    Object.assign(error, { status: 403, code: "AUTH_PORTAL_MISMATCH" });
    throw error;
  }

  if (!Array.isArray(principal.permissions)) {
    const error = new Error("AUTH_PERMISSIONS_MISSING");
    Object.assign(error, { status: 403, code: "AUTH_PERMISSIONS_MISSING" });
    throw error;
  }

  const permissions = [
    ...new Set(
      principal.permissions
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];

  return {
    id: principal.user.id,
    name: principal.user.name,
    email: principal.user.email,
    role,
    verified: Boolean(principal.user.verified),
    permissions,
  };
}

export async function loginBackofficeWithAuthService(input: {
  email: string;
  password: string;
}): Promise<{
  user: AuthUser;
  session: {
    sessionId: number;
    token: string;
    expiresAt: string;
  };
}> {
  const payload = await authServiceFetch<AuthServiceLoginData>(
    "/api/auth/login",
    {
      method: "POST",
      body: {
        email: input.email,
        password: input.password,
        portal: "backoffice",
      },
    },
  );

  const data = payload.data;

  if (!data?.principal || !data.session?.token) {
    throw new Error("AUTH_SERVICE_INVALID_RESPONSE");
  }

  return {
    user: mapPrincipalToAuthUser(data.principal),
    session: {
      sessionId: data.session.sessionId,
      token: data.session.token,
      expiresAt: data.session.expiresAt,
    },
  };
}

export async function getBackofficeSessionFromAuthService(
  rawToken: string | null,
): Promise<{
  user: AuthUser | null;
  sessionId: number | null;
}> {
  if (!rawToken) {
    return { user: null, sessionId: null };
  }

  const payload = await authServiceFetch<AuthServiceMeData>(
    "/api/auth/me?portal=backoffice",
    {
      method: "GET",
      rawToken,
    },
  ).catch((error) => {
    const status = (error as { status?: number }).status;

    if (status === 401 || status === 403 || status === 404) {
      return null;
    }

    throw error;
  });

  if (!payload?.data?.principal || !payload.data.session.sessionId) {
    return { user: null, sessionId: null };
  }

  return {
    user: mapPrincipalToAuthUser(payload.data.principal),
    sessionId: payload.data.session.sessionId,
  };
}

export async function logoutBackofficeFromAuthService(
  rawToken: string | null,
): Promise<void> {
  if (!rawToken) return;

  await authServiceFetch<null>("/api/auth/logout", {
    method: "POST",
    rawToken,
  }).catch(() => {
    // El panel siempre debe limpiar su cookie local aunque el token ya no exista.
  });
}

export async function requestBackofficePasswordReset(
  email: string,
  requestHeaders?: Headers,
): Promise<void> {
  await authServiceFetch("/api/auth/forgot-password", {
    method: "POST",
    body: { email, clientId: "admin" },
    headers: buildPublicRequestHeaders(requestHeaders),
  });
}

export async function verifyBackofficePasswordResetToken(
  token: string,
  requestHeaders?: Headers,
): Promise<{
  valid: true;
  clientId: "admin";
  expiresAt: string;
}> {
  const payload = await authServiceFetch<{
    valid: true;
    clientId: "admin";
    expiresAt: string;
  }>("/api/auth/verify-reset-token", {
    method: "POST",
    body: { token, clientId: "admin" },
    headers: buildPublicRequestHeaders(requestHeaders),
  });

  if (!payload.data) throw new Error("AUTH_SERVICE_INVALID_RESPONSE");
  return payload.data;
}

export async function confirmBackofficePasswordReset(
  input: {
    token: string;
    newPassword: string;
  },
  requestHeaders?: Headers,
): Promise<{ reset: boolean; revokedSessions: boolean }> {
  const payload = await authServiceFetch<{
    reset: boolean;
    revokedSessions: boolean;
  }>("/api/auth/reset-password", {
    method: "POST",
    body: { ...input, clientId: "admin" },
    headers: buildPublicRequestHeaders(requestHeaders),
  });

  if (!payload.data) throw new Error("AUTH_SERVICE_INVALID_RESPONSE");
  return payload.data;
}
