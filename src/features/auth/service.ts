import { loginSchema } from "./schema";
import type { CurrentUserResult, LoginInput, LoginResult } from "./types";
import {
  clearAuthCookies,
  getCurrentSessionUser,
  revokeCurrentSession,
  setAuthCookies,
} from "@/lib/auth/session";
import { loginBackofficeWithAuthService } from "@/lib/auth/auth-service-client";

function normalizeAuthError(error: unknown): Error {
  const status = (error as { status?: number })?.status;
  const code = (error as { code?: string })?.code;
  const message = error instanceof Error ? error.message : String(error);

  if (status === 401 || code === "INVALID_CREDENTIALS") {
    return new Error(code || "INVALID_CREDENTIALS");
  }

  if (
    status === 403 ||
    code === "INVALID_PORTAL_ACCESS" ||
    code === "FORBIDDEN" ||
    message === "FORBIDDEN"
  ) {
    return new Error(code || "FORBIDDEN");
  }

  return error instanceof Error ? error : new Error(message);
}

export async function loginWithCredentials(
  input: LoginInput,
  requestHeaders?: Headers,
): Promise<LoginResult> {
  const parsed = loginSchema.parse(input);

  try {
    const result = await loginBackofficeWithAuthService(
      {
        email: parsed.email,
        password: parsed.password,
      },
      requestHeaders,
    );

    if (result.status === "AUTHENTICATED") {
      await setAuthCookies({
        accessToken: result.session.token,
        accessExpiresAt: new Date(result.session.expiresAt),
        refreshToken: result.refreshToken,
        refreshExpiresAt: new Date(result.refreshTokenExpiresAt),
      });
    }

    return result;
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function logoutCurrentUser(): Promise<void> {
  await revokeCurrentSession();
  await clearAuthCookies();
}

export async function getCurrentUser(): Promise<CurrentUserResult> {
  const session = await getCurrentSessionUser();
  return { user: session.user };
}
