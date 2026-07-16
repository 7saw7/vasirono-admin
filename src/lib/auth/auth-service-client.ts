import type { AuthUser } from "@/features/auth/types";
import { normalizeRoleName } from "@/lib/constants/roles";
import { getBackendRolePermissions } from "@/lib/auth/permissions";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL?.trim() ||
  process.env.AUTH_SERVICE_INTERNAL_URL?.trim() ||
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL?.trim() ||
  "";

const AUTH_SERVICE_TIMEOUT_MS = Number(
  process.env.AUTH_SERVICE_TIMEOUT_MS ?? 10_000
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

function getAuthServiceBaseUrl(): string {
  if (!AUTH_SERVICE_URL) {
    throw new Error("Missing AUTH_SERVICE_URL environment variable.");
  }

  return AUTH_SERVICE_URL.replace(/\/+$/, "");
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
  options: AuthServiceRequestOptions = {}
): Promise<AuthServiceEnvelope<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_SERVICE_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      ...options.headers,
    };

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
    });

    const payload = (await response
      .json()
      .catch(() => ({}))) as AuthServiceEnvelope<T>;

    if (!response.ok || payload.success === false) {
      const code = payload.error?.code;
      const message = payload.error?.message || payload.message || response.statusText;
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
  const role = normalizeRoleName(principal.activeRole || principal.user.globalRole);

  if (!role) {
    throw new Error("FORBIDDEN");
  }

  const permissions = Array.isArray(principal.permissions)
    ? [...new Set(principal.permissions.map((item) => item.trim()).filter(Boolean))]
    : Array.from(getBackendRolePermissions(role));

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
  const payload = await authServiceFetch<AuthServiceLoginData>("/api/auth/login", {
    method: "POST",
    body: {
      email: input.email,
      password: input.password,
      portal: "backoffice",
    },
  });

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
  rawToken: string | null
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
    }
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
  rawToken: string | null
): Promise<void> {
  if (!rawToken) return;

  await authServiceFetch<null>("/api/auth/logout", {
    method: "POST",
    rawToken,
  }).catch(() => {
    // El panel siempre debe limpiar su cookie local aunque el token ya no exista.
  });
}
