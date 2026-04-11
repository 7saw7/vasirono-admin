import type { AppRole } from "@/lib/constants/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  verified: boolean;
};

export type AuthSession = {
  sessionId: number;
  token: string;
  expiresAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  user: AuthUser;
  session: AuthSession;
};

export type CurrentUserResult = {
  user: AuthUser | null;
};

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "SESSION_EXPIRED"
  | "INTERNAL_ERROR";