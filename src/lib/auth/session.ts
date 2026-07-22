import { cookies } from "next/headers";
import type { AuthUser } from "@/features/auth/types";
import {
  getBackofficeSessionFromAuthService,
  logoutBackofficeFromAuthService,
  refreshBackofficeSession,
} from "./auth-service-client";

const ACCESS_COOKIE_NAME =
  process.env.ADMIN_ACCESS_COOKIE_NAME ??
  process.env.SESSION_COOKIE_NAME ??
  "admin_access_token";
const REFRESH_COOKIE_NAME =
  process.env.ADMIN_REFRESH_COOKIE_NAME ?? "admin_refresh_token";
const LEGACY_COOKIE_NAME = "vasirono_bo_session";

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export async function setAuthCookies(input: {
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken: string;
  refreshExpiresAt: Date;
}): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    ACCESS_COOKIE_NAME,
    input.accessToken,
    cookieOptions(input.accessExpiresAt),
  );
  cookieStore.set(
    REFRESH_COOKIE_NAME,
    input.refreshToken,
    cookieOptions(input.refreshExpiresAt),
  );
  if (ACCESS_COOKIE_NAME !== LEGACY_COOKIE_NAME) {
    cookieStore.set(LEGACY_COOKIE_NAME, "", cookieOptions(new Date(0)));
  }
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  const expired = cookieOptions(new Date(0));
  cookieStore.set(ACCESS_COOKIE_NAME, "", expired);
  cookieStore.set(REFRESH_COOKIE_NAME, "", expired);
  if (ACCESS_COOKIE_NAME !== LEGACY_COOKIE_NAME) {
    cookieStore.set(LEGACY_COOKIE_NAME, "", expired);
  }
}

export async function setSessionCookie(
  rawToken: string,
  expiresAt: Date,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE_NAME, rawToken, cookieOptions(expiresAt));
}

export async function clearSessionCookie(): Promise<void> {
  await clearAuthCookies();
}

export async function getRawSessionTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get(ACCESS_COOKIE_NAME)?.value ??
    cookieStore.get(LEGACY_COOKIE_NAME)?.value ??
    null
  );
}

export async function getRawRefreshTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}

export async function refreshCurrentSession(
  requestHeaders?: Headers,
): Promise<{
  user: AuthUser;
  sessionId: number;
  expiresAt: string;
  absoluteExpiresAt: string;
}> {
  const refreshToken = await getRawRefreshTokenFromCookie();
  if (!refreshToken) {
    const error = new Error("REFRESH_TOKEN_MISSING");
    Object.assign(error, { status: 401, code: "REFRESH_TOKEN_MISSING" });
    throw error;
  }

  try {
    const refreshed = await refreshBackofficeSession(
      refreshToken,
      requestHeaders,
    );
    await setAuthCookies({
      accessToken: refreshed.session.token,
      accessExpiresAt: new Date(refreshed.session.expiresAt),
      refreshToken: refreshed.refreshToken,
      refreshExpiresAt: new Date(refreshed.refreshTokenExpiresAt),
    });
    return {
      user: refreshed.user,
      sessionId: refreshed.session.sessionId,
      expiresAt: refreshed.session.expiresAt,
      absoluteExpiresAt: refreshed.session.absoluteExpiresAt,
    };
  } catch (error) {
    await clearAuthCookies().catch(() => undefined);
    throw error;
  }
}

export async function revokeCurrentSession(): Promise<void> {
  const rawToken = await getRawSessionTokenFromCookie();
  await logoutBackofficeFromAuthService(rawToken);
  await clearAuthCookies();
}

export async function getCurrentSessionUser(): Promise<{
  user: AuthUser | null;
  sessionId: number | null;
  expiresAt?: string | null;
  absoluteExpiresAt?: string | null;
  mfa?: boolean;
  stepUpUntil?: string | null;
}> {
  const rawToken = await getRawSessionTokenFromCookie();
  if (!rawToken) return { user: null, sessionId: null };

  const session = await getBackofficeSessionFromAuthService(rawToken);
  if (!session.user || !session.sessionId || !session.mfa) {
    await clearAuthCookies().catch(() => undefined);
    return { user: null, sessionId: null };
  }

  return session;
}
