import type { AppRole } from "@/lib/constants/roles";
import { APP_ROLES } from "@/lib/constants/roles";

export type BackofficePermission =
  | "dashboard.read"
  | "companies.read"
  | "companies.update"
  | "branches.read"
  | "branches.update"
  | "claims.read"
  | "claims.review"
  | "verifications.read"
  | "verifications.review"
  | "reviews.read"
  | "reviews.moderate"
  | "reviewReports.read"
  | "reviewReports.resolve"
  | "users.read"
  | "users.manage"
  | "analytics.read"
  | "taxonomies.manage"
  | "plans.manage"
  | "subscriptions.read"
  | "payments.read"
  | "promotions.manage"
  | "notifications.manage"
  | "settings.manage";

const ALL_PERMISSIONS: BackofficePermission[] = [
  "dashboard.read",
  "companies.read",
  "companies.update",
  "branches.read",
  "branches.update",
  "claims.read",
  "claims.review",
  "verifications.read",
  "verifications.review",
  "reviews.read",
  "reviews.moderate",
  "reviewReports.read",
  "reviewReports.resolve",
  "users.read",
  "users.manage",
  "analytics.read",
  "taxonomies.manage",
  "plans.manage",
  "subscriptions.read",
  "payments.read",
  "promotions.manage",
  "notifications.manage",
  "settings.manage",
];

const ROLE_PERMISSIONS: Record<AppRole, BackofficePermission[]> = {
  [APP_ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [APP_ROLES.ADMIN]: ALL_PERMISSIONS,
  [APP_ROLES.MODERATOR]: [
    "dashboard.read",
    "claims.read",
    "claims.review",
    "verifications.read",
    "verifications.review",
    "reviews.read",
    "reviews.moderate",
    "reviewReports.read",
    "reviewReports.resolve",
    "companies.read",
    "branches.read",
    "users.read",
  ],
  [APP_ROLES.ANALYST]: [
    "dashboard.read",
    "analytics.read",
    "companies.read",
    "branches.read",
    "users.read",
    "subscriptions.read",
    "payments.read",
  ],
  [APP_ROLES.SUPPORT]: [
    "dashboard.read",
    "companies.read",
    "branches.read",
    "claims.read",
    "verifications.read",
    "reviews.read",
    "reviewReports.read",
    "users.read",
    "subscriptions.read",
    "payments.read",
    "notifications.manage",
  ],
  [APP_ROLES.COMPANY_OWNER]: [],
  [APP_ROLES.COMPANY_MANAGER]: [],
  [APP_ROLES.USER]: [],
};

export function getRolePermissions(role: AppRole): Set<BackofficePermission> {
  return new Set(ROLE_PERMISSIONS[role] ?? []);
}

export function hasPermission(
  role: AppRole,
  permission: BackofficePermission
): boolean {
  return getRolePermissions(role).has(permission);
}

export function assertPermission(
  role: AppRole,
  permission: BackofficePermission
): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}