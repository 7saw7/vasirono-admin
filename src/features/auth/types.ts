import type { AppRole } from "@/lib/constants/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  verified: boolean;
  permissions: string[];
};

export type AuthSession = {
  sessionId: number;
  token: string;
  expiresAt: string;
  absoluteExpiresAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthenticatedLoginResult = {
  status: "AUTHENTICATED";
  user: AuthUser;
  session: AuthSession;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  recoveryCodes?: string[];
};

export type MfaPendingLoginResult = {
  status: "MFA_REQUIRED" | "MFA_ENROLLMENT_REQUIRED";
  mfaRequired: true;
  enrollmentRequired: boolean;
  challengeId: string;
  expiresAt: string;
};

export type LoginResult = AuthenticatedLoginResult | MfaPendingLoginResult;

export type CurrentUserResult = {
  user: AuthUser | null;
};

export type MfaEnrollment = {
  secret: string;
  otpauthUri: string;
  issuer: string;
  accountName: string;
  expiresAt: string;
};

export type UserSessionItem = {
  sessionId: number;
  portal: "app" | "company" | "backoffice";
  activeRole: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceLabel: string | null;
  createdAt: string;
  lastSeenAt: string | null;
  expiresAt: string;
  current: boolean;
  mfa: boolean;
  stepUpUntil: string | null;
};

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "SESSION_EXPIRED"
  | "MFA_REQUIRED"
  | "MFA_ENROLLMENT_REQUIRED"
  | "MFA_CHALLENGE_INVALID"
  | "MFA_CHALLENGE_EXPIRED"
  | "MFA_CODE_INVALID"
  | "MFA_TOO_MANY_ATTEMPTS"
  | "STEP_UP_REQUIRED"
  | "REFRESH_TOKEN_REUSE_DETECTED"
  | "INTERNAL_ERROR";
