import { getCurrentSessionUser } from "./session";
import { isBackofficeRole } from "@/lib/constants/roles";
import type { AuthUser } from "@/features/auth/types";

export class AuthGuardError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AuthGuardError";
    this.status = status;
  }
}

export async function requireUser(): Promise<{
  user: AuthUser;
  sessionId: number;
}> {
  const session = await getCurrentSessionUser();

  if (!session.user || !session.sessionId) {
    throw new AuthGuardError("Unauthorized", 401);
  }

  return {
    user: session.user,
    sessionId: session.sessionId,
  };
}

export async function requireBackofficeUser(): Promise<{
  user: AuthUser;
  sessionId: number;
}> {
  const session = await requireUser();

  if (!isBackofficeRole(session.user.role)) {
    throw new AuthGuardError("Forbidden", 403);
  }

  return session;
}