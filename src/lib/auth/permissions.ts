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
  | "taxonomies.read"
  | "taxonomies.manage"
  | "taxonomies.businessTypes.manage"
  | "taxonomies.categories.manage"
  | "taxonomies.subcategories.manage"
  | "taxonomies.services.manage"
  | "plans.read"
  | "plans.manage"
  | "subscriptions.read"
  | "payments.read"
  | "promotions.read"
  | "promotions.manage"
  | "notifications.read"
  | "notifications.manage"
  | "settings.read"
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
  "taxonomies.read",
  "taxonomies.manage",
  "taxonomies.businessTypes.manage",
  "taxonomies.categories.manage",
  "taxonomies.subcategories.manage",
  "taxonomies.services.manage",
  "plans.read",
  "plans.manage",
  "subscriptions.read",
  "payments.read",
  "promotions.read",
  "promotions.manage",
  "notifications.read",
  "notifications.manage",
  "settings.read",
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
    "taxonomies.read",
    "plans.read",
    "promotions.read",
    "notifications.read",
    "settings.read",
  ],

  [APP_ROLES.ANALYST]: [
    "dashboard.read",
    "analytics.read",
    "companies.read",
    "branches.read",
    "users.read",
    "subscriptions.read",
    "payments.read",
    "taxonomies.read",
    "plans.read",
    "promotions.read",
    "notifications.read",
    "settings.read",
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
    "notifications.read",
    "taxonomies.read",
  ],

  [APP_ROLES.COMPANY_OWNER]: [],
  [APP_ROLES.COMPANY_MANAGER]: [],
  [APP_ROLES.USER]: [],
};



export type BackendBackofficePermission = string;

const BACKEND_DASHBOARD_PERMISSIONS = [
  "analytics.backoffice.read",
] as const;

const BACKEND_ANALYTICS_READ_PERMISSIONS = [
  "analytics.backoffice.read",
] as const;

const BACKEND_BILLING_READ_PERMISSIONS = [
  "billing.admin.payments.read",
  "billing.admin.subscriptions.read",
  "billing.admin.plans.read",
  "billing.admin.promotions.read",
] as const;

const BACKEND_BILLING_WRITE_PERMISSIONS = [
  "billing.admin.payments.write",
  "billing.admin.subscriptions.write",
  "billing.admin.plans.write",
] as const;

const BACKEND_VERIFICATION_READ_PERMISSIONS = [
  "verifications.admin.list",
  "verifications.admin.read",
  "verifications.claims.list",
  "verifications.claims.read",
] as const;

const BACKEND_VERIFICATION_WRITE_PERMISSIONS = [
  "verifications.admin.assign",
  "verifications.admin.decide",
  "verifications.claims.decide",
] as const;

const BACKEND_REVIEW_READ_PERMISSIONS = [
  "reviews.admin.read",
  "reviews.admin.reports.read",
] as const;

const BACKEND_REVIEW_MODERATION_PERMISSIONS = [
  "reviews.admin.moderate",
  "reviews.admin.reports.resolve",
] as const;


const BACKEND_TAXONOMY_READ_PERMISSIONS = [
  "backoffice.taxonomies.read",
] as const;

const BACKEND_TAXONOMY_WRITE_PERMISSIONS = [
  "backoffice.taxonomies.manage",
] as const;

const BACKEND_NOTIFICATION_PERMISSIONS = [
  "notifications:read:all",
] as const;

const BACKEND_SETTINGS_READ_PERMISSIONS = [
  "admin:settings:read",
] as const;

const BACKEND_SETTINGS_WRITE_PERMISSIONS = [
  "admin:settings:manage",
] as const;

const BACKEND_USER_READ_PERMISSIONS = [
  "admin:users:read",
  "admin:users:detail",
] as const;

const BACKEND_USER_WRITE_PERMISSIONS = [
  "admin:users:update-role",
  "admin:users:verify",
  "admin:users:activate",
  "admin:users:deactivate",
] as const;

const BACKEND_MEDIA_READ_PERMISSIONS = [
  "media:company:read",
  "media:branch:read",
  "media:catalog-item:read",
  "media:review:read",
  "media:types:read",
] as const;

