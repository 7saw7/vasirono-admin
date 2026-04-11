export const APP_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  ANALYST: "analyst",
  SUPPORT: "support",
  COMPANY_OWNER: "company_owner",
  COMPANY_MANAGER: "company_manager",
  USER: "user",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export const BACKOFFICE_ROLES: AppRole[] = [
  APP_ROLES.SUPER_ADMIN,
  APP_ROLES.ADMIN,
  APP_ROLES.MODERATOR,
  APP_ROLES.ANALYST,
  APP_ROLES.SUPPORT,
];

export function normalizeRoleName(role: string | null | undefined): AppRole | null {
  if (!role) return null;

  const normalized = role.trim().toLowerCase().replace(/\s+/g, "_");

  const values = Object.values(APP_ROLES) as string[];
  return values.includes(normalized) ? (normalized as AppRole) : null;
}

export function isBackofficeRole(role: string | null | undefined): boolean {
  const normalized = normalizeRoleName(role);
  return normalized ? BACKOFFICE_ROLES.includes(normalized) : false;
}