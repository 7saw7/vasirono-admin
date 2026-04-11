import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { query } from "@/lib/db/server";
import type { AuthUser } from "@/features/auth/types";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "vasirono_bo_session";

const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 30);

type SessionLookupRow = {
  session_id: number;
  token: string;
  expires_at: Date;
  revoked: boolean;
  user_id: string;
  name: string;
  email: string;
  verified: boolean | null;
  role_name: string;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashSessionToken(rawToken: string): string {
  return sha256(rawToken);
}

export function getSessionExpirationDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);
  return expiresAt;
}

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

  if (!rawToken) {
    await clearSessionCookie();
    return;
  }

  const tokenHash = hashSessionToken(rawToken);

  await query(
    `
      update user_sessions
      set revoked = true, updated_at = now()
      where token = $1
    `,
    [tokenHash]
  );

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

  const tokenHash = hashSessionToken(rawToken);

  const { rows } = await query<SessionLookupRow>(
    `
      select
        us.id as session_id,
        us.token,
        us.expires_at,
        us.revoked,
        u.id as user_id,
        u.name,
        u.email,
        u.verified,
        r.name as role_name
      from user_sessions us
      inner join users u on u.id = us.user_id
      inner join roles r on r.id = u.role_id
      where us.token = $1
      limit 1
    `,
    [tokenHash]
  );

  const session = rows[0];

  if (!session) {
    await clearSessionCookie();
    return { user: null, sessionId: null };
  }

  const expected = Buffer.from(session.token);
  const actual = Buffer.from(tokenHash);

  if (
    expected.length !== actual.length ||
    !timingSafeEqual(expected, actual) ||
    session.revoked ||
    new Date(session.expires_at).getTime() <= Date.now()
  ) {
    await clearSessionCookie();

    await query(
      `
        update user_sessions
        set revoked = true, updated_at = now()
        where id = $1
      `,
      [session.session_id]
    );

    return { user: null, sessionId: null };
  }

  return {
    sessionId: session.session_id,
    user: {
      id: session.user_id,
      name: session.name,
      email: session.email,
      verified: Boolean(session.verified),
      role: session.role_name as AuthUser["role"],
    },
  };
}