const BACKEND_MEDIA_WRITE_PERMISSIONS = [
  "media:company:write",
  "media:branch:write",
  "media:catalog-item:write",
  "media:review:write",
  "media:company:delete",
  "media:branch:delete",
  "media:catalog-item:delete",
  "media:review:delete",
] as const;

const BACKEND_FULL_PERMISSIONS = [
  ...BACKEND_DASHBOARD_PERMISSIONS,
  ...BACKEND_ANALYTICS_READ_PERMISSIONS,
  ...BACKEND_BILLING_READ_PERMISSIONS,
  ...BACKEND_BILLING_WRITE_PERMISSIONS,
  ...BACKEND_VERIFICATION_READ_PERMISSIONS,
  ...BACKEND_VERIFICATION_WRITE_PERMISSIONS,
  ...BACKEND_REVIEW_READ_PERMISSIONS,
  ...BACKEND_REVIEW_MODERATION_PERMISSIONS,
  ...BACKEND_TAXONOMY_READ_PERMISSIONS,
  ...BACKEND_TAXONOMY_WRITE_PERMISSIONS,
  ...BACKEND_NOTIFICATION_PERMISSIONS,
  ...BACKEND_SETTINGS_READ_PERMISSIONS,
  ...BACKEND_SETTINGS_WRITE_PERMISSIONS,
  ...BACKEND_USER_READ_PERMISSIONS,
  ...BACKEND_USER_WRITE_PERMISSIONS,
  ...BACKEND_MEDIA_READ_PERMISSIONS,
  ...BACKEND_MEDIA_WRITE_PERMISSIONS,
] as const;

const BACKEND_ANALYST_PERMISSIONS = [
  ...BACKEND_DASHBOARD_PERMISSIONS,
  ...BACKEND_ANALYTICS_READ_PERMISSIONS,
  ...BACKEND_BILLING_READ_PERMISSIONS,
  ...BACKEND_TAXONOMY_READ_PERMISSIONS,
  ...BACKEND_NOTIFICATION_PERMISSIONS,
  ...BACKEND_SETTINGS_READ_PERMISSIONS,
  ...BACKEND_MEDIA_READ_PERMISSIONS,
] as const;

const BACKEND_SUPPORT_PERMISSIONS = [
  ...BACKEND_DASHBOARD_PERMISSIONS,
  ...BACKEND_VERIFICATION_READ_PERMISSIONS,
  ...BACKEND_REVIEW_READ_PERMISSIONS,
  ...BACKEND_NOTIFICATION_PERMISSIONS,
  ...BACKEND_USER_READ_PERMISSIONS,
  ...BACKEND_TAXONOMY_READ_PERMISSIONS,
  ...BACKEND_SETTINGS_READ_PERMISSIONS,
  ...BACKEND_MEDIA_READ_PERMISSIONS,
] as const;

const BACKEND_MODERATOR_PERMISSIONS = [
  ...BACKEND_DASHBOARD_PERMISSIONS,
  ...BACKEND_REVIEW_READ_PERMISSIONS,
  ...BACKEND_REVIEW_MODERATION_PERMISSIONS,
  ...BACKEND_VERIFICATION_READ_PERMISSIONS,
  ...BACKEND_TAXONOMY_READ_PERMISSIONS,
  ...BACKEND_NOTIFICATION_PERMISSIONS,
  ...BACKEND_SETTINGS_READ_PERMISSIONS,
  ...BACKEND_MEDIA_READ_PERMISSIONS,
] as const;

const BACKEND_ROLE_PERMISSIONS: Record<AppRole, readonly string[]> = {
  [APP_ROLES.SUPER_ADMIN]: BACKEND_FULL_PERMISSIONS,
  [APP_ROLES.ADMIN]: BACKEND_FULL_PERMISSIONS,
  [APP_ROLES.MODERATOR]: BACKEND_MODERATOR_PERMISSIONS,
  [APP_ROLES.ANALYST]: BACKEND_ANALYST_PERMISSIONS,
  [APP_ROLES.SUPPORT]: BACKEND_SUPPORT_PERMISSIONS,
  [APP_ROLES.COMPANY_OWNER]: [],
  [APP_ROLES.COMPANY_MANAGER]: [],
  [APP_ROLES.USER]: [],
};

export function getBackendRolePermissions(role: AppRole): Set<BackendBackofficePermission> {
  return new Set(BACKEND_ROLE_PERMISSIONS[role] ?? []);
}

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