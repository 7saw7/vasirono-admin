import type { AuthUser } from "@/features/auth/types";

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
  | "verifications.assign"
  | "verifications.documents.review"
  | "verifications.decide"
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
  | "subscriptions.manage"
  | "payments.read"
  | "payments.manage"
  | "promotions.read"
  | "promotions.updateStatus"
  | "promotions.moderate"
  | "promotions.manage"
  | "notifications.read"
  | "settings.read";

export type BackendBackofficePermission = string;

const BACKEND_PERMISSIONS_BY_UI_PERMISSION: Record<
  BackofficePermission,
  readonly BackendBackofficePermission[]
> = {
  "dashboard.read": ["analytics.backoffice.read"],

  "companies.read": ["backoffice.companies.read"],
  "companies.update": ["backoffice.companies.manage"],

  "branches.read": ["backoffice.branches.read"],
  // No backend permission exists yet, so this capability stays disabled.
  "branches.update": [],

  "claims.read": ["verifications.claims.list", "verifications.claims.read"],
  "claims.review": ["verifications.claims.decide"],

  "verifications.read": [
    "verifications.admin.list",
    "verifications.admin.read",
  ],
  // Compatibilidad con consumidores anteriores del Web Admin.
  "verifications.review": [
    "verifications.admin.assign",
    "verifications.admin.decide",
  ],
  "verifications.assign": ["verifications.admin.assign"],
  "verifications.documents.review": ["verifications.admin.decide"],
  "verifications.decide": ["verifications.admin.decide"],

  "reviews.read": ["reviews.admin.read"],
  "reviews.moderate": ["reviews.admin.moderate"],
  "reviewReports.read": ["reviews.admin.reports.read"],
  "reviewReports.resolve": ["reviews.admin.reports.resolve"],

  "users.read": ["admin:users:read", "admin:users:detail"],
  "users.manage": [
    "admin:users:update-role",
    "admin:users:verify",
    "admin:users:activate",
    "admin:users:deactivate",
  ],

  "analytics.read": ["analytics.backoffice.read"],

  "taxonomies.read": ["backoffice.taxonomies.read"],
  "taxonomies.manage": ["backoffice.taxonomies.manage"],
  "taxonomies.businessTypes.manage": ["backoffice.taxonomies.manage"],
  "taxonomies.categories.manage": ["backoffice.taxonomies.manage"],
  "taxonomies.subcategories.manage": ["backoffice.taxonomies.manage"],
  "taxonomies.services.manage": ["backoffice.taxonomies.manage"],

  "plans.read": ["billing.admin.plans.read"],
  "plans.manage": ["billing.admin.plans.write"],
  "subscriptions.read": ["billing.admin.subscriptions.read"],
  "subscriptions.manage": ["billing.admin.subscriptions.write"],
  "payments.read": ["billing.admin.payments.read"],
  "payments.manage": ["billing.admin.payments.write"],

  "promotions.read": ["promotions:admin:read"],
  "promotions.updateStatus": ["promotions:admin:update-status"],
  "promotions.moderate": ["promotions:admin:moderate"],
  "promotions.manage": [
    "promotions:admin:update-status",
    "promotions:admin:moderate",
  ],

  "notifications.read": ["notifications:read:all"],

  // Configuración se cierra como catálogo de consulta. Cada catálogo se
  // administra en su microservicio propietario para evitar una escritura
  // genérica sobre tablas compartidas.
  "settings.read": ["admin:settings:read"],
};

export function getBackendPermissionsForUiPermission(
  permission: BackofficePermission,
): readonly BackendBackofficePermission[] {
  return BACKEND_PERMISSIONS_BY_UI_PERMISSION[permission];
}

/**
 * The UI never derives privileges from a role. Auth Service must explicitly
 * deliver every backend permission. Unknown or unmapped capabilities fail closed.
 */
export function userHasPermission(
  user: Pick<AuthUser, "permissions">,
  permission: BackofficePermission,
): boolean {
  if (!Array.isArray(user.permissions)) return false;

  const required = BACKEND_PERMISSIONS_BY_UI_PERMISSION[permission];
  if (!required || required.length === 0) return false;

  const granted = new Set(
    user.permissions
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean),
  );

  return required.every((item) => granted.has(item));
}

export function assertPermission(
  user: Pick<AuthUser, "permissions">,
  permission: BackofficePermission,
): void {
  if (!userHasPermission(user, permission)) {
    const error = new Error(`Forbidden: missing permission ${permission}`);
    Object.assign(error, {
      status: 403,
      code: "BACKOFFICE_PERMISSION_DENIED",
      permission,
    });
    throw error;
  }
}
