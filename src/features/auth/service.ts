import bcrypt from "bcryptjs";
import type { PoolClient } from "pg";
import { loginSchema } from "./schema";
import { mapAuthRowToUser, type AuthRow } from "./mapper";
import type { CurrentUserResult, LoginInput, LoginResult } from "./types";
import { isBackofficeRole } from "@/lib/constants/roles";
import {
  clearSessionCookie,
  generateSessionToken,
  getCurrentSessionUser,
  getSessionExpirationDate,
  hashSessionToken,
  revokeCurrentSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { withTransaction } from "@/lib/db/server";

type UserWithPasswordRow = AuthRow & {
  password_hash: string;
};

async function findUserByEmail(
  client: PoolClient,
  email: string
): Promise<UserWithPasswordRow | null> {
  const { rows } = await client.query<UserWithPasswordRow>(
    `
      select
        u.id,
        u.name,
        u.email,
        u.verified,
        u.password_hash,
        r.name as role_name
      from users u
      inner join roles r on r.id = u.role_id
      where lower(u.email) = lower($1)
      limit 1
    `,
    [email]
  );

  return rows[0] ?? null;
}

export async function loginWithCredentials(
  input: LoginInput
): Promise<LoginResult> {
  const parsed = loginSchema.parse(input);

  return withTransaction(async (client) => {
    const userRow = await findUserByEmail(client, parsed.email);

    if (!userRow) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(
      parsed.password,
      userRow.password_hash
    );

    if (!passwordMatches) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (!isBackofficeRole(userRow.role_name)) {
      throw new Error("FORBIDDEN");
    }

    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const expiresAt = getSessionExpirationDate();

    const insertResult = await client.query<{ id: number }>(
      `
        insert into user_sessions (user_id, token, created_at, updated_at, revoked, expires_at)
        values ($1, $2, now(), now(), false, $3)
        returning id
      `,
      [userRow.id, tokenHash, expiresAt]
    );

    await setSessionCookie(rawToken, expiresAt);

    return {
      user: mapAuthRowToUser(userRow),
      session: {
        sessionId: insertResult.rows[0].id,
        token: rawToken,
        expiresAt: expiresAt.toISOString(),
      },
    };
  });
}

export async function logoutCurrentUser(): Promise<void> {
  await revokeCurrentSession();
  await clearSessionCookie();
}

export async function getCurrentUser(): Promise<CurrentUserResult> {
  const session = await getCurrentSessionUser();

  if (!session.user) {
    return { user: null };
  }

  if (!isBackofficeRole(session.user.role)) {
    await revokeCurrentSession();
    return { user: null };
  }

  return { user: session.user };
}