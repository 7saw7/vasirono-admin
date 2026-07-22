import { randomUUID } from "crypto";
import { headers as nextHeaders } from "next/headers";
import type {
  AuthenticatedLoginResult,
  AuthUser,
  MfaEnrollment,
  MfaPendingLoginResult,
  UserSessionItem,
} from "@/features/auth/types";
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

type AuthServiceSession = {
  sessionId: number;
  token: string;
  expiresAt: string;
  absoluteExpiresAt?: string;
};

type AuthServiceAuthenticatedData = {
  status?: "AUTHENTICATED";
  principal: AuthServicePrincipal;
  session: AuthServiceSession;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  recoveryCodes?: string[];
};

type AuthServiceMfaPendingData = {
  status: "MFA_REQUIRED" | "MFA_ENROLLMENT_REQUIRED";
  mfaRequired: true;
  enrollmentRequired: boolean;
  challengeId: string;
  expiresAt: string;
};

type AuthServiceLoginData =
  | AuthServiceAuthenticatedData
  | AuthServiceMfaPendingData;

type AuthServiceMeData = {
  principal: AuthServicePrincipal | null;
  session: {
    sessionId: number | null;
    expiresAt: string | null;
    absoluteExpiresAt?: string | null;
    mfa?: boolean;
    authTime?: string | null;
    stepUpUntil?: string | null;
    amr?: string[];
  };
};

type AuthServiceRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  rawToken?: string | null;
  headers?: Record<string, string>;
};

