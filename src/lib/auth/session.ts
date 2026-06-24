import { cookies } from "next/headers";
import type { AuthUser } from "@/features/auth/types";
import {
  getBackofficeSessionFromAuthService,
  logoutBackofficeFromAuthService,
} from "./auth-service-client";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "vasirono_bo_session";

export async function setSessionCookie(rawToken: string, expiresAt: Date) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getRawSessionTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function revokeCurrentSession(): Promise<void> {
  const rawToken = await getRawSessionTokenFromCookie();
  await logoutBackofficeFromAuthService(rawToken);
  await clearSessionCookie();
}

export async function getCurrentSessionUser(): Promise<{
  user: AuthUser | null;
  sessionId: number | null;
}> {
  const rawToken = await getRawSessionTokenFromCookie();

  if (!rawToken) {
    return { user: null, sessionId: null };
  }

  const session = await getBackofficeSessionFromAuthService(rawToken);

  if (!session.user || !session.sessionId) {
    await clearSessionCookie();
  }

  return session;
}
