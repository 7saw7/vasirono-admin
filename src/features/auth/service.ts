import { loginSchema } from "./schema";
import type { CurrentUserResult, LoginInput, LoginResult } from "./types";
import {
  clearSessionCookie,
  getCurrentSessionUser,
  revokeCurrentSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { loginBackofficeWithAuthService } from "@/lib/auth/auth-service-client";

function normalizeAuthError(error: unknown): Error {
  const status = (error as { status?: number })?.status;
  const code = (error as { code?: string })?.code;
  const message = error instanceof Error ? error.message : String(error);

  if (status === 401 || code === "INVALID_CREDENTIALS") {
    return new Error("INVALID_CREDENTIALS");
  }

  if (
    status === 403 ||
    code === "INVALID_PORTAL_ACCESS" ||
    code === "FORBIDDEN" ||
    message === "FORBIDDEN"
  ) {
    return new Error("FORBIDDEN");
  }

  return error instanceof Error ? error : new Error(message);
}

export async function loginWithCredentials(
  input: LoginInput
): Promise<LoginResult> {
  const parsed = loginSchema.parse(input);

  try {
    const result = await loginBackofficeWithAuthService({
      email: parsed.email,
      password: parsed.password,
    });

    await setSessionCookie(result.session.token, new Date(result.session.expiresAt));

    return result;
  } catch (error) {
    throw normalizeAuthError(error);
  }
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

  return { user: session.user };
}