function buildPublicRequestHeaders(source?: Headers): Record<string, string> {
  if (!source) return {};
  const result: Record<string, string> = {};
  const userAgent = source.get("user-agent");
  const requestId = source.get("x-request-id");
  if (userAgent) result["user-agent"] = userAgent;
  if (requestId) result["x-request-id"] = requestId;
  return result;
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
    const requestHeaders: Record<string, string> = {
      accept: "application/json",
      ...options.headers,
    };

    if (!requestHeaders["x-request-id"]) {
      try {
        const incoming = (await nextHeaders()).get("x-request-id")?.trim();
        requestHeaders["x-request-id"] =
          incoming && /^[A-Za-z0-9._:-]{8,128}$/.test(incoming)
            ? incoming
            : randomUUID();
      } catch {
        requestHeaders["x-request-id"] = randomUUID();
      }
    }

    let body: string | undefined;
    if (typeof options.body !== "undefined") {
      requestHeaders["content-type"] = "application/json";
      body = JSON.stringify(options.body);
    }
    if (options.rawToken) {
      requestHeaders.authorization = `Bearer ${options.rawToken}`;
    }

    const response = await fetch(buildAuthServiceUrl(path), {
      method: options.method ?? "GET",
      headers: requestHeaders,
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
  if (!role) throw new Error("FORBIDDEN");

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

function mapAuthenticated(
  data: AuthServiceAuthenticatedData,
): AuthenticatedLoginResult {
  if (
    !data.principal ||
    !data.session?.token ||
    !data.refreshToken ||
    !data.refreshTokenExpiresAt
  ) {
    throw new Error("AUTH_SERVICE_INVALID_RESPONSE");
  }

  return {
    status: "AUTHENTICATED",
    user: mapPrincipalToAuthUser(data.principal),
    session: {
      sessionId: data.session.sessionId,
      token: data.session.token,
      expiresAt: data.session.expiresAt,
      absoluteExpiresAt:
        data.session.absoluteExpiresAt ?? data.refreshTokenExpiresAt,
    },
    refreshToken: data.refreshToken,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    recoveryCodes: data.recoveryCodes,
  };
}

function isMfaPending(
  data: AuthServiceLoginData,
): data is AuthServiceMfaPendingData {
  return (
    data.status === "MFA_REQUIRED" ||
    data.status === "MFA_ENROLLMENT_REQUIRED"
  );
}

export async function loginBackofficeWithAuthService(
  input: { email: string; password: string },
  requestHeaders?: Headers,
): Promise<AuthenticatedLoginResult | MfaPendingLoginResult> {
  const payload = await authServiceFetch<AuthServiceLoginData>(
    "/api/auth/login",
    {
      method: "POST",
      body: {
        email: input.email,
        password: input.password,
        portal: "backoffice",
      },
      headers: buildPublicRequestHeaders(requestHeaders),
    },
  );
  const data = payload.data;
  if (!data) throw new Error("AUTH_SERVICE_INVALID_RESPONSE");
  return isMfaPending(data) ? data : mapAuthenticated(data);
}

export async function getMfaEnrollment(
  challengeId: string,
  requestHeaders?: Headers,
): Promise<MfaEnrollment> {
  const payload = await authServiceFetch<MfaEnrollment>(
    "/api/auth/mfa/enroll",
    {
      method: "POST",
      body: { challengeId },
      headers: buildPublicRequestHeaders(requestHeaders),
    },
  );
  if (!payload.data) throw new Error("AUTH_SERVICE_INVALID_RESPONSE");
  return payload.data;
}

async function completeMfa(
  path: "/api/auth/mfa/confirm" | "/api/auth/mfa/verify",
  input: { challengeId: string; code: string },
  requestHeaders?: Headers,
): Promise<AuthenticatedLoginResult> {
  const payload = await authServiceFetch<AuthServiceAuthenticatedData>(path, {
    method: "POST",
    body: input,
    headers: buildPublicRequestHeaders(requestHeaders),
  });
  if (!payload.data) throw new Error("AUTH_SERVICE_INVALID_RESPONSE");
  return mapAuthenticated(payload.data);
}

export function confirmMfaEnrollment(
  input: { challengeId: string; code: string },
  requestHeaders?: Headers,
): Promise<AuthenticatedLoginResult> {
  return completeMfa("/api/auth/mfa/confirm", input, requestHeaders);
}

export function verifyMfaLogin(
  input: { challengeId: string; code: string },
  requestHeaders?: Headers,
): Promise<AuthenticatedLoginResult> {
  return completeMfa("/api/auth/mfa/verify", input, requestHeaders);
}

export async function refreshBackofficeSession(
  refreshToken: string,
  requestHeaders?: Headers,
): Promise<AuthenticatedLoginResult> {
  const payload = await authServiceFetch<AuthServiceAuthenticatedData>(
    "/api/auth/session/refresh",
    {
      method: "POST",
      body: { refreshToken },
      headers: buildPublicRequestHeaders(requestHeaders),
    },
  );
  if (!payload.data) throw new Error("AUTH_SERVICE_INVALID_RESPONSE");
  return mapAuthenticated(payload.data);
}

export async function getBackofficeSessionFromAuthService(
  rawToken: string | null,
): Promise<{
  user: AuthUser | null;
  sessionId: number | null;
  expiresAt: string | null;
  absoluteExpiresAt: string | null;
  mfa: boolean;
  stepUpUntil: string | null;
}> {
  if (!rawToken) {
    return {
      user: null,
      sessionId: null,
      expiresAt: null,
      absoluteExpiresAt: null,
      mfa: false,
      stepUpUntil: null,
    };
  }

  const payload = await authServiceFetch<AuthServiceMeData>(
    "/api/auth/me?portal=backoffice",
    { method: "GET", rawToken },
  ).catch((error) => {
    const status = (error as { status?: number }).status;
    if (status === 401 || status === 403 || status === 404) return null;
    throw error;
  });

  if (!payload?.data?.principal || !payload.data.session.sessionId) {
    return {
      user: null,
      sessionId: null,
      expiresAt: null,
      absoluteExpiresAt: null,
      mfa: false,
      stepUpUntil: null,
    };
  }

  return {
    user: mapPrincipalToAuthUser(payload.data.principal),
    sessionId: payload.data.session.sessionId,
    expiresAt: payload.data.session.expiresAt,
    absoluteExpiresAt: payload.data.session.absoluteExpiresAt ?? null,
    mfa: payload.data.session.mfa === true,
    stepUpUntil: payload.data.session.stepUpUntil ?? null,
  };
}

export async function logoutBackofficeFromAuthService(
  rawToken: string | null,
): Promise<void> {
  if (!rawToken) return;
  await authServiceFetch<null>("/api/auth/logout?portal=backoffice", {
    method: "POST",
    rawToken,
  }).catch(() => undefined);
}

export async function stepUpBackofficeSession(
  rawToken: string,
  code: string,
  requestHeaders?: Headers,
): Promise<{ stepUpUntil: string; mfa: true; amr: string[] }> {
  const payload = await authServiceFetch<{
    stepUpUntil: string;
    mfa: true;
    amr: string[];
  }>("/api/auth/mfa/step-up?portal=backoffice", {
    method: "POST",
    rawToken,
    body: { code },
    headers: buildPublicRequestHeaders(requestHeaders),
  });
  if (!payload.data) throw new Error("AUTH_SERVICE_INVALID_RESPONSE");
  return payload.data;
}

export async function listBackofficeSessions(
  rawToken: string,
): Promise<UserSessionItem[]> {
  const payload = await authServiceFetch<UserSessionItem[]>(
    "/api/auth/sessions?portal=backoffice",
    { method: "GET", rawToken },
  );
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function revokeBackofficeSession(
  rawToken: string,
  sessionId: number,
): Promise<{ revoked: boolean }> {
  const payload = await authServiceFetch<{ revoked: boolean }>(
    `/api/auth/sessions/${sessionId}?portal=backoffice`,
    { method: "DELETE", rawToken },
  );
  return payload.data ?? { revoked: false };
}

export async function revokeOtherBackofficeSessions(
  rawToken: string,
): Promise<{ revokedSessions: number }> {
  const payload = await authServiceFetch<{ revokedSessions: number }>(
    "/api/auth/sessions/revoke-others?portal=backoffice",
    { method: "POST", rawToken },
  );
  return payload.data ?? { revokedSessions: 0 };
}

export async function revokeAllBackofficeSessions(
  rawToken: string,
): Promise<{ revokedSessions: number }> {
  const payload = await authServiceFetch<{ revokedSessions: number }>(
    "/api/auth/sessions/revoke-all?portal=backoffice",
    { method: "POST", rawToken },
  );
  return payload.data ?? { revokedSessions: 0 };
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
): Promise<{ valid: true; clientId: "admin"; expiresAt: string }> {
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
  input: { token: string; newPassword: string },
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
